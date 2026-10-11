import os
import re
import tempfile
import uuid
from pathlib import Path
from typing import BinaryIO, Iterable


DOCUMENT_EXTENSIONS = frozenset({".pdf", ".docx", ".txt"})
_DOCUMENT_ID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)


class InvalidDocumentPath(ValueError):
    """A document identifier or stored filename is not a safe generated name."""


class ProcessedTextCleanupError(OSError):
    def __init__(self, destination: Path, temporary_path: Path):
        self.destination = destination
        self.temporary_path = temporary_path
        super().__init__(
            "Processed text was installed, but its temporary file could not be removed."
        )


def validate_document_id(document_id: str) -> str:
    if (
        not isinstance(document_id, str)
        or not _DOCUMENT_ID_PATTERN.fullmatch(document_id)
    ):
        raise InvalidDocumentPath("Invalid document identifier.")
    try:
        if str(uuid.UUID(document_id)) != document_id:
            raise InvalidDocumentPath("Invalid document identifier.")
    except ValueError as error:
        raise InvalidDocumentPath("Invalid document identifier.") from error
    return document_id


def source_filename(document_id: str, extension: str) -> str:
    validate_document_id(document_id)
    normalized_extension = extension.lower()
    if normalized_extension not in DOCUMENT_EXTENSIONS:
        raise InvalidDocumentPath("Invalid document extension.")
    return f"{document_id}{normalized_extension}"


def processed_filename(document_id: str) -> str:
    validate_document_id(document_id)
    return f"{document_id}.txt"


def safe_storage_path(
    directory: Path,
    document_id: str,
    filename: str,
    expected_filename: str,
) -> Path:
    validate_document_id(document_id)
    if (
        not isinstance(filename, str)
        or not filename
        or Path(filename).name != filename
        or "/" in filename
        or "\\" in filename
        or filename != expected_filename
    ):
        raise InvalidDocumentPath("Invalid document filename.")

    expected_names = {
        processed_filename(document_id),
        *(
            source_filename(document_id, extension)
            for extension in DOCUMENT_EXTENSIONS
        ),
    }
    if expected_filename not in expected_names:
        raise InvalidDocumentPath("Invalid document filename.")

    root = directory.resolve()
    candidate = root / filename
    if candidate.is_symlink():
        raise InvalidDocumentPath("Symbolic document paths are not allowed.")
    resolved = candidate.resolve(strict=False)
    if resolved.parent != root:
        raise InvalidDocumentPath("Document path escapes its storage directory.")
    return resolved


def create_upload_file(
    directory: Path,
    document_id: str,
    extension: str,
) -> tuple[Path, BinaryIO]:
    filename = source_filename(document_id, extension)
    path = safe_storage_path(directory, document_id, filename, filename)
    return path, path.open("xb")


def write_processed_text(
    directory: Path,
    document_id: str,
    text: str,
) -> Path:
    filename = processed_filename(document_id)
    destination = safe_storage_path(
        directory,
        document_id,
        filename,
        filename,
    )
    temporary_path: Path | None = None
    installed = False
    try:
        file_descriptor, temporary_name = tempfile.mkstemp(
            prefix=f".{document_id}.",
            suffix=".tmp",
            dir=directory,
        )
        temporary_path = Path(temporary_name)
        with os.fdopen(file_descriptor, "w", encoding="utf-8") as temporary:
            temporary.write(text)
            temporary.flush()
            os.fsync(temporary.fileno())

        # Link is atomic and fails rather than overwriting an existing file.
        os.link(temporary_path, destination)
        installed = True
        return destination
    finally:
        if temporary_path is not None:
            try:
                temporary_path.unlink(missing_ok=True)
            except OSError as error:
                if installed:
                    raise ProcessedTextCleanupError(
                        destination,
                        temporary_path,
                    ) from error
                raise


def remove_created_files(
    file_references: Iterable[tuple[Path, str, str, str]],
) -> bool:
    succeeded = True
    for directory, document_id, filename, expected_filename in file_references:
        try:
            path = safe_storage_path(
                directory,
                document_id,
                filename,
                expected_filename,
            )
            path.unlink(missing_ok=True)
        except (OSError, InvalidDocumentPath):
            succeeded = False
    return succeeded


def delete_document_files(
    upload_directory: Path,
    processed_directory: Path,
    document_id: str,
    source_name: str,
    processed_name: str | None,
) -> None:
    validate_document_id(document_id)
    source_extension = Path(source_name).suffix.lower()
    expected_source_name = source_filename(document_id, source_extension)
    source_path = safe_storage_path(
        upload_directory,
        document_id,
        source_name,
        expected_source_name,
    )
    processed_path = None
    if processed_name:
        expected_processed_name = processed_filename(document_id)
        processed_path = safe_storage_path(
            processed_directory,
            document_id,
            processed_name,
            expected_processed_name,
        )

    deletion_errors = []
    for path in (source_path, processed_path):
        if path is None:
            continue
        try:
            path.unlink(missing_ok=True)
        except OSError as error:
            deletion_errors.append(error)

    if deletion_errors:
        raise OSError("Unable to remove all document files.") from deletion_errors[0]
