"""Make IOC value unique per tenant

Revision ID: b6fe6f9ad695
Revises: d52f45da4a19
Create Date: 2026-08-18 22:38:29.509785

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b6fe6f9ad695'
down_revision: Union[str, None] = 'd52f45da4a19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('iocs', schema=None) as batch_op:
        batch_op.drop_index('ix_iocs_value')
        batch_op.create_index(batch_op.f('ix_iocs_value'), ['value'], unique=False)
        batch_op.create_index('ix_ioc_value_global_unique', ['value'], unique=True, postgresql_where=sa.text('org_id IS NULL'), sqlite_where=sa.text('org_id IS NULL'))
        batch_op.create_unique_constraint('uix_ioc_org_value', ['org_id', 'value'])

def downgrade() -> None:
    with op.batch_alter_table('iocs', schema=None) as batch_op:
        batch_op.drop_constraint('uix_ioc_org_value', type_='unique')
        batch_op.drop_index('ix_ioc_value_global_unique', postgresql_where=sa.text('org_id IS NULL'), sqlite_where=sa.text('org_id IS NULL'))
        batch_op.drop_index(batch_op.f('ix_iocs_value'))
        batch_op.create_index('ix_iocs_value', ['value'], unique=1)
