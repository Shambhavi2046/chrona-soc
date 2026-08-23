"""fix_reports_schema

Revision ID: 6a7c823f9009
Revises: 8fe71f4b6e4c
Create Date: 2026-08-21 18:22:46.707148

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a7c823f9009'
down_revision: Union[str, None] = '8fe71f4b6e4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

from sqlalchemy.dialects import postgresql

def upgrade() -> None:
    # Add new columns
    op.add_column('reports', sa.Column('type', sa.String(), nullable=False))
    op.add_column('reports', sa.Column('source_id', sa.String(), nullable=True))
    op.add_column('reports', sa.Column('generated_by', sa.String(), nullable=False))
    op.add_column('reports', sa.Column('pages', sa.Integer(), server_default='1'))
    op.add_column('reports', sa.Column('content', sa.JSON(), nullable=True))

    # Drop obsolete objects
    op.drop_constraint('reports_generated_by_id_fkey', 'reports', type_='foreignkey')
    op.drop_column('reports', 'generated_by_id')
    op.drop_column('reports', 's3_url')

    # Fix template_id
    op.alter_column('reports', 'template_id',
                    type_=postgresql.UUID(as_uuid=True),
                    postgresql_using='template_id::uuid')
    op.create_foreign_key('fk_reports_template_id_report_templates',
                          'reports', 'report_templates',
                          ['template_id'], ['id'])

def downgrade() -> None:
    # Revert template_id
    op.drop_constraint('fk_reports_template_id_report_templates', 'reports', type_='foreignkey')
    op.alter_column('reports', 'template_id', type_=sa.String(length=100))

    # Re-add obsolete columns
    op.add_column('reports', sa.Column('s3_url', sa.String(length=500), nullable=True))
    op.add_column('reports', sa.Column('generated_by_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('reports_generated_by_id_fkey', 'reports', 'users', ['generated_by_id'], ['id'], ondelete='SET NULL')

    # Drop new columns
    op.drop_column('reports', 'content')
    op.drop_column('reports', 'pages')
    op.drop_column('reports', 'generated_by')
    op.drop_column('reports', 'source_id')
    op.drop_column('reports', 'type')
