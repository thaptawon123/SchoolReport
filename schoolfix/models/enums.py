from enum import Enum

class UserRole(str, Enum):
    ADMIN = 'admin'
    TEACHER = 'teacher'
    TECHNICIAN = 'technician'

    @classmethod
    def labels(cls):
        return {
            cls.ADMIN: 'ผู้ดูแลระบบ (Admin)',
            cls.TEACHER: 'ครู/บุคลากร (Teacher)',
            cls.TECHNICIAN: 'ช่างซ่อมบำรุง (Technician)'
        }

    def display_name(self) -> str:
        return self.labels().get(self.value, self.value)


class ProblemType(str, Enum):
    ELECTRICAL = 'electrical'
    AIRCON = 'aircon'
    COMPUTER = 'computer'
    FURNITURE = 'furniture'
    OTHER = 'other'

    @classmethod
    def labels(cls):
        return {
            cls.ELECTRICAL: 'ระบบไฟฟ้าและแสงสว่าง',
            cls.AIRCON: 'เครื่องปรับอากาศและพัดลม',
            cls.COMPUTER: 'คอมพิวเตอร์และอุปกรณ์ไอที',
            cls.FURNITURE: 'โต๊ะ เก้าอี้ และเฟอร์นิเจอร์',
            cls.OTHER: 'อื่นๆ / ทั่วไป'
        }

    def display_name(self) -> str:
        return self.labels().get(self.value, self.value)


class Urgency(str, Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'

    @classmethod
    def labels(cls):
        return {
            cls.LOW: 'ปกติ (Low)',
            cls.MEDIUM: 'ปานกลาง (Medium)',
            cls.HIGH: 'เร่งด่วน (High)'
        }

    def display_name(self) -> str:
        return self.labels().get(self.value, self.value)


class RequestStatus(str, Enum):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'

    @classmethod
    def labels(cls):
        return {
            cls.PENDING: 'รอรับเรื่อง',
            cls.ACCEPTED: 'รับเรื่องแล้ว',
            cls.IN_PROGRESS: 'กำลังดำเนินการ',
            cls.COMPLETED: 'ซ่อมเสร็จสิ้น'
        }

    def display_name(self) -> str:
        return self.labels().get(self.value, self.value)


class ImageType(str, Enum):
    BEFORE = 'before'
    AFTER = 'after'
