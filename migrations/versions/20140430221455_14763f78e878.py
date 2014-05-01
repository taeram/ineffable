"""empty message

Revision ID: 14763f78e878
Revises: 443c31e33806
Create Date: 2014-04-30 22:14:55.891420

"""

# revision identifiers, used by Alembic.
revision = '14763f78e878'
down_revision = '4093ccb6d914'

from alembic import op
import sqlalchemy as sa
from datetime import datetime


def upgrade():
    op.add_column('gallery', sa.Column('modified', sa.DateTime(timezone=True), default=datetime.utcnow))


def downgrade():
    op.drop_column('gallery', 'modified')
