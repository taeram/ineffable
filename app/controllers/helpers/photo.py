from app import app
import boto.sqs
from boto.sqs.message import RawMessage
from .gallery import ineffable_storage
import re
import json

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

ineffable_queue = IneffableQueue()


def generate_thumbnail(photo_path):
    """ Generate a thumbnail from this photo """

    message = {
        "original": photo_path,
        "descriptions": json.loads(app.config['THUMBD_DESCRIPTIONS'])
    }

    # If the original is a .gif, convert it to a .webm, and use that webm
    # as the original and display versions
    if is_gif.search(photo_path):
        for i,thumb in enumerate(message['descriptions']):
            if thumb['suffix'] == 'display':
                message['descriptions'][i] = {
                    "suffix": "display",
                    "format": "webm",
                    "strategy": "ffmpeg -y -i %(localPaths[0])s -c:v libvpx -crf 10 -b:v 1M -c:a libvorbis %(convertedPath)s"
                }

    ineffable_queue.write(json.dumps(message))


def delete_photo(gallery_folder, photo_id):
    """ Delete a photo from a gallery """
    photos = get_gallery_photos(gallery_folder)

    remaining_photos = []
    for photo in photos:
        if photo['id'] == photo_id:
            key = ineffable_storage.get_key("%s/%s.%s" % (gallery_folder, photo['name'], photo['ext']))
            key.delete()

            # .gif files use a .webm as their display photo
            if (photo['ext'] == 'gif'):
                display_ext = 'webm';
            else:
                display_ext = 'jpg'
            key = ineffable_storage.get_key("%s/%s_display.%s" % (gallery_folder, photo['name'], display_ext))
            key.delete()

            key = ineffable_storage.get_key("%s/%s_thumb.jpg" % (gallery_folder, photo['name']))
            key.delete()
        else:
            remaining_photos.append(photo)

    return save_gallery_photos(gallery_folder, remaining_photos)
