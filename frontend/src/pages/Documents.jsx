import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

function Documents() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD DOCUMENTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    let active = true;

    const loadDocuments = async () => {
      try {
        setError("");

        const response = await apiFetch("/api/documents");

        if (!response.ok) {
          throw new Error("Unable to load documents.");
        }

        const data = await response.json();

        if (active) {
          setDocuments(data.documents || []);
        }
      } catch (err) {
        console.error("Fetch documents error:", err);

        if (active) {
          setError("Unable to load documents.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDocuments();

    return () => {
      active = false;
    };
  }, []);

  // =====================================================
  // OPEN FILE PICKER
  // =====================================================

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    // ---------------------------------------------------
    // Frontend validation
    // ---------------------------------------------------

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".txt",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(extension)
    ) {
      setError(
        "Only PDF, DOCX, and TXT files are allowed."
      );

      event.target.value = "";
      return;
    }

    // 20 MB
    if (file.size > 20 * 1024 * 1024) {
      setError("File size cannot exceed 20 MB.");

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      // -------------------------------------------------
      // FormData
      // IMPORTANT:
      // Do NOT manually set Content-Type.
      // Browser adds multipart/form-data boundary.
      // -------------------------------------------------

      const formData = new FormData();

      formData.append("file", file);

      const response = await apiFetch(
        "/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Document upload failed."
        );
      }

      // -------------------------------------------------
      // Add uploaded document to list
      // -------------------------------------------------

      setDocuments((previous) => [
        data.document,
        ...previous,
      ]);

      setSuccess(
        `"${file.name}" uploaded successfully.`
      );

    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.message ||
          "Unable to upload document."
      );
    } finally {
      setUploading(false);

      // Reset file input so same file can be selected again
      event.target.value = "";
    }
  };

  // =====================================================
  // DELETE DOCUMENT
  // =====================================================

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await apiFetch(
        `/api/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to delete document."
        );
      }

      setDocuments((previous) =>
        previous.filter(
          (document) =>
            document.id !== documentId
        )
      );

      setSuccess("Document deleted successfully.");

    } catch (err) {
      console.error("Delete error:", err);

      setError(
        err.message ||
          "Unable to delete document."
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredDocuments = documents.filter(
    (document) =>
      document.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatSize = (document) => {
    if (document.size_mb !== undefined) {
      return `${document.size_mb} MB`;
    }

    return "Unknown size";
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString();
  };

  // =====================================================
  // FILE ICON
  // =====================================================

  const getFileIcon = (type) => {
    if (type === "PDF") {
      return "📄";
    }

    if (type === "DOCX") {
      return "📘";
    }

    return "📝";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-8">

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-sm font-medium text-indigo-400">
            Your Library
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Documents
          </h1>

          <p className="mt-2 text-slate-400">
            Upload and manage your study materials in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={openFilePicker}
          disabled={uploading}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? "Uploading..."
            : "+ Upload Document"}
        </button>

      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={openFilePicker}
        className="group cursor-pointer rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center transition hover:border-indigo-500/60 hover:bg-indigo-500/5"
      >

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
          ↑
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          {uploading
            ? "Uploading your document..."
            : "Upload your study material"}
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
          Drag and drop your PDF, DOCX, or text files here,
          or click to browse your computer.
        </p>

        <p className="mt-4 text-xs text-slate-600">
          Maximum file size: 20 MB
        </p>

      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 md:flex-row">

        <div className="relative flex-1">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search documents..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />

        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
        >
          All Documents ▾
        </button>

      </div>

      {/* Documents */}
      <div>

        <div className="mb-4 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Recent Documents
          </h2>

          <span className="text-sm text-slate-500">
            {documents.length}{" "}
            {documents.length === 1
              ? "document"
              : "documents"}
          </span>

        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center text-sm text-slate-500">
            Loading documents...
          </div>
        )}

        {/* Empty */}
        {!loading &&
          filteredDocuments.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center">

              <div className="text-4xl">
                📚
              </div>

              <h3 className="mt-4 font-semibold">
                No documents found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Upload your first study document to get started.
              </p>

            </div>
          )}

        {/* Document Grid */}
        {!loading &&
          filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              {filteredDocuments.map(
                (document) => (

                  <div
                    key={document.id}
                    className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-1 hover:border-indigo-500/40"
                  >

                    {/* Top */}
                    <div className="flex items-start justify-between">

                      <div className="flex gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
                          {getFileIcon(
                            document.type
                          )}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate font-semibold">
                            {document.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {document.type}
                            {" • "}
                            {formatSize(document)}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            document.id
                          )
                        }
                        className="text-slate-500 hover:text-red-400"
                        title="Delete document"
                      >
                        🗑
                      </button>

                    </div>

                    {/* Status */}
                    <div className="mt-5 flex items-center justify-between">

                      <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        {document.status}
                      </span>

                      <span className="text-xs text-slate-600">
                        {formatDate(
                          document.uploaded_at
                        )}
                      </span>

                    </div>

                    {/* Buttons */}
                    <div className="mt-5 flex gap-2">

                      <button
                        type="button"
                        className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium hover:bg-slate-700"
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/ai-tutor?document_id=${encodeURIComponent(document.id)}`
                          )
                        }
                        disabled={
                          document.status !== "Processed" ||
                          !document.processed
                        }
                        className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium hover:bg-indigo-500"
                      >
                        Ask AI
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

      </div>

    </div>
  );
}

export default Documents;