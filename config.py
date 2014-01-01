from os import getenv
from datetime import timedelta

class Config(object):
    SITE_NAME = getenv('SITE_NAME', 'Ineffable')
    SQLALCHEMY_DATABASE_URI = getenv('DATABASE_URL')
    SECRET_KEY = getenv('SECRET_KEY')
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)
    REMEMBER_COOKIE_DURATION = timedelta(days=30)

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'

class TestingConfig(Config):
    TESTING = True
