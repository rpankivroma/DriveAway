"""add_cards_table

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-03 15:52:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create cards table
    op.create_table(
        'cards',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('card_number', sa.String(length=50), nullable=False),
        sa.Column('expires', sa.Date(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cards_id'), 'cards', ['id'], unique=False)

    # Migrate existing card data from users table to cards table
    # This is a bit tricky with raw SQL in alembic but let's try
    op.execute("""
        INSERT INTO cards (user_id, card_number, expires)
        SELECT id, card_number, expires FROM users WHERE card_number IS NOT NULL
    """)

    # Remove card columns from users table
    op.drop_column('users', 'card_number')
    op.drop_column('users', 'expires')


def downgrade() -> None:
    # Add card columns back to users table
    op.add_column('users', sa.Column('card_number', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('expires', sa.Date(), nullable=True))

    # Migrate data back (only the first card per user)
    op.execute("""
        UPDATE users u
        SET card_number = (SELECT card_number FROM cards c WHERE c.user_id = u.id LIMIT 1),
            expires = (SELECT expires FROM cards c WHERE c.user_id = u.id LIMIT 1)
    """)

    # Drop cards table
    op.drop_index(op.f('ix_cards_id'), table_name='cards')
    op.drop_table('cards')
