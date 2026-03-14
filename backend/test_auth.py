"""
Basic tests for AuthCore authentication functions.

This module contains unit tests for the core authentication
utilities to ensure proper password hashing and token handling.
"""
import pytest
from auth import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    decode_token
)


class TestPasswordFunctions:
    """Test password hashing and validation functions."""

    def test_hash_password_basic(self):
        """Test that password hashing produces different hashes for same input."""
        password = "test123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != hash2  # bcrypt should produce different hashes
        assert len(hash1) > 50  # bcrypt hashes are typically 60+ chars

    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "mypassword123"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "mypassword123"
        wrong_password = "wrongpassword"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False

    def test_validate_password_strength_valid(self):
        """Test password strength validation with valid passwords."""
        valid_passwords = [
            "password123",
            "MySecurePass",
            "a" * 50,  # Long password
        ]
        
        for pwd in valid_passwords:
            is_valid, error = validate_password_strength(pwd)
            assert is_valid is True
            assert error == ""

    def test_validate_password_strength_invalid(self):
        """Test password strength validation with invalid passwords."""
        invalid_cases = [
            ("short", "Password must be at least 8 characters"),
            ("", "Password cannot be empty"),
            ("   ", "Password cannot be empty"),
            ("a" * 101, "Password must not exceed 100 characters"),
        ]
        
        for pwd, expected_error in invalid_cases:
            is_valid, error = validate_password_strength(pwd)
            assert is_valid is False
            assert expected_error in error


class TestTokenFunctions:
    """Test JWT token creation and validation."""

    def test_create_access_token(self):
        """Test access token creation."""
        user_data = {"sub": "user@example.com", "role": "user"}
        token = create_access_token(user_data)
        
        assert isinstance(token, str)
        assert len(token) > 100  # JWT tokens are typically long

    def test_decode_token_valid(self):
        """Test decoding a valid token."""
        user_data = {"sub": "user@example.com", "role": "user"}
        token = create_access_token(user_data)
        
        decoded = decode_token(token)
        assert decoded["sub"] == "user@example.com"
        assert decoded["role"] == "user"
        assert "exp" in decoded  # Expiration should be present

    def test_decode_token_invalid(self):
        """Test decoding an invalid token."""
        invalid_token = "invalid.token.here"
        
        with pytest.raises(Exception):  # Should raise JWTError
            decode_token(invalid_token)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])