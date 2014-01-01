from app import app
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager, prompt_bool, prompt
from flask.ext.login import UserMixin
from datetime import datetime
from snippets.hash_passwords import check_hash, make_hash
from hashlib import sha1
from auth import login_serializer

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
        name=prompt("Username for admin")
        password=prompt("Password for admin")
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

def find_user_by_id(id):
    """ Get a user by id """
    return db.session.query(User).\
                     filter(User.id == id).\
                     first()

def find_user_by_name(name):
    """ Get a user by name """
    return db.session.query(User).\
                     filter(User.name == name).\
                     first()

def find_gallery_all():
    return db.session.query(Gallery).all()

def find_gallery_by_id(id):
    return db.session.query(Gallery).\
                     filter(Gallery.id == id).\
                     first()

class Photo(db.Model):
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

class Gallery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    photos = db.relationship('Photo', backref='gallery', lazy='dynamic')

    def __init__(self, name):
        self.name = name

    def to_object(self):
        return {
            "id": self.id,
            "name": self.name,
            "created": self.created.strftime('%Y-%m-%d %H:%M:%S')
        }

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)

    def __init__(self, name, password):
        self.name = name
        self.password = make_hash(password)

    def get_auth_token(self):
        data = (self.id, sha1(self.password).hexdigest())
        return login_serializer.dumps(data)

    def is_valid_password(self, password):
        """Check if provided password is valid."""
        return check_hash(password, self.password)
