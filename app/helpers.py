from app import app
import boto.sqs
from boto.sqs.message import RawMessage

# Connect to the queue
conn = boto.sqs.connect_to_region(
        app.config['AWS_REGION'],
        aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=app.config['AWS_SECRET_ACCESS_KEY']
)

def add_to_queue(message):
    """ Add a raw message to the queue """
    queue = conn.get_queue(queue_name=app.config['AWS_SQS_QUEUE'])
    if not queue:
        raise "Could not connect to queue"

    m = RawMessage()
    m.set_body(message)
    queue.write(m)
