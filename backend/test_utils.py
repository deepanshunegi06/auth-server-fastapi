"""
Common test utilities and helper functions.

This module provides reusable functions for testing
that help reduce code duplication across test files.
"""
import time
from typing import Dict, Any
from fastapi.testclient import TestClient


def create_test_user(client: TestClient, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Create a test user and return the response data.
    
    Args:
        client: FastAPI test client
        user_data: Optional user data override
        
    Returns:
        Dictionary containing user creation response
    """
    default_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123",
        "role": "user"
    }
    
    if user_data:
        default_data.update(user_data)
    
    response = client.post("/register", json=default_data)
    return response.json()


def login_user(client: TestClient, email: str, password: str) -> Dict[str, Any]:
    """
    Login a user and return the token response.
    
    Args:
        client: FastAPI test client
        email: User email
        password: User password
        
    Returns:
        Dictionary containing login response with tokens
    """
    login_data = {"email": email, "password": password}
    response = client.post("/login", json=login_data)
    return response.json()


def get_auth_headers(token: str) -> Dict[str, str]:
    """
    Create authorization headers for authenticated requests.
    
    Args:
        token: JWT access token
        
    Returns:
        Headers dictionary with Authorization header
    """
    return {"Authorization": f"Bearer {token}"}


def create_and_login_user(
    client: TestClient, 
    user_data: Dict[str, Any] = None
) -> tuple[Dict[str, Any], str]:
    """
    Create a user and login, returning user data and access token.
    
    Args:
        client: FastAPI test client
        user_data: Optional user data override
        
    Returns:
        Tuple of (user_data, access_token)
    """
    user = create_test_user(client, user_data)
    
    # Extract login credentials
    email = user_data.get("email", "test@example.com") if user_data else "test@example.com"
    password = user_data.get("password", "TestPass123") if user_data else "TestPass123"
    
    login_response = login_user(client, email, password)
    return user, login_response["access_token"]


def wait_for_token_expiry():
    """
    Wait for token expiry in tests (use very short tokens for testing).
    
    Note: This is mainly for testing token expiration scenarios.
    In real tests, you'd mock the time or use very short expiry times.
    """
    time.sleep(1)


def assert_user_response(response_data: Dict[str, Any], expected_email: str):
    """
    Assert that a user response contains expected fields and values.
    
    Args:
        response_data: User response data to validate
        expected_email: Expected email address
    """
    required_fields = ["id", "username", "email", "role", "is_locked", 
                      "failed_attempts", "created_at"]
    
    for field in required_fields:
        assert field in response_data, f"Missing field: {field}"
    
    assert response_data["email"] == expected_email
    assert "hashed_password" not in response_data  # Security check


def assert_error_response(response, expected_status: int, error_substring: str = None):
    """
    Assert that an error response has the expected status and message.
    
    Args:
        response: HTTP response object
        expected_status: Expected HTTP status code
        error_substring: Optional substring to check in error message
    """
    assert response.status_code == expected_status
    
    if error_substring:
        error_detail = response.json().get("detail", "")
        assert error_substring.lower() in error_detail.lower(), \
            f"Expected '{error_substring}' in error message: {error_detail}"