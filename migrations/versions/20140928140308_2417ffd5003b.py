"""empty message

Revision ID: 2417ffd5003b
Revises: 413039fd475e
Create Date: 2014-09-28 14:03:08.027720

"""

# revision identifiers, used by Alembic.
revision = '2417ffd5003b'
down_revision = '413039fd475e'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column('gallery', sa.Column('share_code', sa.Text()))
    op.execute("UPDATE gallery SET share_code = SUBSTR(MD5(RANDOM()::text), 0, 32)");
    op.alter_column('gallery', 'share_code', nullable=False)


def downgrade():
    op.drop_column('gallery', 'share_code')
