"""empty message

Revision ID: b10a9159cb8f
Revises: efceab33fad9
Create Date: 2016-03-26 15:26:40.706680

"""

# revision identifiers, used by Alembic.
revision = 'b10a9159cb8f'
down_revision = 'efceab33fad9'

from alembic import op
import sqlalchemy as sa
import json
import re

from app.controllers.helpers.gallery import ineffable_storage

def get_gallery_photos(gallery_folder):
    """ Get the list of photos in a gallery """
    key = ineffable_storage.get_key("%s/photos.json" % gallery_folder)

    try:
        gallery_json = key.get_contents_as_string()
    except Exception as e:
        return []

    return json.loads(gallery_json)

def delete_photos_json(gallery_folder):
    """ Delete the old photos.json file from this folder """
    bucket = ineffable_storage.get_bucket()
    photos = bucket.list(gallery_folder)
    is_photos_json = re.compile(r'(photos\.json)$', re.IGNORECASE)
    for photo in photos:
        if is_photos_json.search(photo.name):
            photo.delete()

    return True

def upgrade():
    ### commands auto generated by Alembic - please adjust! ###

    from app import app
    from app.models.gallery import Gallery
    from app.models.photo import Photo
    from app.models.user import User

    galleries = Gallery.find_all(0, 1000, None)
    for g in galleries:
        photos = get_gallery_photos(g.folder)

        for p in photos:
            photo = Photo(
                name=p['name'],
                ext=p['ext'],
                aspect_ratio=p['aspect_ratio'],
                user=User.find_by_id(p['owner_id']),
                gallery=g
            )
            photo.save()

        # Remove the json file from s3
        delete_photos_json(g.folder)

    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    pass
    ### end Alembic commands ###