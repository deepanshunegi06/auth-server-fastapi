# Testing Guide for AuthCore

This document provides information on running and writing tests for the AuthCore authentication server.

## Test Structure

The backend includes several test files:

- `test_auth.py` - Unit tests for authentication utilities (password hashing, token creation)
- `test_api.py` - Integration tests for API endpoints
- `conftest.py` - Pytest configuration and fixtures

## Running Tests

### Prerequisites

Install testing dependencies:

```bash
pip install pytest pytest-asyncio
```

### Run All Tests

```bash
# From backend directory
pytest

# With verbose output
pytest -v

# With coverage (if coverage installed)
pytest --cov=. --cov-report=html
```

### Run Specific Tests

```bash
# Run only auth unit tests
pytest test_auth.py

# Run only API integration tests
pytest test_api.py

# Run specific test method
pytest test_auth.py::TestPasswordFunctions::test_hash_password_basic
```

## Test Configuration

Tests use an in-memory SQLite database to ensure isolation and speed:

- Each test gets a fresh database
- No persistent data between tests
- Fast execution without external dependencies

## Writing New Tests

### Unit Tests

For testing individual functions:

```python
def test_function_name():
    """Test description."""
    # Arrange
    input_data = "test_input"
    
    # Act  
    result = function_to_test(input_data)
    
    # Assert
    assert result == expected_output
```

### API Tests

For testing endpoints:

```python
def test_endpoint_name(client: TestClient, sample_user_data):
    """Test description."""
    response = client.post("/endpoint", json=test_data)
    
    assert response.status_code == 200
    assert response.json()["key"] == expected_value
```

### Using Fixtures

Common fixtures available:

- `client` - TestClient for API requests
- `test_db` - Fresh database session
- `sample_user_data` - Sample user registration data

## Test Best Practices

1. **Descriptive test names** - Clearly indicate what is being tested
2. **Test isolation** - Each test should be independent
3. **Arrange-Act-Assert** pattern - Clear test structure
4. **Edge cases** - Test both success and failure scenarios
5. **Meaningful assertions** - Verify the specific behavior expected

## Continuous Integration

Tests should be run before committing code changes:

```bash
# Quick test run before commit
pytest --tb=short -q
```

Consider setting up pre-commit hooks to automatically run tests.