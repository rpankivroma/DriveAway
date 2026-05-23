"""initial_schema

Revision ID: 0001
Revises: 
Create Date: 2026-03-17 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- Create tables ---

    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('client', 'admin', name='roleenum'), nullable=False, server_default='client'),
        sa.Column('phone', sa.String(length=30), nullable=True),
        sa.Column('drivers_license', sa.String(length=50), nullable=True),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('card_number', sa.String(length=50), nullable=True),
        sa.Column('expires', sa.Date(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_general_ci',
        mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # 2. cars
    op.create_table(
        'cars',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('brand', sa.String(length=100), nullable=False),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('year', sa.SmallInteger(), nullable=False),
        sa.Column('license_plate', sa.String(length=20), nullable=False),
        sa.Column('color', sa.String(length=50), nullable=True),
        sa.Column('passengers', sa.Integer(), nullable=True, server_default='5'),
        sa.Column('luggage', sa.Integer(), nullable=True, server_default='2'),
        sa.Column('transmission', sa.Enum('automatic', 'mechanic', name='transmissionenum'), nullable=False),
        sa.Column('fuel_type', sa.Enum('gasoline', 'gas', 'electricity', name='fueltypeenum'), nullable=False),
        sa.Column('features', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('images', sa.Text(), nullable=True),
        sa.Column('price_per_day', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('status', sa.Enum('available', 'reserved', 'in_service', 'inactive', name='carstatusenum'), nullable=True, server_default='available'),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('license_plate'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_general_ci',
        mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_cars_id'), 'cars', ['id'], unique=False)

    # 3. additional_services
    op.create_table(
        'additional_services',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('icon', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('desc', sa.Text(), nullable=False),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_general_ci',
        mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_additional_services_id'), 'additional_services', ['id'], unique=False)

    # 4. available_discounts
    op.create_table(
        'available_discounts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('min_days', sa.Integer(), nullable=False),
        sa.Column('max_days', sa.Integer(), nullable=True),
        sa.Column('discount_percent', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_general_ci',
        mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_available_discounts_id'), 'available_discounts', ['id'], unique=False)

    # 5. deals
    op.create_table(
        'deals',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('car_id', sa.BigInteger(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=False),
        sa.Column('total_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('pick_up_location', sa.String(length=255), nullable=True),
        sa.Column('additional_services', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed', name='dealstatusenum'), nullable=True, server_default='pending'),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['car_id'], ['cars.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_general_ci',
        mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_deals_car_id'), 'deals', ['car_id'], unique=False)
    op.create_index(op.f('ix_deals_id'), 'deals', ['id'], unique=False)
    op.create_index(op.f('ix_deals_user_id'), 'deals', ['user_id'], unique=False)


def downgrade() -> None:
    # --- Drop tables in correct order ---
    op.drop_index(op.f('ix_deals_user_id'), table_name='deals')
    op.drop_index(op.f('ix_deals_id'), table_name='deals')
    op.drop_index(op.f('ix_deals_car_id'), table_name='deals')
    op.drop_table('deals')

    op.drop_index(op.f('ix_cars_id'), table_name='cars')
    op.drop_table('cars')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

    op.drop_index(op.f('ix_additional_services_id'), table_name='additional_services')
    op.drop_table('additional_services')

    op.drop_index(op.f('ix_available_discounts_id'), table_name='available_discounts')
    op.drop_table('available_discounts')
