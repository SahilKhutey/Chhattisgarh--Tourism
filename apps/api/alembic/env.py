from logging.config import fileConfig
import os
from pathlib import Path
import sys

# Ensure apps/api root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import get_settings
from app.core.database import Base

# Import models so metadata is populated.
from app.db import models  # noqa: F401
from app.modules.content_template.models import (
    ContentTemplate,
    TemplateField,
)

config = context.config

if config.config_file_name:
    fileConfig(config.config_file_name)

settings = get_settings()

target_metadata = Base.metadata


def run_migrations_offline():
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    configuration = config.get_section(
        config.config_ini_section,
        {},
    )

    configuration["sqlalchemy.url"] = settings.database_url

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
