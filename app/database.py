from app import app
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager, prompt_bool, prompt
from flask.ext.login import UserMixin
from datetime import datetime
from .snippets.hash_passwords import check_hash, make_hash
from hashlib import sha1
from .auth import login_serializer
import md5
import random
from sqlalchemy.orm.exc import NoResultFound
from helpers import generate_thumbnail, \
                    save_gallery_photos, \
                    get_gallery_photos
from urllib import unquote

db = SQLAlchemy(app)

manager = Manager(usage="Manage the database")


@manager.command
def create():
    """ Create the database """
    db.create_all()
    setup()


@manager.command
def setup():
    """ Populate the database with some defaults """
    if prompt_bool("Do you want to add an admin user?"):
        name = prompt("Username for admin")
        password = prompt("Password for admin")
        user = User(name=name, password=password)
        db.session.add(user)
        db.session.commit()


@manager.command
def drop():
    """ Empty the database """
    if prompt_bool("Are you sure you want to drop all tables from the database?"):
        db.drop_all()


@manager.command
def recreate():
    """ Recreate the database """
    drop()
    create()


def find_user_by_id(user_id):
    """ Get a user by id """
    try:
        return db.session.query(User).\
                         filter(User.id == user_id).\
                         one()
    except NoResultFound:
        return None


def find_user_by_name(name):
    """ Get a user by name """
    try:
        return db.session.query(User).\
                         filter(User.name == name).\
                         one()
    except NoResultFound:
        return None


def find_gallery_all():
    """ Get all galleries """
    return db.session.query(Gallery).\
                      order_by(db.desc(Gallery.created)).\
                      all()


def find_gallery_by_id(gallery_id):
    """ Find a single gallery """
    try:
        return db.session.query(Gallery).\
                         filter(Gallery.id == gallery_id).\
                         one()
    except NoResultFound:
        return None


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
        self.gallery = find_gallery_by_id(gallery_id)
        self.aspect_ratio = aspect_ratio

        if created is not None and len(created) > 0:
            self.created = datetime.strptime(created, '%Y:%m:%d %H:%M:%S')
        else:
            self.created = datetime.utcnow()

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


class Gallery(db.Model):

    """ A gallery of photos """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    folder = db.Column(db.Text, nullable=False, unique=True)
    created = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def __init__(self, name, created):
        """ Setup the class """
        self.name = name
        self.created = created
        self.folder = md5.new("%032x" % random.getrandbits(128)).hexdigest()

    def get_photos(self):
        """ Get the photos for this gallery """
        return get_gallery_photos(self.folder)

    def set_photos(self, photos):
        """ Set the photos for the gallery """
        return save_gallery_photos(self.folder, photos)

    def add_photo(self, photo):
        """ Add a photo to the gallery """
        photos = self.get_photos()
        photos.append(photo)

        # Deduplicate the photos list
        # Start with the one we just added so it will overwrite any previous copies
        unique_photos = []
        photo_ids = []
        for photo in photos:
            if photo['id'] not in photo_ids:
                unique_photos.append(photo)
            photo_ids.append(photo['id'])

        # Order the photos by name, and then by created date
        sorted_photos = sorted(unique_photos, key=lambda photo: photo['name'])
        sorted_photos = sorted(sorted_photos, key=lambda photo: photo['created'])

        return self.set_photos(sorted_photos)

    def to_object(self):
        """ Get it as an object """
        gallery = {
            "id": self.id,
            "name": self.name,
            "folder": self.folder,
            "created": self.created.strftime('%Y-%m-%d %H:%M:%S')
        }

        return gallery


class User(db.Model, UserMixin):

    """ A user """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)

    def __init__(self, name, password):
        """ Setup the class """
        self.name = name
        self.password = make_hash(password)

    def get_auth_token(self):
        """ Get an auth token. Used when "remember me" is checked on login """
        data = (self.id, sha1(self.password).hexdigest())
        return login_serializer.dumps(data)

    def is_valid_password(self, password):
        """Check if provided password is valid."""
        return check_hash(password, self.password)
