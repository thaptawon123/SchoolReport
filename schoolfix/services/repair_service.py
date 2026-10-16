import os
import uuid
from datetime import datetime, date
from typing import Optional, List, Tuple
from werkzeug.utils import secure_filename
from ..models import (
    db, RepairRequest, RepairImage, Comment, RepairStatusHistory,
    User, UserRole, RequestStatus, ProblemType, Urgency, ImageType
)
from ..models.repair_request import RepairTransitionError, RepairAuthorizationError
from ..repositories.repair_repository import RepairRepository
from ..repositories.user_repository import UserRepository

class RepairService:
    """
    Core Domain Service managing lifecycle, business rules, authorization,
    and workflow state transitions of Repair Requests.
    """
    def __init__(self, 
                 repair_repo: Optional[RepairRepository] = None, 
                 user_repo: Optional[UserRepository] = None,
                 upload_folder: Optional[str] = None):
        self.repair_repo = repair_repo or RepairRepository()
        self.user_repo = user_repo or UserRepository()
        self.upload_folder = upload_folder or os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
        os.makedirs(self.upload_folder, exist_ok=True)

    def create_request(self, user: User, building: str, room: str, 
                       problem_type: str, description: str, 
                       urgency: str = Urgency.MEDIUM.value,
                       image_file = None) -> Tuple[bool, Optional[RepairRequest], str]:
        """
        Create a new repair request (by Teacher or Admin).
        Enforces:
        - Required fields
        - Generation of unique request_no in format RP-YYYYMM-XXX
        - Initial status is PENDING
        - Optional before image upload
        """
        building = (building or '').strip()
        room = (room or '').strip()
        description = (description or '').strip()

        if not building:
            return False, None, "กรุณาระบุอาคารหรือสถานที่"
        if not room:
            return False, None, "กรุณาระบุห้องหรือจุดติดตั้ง"
        if not description:
            return False, None, "กรุณาระบุรายละเอียดปัญหาที่พบ"

        valid_types = [pt.value for pt in ProblemType]
        if problem_type not in valid_types:
            return False, None, f"ประเภทปัญหา '{problem_type}' ไม่ถูกต้อง"

        valid_urgencies = [u.value for u in Urgency]
        if urgency not in valid_urgencies:
            urgency = Urgency.MEDIUM.value

        try:
            now = datetime.utcnow()
            year_month = now.strftime('%Y%m')
            seq = self.repair_repo.get_next_sequence_for_month(year_month)
            request_no = RepairRequest.generate_request_no(seq, now)

            # Prevent collision if any
            while self.repair_repo.get_by_request_no(request_no):
                seq += 1
                request_no = RepairRequest.generate_request_no(seq, now)

            request = RepairRequest(
                request_no=request_no,
                user_id=user.id,
                building=building,
                room=room,
                problem_type=problem_type,
                description=description,
                urgency=urgency,
                status=RequestStatus.PENDING.value
            )
            db.session.add(request)
            db.session.flush()

            # Record initial status creation history
            initial_history = RepairStatusHistory(
                repair_id=request.id,
                old_status=None,
                new_status=RequestStatus.PENDING.value,
                changed_by=user.id,
                remark="สร้างใบแจ้งซ่อมใหม่ในระบบ"
            )
            db.session.add(initial_history)

            # Handle image upload if provided
            if image_file and hasattr(image_file, 'filename') and image_file.filename:
                self._attach_image(request.id, image_file, ImageType.BEFORE.value)

            db.session.commit()
            return True, request, "สร้างใบแจ้งซ่อมสำเร็จ"

        except Exception as e:
            db.session.rollback()
            return False, None, f"เกิดข้อผิดพลาดในการสร้างใบแจ้งซ่อม: {str(e)}"

    def assign_to_technician(self, repair_id: int, technician_id: int, 
                             admin_user: User, due_date: Optional[date] = None, 
                             remark: str = "") -> Tuple[bool, str]:
        """Admin assigns technician to repair request."""
        request = self.repair_repo.get_by_id(repair_id)
        if not request:
            return False, "ไม่พบข้อมูลใบแจ้งซ่อมที่ระบุ"

        technician = self.user_repo.get_by_id(technician_id)
        if not technician:
            return False, "ไม่พบข้อมูลช่างซ่อมบำรุงที่เลือก"

        try:
            request.assign_to_technician(technician, admin_user, due_date, remark)
            db.session.commit()
            return True, f"มอบหมายงานให้ช่าง {technician.fullname} สำเร็จแล้ว"
        except (RepairAuthorizationError, RepairTransitionError, ValueError) as e:
            db.session.rollback()
            return False, str(e)
        except Exception as e:
            db.session.rollback()
            return False, f"เกิดข้อผิดพลาดในการมอบหมายงาน: {str(e)}"

    def start_repair(self, repair_id: int, actor: User, remark: str = "") -> Tuple[bool, str]:
        """Technician accepts/starts repair work."""
        request = self.repair_repo.get_by_id(repair_id)
        if not request:
            return False, "ไม่พบข้อมูลใบแจ้งซ่อมที่ระบุ"

        try:
            request.start_repair(actor, remark)
            db.session.commit()
            return True, "เปลี่ยนสถานะเป็น 'กำลังดำเนินการ' สำเร็จแล้ว"
        except (RepairAuthorizationError, RepairTransitionError) as e:
            db.session.rollback()
            return False, str(e)
        except Exception as e:
            db.session.rollback()
            return False, f"เกิดข้อผิดพลาด: {str(e)}"

    def complete_repair(self, repair_id: int, actor: User, 
                        cost: float, result: str, 
                        after_image_file = None, 
                        remark: str = "") -> Tuple[bool, str]:
        """Technician completes work, enters cost and repair details."""
        request = self.repair_repo.get_by_id(repair_id)
        if not request:
            return False, "ไม่พบข้อมูลใบแจ้งซ่อมที่ระบุ"

        try:
            request.complete_repair(actor, cost, result, remark)

            if after_image_file and hasattr(after_image_file, 'filename') and after_image_file.filename:
                self._attach_image(request.id, after_image_file, ImageType.AFTER.value)

            db.session.commit()
            return True, "บันทึกปิดงานซ่อมเรียบร้อยแล้ว"
        except (RepairAuthorizationError, RepairTransitionError, ValueError) as e:
            db.session.rollback()
            return False, str(e)
        except Exception as e:
            db.session.rollback()
            return False, f"เกิดข้อผิดพลาดในการปิดงาน: {str(e)}"

    def add_comment(self, repair_id: int, user: User, comment_text: str) -> Tuple[bool, str]:
        """Add a comment with permission check."""
        request = self.repair_repo.get_by_id(repair_id)
        if not request:
            return False, "ไม่พบข้อมูลใบแจ้งซ่อม"

        if not user.can_view_request(request):
            return False, "คุณไม่มีสิทธิ์แสดงความคิดเห็นในใบแจ้งซ่อมนี้"

        comment_text = (comment_text or '').strip()
        if not comment_text:
            return False, "ข้อความความคิดเห็นต้องไม่ว่างเปล่า"

        try:
            comment = Comment(
                repair_id=repair_id,
                user_id=user.id,
                comment=comment_text
            )
            db.session.add(comment)
            db.session.commit()
            return True, "เพิ่มความคิดเห็นสำเร็จ"
        except Exception as e:
            db.session.rollback()
            return False, f"เกิดข้อผิดพลาด: {str(e)}"

    def _attach_image(self, repair_id: int, image_file, image_type: str) -> None:
        """Helper to securely save image file and record in database."""
        filename = secure_filename(image_file.filename)
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext not in {'png', 'jpg', 'jpeg', 'webp'}:
            raise ValueError("ประเภทไฟล์รูปภาพต้องเป็น png, jpg, jpeg หรือ webp เท่านั้น")

        unique_name = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(self.upload_folder, unique_name)
        image_file.save(save_path)

        image_record = RepairImage(
            repair_id=repair_id,
            image_type=image_type,
            image_path=f"uploads/{unique_name}",
            original_filename=filename
        )
        db.session.add(image_record)
