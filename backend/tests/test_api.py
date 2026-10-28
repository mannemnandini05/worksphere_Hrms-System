from fastapi.testclient import TestClient
from app.main import app

client=TestClient(app)
def test_health():
    r=client.get("/")
    assert r.status_code==200 and r.json()["status"]=="ok"
def test_registration_and_login():
    import uuid
    suffix=uuid.uuid4().hex[:8]
    payload={"username":"test_"+suffix,"email":f"test_{suffix}@example.com","password":"SafePassword123"}
    r=client.post("/api/auth/register",json=payload)
    assert r.status_code==200, r.text
    login=client.post("/api/auth/login",json={"username_or_email":payload["username"],"password":payload["password"]})
    assert login.status_code==200 and login.json()["access_token"]
    assert login.json()["user"]["role"]=="EMPLOYEE"
    token = login.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200 and me.json()["email"] == payload["email"]
    # An employee must not access admin-only user management.
    forbidden = client.get("/api/users", headers={"Authorization": f"Bearer {token}"})
    assert forbidden.status_code == 403
def test_protected_endpoint_requires_token():
    r=client.get("/api/dashboard/summary")
    assert r.status_code==401
