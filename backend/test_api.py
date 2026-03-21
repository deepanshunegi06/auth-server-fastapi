"""
API integration tests for AuthCore authentication endpoints.

Tests the complete authentication flow including registration,
login, and protected route access.
"""
import pytest
from fastapi.testclient import TestClient


class TestAuthEndpoints:
    """Test authentication API endpoints."""

    def test_register_success(self, client: TestClient, sample_user_data):
        """Test successful user registration."""
        response = client.post("/register", json=sample_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == sample_user_data["username"]
        assert data["email"] == sample_user_data["email"]
        assert data["role"] == sample_user_data["role"]
        assert "id" in data
        assert "hashed_password" not in data  # Should not expose password

    def test_register_duplicate_email(self, client: TestClient, sample_user_data):
        """Test registration with duplicate email."""
        # Register first user
        client.post("/register", json=sample_user_data)
        
        # Try to register again with same email
        response = client.post("/register", json=sample_user_data)
        
        assert response.status_code == 409
        assert "Email already registered" in response.json()["detail"]

    def test_register_duplicate_username(self, client: TestClient, sample_user_data):
        """Test registration with duplicate username."""
        # Register first user
        client.post("/register", json=sample_user_data)
        
        # Try to register with different email but same username
        duplicate_data = sample_user_data.copy()
        duplicate_data["email"] = "different@example.com"
        
        response = client.post("/register", json=duplicate_data)
        
        assert response.status_code == 409
        assert "Username already taken" in response.json()["detail"]

    def test_login_success(self, client: TestClient, sample_user_data):
        """Test successful login."""
        # First register a user
        client.post("/register", json=sample_user_data)
        
        # Then login
        login_data = {
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
        response = client.post("/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == sample_user_data["email"]

    def test_login_invalid_credentials(self, client: TestClient, sample_user_data):
        """Test login with invalid credentials."""
        # Register user first
        client.post("/register", json=sample_user_data)
        
        # Try login with wrong password
        login_data = {
            "email": sample_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/login", json=login_data)
        
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "somepassword"
        }
        response = client.post("/login", json=login_data)
        
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]


class TestProtectedEndpoints:
    """Test protected endpoints requiring authentication."""

    def test_profile_access_authenticated(self, client: TestClient, sample_user_data):
        """Test profile access with valid token."""
        # Register and login
        client.post("/register", json=sample_user_data)
        login_response = client.post("/login", json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        })
        token = login_response.json()["access_token"]
        
        # Access profile
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/profile", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == sample_user_data["email"]
        assert data["username"] == sample_user_data["username"]
        assert "token_expires_at" in data

    def test_profile_access_unauthenticated(self, client: TestClient):
        """Test profile access without token."""
        response = client.get("/profile")
        
        assert response.status_code == 401

    def test_profile_access_invalid_token(self, client: TestClient):
        """Test profile access with invalid token."""
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = client.get("/profile", headers=headers)
        
        assert response.status_code == 401
        assert "Invalid or expired token" in response.json()["detail"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])