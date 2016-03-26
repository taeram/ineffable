from app import app, db
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager, prompt_bool, prompt
from flask.ext.migrate import Migrate, MigrateCommand
from app.models.user import User

migrate = Migrate(app, db)
migration_manager = Manager(usage="Manage the database")
migration_manager.add_command('migrate', MigrateCommand)

@migration_manager.command
def create():
    """ Create the database """
    db.create_all()
    setup()


@migration_manager.command
def setup():
    """ Populate the database with some defaults """
    if prompt_bool("Do you want to add an admin user?"):
        name = prompt("Username for admin")
        password = prompt("Password for admin")
        user = User(name=name, password=password, role='admin')
        db.session.add(user)
        db.session.commit()


@migration_manager.command
def drop():
    """ Empty the database """
    if prompt_bool("Are you sure you want to drop all tables from the database?"):
        db.drop_all()


@migration_manager.command
def recreate():
    """ Recreate the database """
    drop()
    create()

manager = Manager(app)
manager.add_command("database", migration_manager)

if __name__ == '__main__':
    manager.run()
