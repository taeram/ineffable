from flask import flash
from flask.ext.wtf import Form
from wtforms.fields import TextField, PasswordField, BooleanField, DateField
from wtforms.validators import Required, ValidationError

class LoginForm(Form):
    username = TextField('Username', validators=[Required()])
    password = PasswordField('Password', validators=[Required()])
    remember = BooleanField('Remember Me', default=False)

class CreateGalleryForm(Form):
    name = TextField('Name', validators=[Required()])
    date = DateField('Date', validators=[Required()])
