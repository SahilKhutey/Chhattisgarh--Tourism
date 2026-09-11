import os
import pytest

# Set default test environment variables before any app modules are loaded
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://cg_tourism:cg_tourism_dev@127.0.0.1:5432/cg_tourism",
)
os.environ.setdefault(
    "REDIS_URL",
    "redis://127.0.0.1:6379/0",
)
os.environ.setdefault(
    "JWT_SECRET",
    "test-secret-key-32chars-minimum-length-for-validation",
)
os.environ.setdefault("APP_ENV", "testing")
