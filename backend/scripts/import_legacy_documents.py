import argparse
import json
import sqlite3
import sys
import uuid
from contextlib import contextmanager
from pathlib import Path

import database
from routes.documents import METADATA_FILE, PROCESSED_DIR, UPLOAD_DIR


class LegacyImportError(Exception):
    pass


@contextmanager
def _legacy_read_connection():
    try:
        with database.open_connection() as connection:
            yield connection
    except (sqlite3.Error, OSError) as error:
        raise LegacyImportError(
            "SQLite is unavailable; no legacy ownership records were imported."
        ) from error


def _safe_file(directory: Path, filename: object, expected_name: str) -> Path:
    if not isinstance(filename, str) or filename != expected_name:
        raise LegacyImportError("A legacy document contains an unsafe file reference.")
    try:
        root = directory.resolve()
        path = (root / filename).resolve()
        exists = path.is_file()
    except OSError as error:
        raise LegacyImportError("Unable to validate a legacy document file.") from error
    if path.parent != root or not exists:
        raise LegacyImportError("A legacy document file is missing or unsafe.")
    return path


def _load_mapping(mapping_path: Path) -> dict[str, str]:
    try:
        payload = json.loads(mapping_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise LegacyImportError("Unable to read the owner mapping file.") from error

    entries = payload.get("documents") if isinstance(payload, dict) else None
    if not isinstance(entries, list) or not entries:
        raise LegacyImportError("The mapping file must contain a non-empty documents list.")

    mapping = {}
    for entry in entries:
        if not isinstance(entry, dict):
            raise LegacyImportError("Each mapping entry must be an object.")
        document_id = entry.get("document_id")
        owner_email = entry.get("owner_email")
        if (
            not isinstance(document_id, str)
            or not isinstance(owner_email, str)
            or not owner_email.strip()
            or document_id in mapping
        ):
            raise LegacyImportError("The mapping file has an invalid or duplicate entry.")
        mapping[document_id] = owner_email.strip().lower()
    return mapping


def import_legacy_documents(mapping_path: Path, apply: bool = False) -> int:
    owner_mapping = _load_mapping(mapping_path)
    if not database.DATABASE_PATH.is_file():
        raise LegacyImportError(
            "Start the application and register the mapped accounts before importing."
        )

    try:
        metadata = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise LegacyImportError("No legacy document metadata file was found.") from error
    except (OSError, json.JSONDecodeError) as error:
        raise LegacyImportError("Unable to read legacy document metadata.") from error

    if not isinstance(metadata, list):
        raise LegacyImportError("Legacy document metadata must be a list.")

    legacy_by_id = {}
    for item in metadata:
        if not isinstance(item, dict) or not isinstance(item.get("id"), str):
            continue
        if item["id"] in legacy_by_id:
            raise LegacyImportError("Legacy metadata contains duplicate document IDs.")
        legacy_by_id[item["id"]] = item
    if set(owner_mapping) - set(legacy_by_id):
        raise LegacyImportError("The mapping refers to a document not in legacy metadata.")

    prepared = []
    with _legacy_read_connection() as connection:
        for document_id, owner_email in owner_mapping.items():
            document = legacy_by_id[document_id]
            try:
                normalized_id = str(uuid.UUID(document_id))
            except (ValueError, AttributeError) as error:
                raise LegacyImportError("A legacy document ID is invalid.") from error
            if normalized_id != document_id.lower():
                raise LegacyImportError("A legacy document ID is invalid.")

            name = document.get("name")
            filename = document.get("filename")
            extension = Path(filename).suffix.lower() if isinstance(filename, str) else ""
            if (
                not isinstance(name, str)
                or not name
                or extension not in {".pdf", ".docx", ".txt"}
            ):
                raise LegacyImportError("A legacy document record is incomplete.")
            _safe_file(UPLOAD_DIR, filename, f"{document_id}{extension}")

            processed_filename = document.get("processed_filename")
            processed_value = document.get("processed")
            if not isinstance(processed_value, bool):
                raise LegacyImportError("A legacy document has an invalid processed flag.")
            processed = processed_value
            if processed:
                _safe_file(
                    PROCESSED_DIR,
                    processed_filename,
                    f"{document_id}.txt",
                )
            elif processed_filename is not None:
                _safe_file(
                    PROCESSED_DIR,
                    processed_filename,
                    f"{document_id}.txt",
                )

            size = document.get("size")
            text_length = document.get("text_length", 0)
            uploaded_at = document.get("uploaded_at")
            status_value = document.get("status", "Unavailable")
            processed_at = document.get("processed_at")
            if (
                isinstance(size, bool)
                or not isinstance(size, int)
                or size < 0
                or isinstance(text_length, bool)
                or not isinstance(text_length, int)
                or text_length < 0
                or not isinstance(uploaded_at, str)
                or not isinstance(status_value, str)
                or (processed_at is not None and not isinstance(processed_at, str))
            ):
                raise LegacyImportError("A legacy document record has invalid metadata.")

            user = connection.execute(
                "SELECT id FROM users WHERE email = ?",
                (owner_email,),
            ).fetchone()
            if user is None:
                raise LegacyImportError(
                    "Every mapped owner must already have a registered account."
                )
            existing = connection.execute(
                "SELECT 1 FROM documents WHERE id = ?",
                (document_id,),
            ).fetchone()
            if existing:
                raise LegacyImportError(
                    "A mapped document is already present in the authenticated database."
                )

            prepared.append(
                (
                    document_id,
                    user["id"],
                    name,
                    filename,
                    processed_filename,
                    extension[1:].upper(),
                    size,
                    status_value,
                    uploaded_at,
                    int(processed),
                    text_length,
                    processed_at,
                )
            )

    if not apply:
        return len(prepared)

    try:
        with database.transaction() as connection:
            connection.executemany(
                """
                INSERT INTO documents (
                    id, owner_id, name, filename, processed_filename, type,
                    size, status, uploaded_at, processed, text_length, processed_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                prepared,
            )
    except (sqlite3.Error, OSError) as error:
        raise LegacyImportError(
            "The owner mapping import failed; no records were committed."
        ) from error

    return len(prepared)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Preview or explicitly import owner-mapped legacy documents."
    )
    parser.add_argument(
        "--mapping",
        required=True,
        type=Path,
        help="JSON file mapping legacy document IDs to existing account emails.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Commit the validated mapping to SQLite. Without this, only validate.",
    )
    args = parser.parse_args()

    try:
        count = import_legacy_documents(args.mapping, apply=args.apply)
    except LegacyImportError as error:
        print(f"Legacy import failed: {error}", file=sys.stderr)
        return 1

    action = "Imported" if args.apply else "Validated"
    print(f"{action} {count} explicitly mapped legacy document(s).")
    if not args.apply:
        print("No data was changed. Re-run with --apply to commit this mapping.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
