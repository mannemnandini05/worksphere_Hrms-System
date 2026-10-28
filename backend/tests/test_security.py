from app.security import create_access_token, decode_token, hash_password, verify_password


def test_password_hash_round_trip_and_long_password():
    password = "A-very-long-password-that-is-more-than-seventy-two-bytes-" * 3
    stored = hash_password(password)
    assert stored != password
    assert verify_password(password, stored)
    assert not verify_password(password + "wrong", stored)


def test_jwt_round_trip_and_tamper_detection():
    token = create_access_token(123, "ADMIN", "admin")
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "123"
    assert payload["role"] == "ADMIN"
    assert payload["username"] == "admin"
    parts = token.split(".")
    parts[1] = parts[1][:-1] + ("A" if parts[1][-1] != "A" else "B")
    assert decode_token(".".join(parts)) is None


def test_invalid_tokens_are_rejected():
    assert decode_token("not-a-token") is None
    assert decode_token("") is None
