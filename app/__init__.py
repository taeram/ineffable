# Application
from flask import Flask
app = Flask(__name__, template_folder="views/templates")
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Database
from flask.ext.sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

# Environment
from os import getenv
if getenv('FLASK_ENV') == 'production':
    app.config.from_object('config.ProductionConfig')
else:
    app.config.from_object('config.DevelopmentConfig')

app.debug = app.config['DEBUG']

# Logging
import logging
from logging import FileHandler
file_handler = FileHandler(filename="%s/ineffable.log" % app.config['LOG_DIR'])
file_handler.setLevel(logging.WARNING)
app.logger.addHandler(file_handler)

from .controllers import *
from .controllers.helpers import *
from .views.helpers.filters import *
