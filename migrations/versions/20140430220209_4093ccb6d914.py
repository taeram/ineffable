"""empty message

Revision ID: 4093ccb6d914
Revises: None
Create Date: 2014-04-30 22:02:09.991428

"""

# revision identifiers, used by Alembic.
revision = '4093ccb6d914'
down_revision = None

from alembic import op
import sqlalchemy as sa
from datetime import datetime


def upgrade():
    op.create_table('gallery',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('folder', sa.types.VARCHAR(length=255), nullable=False),
        sa.Column('share_code', sa.Text(), nullable=False),
        sa.Column('modified', sa.DateTime(timezone=True), default=datetime.utcnow),
        sa.Column('created', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('folder')
    )
    op.create_table('user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.types.VARCHAR(length=255), nullable=False),
        sa.Column('password', sa.Text(), nullable=False),
        sa.Column('role', sa.Text(), nullable=False, server_default="user"),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )


def downgrade():
    op.drop_table('user')
    op.drop_table('gallery')
