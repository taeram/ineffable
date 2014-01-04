from os import getenv, \
               path
from time import time
from datetime import timedelta

class Config(object):
    AWS_ACCESS_KEY_ID = getenv('AWS_ACCESS_KEY_ID')
    AWS_REGION = getenv('AWS_REGION')
    AWS_S3_BUCKET = getenv('AWS_S3_BUCKET')
    AWS_SECRET_ACCESS_KEY = getenv('AWS_SECRET_ACCESS_KEY')
    AWS_SQS_QUEUE = getenv('AWS_SQS_QUEUE')
    CACHE_BUSTER = int(path.getmtime(__file__))
    MAX_UPLOAD_SIZE = getenv('MAX_UPLOAD_SIZE')
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
    REMEMBER_COOKIE_DURATION = timedelta(days=30)
    SECRET_KEY = getenv('SECRET_KEY')
    SEND_FILE_MAX_AGE_DEFAULT = 365*86400
    SITE_NAME = getenv('SITE_NAME', 'Ineffable')
    SQLALCHEMY_DATABASE_URI = getenv('DATABASE_URL')
    SQLALCHEMY_ECHO = getenv('SQLALCHEMY_ECHO', False)
    THUMBD_DESCRIPTIONS = getenv('THUMBD_DESCRIPTIONS')

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    CACHE_BUSTER = int(time())
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'

class TestingConfig(Config):
    TESTING = True
