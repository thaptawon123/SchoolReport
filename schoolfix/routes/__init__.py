from .auth_routes import auth_bp
from .main_routes import main_bp
from .repair_routes import repair_bp
from .admin_routes import admin_bp

__all__ = ['auth_bp', 'main_bp', 'repair_bp', 'admin_bp']
