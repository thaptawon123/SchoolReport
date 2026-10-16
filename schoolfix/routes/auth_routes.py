from functools import wraps
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_user, logout_user, login_required, current_user
from ..services.auth_service import AuthService
from ..models import UserRole

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

def role_required(*allowed_roles):
    """Decorator to enforce role-based access control on routes."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('auth.login', next=request.url))
            if current_user.role not in allowed_roles:
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = bool(request.form.get('remember'))

        success, user, message = auth_service.authenticate(username, password)
        if success and user:
            login_user(user, remember=remember)
            flash(f"ยินดีต้อนรับคุณ {user.fullname} เข้าสู่ระบบ", "success")
            next_page = request.args.get('next')
            return redirect(next_page or url_for('main.dashboard'))
        else:
            flash(message, "danger")

    return render_template('login.html')


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash("ออกจากระบบเรียบร้อยแล้ว", "info")
    return redirect(url_for('auth.login'))
