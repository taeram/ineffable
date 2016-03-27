from flask.ext.login import UserMixin
from app.library.hash_passwords import check_hash, make_hash
from app import db
from hashlib import sha1
from sqlalchemy.orm.exc import NoResultFound

class User(db.Model, UserMixin):

    """ A user """

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.VARCHAR(255), nullable=False, unique=True)
    password = db.Column(db.VARCHAR(255), nullable=False)
    role = db.Column(db.Text, nullable=False, default="user")

    def __init__(self, name, password, role):
        """ Setup the class """
        self.name = name
        self.password = make_hash(password)
        self.role = role

    def get_role(self):
        return self.role

    def set_role(self, role):
        self.role = role
        return self

    def set_password(self, password):
        self.password = make_hash(password)

    def get_auth_token(self):
        """ Get an auth token. Used when "remember me" is checked on login """
        data = (self.id, sha1(self.password).hexdigest())
        return login_serializer.dumps(data)

    def is_valid_password(self, password):
        """Check if provided password is valid."""
        return check_hash(password, self.password)

    @staticmethod
    def find_all(offset=None, limit=None):
        """ Get all galleries """
        query = db.session.query(User).\
                    order_by(db.desc(User.name))

        if offset is not None and limit is not None:
            query = query.limit(limit).\
                          offset(offset)

        return query.all()

    @staticmethod
    def find_by_id(user_id):
        """ Get a user by id """
        try:
            return db.session.query(User).\
                             filter(User.id == user_id).\
                             one()
        except NoResultFound:
            return None

    @staticmethod
    def find_by_name(name):
        """ Get a user by name """
        try:
            return db.session.query(User).\
                             filter(User.name == name).\
                             one()
        except NoResultFound:
            return None
