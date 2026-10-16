from typing import Optional, List
from ..models import db, User, UserRole

class UserRepository:
    """Repository for User data access."""

    def get_by_id(self, user_id: int) -> Optional[User]:
        return db.session.get(User, user_id)

    def get_by_username(self, username: str) -> Optional[User]:
        return User.query.filter_by(username=username).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return User.query.filter_by(email=email).first()

    def get_all(self, role: Optional[str] = None) -> List[User]:
        query = User.query
        if role:
            query = query.filter_by(role=role)
        return query.order_by(User.id.asc()).all()

    def get_all_technicians(self) -> List[User]:
        return User.query.filter_by(role=UserRole.TECHNICIAN.value, is_active=True).all()

    def save(self, user: User) -> User:
        db.session.add(user)
        db.session.commit()
        return user
