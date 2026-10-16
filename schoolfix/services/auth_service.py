from typing import Optional, Tuple
from ..models import User, UserRole
from ..repositories.user_repository import UserRepository

class AuthService:
    """
    Service coordinating authentication, registration, and user access policies.
    """
    def __init__(self, user_repo: Optional[UserRepository] = None):
        self.user_repo = user_repo or UserRepository()

    def authenticate(self, username: str, password: str) -> Tuple[bool, Optional[User], str]:
        """Authenticate user credentials."""
        if not username or not password:
            return False, None, "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"

        user = self.user_repo.get_by_username(username.strip())
        if not user:
            return False, None, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"

        if not user.is_active:
            return False, None, "บัญชีผู้ใช้นี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ"

        if not user.check_password(password):
            return False, None, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"

        return True, user, "เข้าสู่ระบบสำเร็จ"

    def register_user(self, username: str, password: str, fullname: str, email: str, 
                      role: str = UserRole.TEACHER.value, department: str = "", phone: str = "") -> Tuple[bool, Optional[User], str]:
        """Register a new user with validation."""
        username = username.strip()
        email = email.strip().lower()
        fullname = fullname.strip()

        if len(username) < 3:
            return False, None, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"

        if self.user_repo.get_by_username(username):
            return False, None, f"ชื่อผู้ใช้ '{username}' มีอยู่ในระบบแล้ว"

        if self.user_repo.get_by_email(email):
            return False, None, f"อีเมล '{email}' ถูกใช้งานแล้ว"

        if role not in [r.value for r in UserRole]:
            return False, None, f"บทบาท '{role}' ไม่ถูกต้องในระบบ"

        try:
            user = User(
                username=username,
                fullname=fullname,
                email=email,
                role=role,
                department=department.strip(),
                phone=phone.strip()
            )
            user.set_password(password)
            saved = self.user_repo.save(user)
            return True, saved, "สร้างบัญชีผู้ใช้งานสำเร็จ"
        except Exception as e:
            return False, None, str(e)
