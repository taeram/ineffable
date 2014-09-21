"""empty message

Revision ID: 413039fd475e
Revises: 14763f78e878
Create Date: 2014-09-21 12:40:33.740850

"""

# revision identifiers, used by Alembic.
revision = '413039fd475e'
down_revision = '14763f78e878'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column('user', sa.Column('role', sa.Text(), nullable=False, server_default="user"))

def downgrade():
    op.drop_column('user', 'role')