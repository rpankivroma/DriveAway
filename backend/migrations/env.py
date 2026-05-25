import asyncio
import os
import ssl
import sys
from logging.config import fileConfig
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from dotenv import load_dotenv
from alembic import context

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.example')
load_dotenv(dotenv_path=env_path)

# Import models to register target metadata
from app.models.user import User, VerificationCode
from app.models.car import Car
from app.models.booking import Deal
from app.models.discount import AvailableDiscount
from app.models.service import AdditionalService
from app.db.base import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Set the sqlalchemy.url from environment variables
env_url = os.getenv("DATABASE_URL")
if not env_url:
    raise ValueError("DATABASE_URL environment variable is required")

# Clean up any trailing/leading whitespaces or carriage returns
env_url = env_url.strip()

# Normalize postgres:// -> postgresql://
actual_url = env_url
if env_url.startswith("postgres://"):
    actual_url = env_url.replace("postgres://", "postgresql://", 1)

parsed = urlparse(actual_url)

# Parse and clean query params
query_params = {}
for k, v in parse_qsl(parsed.query):
    query_params[k.strip()] = v.strip()

# Determine whether SSL is needed based on sslmode
use_ssl = True  # Neon always requires SSL by default
sslmode = query_params.pop('sslmode', None)
if sslmode:
    sslmode = sslmode.strip().lower()
    use_ssl = sslmode != 'disable'

# Remove 'ssl' query param — asyncpg does not support it in the DSN
query_params.pop('ssl', None)

# Remove 'channel_binding' — not supported by asyncpg
query_params.pop('channel_binding', None)

# Rebuild URL with postgresql+asyncpg scheme, without SSL query params
new_query = urlencode(query_params)
new_parsed = parsed._replace(scheme="postgresql+asyncpg", query=new_query)
db_url = urlunparse(new_parsed)

config.set_main_option("sqlalchemy.url", db_url)

# Print clean URL for debugging (password masked)
clean_print_url = db_url
if parsed.password:
    clean_print_url = db_url.replace(parsed.password, "********")
print(f"DEBUG (env.py): Resolved database URL: {clean_print_url}", flush=True)
print(f"DEBUG (env.py): SSL enabled: {use_ssl}", flush=True)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    from sqlalchemy.ext.asyncio import create_async_engine

    ssl_context = ssl.create_default_context() if use_ssl else False

    connectable = create_async_engine(
        db_url,
        poolclass=pool.NullPool,
        connect_args={"ssl": ssl_context},
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())