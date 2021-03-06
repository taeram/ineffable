from app import app
from boto.s3.connection import S3Connection
from boto.s3.key import Key
import json


class IneffableStorage(object):

    def __init__(self):
        """ Initialize the class """
        self.connection = None
        self.bucket = None

    def setup_connection(self):
        """ Setup the connection to S3 """
        if self.connection is None:
            self.connection = S3Connection(
                aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=app.config['AWS_SECRET_ACCESS_KEY']
            )

    def setup_bucket(self):
        """ Setup the connection to the S3 bucket """
        self.setup_connection()
        if self.bucket is None:
            self.bucket = self.connection.get_bucket(app.config['AWS_S3_BUCKET'])

    def get_bucket(self):
        """ Get an S3 bucket """
        self.setup_bucket()
        return self.bucket

    def get_key(self, key_name):
        """ Get a key for a specific bucket """
        self.setup_bucket()

        key = Key(self.bucket)
        key.key = key_name

        return key

ineffable_storage = IneffableStorage()
