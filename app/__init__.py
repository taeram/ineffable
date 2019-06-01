from flask import Flask

# Set the locale
import locale
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

app = Flask(__name__, template_folder="views/templates")
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Logging
import sys
import logging
log_handler = logging.StreamHandler(sys.stdout)
log_handler.setLevel(logging.WARNING)
app.logger.addHandler(log_handler)

# Environment
app.config.from_object('config.Config')
app.debug = app.config['DEBUG']

# Database
from flask.ext.sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

from .controllers import *
from .controllers.helpers import *
from .views.helpers.filters import *
