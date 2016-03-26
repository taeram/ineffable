import pytz
from datetime import datetime
import md5
from app.helpers import generate_thumbnail
from .gallery import Gallery
from urllib import unquote


class Photo():

    """ A photo """

    name = None
    ext = None
    owner_id = None
    gallery = None
    aspect_ratio = None
    created = None

    def __init__(self, name, ext, aspect_ratio, owner_id, gallery_id, created=None):
        """ Setup the class """
        self.id = md5.new(name + '.' + ext).hexdigest()
        self.name = unquote(name)
        self.ext = ext
        self.owner_id = owner_id
        self.gallery = Gallery.find_by_id(gallery_id)
        self.aspect_ratio = aspect_ratio

        if created is not None and len(created) > 0:
            self.created = datetime.strptime(created, '%Y:%m:%d %H:%M:%S')
        else:
            self.created = datetime.now(pytz.utc)

    def generate_thumbnail(self):
        """ Generate a thumbnail for this photo """
        photo_path = "%s/%s.%s" % (self.gallery.folder, self.name, self.ext)
        generate_thumbnail(photo_path)

    def save(self):
        """ Save this photo to the gallery """
        return self.gallery.add_photo(self.to_object())

    def to_object(self):
        """ Get this class as an object """
        return {
            "id": self.id,
            "name": self.name,
            "ext": self.ext,
            "aspect_ratio": self.aspect_ratio,
            "owner_id": self.owner_id,
            "created": self.created.strftime('%Y-%m-%d %H:%M:%S')
        }
