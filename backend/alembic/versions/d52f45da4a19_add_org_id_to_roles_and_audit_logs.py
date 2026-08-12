"""Add org_id to roles and audit_logs

Revision ID: d52f45da4a19
Revises: 7c26d6f49135
Create Date: 2026-08-12 15:20:07.703842

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd52f45da4a19'
down_revision: Union[str, None] = '7c26d6f49135'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('roles') as batch_op:
        batch_op.add_column(sa.Column('org_id', sa.UUID(), nullable=True))
        batch_op.create_index(batch_op.f('ix_roles_org_id'), ['org_id'], unique=False)
        batch_op.create_foreign_key('fk_roles_org_id', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('audit_logs') as batch_op:
        batch_op.add_column(sa.Column('org_id', sa.UUID(), nullable=True))
        batch_op.create_index(batch_op.f('ix_audit_logs_org_id'), ['org_id'], unique=False)
        batch_op.create_foreign_key('fk_audit_logs_org_id', 'organizations', ['org_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    with op.batch_alter_table('audit_logs') as batch_op:
        batch_op.drop_constraint('fk_audit_logs_org_id', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_audit_logs_org_id'))
        batch_op.drop_column('org_id')

    with op.batch_alter_table('roles') as batch_op:
        batch_op.drop_constraint('fk_roles_org_id', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_roles_org_id'))
        batch_op.drop_column('org_id')
