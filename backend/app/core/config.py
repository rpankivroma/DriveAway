import os
import ssl
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.example')
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Car Sharing API"

    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    @property
    def DATABASE_URL(self) -> str:
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

        # Remove SSL-related params — these must be passed via connect_args, not the DSN
        query_params.pop('sslmode', None)
        query_params.pop('ssl', None)

        # Remove 'channel_binding' — not supported by asyncpg
        query_params.pop('channel_binding', None)

        # Rebuild URL with postgresql+asyncpg scheme
        new_query = urlencode(query_params)
        new_parsed = parsed._replace(scheme="postgresql+asyncpg", query=new_query)
        return urlunparse(new_parsed)

    @property
    def DATABASE_SSL_CONTEXT(self) -> ssl.SSLContext:
        """
        Returns an SSL context for asyncpg connections.
        Pass this to create_async_engine via connect_args={"ssl": settings.DATABASE_SSL_CONTEXT}.
        Neon always requires SSL — use ssl.create_default_context() for certificate verification.
        """
        return ssl.create_default_context()


settings = Settings()