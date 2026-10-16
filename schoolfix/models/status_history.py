from datetime import datetime
from . import db
from .enums import RequestStatus

class RepairStatusHistory(db.Model):
    """
    RepairStatusHistory entity preserving the complete audit trail of state transitions.
    """
    __tablename__ = 'repair_status_history'

    id = db.Column(db.Integer, primary_key=True)
    repair_id = db.Column(db.Integer, db.ForeignKey('repair_requests.id', ondelete='CASCADE'), nullable=False, index=True)
    old_status = db.Column(db.String(30), nullable=True)
    new_status = db.Column(db.String(30), nullable=False)
    changed_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    remark = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    operator = db.relationship('User', foreign_keys=[changed_by])

    @property
    def new_status_display(self) -> str:
        return RequestStatus.labels().get(self.new_status, self.new_status)

    @property
    def old_status_display(self) -> str:
        return RequestStatus.labels().get(self.old_status, self.old_status) if self.old_status else 'เริ่มต้น'

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'repair_id': self.repair_id,
            'old_status': self.old_status,
            'old_status_display': self.old_status_display,
            'new_status': self.new_status,
            'new_status_display': self.new_status_display,
            'changed_by': self.changed_by,
            'changed_by_name': self.operator.fullname if self.operator else 'ระบบ',
            'remark': self.remark,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f"<RepairStatusHistory {self.old_status} -> {self.new_status}>"
