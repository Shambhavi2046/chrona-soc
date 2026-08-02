"""add playbook_executions

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-02 23:49:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('playbook_executions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('playbook_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('started_at', sa.String(length=100), nullable=False),
        sa.Column('completed_at', sa.String(length=100), nullable=True),
        sa.Column('duration', sa.String(length=50), nullable=True),
        sa.Column('execution_logs', sa.JSON(), nullable=True),
        sa.Column('initiated_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['playbook_id'], ['playbooks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('playbook_executions')
