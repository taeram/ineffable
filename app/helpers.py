from app import app
import boto.sqs
from boto.sqs.message import RawMessage
from boto.s3.connection import S3Connection
from boto.s3.key import Key
import json
import re

# Common regular expressions
is_gif = re.compile(r'(\.gif)$', re.IGNORECASE)


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


ineffable_queue = IneffableQueue()
ineffable_storage = IneffableStorage()


def generate_thumbnail(photo_path):
    """ Generate a thumbnail from this photo """

    message = {
        "original": photo_path,
        "descriptions": json.loads(app.config['THUMBD_DESCRIPTIONS'])
    }

    # If the original is a .gif, we will use the original .gif as the display version
    if is_gif.search(photo_path):
        for i,thumb in enumerate(message['descriptions']):
            if thumb['suffix'] == 'display':
                del message['descriptions'][i]

    ineffable_queue.write(json.dumps(message))


def get_gallery_photos(gallery_folder):
    """ Get the list of photos in a gallery """
    key = ineffable_storage.get_key("%s/photos.json" % gallery_folder)

    try:
        gallery_json = key.get_contents_as_string()
    except Exception as e:
        return []

    return json.loads(gallery_json)


def save_gallery_photos(gallery_folder, photos):
    """ Save the list of photos in a gallery """
    key = ineffable_storage.get_key("%s/photos.json" % gallery_folder)
    key.set_contents_from_string(json.dumps(photos))
    key.make_public()

    return True


def delete_gallery(gallery_folder):
    """ Delete a gallery and all its photos """
    bucket = ineffable_storage.get_bucket()
    photos = bucket.list(gallery_folder)
    for photo in photos:
        photo.delete()

    return True


def delete_photo(gallery_folder, photo_id):
    """ Delete a photo from a gallery """
    photos = get_gallery_photos(gallery_folder)

    remaining_photos = []
    for photo in photos:
        if photo['id'] == photo_id:
            key = ineffable_storage.get_key("%s/%s.%s" % (gallery_folder, photo['name'], photo['ext']))
            key.delete()

            # .gif files use the original as their display version, so skip them here
            if (photo['ext'] != 'gif'):
                key = ineffable_storage.get_key("%s/%s_display.jpg" % (gallery_folder, photo['name']))
                key.delete()

            key = ineffable_storage.get_key("%s/%s_thumb.jpg" % (gallery_folder, photo['name']))
            key.delete()
        else:
            remaining_photos.append(photo)

    return save_gallery_photos(gallery_folder, remaining_photos)
