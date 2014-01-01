from app import app
from flask import flash, \
                  redirect, \
                  request, \
                  url_for
from flask.ext.login import LoginManager, \
                            current_user
from itsdangerous import constant_time_compare, BadData, URLSafeTimedSerializer

login_serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
from database import find_user_by_id

# Initialize flask-login
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(id):
    return find_user_by_id(id)

@login_manager.unauthorized_handler
def unauthorized_handler():
    flash('Please login', 'warning')
    return redirect(url_for('login', next=request.path))

