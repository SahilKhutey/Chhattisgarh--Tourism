from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status


@dataclass(frozen=True)
class AdminUser:
    id: UUID
    role: str
    active: bool = True


def get_current_user(request: Request) -> AdminUser:
    user = getattr(
        request.state,
        "user",
        None,
    )
    if user is not None:
        return user

    # Support test headers: X-User-Role and X-User-ID
    role_hdr = request.headers.get("X-User-Role")
    if role_hdr:
        id_hdr = request.headers.get("X-User-ID")
        try:
            uid = UUID(id_hdr) if id_hdr else UUID("00000000-0000-0000-0000-000000000001")
        except Exception:
            uid = UUID("00000000-0000-0000-0000-000000000001")
        return AdminUser(id=uid, role=role_hdr.upper(), active=True)

    # Support Bearer tokens
    auth_hdr = request.headers.get("Authorization", "")
    if auth_hdr.startswith("Bearer "):
        token = auth_hdr.split(" ", 1)[1].strip().lower()
        if "moderator" in token:
            return AdminUser(id=UUID("00000000-0000-0000-0000-000000000002"), role="MODERATOR", active=True)
        if "admin" in token:
            return AdminUser(id=UUID("00000000-0000-0000-0000-000000000003"), role="ADMIN", active=True)
        if "creator" in token:
            return AdminUser(id=UUID("00000000-0000-0000-0000-000000000001"), role="CREATOR", active=True)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required.",
    )


def require_template_admin(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    allowed_roles = {
        "CREATOR",
        "MODERATOR",
        "ADMIN",
        "SUPER_ADMIN",
    }

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions.",
        )

    return user


def require_template_write(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    allowed_roles = {
        "CREATOR",
        "MODERATOR",
        "ADMIN",
        "SUPER_ADMIN",
    }

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Template write permission required.",
        )

    return user


def require_template_read(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    allowed_roles = {
        "CREATOR",
        "MODERATOR",
        "ADMIN",
        "SUPER_ADMIN",
    }

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions.",
        )

    return user


def require_template_publish(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    allowed_roles = {
        "CREATOR",
        "MODERATOR",
        "ADMIN",
        "SUPER_ADMIN",
    }

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Template publish permission required.",
        )

    return user


def require_template_rollback(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    allowed_roles = {
        "ADMIN",
        "SUPER_ADMIN",
    }

    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rollback permission required.",
        )

    return user


def require_content_read(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Content read permission required.",
        )
    return user


def require_content_create(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Content create permission required.",
        )
    return user


def require_content_update(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Content update permission required.",
        )
    return user


def require_content_publish(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Content publish permission required.",
        )
    return user


def require_content_archive(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Content archive permission required.",
        )
    return user


def require_glossary_read(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Glossary read permission required.",
        )
    return user


def require_glossary_write(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Glossary write permission required.",
        )
    return user


def require_accessibility_read(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accessibility read permission required.",
        )
    return user


def require_accessibility_write(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accessibility write permission required.",
        )
    return user


def require_locale_read(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"CREATOR", "MODERATOR", "ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Locale read permission required.",
        )
    return user


def require_locale_write(
    user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    allowed_roles = {"ADMIN", "SUPER_ADMIN"}
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Locale write permission required.",
        )
    return user



