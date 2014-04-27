from app import app
from flask import flash, \
                  redirect, \
                  request, \
                  url_for
from flask.ext.login import LoginManager
from itsdangerous import URLSafeTimedSerializer

login_serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
from .database import find_user_by_id

# Initialize flask-login
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    """ Get a user """
    return find_user_by_id(user_id)


@login_manager.unauthorized_handler
def unauthorized_handler():
    """ Handle requests to login protected pages """
    flash('Please login', 'warning')
    return redirect(url_for('login', next=request.path))
