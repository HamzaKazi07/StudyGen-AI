import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from threading import Lock


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(
    os.getenv(
        "STUDYGEN_DATABASE_PATH",
        str(BASE_DIR / "data" / "studygen.sqlite3"),
    )
)
MIGRATIONS_DIR = BASE_DIR / "migrations"

_migration_lock = Lock()


@contextmanager
def open_connection():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(
        DATABASE_PATH,
        timeout=10,
        check_same_thread=False,
    )
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA busy_timeout = 10000")
    try:
        yield connection
    finally:
        connection.close()


@contextmanager
def transaction():
    with open_connection() as connection:
        connection.execute("BEGIN IMMEDIATE")
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise


def initialize_database():
    with _migration_lock, open_connection() as connection:
        version = connection.execute("PRAGMA user_version").fetchone()[0]
        migration_files = sorted(MIGRATIONS_DIR.glob("[0-9][0-9][0-9]_*.sql"))
        latest_version = (
            int(migration_files[-1].name[:3]) if migration_files else 0
        )
        if version > latest_version:
            raise RuntimeError(
                "Database schema is newer than this application supports."
            )

        for migration_file in migration_files:
            migration_version = int(migration_file.name[:3])
            if migration_version <= version:
                continue
            if migration_version != version + 1:
                raise RuntimeError(
                    f"Database migration sequence is incomplete at version {version}."
                )

            migration = migration_file.read_text(encoding="utf-8")
            connection.execute("BEGIN IMMEDIATE")
            try:
                for statement in migration.split(";"):
                    if statement.strip():
                        connection.execute(statement)
                connection.execute(
                    f"PRAGMA user_version = {migration_version}"
                )
                connection.commit()
            except Exception:
                connection.rollback()
                raise
            version = migration_version
