from datetime import datetime
from . import db
from .enums import ImageType

class RepairImage(db.Model):
    """
    RepairImage entity representing uploaded photos (before and after repair).
    Demonstrates Composition (child of RepairRequest).
    """
    __tablename__ = 'repair_images'

    id = db.Column(db.Integer, primary_key=True)
    repair_id = db.Column(db.Integer, db.ForeignKey('repair_requests.id', ondelete='CASCADE'), nullable=False, index=True)
    image_type = db.Column(db.String(20), nullable=False, default=ImageType.BEFORE.value)
    image_path = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'repair_id': self.repair_id,
            'image_type': self.image_type,
            'image_path': self.image_path,
            'original_filename': self.original_filename,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

    def __repr__(self):
        return f"<RepairImage id={self.id} repair_id={self.repair_id} type='{self.image_type}'>"
