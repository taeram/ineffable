from app import app
import boto.sqs
from boto.sqs.message import RawMessage


class IneffableQueue(object):

    def __init__(self):
        """ Initialize the class """
        self.connection = None
        self.queue = None

    def setup_connection(self):
        """ Connect to SQS """
        if self.connection is None:
            self.connection = boto.sqs.connect_to_region(
                app.config['AWS_REGION'],
                aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=app.config['AWS_SECRET_ACCESS_KEY']
            )

    def setup_queue(self):
        """ Get an SQS queue """
        self.setup_connection()

        if self.queue is None:
            self.queue = self.connection.get_queue(queue_name=app.config['AWS_SQS_QUEUE'])

        if not self.queue:
            raise "Could not connect to queue"

        return self.queue

    def write(self, message):
        """ Add a raw message to the queue """
        self.setup_queue()

        m = RawMessage()
        m.set_body(message)
        self.queue.write(m)

ineffable_queue = IneffableQueue()
