from datetime import datetime, date
from typing import Optional, List
from . import db
from .enums import RequestStatus, ProblemType, Urgency, UserRole
from .status_history import RepairStatusHistory

class RepairTransitionError(Exception):
    """Raised when an invalid state transition is attempted."""
    pass

class RepairAuthorizationError(Exception):
    """Raised when an unauthorized actor attempts a repair action."""
    pass


class RepairRequest(db.Model):
    """
    RepairRequest entity representing a work order in the school.
    Demonstrates OOP Encapsulation (state-machine methods, invariants) 
    and Composition (composed of images, comments, status history).
    """
    __tablename__ = 'repair_requests'

    id = db.Column(db.Integer, primary_key=True)
    request_no = db.Column(db.String(30), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Location and problem details
    building = db.Column(db.String(100), nullable=False)
    room = db.Column(db.String(50), nullable=False)
    problem_type = db.Column(db.String(50), nullable=False, default=ProblemType.OTHER.value)
    description = db.Column(db.Text, nullable=False)
    urgency = db.Column(db.String(20), nullable=False, default=Urgency.MEDIUM.value)
    
    # Workflow state
    status = db.Column(db.String(30), nullable=False, default=RequestStatus.PENDING.value, index=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    due_date = db.Column(db.Date, nullable=True)
    completion_date = db.Column(db.DateTime, nullable=True)
    
    # Resolution details
    cost = db.Column(db.Float, nullable=True, default=0.0)
    result = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Composition: Relationships
    images = db.relationship(
        'RepairImage',
        backref='repair_request',
        lazy='joined',
        cascade='all, delete-orphan'
    )
    comments = db.relationship(
        'Comment',
        backref='repair_request',
        lazy='dynamic',
        cascade='all, delete-orphan',
        order_by='Comment.created_at.asc()'
    )
    status_history = db.relationship(
        'RepairStatusHistory',
        backref='repair_request',
        lazy='dynamic',
        cascade='all, delete-orphan',
        order_by='RepairStatusHistory.created_at.desc()'
    )

    # Allowed state transitions graph (OO State Machine)
    VALID_TRANSITIONS = {
        RequestStatus.PENDING.value: [RequestStatus.ACCEPTED.value],
        RequestStatus.ACCEPTED.value: [RequestStatus.IN_PROGRESS.value],
        RequestStatus.IN_PROGRESS.value: [RequestStatus.COMPLETED.value],
        RequestStatus.COMPLETED.value: []  # Terminal state
    }

    # Encapsulation: State Transition Verification
    def can_transition_to(self, new_status: str) -> bool:
        """Check if transition from current status to new_status is allowed."""
        allowed = self.VALID_TRANSITIONS.get(self.status, [])
        return new_status in allowed

    def _record_history(self, old_status: str, new_status: str, changed_by_user_id: int, remark: str = "") -> None:
        """Internal helper to record audit trail (Composition)."""
        history = RepairStatusHistory(
            repair_id=self.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by_user_id,
            remark=remark
        )
        db.session.add(history)

    # OO Behavioral Methods
    def assign_to_technician(self, technician, actor, due_date: Optional[date] = None, remark: str = "") -> None:
        """
        Admin assigns task to a technician. Moves status to ACCEPTED.
        Enforces invariants:
        - Only Admin can assign
        - Assigned user must have TECHNICIAN role
        - Must be in PENDING status or reassigned
        """
        if not actor.is_admin:
            raise RepairAuthorizationError("เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถมอบหมายงานได้")
        
        if technician.role != UserRole.TECHNICIAN.value:
            raise ValueError("ผู้รับมอบหมายงานต้องมีบทบาทเป็นช่างซ่อมบำรุง (Technician)")

        old_status = self.status
        self.assigned_to = technician.id
        self.due_date = due_date
        
        if self.status == RequestStatus.PENDING.value:
            self.status = RequestStatus.ACCEPTED.value
            self.updated_at = datetime.utcnow()
            self._record_history(
                old_status=old_status,
                new_status=RequestStatus.ACCEPTED.value,
                changed_by_user_id=actor.id,
                remark=remark or f"มอบหมายงานให้ช่าง {technician.fullname}"
            )

    def start_repair(self, actor, remark: str = "") -> None:
        """
        Technician starts the repair. Moves status to IN_PROGRESS.
        Enforces invariants:
        - Actor must be the assigned technician (or admin)
        - Current status must be ACCEPTED
        """
        if not (actor.is_admin or (actor.is_technician and self.assigned_to == actor.id)):
            raise RepairAuthorizationError("คุณไม่มีสิทธิ์เริ่มดำเนินการในงานที่ไม่ได้มอบหมายให้คุณ")

        if not self.can_transition_to(RequestStatus.IN_PROGRESS.value):
            raise RepairTransitionError(
                f"ไม่สามารถเริ่มงานได้จากสถานะ '{self.status_display}' (ต้องอยู่ในสถานะ 'รับเรื่องแล้ว')"
            )

        old_status = self.status
        self.status = RequestStatus.IN_PROGRESS.value
        self.updated_at = datetime.utcnow()
        self._record_history(
            old_status=old_status,
            new_status=RequestStatus.IN_PROGRESS.value,
            changed_by_user_id=actor.id,
            remark=remark or "ช่างเริ่มดำเนินการซ่อมแซม"
        )

    def complete_repair(self, actor, cost: float, result: str, remark: str = "") -> None:
        """
        Technician marks repair as completed. Moves status to COMPLETED.
        Enforces invariants:
        - Actor must be assigned technician (or admin)
        - Current status must be IN_PROGRESS
        - Cost must be non-negative
        - Result explanation must not be empty
        """
        if not (actor.is_admin or (actor.is_technician and self.assigned_to == actor.id)):
            raise RepairAuthorizationError("คุณไม่มีสิทธิ์บันทึกปิดงานซ่อมนี้")

        if not self.can_transition_to(RequestStatus.COMPLETED.value):
            raise RepairTransitionError(
                f"ไม่สามารถปิดงานได้จากสถานะ '{self.status_display}' (ต้องอยู่ในสถานะ 'กำลังดำเนินการ')"
            )

        if cost is None or cost < 0:
            raise ValueError("ค่าใช้จ่ายต้องเป็นตัวเลขและไม่ต่ำกว่า 0 บาท")

        if not result or not result.strip():
            raise ValueError("กรุณาระบุรายละเอียดผลการซ่อมแซม")

        old_status = self.status
        self.status = RequestStatus.COMPLETED.value
        self.cost = float(cost)
        self.result = result.strip()
        self.completion_date = datetime.utcnow()
        self.updated_at = datetime.utcnow()

        self._record_history(
            old_status=old_status,
            new_status=RequestStatus.COMPLETED.value,
            changed_by_user_id=actor.id,
            remark=remark or f"ปิดงานซ่อมเรียบร้อย ค่าใช้จ่าย: {cost:,.2f} บาท"
        )

    @classmethod
    def generate_request_no(cls, sequence: int, now: Optional[datetime] = None) -> str:
        """Format: RP-YYYYMM-XXX e.g. RP-202505-001"""
        if now is None:
            now = datetime.utcnow()
        year_month = now.strftime('%Y%m')
        return f"RP-{year_month}-{sequence:03d}"

    # Display Helpers
    @property
    def status_display(self) -> str:
        return RequestStatus.labels().get(self.status, self.status)

    @property
    def problem_type_display(self) -> str:
        return ProblemType.labels().get(self.problem_type, self.problem_type)

    @property
    def urgency_display(self) -> str:
        return Urgency.labels().get(self.urgency, self.urgency)

    @property
    def before_images(self) -> List:
        return [img for img in self.images if img.image_type == 'before']

    @property
    def after_images(self) -> List:
        return [img for img in self.images if img.image_type == 'after']

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'request_no': self.request_no,
            'user_id': self.user_id,
            'reporter_name': self.reporter.fullname if self.reporter else None,
            'reporter_department': self.reporter.department if self.reporter else None,
            'building': self.building,
            'room': self.room,
            'problem_type': self.problem_type,
            'problem_type_display': self.problem_type_display,
            'description': self.description,
            'urgency': self.urgency,
            'urgency_display': self.urgency_display,
            'status': self.status,
            'status_display': self.status_display,
            'assigned_to': self.assigned_to,
            'technician_name': self.technician.fullname if self.technician else 'ยังไม่ได้มอบหมาย',
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'cost': self.cost,
            'result': self.result,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'images_count': len(self.images)
        }

    def __repr__(self):
        return f"<RepairRequest {self.request_no} status='{self.status}'>"
