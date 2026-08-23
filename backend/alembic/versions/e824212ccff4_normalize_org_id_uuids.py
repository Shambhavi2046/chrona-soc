"""normalize_org_id_uuids

Revision ID: e824212ccff4
Revises: dc169c8d39ef
Create Date: 2026-08-10 21:40:32.045041

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e824212ccff4'
down_revision: Union[str, None] = 'dc169c8d39ef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Normalize hyphenated org_id values to match SQLAlchemy UUID(.hex) format
    if op.get_bind().dialect.name == "sqlite":
        op.execute("UPDATE cases SET org_id = REPLACE(org_id, '-', '') WHERE org_id LIKE '%-%'")
        op.execute("UPDATE alerts SET org_id = REPLACE(org_id, '-', '') WHERE org_id LIKE '%-%'")
        op.execute("UPDATE integration_credentials SET org_id = REPLACE(org_id, '-', '') WHERE org_id LIKE '%-%'")


def downgrade() -> None:
    # Downgrade is not required as hex UUIDs are the correct format for SQLAlchemy SQLite mappings.
    pass
