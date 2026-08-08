"""merge heads

Revision ID: 2449379bedbe
Revises: 8177a159920d, b2c3d4e5f6a7
Create Date: 2026-08-08 19:39:26.845476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2449379bedbe'
down_revision: Union[str, None] = ('8177a159920d', 'b2c3d4e5f6a7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
