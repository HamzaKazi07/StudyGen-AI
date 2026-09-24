import uuid
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException

from pypdf import PdfReader
from docx import Document


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
# IN-MEMORY DOCUMENT METADATA
# =========================================================

documents = []


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
    file: UploadFile = File(...)
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
    # Create initial metadata
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

        "size_mb": round(
            total_size / (1024 * 1024),
            2
        ),

        "status": "Processing",

        "uploaded_at": datetime.now().isoformat(),

        "processed": False,

        "text_length": 0

    }


    documents.append(document)


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
        # Update metadata
        # -------------------------------------------------

        document["status"] = "Processed"

        document["processed"] = True

        document["text_length"] = len(
            extracted_text
        )

        document["processed_filename"] = (
            processed_file.name
        )

        document["processed_at"] = (
            datetime.now().isoformat()
        )


    except HTTPException:

        raise

    except Exception as e:

        print(
            "Document processing error:",
            repr(e)
        )

        document["status"] = "Processing Failed"

        raise HTTPException(
            status_code=500,
            detail="Unable to process document."
        )


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
def get_documents():

    return {

        "success": True,

        "documents": documents

    }


# =========================================================
# GET PROCESSED TEXT
# =========================================================

@router.get("/{document_id}/content")
def get_document_content(
    document_id: str
):

    document = next(
        (
            item
            for item in documents
            if item["id"] == document_id
        ),
        None
    )


    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    if not document.get("processed"):

        raise HTTPException(
            status_code=409,
            detail="Document has not been processed yet."
        )


    processed_filename = document.get(
        "processed_filename"
    )


    if not processed_filename:

        raise HTTPException(
            status_code=404,
            detail="Processed content not found."
        )


    processed_file = (
        PROCESSED_DIR /
        processed_filename
    )


    if not processed_file.exists():

        raise HTTPException(
            status_code=404,
            detail="Processed content file not found."
        )


    try:

        text = processed_file.read_text(
            encoding="utf-8"
        )

    except Exception as e:

        print(
            "Read processed document error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to read processed document."
        )


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
    document_id: str
):

    document = next(
        (
            item
            for item in documents
            if item["id"] == document_id
        ),
        None
    )


    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    # -----------------------------------------------------
    # Delete original file
    # -----------------------------------------------------

    file_path = (
        UPLOAD_DIR /
        document["filename"]
    )


    try:

        if file_path.exists():
            file_path.unlink()


        # -------------------------------------------------
        # Delete processed text
        # -------------------------------------------------

        processed_filename = document.get(
            "processed_filename"
        )


        if processed_filename:

            processed_file = (
                PROCESSED_DIR /
                processed_filename
            )

            if processed_file.exists():
                processed_file.unlink()


    except Exception as e:

        print(
            "Document delete error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to delete document."
        )


    documents.remove(document)


    return {

        "success": True,

        "message": (
            "Document and processed content "
            "deleted successfully."
        )

    }