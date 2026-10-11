CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf_token TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    processed_filename TEXT,
    type TEXT NOT NULL,
    size INTEGER NOT NULL CHECK (size >= 0),
    status TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    processed INTEGER NOT NULL CHECK (processed IN (0, 1)),
    text_length INTEGER NOT NULL DEFAULT 0 CHECK (text_length >= 0),
    processed_at TEXT,
    deleted_at TEXT
);

CREATE INDEX documents_owner_uploaded_idx
ON documents(owner_id, uploaded_at DESC);
