from __future__ import annotations

from uuid import UUID
from fastapi import Depends, HTTPException, Request, status
from app.modules.admin.dependencies import AdminUser, get_current_user

AuthUser = AdminUser


VALIDATION_ROLES = {
    "ADMIN",
    "SUPER_ADMIN",
    "MARKET_RESEARCHER",
    "PRODUCT_MANAGER",
    "CONTENT_EDITOR",
    "CONTENT_REVIEWER",
    "CONTENT_VERIFIER",
    "TRANSACTION_VALIDATOR",
    "PROVIDER_OPERATOR",
    "RETENTION_ANALYST",
    "COMMUNITY_LEAD",
    "FINANCE_ADMIN",
    "PILOT_OPERATOR",
    "SCALE_ADMIN",
}

PILOT_CONTROL_ROLES = {
    "ADMIN",
    "SUPER_ADMIN",
    "PRODUCT_MANAGER",
    "PILOT_OPERATOR",
    "SCALE_ADMIN",
}

PILOT_APPROVER_ROLES = {
    "ADMIN",
    "SUPER_ADMIN",
    "PRODUCT_MANAGER",
    "SCALE_ADMIN",
}


def require_market_researcher(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    if user.role not in VALIDATION_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation requires one of roles: {', '.join(sorted(VALIDATION_ROLES))}. Current: {user.role}",
        )
    return user


def require_pilot_operator(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    if user.role not in PILOT_CONTROL_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Pilot operations require one of: {', '.join(sorted(PILOT_CONTROL_ROLES))}. Current: {user.role}",
        )
    return user


def require_pilot_approver(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    if user.role not in PILOT_APPROVER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Pilot approval/scale decision requires one of: {', '.join(sorted(PILOT_APPROVER_ROLES))}. Current: {user.role}",
        )
    return user
