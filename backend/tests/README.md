# Backend Unit Testing

This directory contains the unit tests for the backend services and schemas. The testing environment is built using `pytest`, `pytest-asyncio`, and `pytest-mock`.

## Directory Structure

```text
tests/
├── conftest.py          # Global fixtures and configuration
├── test_schemas/        # Unit tests for Pydantic schemas
└── test_services/       # Unit tests for business logic (Service Layer)
```

## Setup

Ensure you have the testing dependencies installed. From the `backend` directory:

```bash
pip install -r requirements.txt
```

The key testing packages are:
- `pytest`: The core testing framework.
- `pytest-asyncio`: Support for testing asynchronous code.
- `pytest-mock`: A wrapper around the standard `unittest.mock` for easier mocking in pytest.

## Running Tests

To run all tests, execute the following command from the `backend` directory:

```bash
pytest
```

To run specific test files:

```bash
# Run Car Service tests
pytest tests/test_services/test_car_service.py

# Run Auth Service tests
pytest tests/test_services/test_auth_service.py

# Run User Service tests
pytest tests/test_services/test_user_service.py

# Run Admin Service tests
pytest tests/test_services/test_admin_service.py

# Run Auth Schema tests
pytest tests/test_schemas/test_auth_schemas.py

# Run User Schema tests
pytest tests/test_schemas/test_user_schema.py

# Run Card Schema tests
pytest tests/test_schemas/test_card_schema.py
```

To run tests with verbose output:

```bash
pytest -v
```

## Writing Tests

### Service Layer Tests

Service layer tests should be **unit tests**. They should not connect to a real database. Instead, you should mock the repository layer.

#### Car Service Tests
Tests for car listing, filtering, and retrieval:
- Get car by ID (returns correct data for valid ID)
- Get car by ID (raises 404 for invalid ID)
- Filtering (transmission, fuel type, passengers, etc. passed correctly)
- Sorting (price_low, price_high handled correctly)
- Pagination (skip and limit calculation)

#### Auth Service Tests
Comprehensive tests for:
- User registration (duplicate email check, password hashing)
- Login (password verification, JWT generation)
- Email verification (code validation, expiration)
- Password reset (forgot password flow, hash update)
- Resend verification

#### User Service Tests
Tests for user profile and account management:
- Get user profile (structured response with stats and history)
- Password change (validation of current password)
- Card management (add/delete with validation)

#### Admin Service Tests
Tests for administrative operations:
- Car management (create, update, delete with validation)
- Discount management (create, update, delete with min/max days validation)

### Schema Tests

Schema tests verify that Pydantic models correctly validate input data and handle errors.

#### Auth Schema Tests
Validation for authentication requests:
- Invalid email rejection
- Missing required fields
- Verification code format (must be 6 digits)

#### User Schema Tests
Validation for user-related schemas:
- Card validation (16 digits, numeric, MM/YY format, expiry check)

Example using `patch` and `AsyncMock`:

```python
@pytest.mark.asyncio
async def test_service_method(mock_db):
    with patch("app.services.my_service.MyRepository") as MockRepo:
        repo_instance = MockRepo.return_value
        repo_instance.get_data = AsyncMock(return_value={"id": 1})
        
        service = MyService(mock_db)
        result = await service.do_something(1)
        
        assert result["id"] == 1
```

### Schema Tests

Schema tests verify that Pydantic models correctly validate input data and handle errors.

```python
def test_schema_validation():
    data = {"name": "Test", "age": 25}
    model = MySchema(**data)
    assert model.name == "Test"
```

## Shared Fixtures (`conftest.py`)

- `mock_db`: Provides an `AsyncMock` of the SQLAlchemy `AsyncSession`. Use this when initializing services in your tests.
- `mock_repo`: A generic `AsyncMock` for repository mocking.

## Configuration (`pytest.ini`)

The `pytest.ini` file in the backend root configures:
- `asyncio_mode = auto`: Automatically handles async test functions.
- `pythonpath = .`: Ensures the `app` module is importable from the tests.
