from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user
from ..repositories.repair_repository import RepairRepository
from ..models import RequestStatus, ProblemType, Urgency

main_bp = Blueprint('main', __name__)
repair_repo = RepairRepository()

@main_bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('auth.login'))

@main_bp.route('/dashboard')
@login_required
def dashboard():
    stats = repair_repo.get_statistics(current_user)
    recent_requests = repair_repo.get_all(user=current_user)[:6]
    
    return render_template(
        'dashboard.html',
        stats=stats,
        recent_requests=recent_requests,
        RequestStatus=RequestStatus,
        ProblemType=ProblemType,
        Urgency=Urgency
    )
