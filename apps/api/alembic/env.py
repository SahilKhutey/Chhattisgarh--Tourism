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

import importlib
import pkgutil
from alembic.ddl.impl import DefaultImpl
from sqlalchemy import Table, MetaData, Column, String, PrimaryKeyConstraint, text

# Patch DefaultImpl to generate VARCHAR(128) for alembic_version.version_num
_orig_version_table_impl = DefaultImpl.version_table_impl


def _custom_version_table_impl(self, *, version_table: str, version_table_schema=None, version_table_pk=True, **kw):
    vt = Table(
        version_table,
        MetaData(),
        Column("version_num", String(128), nullable=False),
        schema=version_table_schema,
    )
    if version_table_pk:
        vt.append_constraint(
            PrimaryKeyConstraint("version_num", name=f"{version_table}_pkc")
        )
    return vt


DefaultImpl.version_table_impl = _custom_version_table_impl

# Import models so metadata is fully populated for alembic check.
from app.db import models  # noqa: F401
import app.modules

for _info in pkgutil.walk_packages(app.modules.__path__, app.modules.__name__ + "."):
    if "models" in _info.name:
        try:
            importlib.import_module(_info.name)
        except Exception:
            pass

try:
    importlib.import_module("app.events.models")
except Exception:
    pass

POSTGIS_SYSTEM_TABLES = {
    "spatial_ref_sys",
    "state_lookup",
    "county_lookup",
    "zcta5",
    "geocode_settings",
    "geocode_settings_default",
    "pagc_gaz",
    "pagc_lex",
    "pagc_rules",
    "topology",
    "layer",
    "direction_lookup",
    "secondary_unit_lookup",
    "street_type_lookup",
    "place_lookup",
    "zip_lookup",
    "zip_lookup_all",
    "zip_lookup_base",
    "zip_state",
    "zip_state_loc",
    "countysub_lookup",
    "cousub_lookup",
    "edges",
    "faces",
    "featnames",
    "addr",
    "tabblock",
    "bg",
    "tract",
}


def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table":
        if name in POSTGIS_SYSTEM_TABLES:
            return False
        if reflected and name not in target_metadata.tables:
            return False
    return True


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
        include_object=include_object,
        compare_type=False,
        compare_server_default=False,
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
        try:
            connection.execute(
                text(
                    "DO $$ BEGIN "
                    "  ALTER TABLE alembic_version ALTER COLUMN version_num TYPE character varying(128); "
                    "EXCEPTION WHEN OTHERS THEN NULL; "
                    "END $$;"
                )
            )
            connection.commit()
        except Exception:
            pass

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
            compare_type=False,
            compare_server_default=False,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
