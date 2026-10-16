from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .repair_request import RepairRequest
from .repair_image import RepairImage
from .comment import Comment
from .status_history import RepairStatusHistory
from .enums import UserRole, ProblemType, Urgency, RequestStatus, ImageType

__all__ = [
    'db',
    'User',
    'RepairRequest',
    'RepairImage',
    'Comment',
    'RepairStatusHistory',
    'UserRole',
    'ProblemType',
    'Urgency',
    'RequestStatus',
    'ImageType'
]
