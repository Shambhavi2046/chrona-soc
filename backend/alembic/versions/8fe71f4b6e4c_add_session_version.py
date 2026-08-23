"""add_session_version

Revision ID: 8fe71f4b6e4c
Revises: fad5fe0795cd
Create Date: 2026-08-19 12:46:43.186021

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8fe71f4b6e4c'
down_revision: Union[str, None] = 'fad5fe0795cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('session_version', sa.Integer(), nullable=False, server_default='1'))

def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('session_version')
