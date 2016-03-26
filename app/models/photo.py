from app import db
import pytz
from datetime import datetime
import md5
from app.controllers.helpers.photo import generate_thumbnail
from .user import User
from urllib import unquote


class Photo(db.Model):

    """ A photo """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    ext = db.Column(db.String(32), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey(User.id))
    gallery_id = db.Column(db.Integer, db.ForeignKey('gallery.id'))
    aspect_ratio = db.Column(db.Float, nullable=False)
    created = db.Column(db.DateTime(timezone=True))

    def __init__(self, name, ext, aspect_ratio, user, gallery, created=None):
        """ Setup the class """
        self.name = unquote(name)
        self.ext = ext
        self.aspect_ratio = aspect_ratio
        self.owner_id = user.id
        self.gallery_id = gallery.id

        if created is not None and len(created) > 0:
            self.created = datetime.strptime(created, '%Y:%m:%d %H:%M:%S')
        else:
            self.created = datetime.now(pytz.utc)

    def generate_thumbnail(self):
        """ Generate a thumbnail for this photo """
        photo_path = "%s/%s.%s" % (self.gallery.folder, self.name, self.ext)
        generate_thumbnail(photo_path)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def to_object(self):
        """ Get this class as an object """
        return {
            "id": self.id,
            "name": self.name,
            "ext": self.ext,
            "aspect_ratio": self.aspect_ratio,
            "created": self.created.strftime('%Y-%m-%d %H:%M:%S')
        }
