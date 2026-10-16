from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from .enums import UserRole

class User(UserMixin, db.Model):
    """
    User entity representing system actors (Admin, Teacher, Technician).
    Demonstrates OOP Inheritance (UserMixin) and Encapsulation (password hashing & authorization checks).
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    fullname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False, default=UserRole.TEACHER.value)
    department = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships (Composition / Association)
    reported_requests = db.relationship(
        'RepairRequest',
        foreign_keys='RepairRequest.user_id',
        backref='reporter',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    assigned_tasks = db.relationship(
        'RepairRequest',
        foreign_keys='RepairRequest.assigned_to',
        backref='technician',
        lazy='dynamic'
    )
    comments = db.relationship(
        'Comment',
        backref='author',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )

    # Encapsulation: Password Security
    def set_password(self, password: str) -> None:
        """Hash and set user password securely using Werkzeug."""
        if not password or len(password.strip()) < 6:
            raise ValueError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร")
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify plain password against stored hash."""
        if not self.password_hash or not password:
            return False
        return check_password_hash(self.password_hash, password)

    # Encapsulation: Role Checking & Authorization Policies
    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN.value

    @property
    def is_teacher(self) -> bool:
        return self.role == UserRole.TEACHER.value

    @property
    def is_technician(self) -> bool:
        return self.role == UserRole.TECHNICIAN.value

    @property
    def role_display(self) -> str:
        return UserRole.labels().get(self.role, self.role)

    def can_view_request(self, repair_request) -> bool:
        """
        Policy check:
        - Admin can view all requests
        - Teacher can only view their own requests
        - Technician can only view tasks assigned to them
        """
        if self.is_admin:
            return True
        if self.is_teacher and repair_request.user_id == self.id:
            return True
        if self.is_technician and repair_request.assigned_to == self.id:
            return True
        return False

    def can_edit_request(self, repair_request) -> bool:
        """Check whether user can modify or execute actions on this request."""
        if self.is_admin:
            return True
        if self.is_technician and repair_request.assigned_to == self.id:
            return True
        return False

    def can_assign_technician(self) -> bool:
        """Only Admin has the authority to assign jobs."""
        return self.is_admin

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Serialize user object without leaking password hash."""
        data = {
            'id': self.id,
            'username': self.username,
            'fullname': self.fullname,
            'email': self.email,
            'role': self.role,
            'role_display': self.role_display,
            'department': self.department,
            'phone': self.phone,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_sensitive:
            data['password_hash'] = self.password_hash
        return data

    def __repr__(self):
        return f"<User id={self.id} username='{self.username}' role='{self.role}'>"
