from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import func
from ..models import db, RepairRequest, User, RequestStatus, ProblemType, Urgency

class RepairRepository:
    """
    Repository pattern implementation for RepairRequest data access.
    Abstracts direct database interactions away from the Service layer.
    """

    def get_by_id(self, repair_id: int) -> Optional[RepairRequest]:
        return db.session.get(RepairRequest, repair_id)

    def get_by_request_no(self, request_no: str) -> Optional[RepairRequest]:
        return RepairRequest.query.filter_by(request_no=request_no).first()

    def get_all(self, 
                user: Optional[User] = None, 
                status: Optional[str] = None,
                problem_type: Optional[str] = None,
                urgency: Optional[str] = None,
                search: Optional[str] = None,
                order_by_desc: bool = True) -> List[RepairRequest]:
        """Query requests with authorization rules and multi-criteria filters."""
        query = RepairRequest.query

        # Apply strict role scoping (Defense in depth)
        if user:
            if user.is_teacher:
                query = query.filter(RepairRequest.user_id == user.id)
            elif user.is_technician:
                query = query.filter(RepairRequest.assigned_to == user.id)
            # Admin sees all

        if status:
            query = query.filter(RepairRequest.status == status)

        if problem_type:
            query = query.filter(RepairRequest.problem_type == problem_type)

        if urgency:
            query = query.filter(RepairRequest.urgency == urgency)

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                (RepairRequest.request_no.ilike(term)) |
                (RepairRequest.building.ilike(term)) |
                (RepairRequest.room.ilike(term)) |
                (RepairRequest.description.ilike(term))
            )

        if order_by_desc:
            query = query.order_by(RepairRequest.created_at.desc())
        else:
            query = query.order_by(RepairRequest.created_at.asc())

        return query.all()

    def get_next_sequence_for_month(self, year_month: str) -> int:
        """Count existing requests in current month to format next sequence number."""
        prefix = f"RP-{year_month}-%"
        count = RepairRequest.query.filter(RepairRequest.request_no.like(prefix)).count()
        return count + 1

    def get_statistics(self, user: Optional[User] = None) -> Dict[str, Any]:
        """Aggregate counts by status, problem_type, and total cost."""
        query = RepairRequest.query
        if user:
            if user.is_teacher:
                query = query.filter(RepairRequest.user_id == user.id)
            elif user.is_technician:
                query = query.filter(RepairRequest.assigned_to == user.id)

        all_reqs = query.all()
        total = len(all_reqs)
        pending = sum(1 for r in all_reqs if r.status == RequestStatus.PENDING.value)
        accepted = sum(1 for r in all_reqs if r.status == RequestStatus.ACCEPTED.value)
        in_progress = sum(1 for r in all_reqs if r.status == RequestStatus.IN_PROGRESS.value)
        completed = sum(1 for r in all_reqs if r.status == RequestStatus.COMPLETED.value)
        total_cost = sum(r.cost or 0.0 for r in all_reqs if r.status == RequestStatus.COMPLETED.value)

        # By category
        category_counts = {}
        for pt in ProblemType:
            category_counts[pt.value] = sum(1 for r in all_reqs if r.problem_type == pt.value)

        return {
            'total': total,
            'pending': pending,
            'accepted': accepted,
            'in_progress': in_progress,
            'completed': completed,
            'total_cost': total_cost,
            'category_counts': category_counts
        }

    def save(self, repair_request: RepairRequest) -> RepairRequest:
        db.session.add(repair_request)
        db.session.commit()
        return repair_request

    def delete(self, repair_request: RepairRequest) -> None:
        db.session.delete(repair_request)
        db.session.commit()
