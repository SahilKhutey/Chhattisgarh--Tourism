import uuid
from app.modules.admin.dependencies import AdminUser, get_current_user


def test_unauthenticated_request(client):
    # Overriding get_current_user to raise 401 (default behavior when no user in state)
    from fastapi import HTTPException, status

    def no_user():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    from app.main import app
    app.dependency_overrides[get_current_user] = no_user

    response = client.get("/api/admin/templates")
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required."


def test_inactive_user_forbidden(client):
    from app.main import app

    inactive = AdminUser(id=uuid.uuid4(), role="ADMIN", active=False)
    app.dependency_overrides[get_current_user] = lambda: inactive

    response = client.get("/api/admin/templates")
    assert response.status_code == 403
    assert response.json()["detail"] == "User account is inactive."


def test_unauthorized_role_forbidden(client):
    from app.main import app

    viewer = AdminUser(id=uuid.uuid4(), role="VIEWER", active=True)
    app.dependency_overrides[get_current_user] = lambda: viewer

    response = client.get("/api/admin/templates")
    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions."


def test_allowed_roles(client):
    from app.main import app

    for role in ["CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"]:
        user = AdminUser(id=uuid.uuid4(), role=role, active=True)
        app.dependency_overrides[get_current_user] = lambda u=user: u

        response = client.get("/api/admin/templates")
        assert response.status_code == 200, f"Role {role} failed with status {response.status_code}"
