import os
APP_DIR=os.path.dirname(os.path.realpath(__file__))

# Activate the virtualenv
activate_this = APP_DIR + '/.virtualenv/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

# Add the application to the sys path
import sys
sys.path.insert(0, APP_DIR)

# Manually pass variables set in Apache using SetEnv to Flask
setenv_variables = ['AWS_ACCESS_KEY_ID', 'AWS_REGION', 'AWS_S3_BUCKET', 'AWS_SECRET_ACCESS_KEY', 'AWS_SQS_QUEUE', 'DATABASE_URL', 'FLASK_ENV', 'MAX_UPLOAD_SIZE', 'SECRET_KEY', 'SITE_NAME', 'THUMBD_DESCRIPTIONS']
def application(environ, start_response):
    for key in setenv_variables:
        os.environ[key] = environ.get(key, '')

    from app import app as flask_application
    return flask_application(environ, start_response)
