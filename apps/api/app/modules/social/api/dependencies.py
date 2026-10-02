from __future__ import annotations

from uuid import UUID
from fastapi import Depends, HTTPException, Request, status

from app.modules.admin.dependencies import AdminUser, get_current_user


def get_optional_user(request: Request) -> AdminUser | None:
    try:
        return get_current_user(request)
    except HTTPException:
        return None


def require_auth(user: AdminUser = Depends(get_current_user)) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    return user


def require_moderator(user: AdminUser = Depends(get_current_user)) -> AdminUser:
    require_auth(user)
    allowed_roles = {"MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation requires moderation authority ({', '.join(sorted(allowed_roles))}). Current: {user.role}",
        )
    return user


def require_admin(user: AdminUser = Depends(get_current_user)) -> AdminUser:
    require_auth(user)
    allowed_roles = {"ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation requires admin authority ({', '.join(sorted(allowed_roles))}). Current: {user.role}",
        )
    return user
