import pytest
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.fixture
def mock_db():
    """Fixture for a mocked async database session."""
    return AsyncMock(spec=AsyncSession)

@pytest.fixture
def mock_repo():
    """Fixture for a mocked repository."""
    return AsyncMock()
