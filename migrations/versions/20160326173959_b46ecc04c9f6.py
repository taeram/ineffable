"""empty message

Revision ID: b46ecc04c9f6
Revises: b10a9159cb8f
Create Date: 2016-03-26 17:39:59.077004

"""

# revision identifiers, used by Alembic.
revision = 'b46ecc04c9f6'
down_revision = 'b10a9159cb8f'

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(u'photo_ibfk_1', 'photo', type_='foreignkey')
    op.drop_constraint(u'photo_ibfk_2', 'photo', type_='foreignkey')
    op.alter_column('photo', 'gallery_id',
               existing_type=mysql.INTEGER(display_width=11),
               nullable=False)
    op.alter_column('photo', 'owner_id',
               existing_type=mysql.INTEGER(display_width=11),
               nullable=False)
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_foreign_key(u'photo_ibfk_2', 'photo', 'user', ['owner_id'], ['id'])
    op.create_foreign_key(u'photo_ibfk_1', 'photo', 'gallery', ['gallery_id'], ['id'])
    op.alter_column('photo', 'owner_id',
               existing_type=mysql.INTEGER(display_width=11),
               nullable=True)
    op.alter_column('photo', 'gallery_id',
               existing_type=mysql.INTEGER(display_width=11),
               nullable=True)
    ### end Alembic commands ###