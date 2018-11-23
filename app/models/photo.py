from app import app, db
import pytz
from datetime import datetime
import md5
import re
import json
from app.controllers.helpers.storage import ineffable_storage
from .user import User
from urllib import unquote


class Photo(db.Model):

    """ A photo """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    ext = db.Column(db.String(32), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    gallery_id = db.Column(db.Integer, db.ForeignKey('gallery.id'), nullable=False)
    aspect_ratio = db.Column(db.Float, nullable=False)
    created = db.Column(db.DateTime(timezone=False))

    def __init__(self, name, ext, aspect_ratio, owner, gallery, created=None):
        """ Setup the class """
        self.name = unquote(name)
        self.ext = ext
        self.aspect_ratio = aspect_ratio
        self.owner_id = owner.id
        self.gallery_id = gallery.id

        if created is not None and len(created) > 0:
            self.created = datetime.strptime(created, '%Y:%m:%d %H:%M:%S')
        else:
            self.created = datetime.now(pytz.utc)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        """ Delete the photo """
        # Delete the photo from s3
        self.delete_from_storage()

        db.session.delete(self)
        db.session.commit()

    def delete_from_storage(self):
        """ Delete a photo from s3 """

        key = ineffable_storage.get_key("%s/%s.%s" % (self.gallery.folder, self.name, self.ext))
        key.delete()

        # .gif files use a .webm as their display photo
        if (self.ext == 'gif'):
            display_ext = 'webm';
        else:
            display_ext = 'jpg'
        key = ineffable_storage.get_key("%s/%s_display.%s" % (self.gallery.folder, self.name, display_ext))
        key.delete()

        key = ineffable_storage.get_key("%s/%s_thumb.jpg" % (self.gallery.folder, self.name))
        key.delete()

    def to_object(self):
        """ Get this class as an object """
        return {
            "id": self.id,
            "name": self.name,
            "ext": self.ext,
            "aspect_ratio": self.aspect_ratio,
            "created": self.created.strftime('%Y-%m-%d %H:%M:%S')
        }

    @staticmethod
    def find_by_id(photo_id):
        """ Find a single photo """
        try:
            return db.session.query(Photo).\
                             filter(Photo.id == photo_id).\
                             one()
        except NoResultFound:
            return None
