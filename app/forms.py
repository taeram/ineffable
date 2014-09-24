from flask.ext.wtf import Form
from wtforms.fields import TextField,\
						   PasswordField,\
						   BooleanField,\
						   DateField,\
						   SelectField
from wtforms.validators import Required
from datetime import datetime


class LoginForm(Form):
    username = TextField('Username', validators=[Required()])
    password = PasswordField('Password', validators=[Required()])
    remember = BooleanField('Remember Me', default=False)


class GalleryForm(Form):
    name = TextField('Name', validators=[Required()])
    date = DateField('Date', validators=[Required()])


class UserForm(Form):
    name = TextField('Name', validators=[Required()])
    role = SelectField('Role', choices=[('admin', 'admin'), ('user', 'user'), ('guest', 'guest')], default='user', validators=[Required()])
    password = PasswordField('Password', validators=[Required()])
