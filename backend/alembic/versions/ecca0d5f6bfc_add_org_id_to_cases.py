"""Add org_id to cases

Revision ID: ecca0d5f6bfc
Revises: 51c9544cf611
Create Date: 2026-08-10 12:38:30.275828

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ecca0d5f6bfc'
down_revision: Union[str, None] = '51c9544cf611'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column as nullable first
    op.add_column('cases', sa.Column('org_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
    
    # Backfill existing records with the Chrona Security default org
    op.execute("UPDATE cases SET org_id = '7b037a37-1f5e-49be-b089-6a26320ae784'")
    
    # Alter column to be NOT NULL and create constraints/indexes
    with op.batch_alter_table('cases') as batch_op:
        batch_op.alter_column('org_id', existing_type=sa.dialects.postgresql.UUID(as_uuid=True), nullable=False)
        batch_op.create_foreign_key('fk_cases_org_id_orgs', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')
        batch_op.create_index('ix_cases_org_id', ['org_id'])


def downgrade() -> None:
    with op.batch_alter_table('cases') as batch_op:
        batch_op.drop_index('ix_cases_org_id')
        batch_op.drop_constraint('fk_cases_org_id_orgs', type_='foreignkey')
        batch_op.drop_column('org_id')
