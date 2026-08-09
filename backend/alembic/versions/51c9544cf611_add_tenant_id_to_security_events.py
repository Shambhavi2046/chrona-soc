"""Add tenant_id to security_events

Revision ID: 51c9544cf611
Revises: b8363bd78100
Create Date: 2026-08-09 23:09:54.511599

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '51c9544cf611'
down_revision: Union[str, None] = 'b8363bd78100'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column as nullable first
    op.add_column('security_events', sa.Column('tenant_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))

    # Backfill existing records with the Chrona Security default org
    op.execute("UPDATE security_events SET tenant_id = '7b037a37-1f5e-49be-b089-6a26320ae784'")

    # Alter column to be NOT NULL and create constraints/indexes
    # For SQLite compatibility, we use batch_alter_table
    with op.batch_alter_table('security_events') as batch_op:
        # Note: SQLite may not fully support alter_column for NOT NULL easily without recreating table,
        # but Alembic batch mode handles it.
        batch_op.alter_column('tenant_id', existing_type=sa.dialects.postgresql.UUID(as_uuid=True), nullable=False)
        batch_op.create_foreign_key('fk_security_events_tenant_id_orgs', 'organizations', ['tenant_id'], ['id'], ondelete='CASCADE')
        batch_op.create_index('ix_security_events_tenant_id', ['tenant_id'])


def downgrade() -> None:
    with op.batch_alter_table('security_events') as batch_op:
        batch_op.drop_index('ix_security_events_tenant_id')
        batch_op.drop_constraint('fk_security_events_tenant_id_orgs', type_='foreignkey')
        batch_op.drop_column('tenant_id')
