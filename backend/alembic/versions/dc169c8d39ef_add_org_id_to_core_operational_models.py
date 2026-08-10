"""Add org_id to core operational models

Revision ID: dc169c8d39ef
Revises: ecca0d5f6bfc
Create Date: 2026-08-10 16:39:27.891444

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dc169c8d39ef'
down_revision: Union[str, None] = 'ecca0d5f6bfc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns as nullable=True
    with op.batch_alter_table('alerts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('org_id', sa.UUID(), nullable=True))
        batch_op.create_index(batch_op.f('ix_alerts_org_id'), ['org_id'], unique=False)
        batch_op.create_foreign_key('fk_alerts_org_id', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('integration_credentials', schema=None) as batch_op:
        batch_op.add_column(sa.Column('org_id', sa.UUID(), nullable=True))
        batch_op.create_index(batch_op.f('ix_integration_credentials_org_id'), ['org_id'], unique=False)
        batch_op.create_foreign_key('fk_integration_credentials_org_id', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('playbooks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('org_id', sa.UUID(), nullable=True))
        batch_op.create_index(batch_op.f('ix_playbooks_org_id'), ['org_id'], unique=False)
        batch_op.create_foreign_key('fk_playbooks_org_id', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')

    # 2. Cleanup and Backfill
    # Playbooks: Delete test data
    op.execute(
        "DELETE FROM playbooks "
        "WHERE created_by = 'System' "
        "AND (name LIKE 'E2E Test Playbook%' OR name = 'ThreatFox Integration Test')"
    )

    # Alerts: Backfill Alert.org_id from Case.org_id
    op.execute(
        "UPDATE alerts "
        "SET org_id = (SELECT org_id FROM cases WHERE cases.id = alerts.case_id) "
        "WHERE case_id IS NOT NULL"
    )

    # Integration Credentials: Backfill legacy ThreatFox credential
    # Using the exact Chrona Security org_id identified in the database
    op.execute(
        "UPDATE integration_credentials "
        "SET org_id = '7b037a37-1f5e-49be-b089-6a26320ae784' "
        "WHERE name = 'ThreatFox Production' AND provider = 'threatfox'"
    )

    # 3. Enforce nullable=False
    with op.batch_alter_table('alerts', schema=None) as batch_op:
        batch_op.alter_column('org_id', existing_type=sa.UUID(), nullable=False)

    with op.batch_alter_table('integration_credentials', schema=None) as batch_op:
        batch_op.alter_column('org_id', existing_type=sa.UUID(), nullable=False)

    with op.batch_alter_table('playbooks', schema=None) as batch_op:
        batch_op.alter_column('org_id', existing_type=sa.UUID(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table('playbooks', schema=None) as batch_op:
        batch_op.drop_constraint('fk_playbooks_org_id', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_playbooks_org_id'))
        batch_op.drop_column('org_id')

    with op.batch_alter_table('integration_credentials', schema=None) as batch_op:
        batch_op.drop_constraint('fk_integration_credentials_org_id', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_integration_credentials_org_id'))
        batch_op.drop_column('org_id')

    with op.batch_alter_table('alerts', schema=None) as batch_op:
        batch_op.drop_constraint('fk_alerts_org_id', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_alerts_org_id'))
        batch_op.drop_column('org_id')
