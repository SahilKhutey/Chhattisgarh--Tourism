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

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    return user


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



