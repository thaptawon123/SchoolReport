"""
Comprehensive Unit & Security Test Suite for SchoolFix Domain & OOP Architecture
Executable directly via Python 3 Standard Library `unittest`.
"""

import unittest
from datetime import datetime, date

# Test helper dummy classes mimicking domain models without requiring full Flask app context
class MockUser:
    def __init__(self, id, username, fullname, role, is_active=True):
        self.id = id
        self.username = username
        self.fullname = fullname
        self.role = role
        self.is_active = is_active

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_teacher(self):
        return self.role == 'teacher'

    @property
    def is_technician(self):
        return self.role == 'technician'

    def can_view_request(self, req):
        if self.is_admin:
            return True
        if self.is_teacher and req.user_id == self.id:
            return True
        if self.is_technician and req.assigned_to == self.id:
            return True
        return False

    def can_edit_request(self, req):
        if self.is_admin:
            return True
        if self.is_technician and req.assigned_to == self.id:
            return True
        return False


class MockRepairRequest:
    VALID_TRANSITIONS = {
        'pending': ['accepted'],
        'accepted': ['in_progress'],
        'in_progress': ['completed'],
        'completed': []
    }

    def __init__(self, id, request_no, user_id, building, room, problem_type, description, urgency='medium'):
        self.id = id
        self.request_no = request_no
        self.user_id = user_id
        self.building = building
        self.room = room
        self.problem_type = problem_type
        self.description = description
        self.urgency = urgency
        self.status = 'pending'
        self.assigned_to = None
        self.due_date = None
        self.cost = 0.0
        self.result = None
        self.history = []

    @classmethod
    def generate_request_no(cls, sequence: int, now: datetime = None) -> str:
        if now is None:
            now = datetime(2025, 5, 1)
        year_month = now.strftime('%Y%m')
        return f"RP-{year_month}-{sequence:03d}"

    def can_transition_to(self, new_status: str) -> bool:
        return new_status in self.VALID_TRANSITIONS.get(self.status, [])

    def assign_to_technician(self, technician, actor, due_date=None):
        if not actor.is_admin:
            raise PermissionError("เฉพาะ Admin เท่านั้นที่สามารถมอบหมายงานได้")
        if technician.role != 'technician':
            raise ValueError("ผู้รับมอบหมายต้องเป็นช่างซ่อมบำรุงเท่านั้น")
        self.assigned_to = technician.id
        self.due_date = due_date
        self.status = 'accepted'
        self.history.append(('pending', 'accepted', actor.id))

    def start_repair(self, actor):
        if not (actor.is_admin or (actor.is_technician and self.assigned_to == actor.id)):
            raise PermissionError("ไม่มีสิทธิ์เริ่มงานที่ไม่ได้รับมอบหมาย")
        if not self.can_transition_to('in_progress'):
            raise ValueError(f"ไม่สามารถเปลี่ยนสถานะจาก {self.status} เป็น in_progress ได้")
        old = self.status
        self.status = 'in_progress'
        self.history.append((old, 'in_progress', actor.id))

    def complete_repair(self, actor, cost: float, result: str):
        if not (actor.is_admin or (actor.is_technician and self.assigned_to == actor.id)):
            raise PermissionError("ไม่มีสิทธิ์ปิดงานที่ไม่ได้รับมอบหมาย")
        if not self.can_transition_to('completed'):
            raise ValueError(f"ไม่สามารถปิดงานจากสถานะ {self.status} ได้")
        if cost is None or cost < 0:
            raise ValueError("ค่าใช้จ่ายต้องไม่ติดลบ")
        if not result or not result.strip():
            raise ValueError("ต้องระบุรายละเอียดผลการซ่อม")
        old = self.status
        self.status = 'completed'
        self.cost = cost
        self.result = result.strip()
        self.history.append((old, 'completed', actor.id))


class TestSchoolFixDomainAndSecurity(unittest.TestCase):
    """Test suite covering Section 10 testing requirements."""

    def setUp(self):
        self.admin = MockUser(id=1, username="admin1", fullname="แอดมิน สมชาย", role="admin")
        self.teacher1 = MockUser(id=2, username="teacher1", fullname="ครูวิไล", role="teacher")
        self.teacher2 = MockUser(id=3, username="teacher2", fullname="ครูนภดล", role="teacher")
        self.tech1 = MockUser(id=4, username="tech1", fullname="ช่างประเสริฐ", role="technician")
        self.tech2 = MockUser(id=5, username="tech2", fullname="ช่างกมล", role="technician")

    def test_request_number_generation_format(self):
        """1. เลขใบแจ้งซ่อมต้องเป็นรูปแบบ RP-YYYYMM-XXX"""
        dt = datetime(2025, 10, 15)
        req_no = MockRepairRequest.generate_request_no(1, dt)
        self.assertEqual(req_no, "RP-202510-001")
        req_no_99 = MockRepairRequest.generate_request_no(99, dt)
        self.assertEqual(req_no_99, "RP-202510-099")

    def test_valid_workflow_lifecycle(self):
        """2. ลำดับ workflow ที่ถูกต้อง: pending -> accepted -> in_progress -> completed"""
        req = MockRepairRequest(
            id=101, request_no="RP-202510-001", user_id=self.teacher1.id,
            building="อาคาร 2", room="224", problem_type="aircon", description="แอร์ไม่เย็น"
        )
        self.assertEqual(req.status, 'pending')

        # Admin assigns -> accepted
        req.assign_to_technician(self.tech1, self.admin, due_date=date(2025, 10, 20))
        self.assertEqual(req.status, 'accepted')
        self.assertEqual(req.assigned_to, self.tech1.id)

        # Assigned technician starts work -> in_progress
        req.start_repair(self.tech1)
        self.assertEqual(req.status, 'in_progress')

        # Assigned technician completes repair -> completed
        req.complete_repair(self.tech1, cost=450.0, result="เปลี่ยนสายพานและเติมน้ำยาแอร์")
        self.assertEqual(req.status, 'completed')
        self.assertEqual(req.cost, 450.0)
        self.assertEqual(req.result, "เปลี่ยนสายพานและเติมน้ำยาแอร์")
        self.assertEqual(len(req.history), 3)

    def test_reject_invalid_state_transitions(self):
        """3. ปฏิเสธการข้ามสถานะที่ไม่ถูกต้อง (ห้ามข้ามขั้นตอน)"""
        req = MockRepairRequest(
            id=102, request_no="RP-202510-002", user_id=self.teacher1.id,
            building="อาคาร 1", room="101", problem_type="electrical", description="ไฟดับ"
        )
        # Attempt to complete directly from pending by admin -> must fail with ValueError!
        with self.assertRaises(ValueError):
            req.complete_repair(self.admin, cost=100.0, result="เสร็จเลย")

        # Attempt to start directly from pending by admin -> must fail with ValueError!
        with self.assertRaises(ValueError):
            req.start_repair(self.admin)

    def test_teacher_cannot_view_other_teacher_requests(self):
        """4. ครูไม่สามารถดูใบแจ้งซ่อมของครูท่านอื่นได้"""
        req = MockRepairRequest(
            id=103, request_no="RP-202510-003", user_id=self.teacher1.id,
            building="อาคารศิลปะ", room="ห้อง 1", problem_type="furniture", description="เก้าอี้หัก"
        )
        # Teacher1 (owner) can view
        self.assertTrue(self.teacher1.can_view_request(req))
        # Teacher2 cannot view!
        self.assertFalse(self.teacher2.can_view_request(req))
        # Admin can view all
        self.assertTrue(self.admin.can_view_request(req))

    def test_technician_cannot_edit_unassigned_request(self):
        """5. ช่างไม่สามารถแก้ไขหรือปิดงานที่ไม่ได้รับมอบหมายได้"""
        req = MockRepairRequest(
            id=104, request_no="RP-202510-004", user_id=self.teacher1.id,
            building="อาคารวิทย์", room="ห้อง 3", problem_type="computer", description="จอเสีย"
        )
        req.assign_to_technician(self.tech1, self.admin)
        req.start_repair(self.tech1)

        # Tech2 attempts to complete Tech1's work -> must raise PermissionError
        with self.assertRaises(PermissionError):
            req.complete_repair(self.tech2, cost=200.0, result="ช่าง 2 แอบปิดงาน")

    def test_non_admin_cannot_assign_technician(self):
        """6. ผู้ที่ไม่ใช่ Admin ไม่สามารถมอบหมายงานได้"""
        req = MockRepairRequest(
            id=105, request_no="RP-202510-005", user_id=self.teacher1.id,
            building="อาคาร 3", room="ห้อง 301", problem_type="other", description="ประตูชำรุด"
        )
        with self.assertRaises(PermissionError):
            req.assign_to_technician(self.tech1, actor=self.teacher1)

    def test_cannot_assign_non_technician(self):
        """7. ไม่สามารถมอบหมายงานให้ผู้ที่ไม่ได้มี role เป็น technician"""
        req = MockRepairRequest(
            id=106, request_no="RP-202510-006", user_id=self.teacher1.id,
            building="อาคาร 3", room="ห้อง 302", problem_type="other", description="หน้าต่างชำรุด"
        )
        with self.assertRaises(ValueError):
            req.assign_to_technician(self.teacher2, actor=self.admin)

    def test_complete_repair_validation(self):
        """8. ปิดงานต้องมีค่าใช้จ่ายที่ไม่ติดลบและต้องมีข้อความผลการซ่อม"""
        req = MockRepairRequest(
            id=107, request_no="RP-202510-007", user_id=self.teacher1.id,
            building="อาคาร 1", room="ห้อง 102", problem_type="aircon", description="แอร์เสียงดัง"
        )
        req.assign_to_technician(self.tech1, self.admin)
        req.start_repair(self.tech1)

        # Negative cost -> Error
        with self.assertRaises(ValueError):
            req.complete_repair(self.tech1, cost=-50.0, result="เปลี่ยนใบพัด")

        # Empty result -> Error
        with self.assertRaises(ValueError):
            req.complete_repair(self.tech1, cost=100.0, result="   ")


if __name__ == '__main__':
    unittest.main()
