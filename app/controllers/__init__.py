from app import app
from app.models.user import User
from flask import flash, \
                  redirect,  \
                  request, \
                  url_for
from flask.ext.compress import Compress
from flask.ext.login import current_user, \
                            LoginManager

__all__ = [
    "gallery",
    "user"
]

# Flask-Compress plugin
Compress(app)

# Flask-Login plugin
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    """ Load a user """
    return User.find_by_id(user_id)

@login_manager.unauthorized_handler
def unauthorized_handler():
    """ Handle requests to login protected pages """
    flash('Please login', 'warning')
    return redirect(url_for('users_login', next=request.path))

# Global variables
@app.context_processor
def inject_globals():
    return dict(
        page_title=app.config['SITE_NAME'],
        og_photo_url='',
        current_user=current_user
    )
