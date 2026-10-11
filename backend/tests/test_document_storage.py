import asyncio
import io
import sqlite3
import tempfile
import unittest
import uuid
from pathlib import Path
from unittest.mock import patch

import database
import routes.documents as documents_route
from fastapi import HTTPException
from starlette.datastructures import Headers, UploadFile
from services.document_storage import (
    InvalidDocumentPath,
    ProcessedTextCleanupError,
    create_upload_file,
    delete_document_files,
    processed_filename,
    remove_created_files,
    safe_storage_path,
    source_filename,
    validate_document_id,
    write_processed_text,
)


class DocumentStorageTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        self.upload_dir = self.root / "documents"
        self.processed_dir = self.root / "processed"
        self.upload_dir.mkdir()
        self.processed_dir.mkdir()
        self.document_id = str(uuid.uuid4())

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_valid_ids_and_generated_filenames_resolve_inside_storage(self):
        self.assertEqual(validate_document_id(self.document_id), self.document_id)
        original_name = source_filename(self.document_id, ".TXT")
        derived_name = processed_filename(self.document_id)

        original = safe_storage_path(
            self.upload_dir,
            self.document_id,
            original_name,
            original_name,
        )
        derived = safe_storage_path(
            self.processed_dir,
            self.document_id,
            derived_name,
            derived_name,
        )

        self.assertEqual(original, self.upload_dir.resolve() / original_name)
        self.assertEqual(derived, self.processed_dir.resolve() / derived_name)

    def test_malformed_ids_and_path_traversal_names_are_rejected(self):
        for malformed_id in (
            "",
            "../outside",
            str(uuid.uuid4()).upper(),
            "11111111-1111-1111-1111-111111111111.txt",
        ):
            with self.subTest(document_id=malformed_id):
                with self.assertRaises(InvalidDocumentPath):
                    validate_document_id(malformed_id)

        for traversal_name in (
            f"..\\{self.document_id}.txt",
            f"../{self.document_id}.txt",
            f"{self.document_id}.txt/../../outside",
        ):
            with self.subTest(filename=traversal_name):
                with self.assertRaises(InvalidDocumentPath):
                    safe_storage_path(
                        self.processed_dir,
                        self.document_id,
                        traversal_name,
                        processed_filename(self.document_id),
                    )

    def test_symlink_to_outside_storage_is_rejected(self):
        outside = self.root / "outside.txt"
        outside.write_text("keep", encoding="utf-8")
        link = self.processed_dir / processed_filename(self.document_id)
        try:
            link.symlink_to(outside)
        except (OSError, NotImplementedError):
            self.skipTest("Symlink creation is unavailable on this system.")

        with self.assertRaises(InvalidDocumentPath):
            safe_storage_path(
                self.processed_dir,
                self.document_id,
                link.name,
                link.name,
            )
        self.assertEqual(outside.read_text(encoding="utf-8"), "keep")

    def test_processed_text_is_atomically_installed_without_overwrite(self):
        target = write_processed_text(
            self.processed_dir,
            self.document_id,
            "complete extracted text",
        )
        self.assertEqual(target.read_text(encoding="utf-8"), "complete extracted text")
        self.assertEqual(list(self.processed_dir.iterdir()), [target])

        with self.assertRaises(FileExistsError):
            write_processed_text(
                self.processed_dir,
                self.document_id,
                "must not replace existing content",
            )
        self.assertEqual(target.read_text(encoding="utf-8"), "complete extracted text")
        self.assertEqual(list(self.processed_dir.iterdir()), [target])

    def test_temp_cleanup_failure_preserves_installed_and_preexisting_files(self):
        target = self.processed_dir / processed_filename(self.document_id)
        unrelated = self.processed_dir / f"{uuid.uuid4()}.txt"
        unrelated.write_text("preserve", encoding="utf-8")
        original_unlink = Path.unlink

        def fail_temporary_cleanup(path, missing_ok=False):
            if path.suffix == ".tmp":
                raise OSError("simulated temporary-file cleanup failure")
            return original_unlink(path, missing_ok=missing_ok)

        with patch.object(Path, "unlink", new=fail_temporary_cleanup):
            with self.assertRaises(ProcessedTextCleanupError) as raised:
                write_processed_text(
                    self.processed_dir,
                    self.document_id,
                    "installed extracted text",
                )

        self.assertEqual(raised.exception.destination, target)
        self.assertTrue(target.exists())
        self.assertEqual(target.read_text(encoding="utf-8"), "installed extracted text")
        self.assertTrue(raised.exception.temporary_path.exists())
        self.assertEqual(unrelated.read_text(encoding="utf-8"), "preserve")

        # A pre-existing destination is never replaced or removed.
        existing_id = str(uuid.uuid4())
        existing_target = self.processed_dir / processed_filename(existing_id)
        existing_target.write_text("pre-existing", encoding="utf-8")
        with self.assertRaises(FileExistsError):
            write_processed_text(
                self.processed_dir,
                existing_id,
                "replacement",
            )
        self.assertEqual(existing_target.read_text(encoding="utf-8"), "pre-existing")
        self.assertEqual(unrelated.read_text(encoding="utf-8"), "preserve")

    def test_metadata_transaction_is_atomic_and_write_errors_propagate(self):
        test_database = self.root / "metadata.sqlite3"
        with patch.object(database, "DATABASE_PATH", test_database):
            with database.open_connection() as connection:
                connection.execute(
                    "CREATE TABLE documents (id TEXT PRIMARY KEY, name TEXT NOT NULL)"
                )
                connection.execute(
                    "CREATE TRIGGER reject_document BEFORE INSERT ON documents "
                    "BEGIN SELECT RAISE(FAIL, 'simulated metadata write failure'); END"
                )
                connection.commit()

            with self.assertRaises(sqlite3.IntegrityError):
                with database.transaction() as connection:
                    connection.execute(
                        "INSERT INTO documents (id, name) VALUES (?, ?)",
                        (self.document_id, "notes.txt"),
                    )

            with database.open_connection() as connection:
                count = connection.execute(
                    "SELECT COUNT(*) FROM documents"
                ).fetchone()[0]
        self.assertEqual(count, 0)

    def test_partial_upload_cleanup_removes_only_files_created_by_operation(self):
        upload_name = source_filename(self.document_id, ".txt")
        upload_path, upload_file = create_upload_file(
            self.upload_dir,
            self.document_id,
            ".txt",
        )
        with upload_file:
            upload_file.write(b"partial upload")
        processed_path = write_processed_text(
            self.processed_dir,
            self.document_id,
            "partial extracted output",
        )

        unrelated = self.upload_dir / f"{uuid.uuid4()}.txt"
        unrelated.write_text("leave this file intact", encoding="utf-8")
        created_refs = [
            (self.upload_dir, self.document_id, upload_name, upload_name),
            (
                self.processed_dir,
                self.document_id,
                processed_path.name,
                processed_path.name,
            ),
        ]

        self.assertTrue(remove_created_files(created_refs))
        self.assertFalse(upload_path.exists())
        self.assertFalse(processed_path.exists())
        self.assertEqual(unrelated.read_text(encoding="utf-8"), "leave this file intact")

    def test_missing_files_and_metadata_do_not_delete_unrelated_files(self):
        source_name = source_filename(self.document_id, ".txt")
        derived_name = processed_filename(self.document_id)
        unrelated = self.upload_dir / f"{uuid.uuid4()}.txt"
        unrelated.write_text("preserve", encoding="utf-8")

        # A missing owner-scoped metadata record gives deletion no authority
        # to infer paths; the unrelated files remain untouched.
        test_database = self.root / "metadata.sqlite3"
        with patch.object(database, "DATABASE_PATH", test_database):
            with database.open_connection() as connection:
                connection.execute(
                    "CREATE TABLE documents (id TEXT PRIMARY KEY, owner_id TEXT)"
                )
                row = connection.execute(
                    "SELECT id FROM documents WHERE id = ? AND owner_id = ?",
                    (self.document_id, "user-id"),
                ).fetchone()
            self.assertIsNone(row)

        # File cleanup for a known document is idempotent when either file
        # has already disappeared.
        delete_document_files(
            self.upload_dir,
            self.processed_dir,
            self.document_id,
            source_name,
            derived_name,
        )
        self.assertEqual(unrelated.read_text(encoding="utf-8"), "preserve")
        self.assertEqual(list(self.upload_dir.iterdir()), [unrelated])
        self.assertEqual(list(self.processed_dir.iterdir()), [])

    def test_cleanup_rejects_untrusted_or_mismatched_file_references(self):
        outside = self.root / "outside.txt"
        outside.write_text("preserve", encoding="utf-8")

        self.assertFalse(
            remove_created_files(
                [
                    (
                        self.processed_dir,
                        self.document_id,
                        "../outside.txt",
                        processed_filename(self.document_id),
                    )
                ]
            )
        )
        self.assertEqual(outside.read_text(encoding="utf-8"), "preserve")

    def _insert_owned_document(self, database_path, source_path, processed_path):
        with patch.object(database, "DATABASE_PATH", database_path):
            database.initialize_database()
            with database.transaction() as connection:
                connection.execute(
                    """
                    INSERT INTO users (id, email, password_hash, created_at)
                    VALUES (?, ?, ?, ?)
                    """,
                    ("owner-id", "owner@example.test", "test-hash", "now"),
                )
                connection.execute(
                    """
                    INSERT INTO documents (
                        id, owner_id, name, filename, processed_filename, type,
                        size, status, uploaded_at, processed, text_length
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        self.document_id,
                        "owner-id",
                        "notes.txt",
                        source_path.name,
                        processed_path.name,
                        "TXT",
                        6,
                        "Processed",
                        "now",
                        1,
                        6,
                    ),
                )

    def _assert_delete_failure_is_retryable(self, failing_path, expected_remaining):
        source_name = source_filename(self.document_id, ".txt")
        derived_name = processed_filename(self.document_id)
        source_path = self.upload_dir / source_name
        processed_path = self.processed_dir / derived_name
        source_path.write_text("source", encoding="utf-8")
        processed_path.write_text("processed", encoding="utf-8")
        unrelated = self.root / f"{uuid.uuid4()}.txt"
        unrelated.write_text("preserve", encoding="utf-8")
        database_path = self.root / "delete.sqlite3"
        self._insert_owned_document(database_path, source_path, processed_path)

        original_unlink = Path.unlink

        def fail_selected_file(path, missing_ok=False):
            if path == failing_path:
                raise OSError("simulated file deletion failure")
            return original_unlink(path, missing_ok=missing_ok)

        with (
            patch.object(database, "DATABASE_PATH", database_path),
            patch.object(documents_route, "UPLOAD_DIR", self.upload_dir),
            patch.object(documents_route, "PROCESSED_DIR", self.processed_dir),
            patch.object(Path, "unlink", new=fail_selected_file),
        ):
            with self.assertRaises(HTTPException) as raised:
                documents_route.delete_document(
                    self.document_id,
                    {"id": "owner-id"},
                )

        self.assertEqual(raised.exception.status_code, 503)
        self.assertEqual(
            {
                path
                for path in (source_path, processed_path)
                if path.exists()
            },
            expected_remaining,
        )
        self.assertEqual(unrelated.read_text(encoding="utf-8"), "preserve")
        with patch.object(database, "DATABASE_PATH", database_path):
            with database.open_connection() as connection:
                row = connection.execute(
                    "SELECT deleted_at FROM documents WHERE id = ? AND owner_id = ?",
                    (self.document_id, "owner-id"),
                ).fetchone()
        self.assertIsNotNone(row)
        self.assertIsNotNone(row["deleted_at"])

        with (
            patch.object(database, "DATABASE_PATH", database_path),
            patch.object(documents_route, "UPLOAD_DIR", self.upload_dir),
            patch.object(documents_route, "PROCESSED_DIR", self.processed_dir),
        ):
            result = documents_route.delete_document(
                self.document_id,
                {"id": "owner-id"},
            )
        self.assertTrue(result["success"])
        self.assertFalse(source_path.exists())
        self.assertFalse(processed_path.exists())
        self.assertEqual(unrelated.read_text(encoding="utf-8"), "preserve")
        with patch.object(database, "DATABASE_PATH", database_path):
            with database.open_connection() as connection:
                row = connection.execute(
                    "SELECT id FROM documents WHERE id = ? AND owner_id = ?",
                    (self.document_id, "owner-id"),
                ).fetchone()
        self.assertIsNone(row)

    def test_source_delete_failure_keeps_tombstone_and_retries_cleanup(self):
        self._assert_delete_failure_is_retryable(
            self.upload_dir / source_filename(self.document_id, ".txt"),
            {self.upload_dir / source_filename(self.document_id, ".txt")},
        )

    def test_processed_text_delete_failure_keeps_tombstone_and_retries_cleanup(self):
        self._assert_delete_failure_is_retryable(
            self.processed_dir / processed_filename(self.document_id),
            {self.processed_dir / processed_filename(self.document_id)},
        )

    def test_upload_database_transaction_failure_cleans_operation_files(self):
        database_path = self.root / "upload.sqlite3"
        with patch.object(database, "DATABASE_PATH", database_path):
            database.initialize_database()
            with database.open_connection() as connection:
                connection.execute(
                    """
                    CREATE TRIGGER reject_document_insert
                    BEFORE INSERT ON documents
                    BEGIN SELECT RAISE(FAIL, 'simulated metadata failure'); END
                    """
                )
                connection.commit()

        with (
            patch.object(database, "DATABASE_PATH", database_path),
            patch.object(documents_route, "UPLOAD_DIR", self.upload_dir),
            patch.object(documents_route, "PROCESSED_DIR", self.processed_dir),
        ):
            upload = UploadFile(
                filename="notes.txt",
                file=io.BytesIO(b"temporary upload"),
                headers=Headers({"content-type": "text/plain"}),
            )
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(
                    documents_route.upload_document(
                        upload,
                        {"id": "owner-id"},
                    )
                )

        self.assertEqual(raised.exception.status_code, 503)
        self.assertEqual(list(self.upload_dir.iterdir()), [])
        self.assertEqual(list(self.processed_dir.iterdir()), [])
        with patch.object(database, "DATABASE_PATH", database_path):
            with database.open_connection() as connection:
                count = connection.execute(
                    "SELECT COUNT(*) FROM documents"
                ).fetchone()[0]
        self.assertEqual(count, 0)


if __name__ == "__main__":
    unittest.main()
