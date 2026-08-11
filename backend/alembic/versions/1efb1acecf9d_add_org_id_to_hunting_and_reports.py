"""add_org_id_to_hunting_and_reports

Revision ID: 1efb1acecf9d
Revises: e824212ccff4
Create Date: 2026-08-11 17:24:41.740856

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1efb1acecf9d'
down_revision: Union[str, None] = 'e824212ccff4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column as nullable first
    op.add_column('saved_hunts', sa.Column('org_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('report_templates', sa.Column('org_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('reports', sa.Column('org_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
    
    # Backfill existing records with the Chrona Security default org
    op.execute("UPDATE saved_hunts SET org_id = '7b037a37-1f5e-49be-b089-6a26320ae784'")
    op.execute("UPDATE report_templates SET org_id = '7b037a37-1f5e-49be-b089-6a26320ae784'")
    op.execute("UPDATE reports SET org_id = '7b037a37-1f5e-49be-b089-6a26320ae784'")
    
    # Alter columns to be NOT NULL and create constraints/indexes
    with op.batch_alter_table('saved_hunts') as batch_op:
        batch_op.alter_column('org_id', existing_type=sa.dialects.postgresql.UUID(as_uuid=True), nullable=False)
        batch_op.create_foreign_key('fk_saved_hunts_org_id_orgs', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')
        batch_op.create_index('ix_saved_hunts_org_id', ['org_id'])

    with op.batch_alter_table('report_templates') as batch_op:
        batch_op.alter_column('org_id', existing_type=sa.dialects.postgresql.UUID(as_uuid=True), nullable=False)
        batch_op.create_foreign_key('fk_report_templates_org_id_orgs', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')
        batch_op.create_index('ix_report_templates_org_id', ['org_id'])

    with op.batch_alter_table('reports') as batch_op:
        batch_op.alter_column('org_id', existing_type=sa.dialects.postgresql.UUID(as_uuid=True), nullable=False)
        batch_op.create_foreign_key('fk_reports_org_id_orgs', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')
        batch_op.create_index('ix_reports_org_id', ['org_id'])


def downgrade() -> None:
    with op.batch_alter_table('reports') as batch_op:
        batch_op.drop_index('ix_reports_org_id')
        batch_op.drop_constraint('fk_reports_org_id_orgs', type_='foreignkey')
        batch_op.drop_column('org_id')

    with op.batch_alter_table('report_templates') as batch_op:
        batch_op.drop_index('ix_report_templates_org_id')
        batch_op.drop_constraint('fk_report_templates_org_id_orgs', type_='foreignkey')
        batch_op.drop_column('org_id')

    with op.batch_alter_table('saved_hunts') as batch_op:
        batch_op.drop_index('ix_saved_hunts_org_id')
        batch_op.drop_constraint('fk_saved_hunts_org_id_orgs', type_='foreignkey')
        batch_op.drop_column('org_id')
