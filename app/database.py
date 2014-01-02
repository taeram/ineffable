from app import app
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager, prompt_bool, prompt
from flask.ext.login import UserMixin
from datetime import datetime
from .snippets.hash_passwords import check_hash, make_hash
from hashlib import sha1
from .auth import login_serializer
import md5

db = SQLAlchemy(app)

manager = Manager(usage="Manage the database")

@manager.command
def create():
    "Create the database"
    db.create_all()
    setup()

@manager.command
def setup():
    "Populate the database with some defaults"
    if prompt_bool("Do you want to add an admin user?"):
        name = prompt("Username for admin")
        password = prompt("Password for admin")
        user = User(name=name, password=password)
        db.session.add(user)
        db.session.commit()

@manager.command
def drop():
    "Empty the database"
    if prompt_bool("Are you sure you want to drop all tables from the database?"):
        db.drop_all()

@manager.command
def recreate():
    "Recreate the database"
    drop()
    create()

def find_user_by_id(user_id):
    """ Get a user by id """
    return db.session.query(User).\
                     filter(User.id == user_id).\
                     first()

def find_user_by_name(name):
    """ Get a user by name """
    return db.session.query(User).\
                     filter(User.name == name).\
                     first()

def find_gallery_all():
    """ Get all galleries """
    return db.session.query(Gallery).all()

def find_gallery_by_id(gallery_id):
    """ Find a single gallery """
    return db.session.query(Gallery).\
                     filter(Gallery.id == gallery_id).\
                     first()

class Photo(db.Model):
    """ A photo """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    ext = db.Column(db.Text, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    gallery_id = db.Column(db.Integer, db.ForeignKey('gallery.id'))
    aspect_ratio = db.Column(db.Float, nullable=False)
    created = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    def __init__(self, name, ext, aspect_ratio, user_id, gallery_id):
        self.name = name
        self.ext = ext
        self.user_id = user_id
        self.aspect_ratio = aspect_ratio
        self.gallery_id = gallery_id

    def to_object(self):
        """ Get it as an object """
        return {
            "id": self.id,
            "name": self.name,
            "ext": self.ext,
            "user_id": self.user_id,
            "aspect_ratio": self.aspect_ratio,
            "created": self.created.strftime('%Y-%m-%d %H:%M:%S')
        }

class Gallery(db.Model):
    """ A gallery of photos """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    photos = db.relationship('Photo', backref='gallery', lazy='dynamic')

    def __init__(self, name):
        self.name = name

    def get_folder(self):
        """ A unique hash for this album """
        return md5.new("%s-%s" % (self.id, self.created)).hexdigest()

    def to_object(self):
        """ Get it as an object """
        return {
            "id": self.id,
            "name": self.name,
            "created": self.created.strftime('%Y-%m-%d %H:%M:%S')
        }

class User(db.Model, UserMixin):
    """ A user """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)

    def __init__(self, name, password):
        self.name = name
        self.password = make_hash(password)

    def get_auth_token(self):
        """ Get an auth token. Used when "remember me" is checked on login """
        data = (self.id, sha1(self.password).hexdigest())
        return login_serializer.dumps(data)

    def is_valid_password(self, password):
        """Check if provided password is valid."""
        return check_hash(password, self.password)
