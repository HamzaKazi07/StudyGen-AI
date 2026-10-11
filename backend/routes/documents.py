import logging
import sqlite3
import uuid
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from pypdf import PdfReader
from docx import Document

from database import open_connection, transaction
from services.auth import get_current_user, require_csrf


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


# =========================================================
# CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads" / "documents"
PROCESSED_DIR = BASE_DIR / "uploads" / "processed"
METADATA_FILE = BASE_DIR / "uploads" / "documents.json"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

PROCESSED_DIR.mkdir(
    parents=True,
    exist_ok=True
)


MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt"
}


ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
}


# =========================================================
# LEGACY METADATA LOCATION
# =========================================================

def document_response(row) -> dict:
    document = dict(row)
    document["processed"] = bool(document["processed"])
    document["size_mb"] = round(document["size"] / (1024 * 1024), 2)
    document.pop("owner_id", None)
    document.pop("deleted_at", None)
    return document


def safe_storage_path(
    directory: Path,
    filename: str | None,
    expected_filename: str | None = None,
) -> Path:
    if (
        not filename
        or Path(filename).name != filename
        or (expected_filename is not None and filename != expected_filename)
    ):
        raise HTTPException(
            status_code=404,
            detail="Document file is unavailable.",
        )
    root = directory.resolve()
    path = (root / filename).resolve()
    if path.parent != root:
        raise HTTPException(
            status_code=404,
            detail="Document file is unavailable.",
        )
    return path


def cleanup_document_files(document) -> bool:

    document_id = document.get("id")
    source_filename = document.get("filename")
    source_extension = Path(source_filename).suffix.lower() if source_filename else ""
    paths = (
        (
            UPLOAD_DIR,
            source_filename,
            f"{document_id}{source_extension}"
            if source_extension in ALLOWED_EXTENSIONS
            else None,
        ),
        (
            PROCESSED_DIR,
            document.get("processed_filename"),
            f"{document_id}.txt",
        ),
    )
    succeeded = True
    for location, filename, expected_filename in paths:
        if not filename:
            continue

        try:
            file_path = safe_storage_path(
                location,
                filename,
                expected_filename,
            )
            if file_path.exists():
                file_path.unlink()
        except HTTPException:
            logger.error("Refusing to clean up an unsafe document path")
            succeeded = False
        except OSError:
            logger.exception("Document file cleanup failed")
            succeeded = False
    return succeeded


# =========================================================
# TEXT EXTRACTION
# =========================================================

def extract_pdf_text(file_path: Path) -> str:

    text_parts = []

    try:

        reader = PdfReader(str(file_path))

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text_parts.append(page_text)

    except Exception as e:

        print("PDF extraction error:", repr(e))

        raise HTTPException(
            status_code=422,
            detail="Unable to extract text from the PDF."
        )

    return "\n\n".join(text_parts).strip()


def extract_docx_text(file_path: Path) -> str:

    try:

        document = Document(str(file_path))

        paragraphs = []

        for paragraph in document.paragraphs:

            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        return "\n\n".join(paragraphs).strip()

    except Exception as e:

        print("DOCX extraction error:", repr(e))

        raise HTTPException(
            status_code=422,
            detail="Unable to extract text from the DOCX file."
        )


def extract_txt_text(file_path: Path) -> str:

    try:

        return file_path.read_text(
            encoding="utf-8",
            errors="ignore"
        ).strip()

    except Exception as e:

        print("TXT extraction error:", repr(e))

        raise HTTPException(
            status_code=422,
            detail="Unable to read the text file."
        )


def extract_text(
    file_path: Path,
    extension: str
) -> str:

    if extension == ".pdf":

        return extract_pdf_text(file_path)

    if extension == ".docx":

        return extract_docx_text(file_path)

    if extension == ".txt":

        return extract_txt_text(file_path)

    raise HTTPException(
        status_code=400,
        detail="Unsupported document type."
    )


# =========================================================
# SAVE PROCESSED TEXT
# =========================================================

def save_processed_text(
    document_id: str,
    text: str
) -> Path:

    processed_file = (
        PROCESSED_DIR /
        f"{document_id}.txt"
    )

    processed_file.write_text(
        text,
        encoding="utf-8"
    )

    return processed_file


# =========================================================
# UPLOAD + PROCESS DOCUMENT
# =========================================================

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user: dict[str, str] = Depends(require_csrf),
):

    # -----------------------------------------------------
    # Validate filename
    # -----------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )


    original_filename = file.filename

    extension = Path(
        original_filename
    ).suffix.lower()


    # -----------------------------------------------------
    # Validate extension
    # -----------------------------------------------------

    if extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, and TXT files are allowed."
        )


    # -----------------------------------------------------
    # Validate content type
    # -----------------------------------------------------

    if (
        file.content_type
        and file.content_type not in ALLOWED_CONTENT_TYPES
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid file type."
        )


    # -----------------------------------------------------
    # Generate unique ID
    # -----------------------------------------------------

    document_id = str(uuid.uuid4())


    safe_filename = (
        f"{document_id}{extension}"
    )


    file_path = (
        UPLOAD_DIR /
        safe_filename
    )


    # -----------------------------------------------------
    # Save uploaded file
    # -----------------------------------------------------

    total_size = 0

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            while True:

                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                total_size += len(chunk)


                # 20 MB limit

                if total_size > MAX_FILE_SIZE:

                    buffer.close()

                    if file_path.exists():
                        file_path.unlink()

                    raise HTTPException(
                        status_code=413,
                        detail="File size cannot exceed 20 MB."
                    )


                buffer.write(chunk)


    except HTTPException:
        raise

    except Exception as e:

        if file_path.exists():
            file_path.unlink()

        print(
            "Document upload error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to upload document."
        )

    finally:

        await file.close()


    # -----------------------------------------------------
    # Build document metadata after extraction succeeds
    # -----------------------------------------------------

    document = {
        "id": document_id,
        "name": original_filename,
        "filename": safe_filename,
        "type": extension.replace(
            ".",
            ""
        ).upper(),
        "size": total_size,
        "status": "Processing",
        "uploaded_at": datetime.now().isoformat(),
        "processed": False,
        "text_length": 0,
    }

    # =====================================================
    # PROCESS DOCUMENT
    # =====================================================

    try:

        extracted_text = extract_text(
            file_path,
            extension
        )


        # -------------------------------------------------
        # Check extracted text
        # -------------------------------------------------

        if not extracted_text:

            document["status"] = "Processing Failed"

            raise HTTPException(
                status_code=422,
                detail=(
                    "No readable text was found "
                    "in this document."
                )
            )


        # -------------------------------------------------
        # Save extracted text
        # -------------------------------------------------

        processed_file = save_processed_text(
            document_id,
            extracted_text
        )


        # -------------------------------------------------
        # Complete metadata before inserting the ownership record
        # -------------------------------------------------

        document["status"] = "Processed"
        document["processed"] = True
        document["text_length"] = len(extracted_text)
        document["processed_filename"] = processed_file.name
        document["processed_at"] = datetime.now().isoformat()

        with transaction() as connection:
            connection.execute(
                """
                INSERT INTO documents (
                    id, owner_id, name, filename, processed_filename, type,
                    size, status, uploaded_at, processed, text_length, processed_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    document["id"],
                    user["id"],
                    document["name"],
                    document["filename"],
                    document["processed_filename"],
                    document["type"],
                    document["size"],
                    document["status"],
                    document["uploaded_at"],
                    1,
                    document["text_length"],
                    document["processed_at"],
                ),
            )

    except HTTPException:
        if not cleanup_document_files(document):
            raise HTTPException(
                status_code=503,
                detail="Upload failed and temporary file cleanup could not be confirmed.",
            )
        raise

    except sqlite3.Error as e:
        cleanup_succeeded = cleanup_document_files(document)
        logger.exception("Document metadata transaction failed")
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to save document metadata; temporary file cleanup "
                + ("completed." if cleanup_succeeded else "could not be confirmed.")
            ),
        ) from e

    except OSError as e:
        cleanup_succeeded = cleanup_document_files(document)
        logger.exception("Document file operation failed")
        raise HTTPException(
            status_code=503,
            detail=(
                "Document storage failed; temporary file cleanup "
                + ("completed." if cleanup_succeeded else "could not be confirmed.")
            ),
        ) from e

    except Exception as e:
        cleanup_succeeded = cleanup_document_files(document)
        logger.exception("Document processing failed")
        raise HTTPException(
            status_code=500 if cleanup_succeeded else 503,
            detail=(
                "Unable to process document."
                if cleanup_succeeded
                else "Document processing failed and temporary file cleanup could not be confirmed."
            ),
        ) from e

    # =====================================================
    # RETURN RESPONSE
    # =====================================================

    return {
        "success": True,
        "message": (
            "Document uploaded and "
            "processed successfully."
        ),
        "document": document
    }


# =========================================================
# GET ALL DOCUMENTS
# =========================================================

@router.get("")
def get_documents(user: dict[str, str] = Depends(get_current_user)):
    try:
        with open_connection() as connection:
            rows = connection.execute(
                """
                SELECT id, name, filename, processed_filename, type, size,
                       status, uploaded_at, processed, text_length, processed_at
                FROM documents
                WHERE owner_id = ? AND deleted_at IS NULL
                ORDER BY uploaded_at DESC
                """,
                (user["id"],),
            ).fetchall()
    except (sqlite3.Error, OSError) as e:
        logger.exception("Document listing query failed")
        raise HTTPException(
            status_code=503,
            detail="Documents are temporarily unavailable.",
        ) from e

    return {"success": True, "documents": [document_response(row) for row in rows]}


# =========================================================
# GET PROCESSED TEXT
# =========================================================

def get_processed_document(
    document_id: str,
    owner_id: str,
    require_text: bool = False
):

    try:
        with open_connection() as connection:
            row = connection.execute(
                """
                SELECT id, owner_id, name, filename, processed_filename, type,
                       size, status, uploaded_at, processed, text_length,
                       processed_at, deleted_at
                FROM documents
                WHERE id = ? AND owner_id = ? AND deleted_at IS NULL
                """,
                (document_id, owner_id),
            ).fetchone()
    except (sqlite3.Error, OSError) as e:
        logger.exception("Document lookup failed")
        raise HTTPException(
            status_code=503,
            detail="Document is temporarily unavailable.",
        ) from e

    if not row:
        raise HTTPException(status_code=404, detail="Document not found.")

    document = document_response(row)
    if not document["processed"]:

        raise HTTPException(
            status_code=409,
            detail="Document has not been processed yet."
        )

    processed_file = safe_storage_path(
        PROCESSED_DIR,
        document.get("processed_filename"),
        f"{document_id}.txt",
    )

    if not processed_file.is_file():

        raise HTTPException(
            status_code=404,
            detail="Processed content not found."
        )

    try:

        text = processed_file.read_text(
            encoding="utf-8"
        )

    except OSError as e:
        logger.exception("Processed document read failed")
        raise HTTPException(
            status_code=503,
            detail="Unable to read processed document.",
        ) from e

    if require_text and not text.strip():

        raise HTTPException(
            status_code=422,
            detail="Document content is empty."
        )

    return document, text

@router.get("/{document_id}/content")
def get_document_content(
    document_id: str,
    user: dict[str, str] = Depends(get_current_user),
):

    document, text = get_processed_document(document_id, user["id"])

    return {
        "success": True,
        "document_id": document_id,
        "name": document["name"],
        "text": text,
        "text_length": len(text)
    }


# =========================================================
# DELETE DOCUMENT
# =========================================================

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    user: dict[str, str] = Depends(require_csrf),
):
    try:
        with transaction() as connection:
            row = connection.execute(
                """
                SELECT id, owner_id, name, filename, processed_filename,
                       type, size, status, uploaded_at, processed, text_length,
                       processed_at, deleted_at
                FROM documents
                WHERE id = ? AND owner_id = ?
                """,
                (document_id, user["id"]),
            ).fetchone()
            if row is None:
                raise HTTPException(
                    status_code=404,
                    detail="Document not found.",
                )
            if row["deleted_at"] is None:
                connection.execute(
                    "UPDATE documents SET deleted_at = ? WHERE id = ? AND owner_id = ?",
                    (
                        datetime.now().isoformat(),
                        document_id,
                        user["id"],
                    ),
                )
    except (sqlite3.Error, OSError) as e:
        logger.exception("Document deletion state update failed")
        raise HTTPException(
            status_code=503,
            detail="Unable to delete document. Please retry.",
        ) from e

    document = document_response(row)
    source_extension = Path(document["filename"]).suffix.lower()
    if source_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=503,
            detail="Document file reference is invalid; deletion was not completed.",
        )
    try:
        for directory, filename, expected_filename in (
            (
                UPLOAD_DIR,
                document["filename"],
                f"{document_id}{source_extension}",
            ),
            (
                PROCESSED_DIR,
                document.get("processed_filename"),
                f"{document_id}.txt",
            ),
        ):
            if filename:
                path = safe_storage_path(
                    directory,
                    filename,
                    expected_filename,
                )
                if path.exists():
                    path.unlink()
    except (OSError, HTTPException) as e:
        logger.exception("Document file cleanup failed")
        raise HTTPException(
            status_code=503,
            detail="Unable to complete document deletion. Please retry.",
        ) from e

    try:
        with transaction() as connection:
            connection.execute(
                "DELETE FROM documents WHERE id = ? AND owner_id = ?",
                (document_id, user["id"]),
            )
    except (sqlite3.Error, OSError) as e:
        logger.exception("Document metadata deletion failed")
        raise HTTPException(
            status_code=503,
            detail="Unable to complete document deletion. Please retry.",
        ) from e

    return {
        "success": True,
        "message": (
            "Document and processed content "
            "deleted successfully."
        )
    }