from flask.ext.wtf import Form
from wtforms.fields import TextField,\
						   PasswordField,\
						   SelectField
from wtforms.validators import Required


class UserForm(Form):
    name = TextField('Name', validators=[Required()])
    role = SelectField('Role', choices=[('admin', 'admin'), ('user', 'user'), ('guest', 'guest')], default='user', validators=[Required()])
    password = PasswordField('Password', validators=[Required()])
