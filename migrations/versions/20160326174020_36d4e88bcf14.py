"""empty message

Revision ID: 36d4e88bcf14
Revises: b46ecc04c9f6
Create Date: 2016-03-26 17:40:20.550589

"""

# revision identifiers, used by Alembic.
revision = '36d4e88bcf14'
down_revision = 'b46ecc04c9f6'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_foreign_key(None, 'photo', 'user', ['owner_id'], ['id'])
    op.create_foreign_key(None, 'photo', 'gallery', ['gallery_id'], ['id'])
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'photo', type_='foreignkey')
    op.drop_constraint(None, 'photo', type_='foreignkey')
    ### end Alembic commands ###