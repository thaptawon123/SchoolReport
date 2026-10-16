from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort, Response
from flask_login import login_required, current_user
from ..models import UserRole, RequestStatus, ProblemType, Urgency
from ..services.repair_service import RepairService
from ..services.report_service import ReportService
from ..repositories.repair_repository import RepairRepository
from ..repositories.user_repository import UserRepository
from .auth_routes import role_required

repair_bp = Blueprint('repair', __name__, url_prefix='/repairs')
repair_service = RepairService()
repair_repo = RepairRepository()
user_repo = UserRepository()
report_service = ReportService()


@repair_bp.route('', methods=['GET'])
@login_required
def list_repairs():
    status = request.args.get('status')
    problem_type = request.args.get('problem_type')
    urgency = request.args.get('urgency')
    search = request.args.get('search')

    requests = repair_repo.get_all(
        user=current_user,
        status=status,
        problem_type=problem_type,
        urgency=urgency,
        search=search
    )

    return render_template(
        'repairs/list.html',
        requests=requests,
        current_status=status,
        current_type=problem_type,
        current_urgency=urgency,
        search_query=search,
        RequestStatus=RequestStatus,
        ProblemType=ProblemType,
        Urgency=Urgency
    )


@repair_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_repair():
    # Only Teacher or Admin can report repairs
    if current_user.is_technician:
        flash("เจ้าหน้าที่ช่างซ่อมไม่สามารถสร้างใบแจ้งซ่อมใหม่ได้", "warning")
        return redirect(url_for('repair.list_repairs'))

    if request.method == 'POST':
        building = request.form.get('building')
        room = request.form.get('room')
        problem_type = request.form.get('problem_type')
        description = request.form.get('description')
        urgency = request.form.get('urgency', Urgency.MEDIUM.value)
        image_file = request.files.get('image')

        success, req, msg = repair_service.create_request(
            user=current_user,
            building=building,
            room=room,
            problem_type=problem_type,
            description=description,
            urgency=urgency,
            image_file=image_file
        )

        if success and req:
            flash(f"แจ้งซ่อมสำเร็จ! หมายเลขอ้างอิง {req.request_no}", "success")
            return redirect(url_for('repair.repair_detail', repair_id=req.id))
        else:
            flash(msg, "danger")

    return render_template(
        'repairs/create.html',
        ProblemType=ProblemType,
        Urgency=Urgency
    )


@repair_bp.route('/<int:repair_id>', methods=['GET'])
@login_required
def repair_detail(repair_id: int):
    req = repair_repo.get_by_id(repair_id)
    if not req:
        abort(404)

    # Authorization Check
    if not current_user.can_view_request(req):
        abort(403)

    technicians = user_repo.get_all_technicians() if current_user.is_admin else []

    return render_template(
        'repairs/detail.html',
        req=req,
        technicians=technicians,
        RequestStatus=RequestStatus
    )


@repair_bp.route('/<int:repair_id>/assign', methods=['POST'])
@login_required
@role_required(UserRole.ADMIN.value)
def assign_repair(repair_id: int):
    technician_id = request.form.get('technician_id', type=int)
    due_date_str = request.form.get('due_date')
    remark = request.form.get('remark', '')

    due_date = None
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
        except ValueError:
            pass

    success, msg = repair_service.assign_to_technician(
        repair_id=repair_id,
        technician_id=technician_id,
        admin_user=current_user,
        due_date=due_date,
        remark=remark
    )

    if success:
        flash(msg, "success")
    else:
        flash(msg, "danger")

    return redirect(url_for('repair.repair_detail', repair_id=repair_id))


@repair_bp.route('/<int:repair_id>/start', methods=['POST'])
@login_required
def start_repair(repair_id: int):
    remark = request.form.get('remark', '')
    success, msg = repair_service.start_repair(repair_id, current_user, remark)

    if success:
        flash(msg, "success")
    else:
        flash(msg, "danger")

    return redirect(url_for('repair.repair_detail', repair_id=repair_id))


@repair_bp.route('/<int:repair_id>/complete', methods=['POST'])
@login_required
def complete_repair(repair_id: int):
    cost_str = request.form.get('cost', '0')
    result = request.form.get('result', '')
    remark = request.form.get('remark', '')
    after_image = request.files.get('after_image')

    try:
        cost = float(cost_str)
    except ValueError:
        cost = -1.0

    success, msg = repair_service.complete_repair(
        repair_id=repair_id,
        actor=current_user,
        cost=cost,
        result=result,
        after_image_file=after_image,
        remark=remark
    )

    if success:
        flash(msg, "success")
    else:
        flash(msg, "danger")

    return redirect(url_for('repair.repair_detail', repair_id=repair_id))


@repair_bp.route('/<int:repair_id>/comment', methods=['POST'])
@login_required
def add_comment(repair_id: int):
    comment_text = request.form.get('comment', '')
    success, msg = repair_service.add_comment(repair_id, current_user, comment_text)

    if success:
        flash(msg, "success")
    else:
        flash(msg, "danger")

    return redirect(url_for('repair.repair_detail', repair_id=repair_id))


@repair_bp.route('/<int:repair_id>/print', methods=['GET'])
@login_required
def print_slip(repair_id: int):
    req = repair_repo.get_by_id(repair_id)
    if not req:
        abort(404)
    if not current_user.can_view_request(req):
        abort(403)

    return render_template('repairs/print_ticket.html', req=req)


@repair_bp.route('/export/csv', methods=['GET'])
@login_required
def export_csv():
    # Only Admin or Teacher/Technician within their allowed scope
    status = request.args.get('status')
    problem_type = request.args.get('problem_type')
    urgency = request.args.get('urgency')

    requests = repair_repo.get_all(
        user=current_user,
        status=status,
        problem_type=problem_type,
        urgency=urgency
    )

    csv_data, mime, ext = report_service.export_data(requests, 'csv')
    filename = f"schoolfix_repairs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{ext}"

    return Response(
        csv_data,
        mimetype=mime,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
