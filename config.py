from os import getenv
from datetime import timedelta

class Config(object):
    SITE_NAME = getenv('SITE_NAME', 'Ineffable')
    SQLALCHEMY_DATABASE_URI = getenv('DATABASE_URL')
    SECRET_KEY = getenv('SECRET_KEY')
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
    REMEMBER_COOKIE_DURATION = timedelta(days=30)
    AWS_ACCESS_KEY_ID = getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = getenv('AWS_REGION')
    AWS_S3_BUCKET = getenv('AWS_S3_BUCKET')
    AWS_SQS_QUEUE = getenv('AWS_SQS_QUEUE')
    MAX_UPLOAD_SIZE = getenv('MAX_UPLOAD_SIZE')

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'

class TestingConfig(Config):
    TESTING = True
