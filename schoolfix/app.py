import os
from flask import Flask, render_template
from flask_login import LoginManager
from sqlalchemy import event
from sqlalchemy.engine import Engine

from .config import config_by_name
from .models import db, User
from .routes import auth_bp, main_bp, repair_bp, admin_bp

def create_app(config_name: str = 'development') -> Flask:
    """Application factory for SchoolFix."""
    app = Flask(__name__)
    config_obj = config_by_name.get(config_name, config_by_name['default'])
    app.config.from_object(config_obj)

    # Ensure uploads directory exists
    os.makedirs(app.config.get('UPLOAD_FOLDER', os.path.join(app.root_path, 'static', 'uploads')), exist_ok=True)

    # Initialize extensions
    db.init_app(app)

    # Enforce SQLite foreign key constraints
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA foreign_keys=ON")
        except Exception:
            pass
        finally:
            cursor.close()

    # Flask-Login setup
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน'
    login_manager.login_message_category = 'warning'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(repair_bp)
    app.register_blueprint(admin_bp)

    # Custom Jinja Template Filters
    @app.template_filter('thai_date')
    def thai_date_filter(dt):
        if not dt:
            return '-'
        months_th = [
            '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ]
        year_be = dt.year + 543
        return f"{dt.day} {months_th[dt.month]} {year_be}"

    @app.template_filter('thai_datetime')
    def thai_datetime_filter(dt):
        if not dt:
            return '-'
        months_th = [
            '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ]
        year_be = dt.year + 543
        return f"{dt.day} {months_th[dt.month]} {year_be} เวลา {dt.strftime('%H:%M น.')}"

    # Error Handlers
    @app.errorhandler(403)
    def forbidden_error(error):
        return render_template('errors/403.html'), 403

    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('errors/500.html'), 500

    return app

if __name__ == '__main__':
    app = create_app('development')
    app.run(host='0.0.0.0', port=5000, debug=True)
