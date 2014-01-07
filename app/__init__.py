import os
from flask import Flask
from flask.ext.compress import Compress

app = Flask(__name__)
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Plugins
Compress(app)

if os.getenv('FLASK_ENV') == 'production':
    app.config.from_object('config.ProductionConfig')
else:
    app.config.from_object('config.DevelopmentConfig')

import auth
import filters
import views
