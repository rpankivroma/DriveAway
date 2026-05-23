"""add_email_verification_and_consolidate_codes

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-22 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_verified to users
    op.add_column('users', sa.Column('is_verified', sa.SmallInteger(), nullable=False, server_default='0'))
    
    # Drop old password_reset_codes table (created in 0002)
    op.drop_table('password_reset_codes')
    
    # Create new consolidated verification_codes table
    op.create_table(
        'verification_codes',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('type', sa.Enum('reset_password', 'verify_email', name='verificationtypeenum'), nullable=False),
        sa.Column('code_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('is_used', sa.SmallInteger(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_general_ci',
        mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_verification_codes_email'), 'verification_codes', ['email'], unique=False)
    op.create_index(op.f('ix_verification_codes_id'), 'verification_codes', ['id'], unique=False)


def downgrade() -> None:
    # Drop new table
    op.drop_index(op.f('ix_verification_codes_id'), table_name='verification_codes')
    op.drop_index(op.f('ix_verification_codes_email'), table_name='verification_codes')
    op.drop_table('verification_codes')
    
    # Recreate old password_reset_codes table
    op.create_table(
        'password_reset_codes',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('code_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('is_used', sa.SmallInteger(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Remove is_verified from users
    op.drop_column('users', 'is_verified')
