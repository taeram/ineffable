from os import getenv, \
               path
from time import time
from datetime import timedelta

APP_DIR = path.dirname(path.realpath(__file__))

class Config(object):
    AWS_ACCESS_KEY_ID = getenv('AWS_ACCESS_KEY_ID')
    AWS_REGION = getenv('AWS_REGION')
    AWS_S3_BUCKET = getenv('AWS_S3_BUCKET')
    AWS_SECRET_ACCESS_KEY = getenv('AWS_SECRET_ACCESS_KEY')
    AWS_SQS_QUEUE = getenv('AWS_SQS_QUEUE')
    CACHE_BUSTER = int(path.getmtime(__file__))
    GALLERIES_PER_PAGE=5
    GOOGLE_ANALYTICS_ID = getenv('GOOGLE_ANALYTICS_ID', False)
    LOG_DIR = "%s/logs" % APP_DIR
    MAX_UPLOAD_SIZE = getenv('MAX_UPLOAD_SIZE')
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
    REMEMBER_COOKIE_DURATION = timedelta(days=30)
    SECRET_KEY = getenv('SECRET_KEY')
    SEND_FILE_MAX_AGE_DEFAULT = 365 * 86400
    SITE_NAME = getenv('SITE_NAME', 'Ineffable')
    SQLALCHEMY_DATABASE_URI = getenv('DATABASE_URL', 'sqlite:///' + path.dirname(__file__) + '/app/app.db').replace('mysql2:', 'mysql:')
    SQLALCHEMY_ECHO = getenv('SQLALCHEMY_ECHO', False)
    TESTING = False
    THUMBD_DESCRIPTIONS = getenv('THUMBD_DESCRIPTIONS')

class ProductionConfig(Config):
    DEBUG = getenv('DEBUG', False)

class DevelopmentConfig(Config):
    CACHE_BUSTER = time()
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
