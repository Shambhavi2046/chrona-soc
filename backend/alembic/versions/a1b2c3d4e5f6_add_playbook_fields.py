"""add category and created_by to playbooks

Revision ID: a1b2c3d4e5f6
Revises: 9f4aa73ddcce
Create Date: 2026-08-02 23:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '9f4aa73ddcce'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('playbooks', sa.Column('category', sa.String(length=100), nullable=True, server_default='General'))
    op.add_column('playbooks', sa.Column('created_by', sa.String(length=255), nullable=True, server_default='System'))


def downgrade() -> None:
    op.drop_column('playbooks', 'created_by')
    op.drop_column('playbooks', 'category')
