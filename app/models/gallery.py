from app import db
import pytz
from datetime import datetime
import md5
import random
from sqlalchemy import func
from sqlalchemy.orm.exc import NoResultFound
from .photo import Photo


class Gallery(db.Model):

    """ A gallery of photos """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    folder = db.Column(db.String(32), nullable=False, unique=True)
    share_code = db.Column(db.String(255), nullable=False, unique=True)
    photos = db.relationship('Photo', backref="gallery", lazy="dynamic")
    modified = db.Column(db.DateTime(timezone=True))
    created = db.Column(db.DateTime(timezone=True))

    def __init__(self, name, created):
        """ Setup the class """
        self.name = name
        self.folder = md5.new("%032x" % random.getrandbits(128)).hexdigest()
        self.share_code = md5.new("%032x" % random.getrandbits(128)).hexdigest()
        self.modified = datetime.now(pytz.utc)
        self.created = created

    def update_modified(self):
        """ Update the modified time of the gallery """
        self.modified = datetime.now(pytz.utc).replace(tzinfo=None)
        db.session.add(self)
        db.session.commit()

    def delete(self):
        """ Delete a gallery and all its photos """
        for photo in self.photos:
            photo.delete()

        db.session.delete(self)
        db.session.commit()

    def to_object(self):
        """ Get it as an object """

        photos = db.session.query(Photo)\
                           .filter(Photo.gallery_id == self.id)\
                           .order_by(db.asc(Photo.created), db.desc(Photo.name))

        gallery = {
            "id": self.id,
            "name": self.name,
            "folder": self.folder,
            "share_code": self.share_code,
            "modified": self.modified.strftime('%Y-%m-%d %H:%M:%S'),
            "created": self.created.strftime('%Y-%m-%d %H:%M:%S'),
            "photos": [photo.to_object() for photo in photos]
        }

        return gallery

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def find_all(offset, limit, search_query):
        """ Get all galleries """
        query = db.session.query(Gallery)

        if search_query is not None:
            query = query.filter(func.lower(Gallery.name).like('%%%s%%' % search_query))

        return query.order_by(db.desc(Gallery.created)).\
                    limit(limit).\
                    offset(offset).\
                    all()

    @staticmethod
    def find_by_id(gallery_id):
        """ Find a single gallery """
        try:
            return db.session.query(Gallery).\
                             filter(Gallery.id == gallery_id).\
                             one()
        except NoResultFound:
            return None

    @staticmethod
    def find_by_share_code(share_code):
        """ Find a single gallery """
        try:
            return db.session.query(Gallery).\
                             filter(Gallery.share_code == share_code).\
                             one()
        except NoResultFound:
            return None
