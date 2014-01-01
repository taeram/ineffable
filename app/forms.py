from flask import flash
from flask.ext.wtf import Form
from wtforms.fields import TextField, PasswordField, BooleanField
from wtforms.validators import Required, ValidationError

class LoginForm(Form):
    username = TextField('Username', validators=[Required()])
    password = PasswordField('Password', validators=[Required()])
    remember = BooleanField('Remember Me', default=False)
