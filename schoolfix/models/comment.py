from datetime import datetime
from . import db

class Comment(db.Model):
    """
    Comment entity representing discussions between Teacher, Admin, and Technician.
    """
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    repair_id = db.Column(db.Integer, db.ForeignKey('repair_requests.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'repair_id': self.repair_id,
            'user_id': self.user_id,
            'user_name': self.author.fullname if self.author else None,
            'user_role': self.author.role if self.author else None,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<Comment id={self.id} repair_id={self.repair_id} user_id={self.user_id}>"
