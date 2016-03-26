from flask.ext.wtf import Form
from wtforms.fields import TextField,\
						   DateField
from wtforms.validators import Required

class GalleryForm(Form):
    name = TextField('Name', validators=[Required()])
    date = DateField('Date', validators=[Required()])
