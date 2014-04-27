from app import app
import boto.sqs
from boto.sqs.message import RawMessage
from boto.s3.connection import S3Connection
from boto.s3.key import Key
import json

# Connect to the queue
sqs_conn = boto.sqs.connect_to_region(
    app.config['AWS_REGION'],
    aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=app.config['AWS_SECRET_ACCESS_KEY']
)

# Connect to S3
s3_conn = S3Connection(
    aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=app.config['AWS_SECRET_ACCESS_KEY']
)
s3_bucket = s3_conn.get_bucket(app.config['AWS_S3_BUCKET'])
s3_key = Key(s3_bucket)


def add_to_queue(message):
    """ Add a raw message to the queue """
    queue = sqs_conn.get_queue(queue_name=app.config['AWS_SQS_QUEUE'])
    if not queue:
        raise "Could not connect to queue"

    m = RawMessage()
    m.set_body(message)
    queue.write(m)


def generate_thumbnail(photo_path):
    """ Generate a thumbnail from this photo """
    message = {
        "original": photo_path,
        "descriptions": json.loads(app.config['THUMBD_DESCRIPTIONS'])
    }
    add_to_queue(json.dumps(message))


def get_gallery_photos(gallery_folder):
    """ Get the list of photos in a gallery """
    s3_key.key = "%s/photos.json" % gallery_folder

    try:
        gallery_json = s3_key.get_contents_as_string()
    except Exception as e:
        return []

    return json.loads(gallery_json)


def save_gallery_photos(gallery_folder, photos):
    """ Save the list of photos in a gallery """
    s3_key.key = "%s/photos.json" % gallery_folder
    s3_key.set_contents_from_string(json.dumps(photos))
    s3_key.make_public()

    return True
