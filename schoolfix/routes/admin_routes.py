from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from ..models import UserRole
from ..repositories.user_repository import UserRepository
from ..services.auth_service import AuthService
from .auth_routes import role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
user_repo = UserRepository()
auth_service = AuthService()

@admin_bp.route('/users', methods=['GET', 'POST'])
@login_required
@role_required(UserRole.ADMIN.value)
def manage_users():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        fullname = request.form.get('fullname')
        email = request.form.get('email')
        role = request.form.get('role', UserRole.TEACHER.value)
        department = request.form.get('department', '')
        phone = request.form.get('phone', '')

        success, user, msg = auth_service.register_user(
            username=username,
            password=password,
            fullname=fullname,
            email=email,
            role=role,
            department=department,
            phone=phone
        )

        if success:
            flash(msg, "success")
        else:
            flash(msg, "danger")

        return redirect(url_for('admin.manage_users'))

    users = user_repo.get_all()
    return render_template('admin/users.html', users=users, UserRole=UserRole)


@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@login_required
@role_required(UserRole.ADMIN.value)
def toggle_user_status(user_id: int):
    if user_id == current_user.id:
        flash("ไม่สามารถปิดการใช้งานบัญชีของตนเองได้", "warning")
        return redirect(url_for('admin.manage_users'))

    user = user_repo.get_by_id(user_id)
    if not user:
        abort(404)

    user.is_active = not user.is_active
    user_repo.save(user)
    status_label = "เปิดการใช้งาน" if user.is_active else "ระงับการใช้งาน"
    flash(f"{status_label}บัญชี {user.fullname} เรียบร้อยแล้ว", "success")
    return redirect(url_for('admin.manage_users'))
