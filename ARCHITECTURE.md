
# DocSpace — Architecture & Design Decisions

## 1. Project Overview

DocSpace is a lightweight full-stack document management
application that enables users to create, edit, save,
share, import, export, and delete documents.

The application prioritizes core document workflows,
data persistence, usability, and straightforward deployment.

## 2. Technology Stack

### Frontend
- React and Vite
- CSS for responsive UI styling
- Lucide React for icons
- Browser contentEditable for rich-text editing
- Turndown for Markdown export
- Browser print functionality for PDF export

### Backend
- Python and FastAPI
- SQLAlchemy ORM
- REST APIs
- Pydantic for request validation

### Database
- SQLite for local development
- Neon PostgreSQL for production

### Deployment
- Render Web Service for FastAPI
- Render Static Site for React
- Neon for persistent database storage

## 3. System Architecture

User Browser
    |
    v
React Frontend (Render Static Site)
    |
    | HTTP REST API
    v
FastAPI Backend (Render Web Service)
    |
    | SQLAlchemy ORM
    v
Neon PostgreSQL Database

The frontend handles document interactions, formatting,
user switching, and exports.

The backend handles document operations, upload validation,
ownership checks, and sharing permissions.

The database stores documents and sharing relationships.

## 4. Document Data Model

Documents:
- id: Unique document identifier
- title: Document title
- content: Rich-text HTML
- owner: Document owner

Shares:
- id: Unique sharing record
- document_id: Associated document
- username: User granted access

## 5. Main Workflows

### Document Creation and Editing

Users create documents through the React interface.

The frontend sends requests to FastAPI, which validates
inputs and stores document data in PostgreSQL.

Rich-text formatting is stored as HTML to preserve
headings, bold, italic, underline, and lists.

### Document Sharing

DocSpace uses two simulated users: Alice and Bob.

Document owners can grant access to another user.

Owned and shared documents are displayed separately.

Only owners can share or delete their documents.

### File Upload

Users can upload UTF-8 .txt and .md files.

The backend validates the file extension and size,
then imports the file content into an editable document.

The maximum supported file size is 1 MB.

### Document Export

Markdown export converts document HTML into Markdown
using Turndown.

PDF export uses the browser print interface and
print-specific CSS for document formatting.

## 6. Engineering Priorities

The main priority was completing a reliable,
end-to-end workflow within a limited timeframe.

Key decisions:

1. React provides a reusable and interactive frontend.
2. FastAPI simplifies REST API development and validation.
3. SQLAlchemy supports both SQLite and PostgreSQL.
4. Neon separates persistent storage from application hosting.
5. Simulated users make sharing easy for reviewers to test.
6. Browser-based editing and PDF printing avoid unnecessary
   dependency complexity.

## 7. Testing

Automated testing uses Pytest and FastAPI TestClient.

The core test verifies document creation and retrieval
through backend APIs.

Manual verification covers document editing, saving,
refresh persistence, sharing, uploads, exports, and deletion.

## 8. Known Limitations

- Authentication uses simulated user identities.
- The application does not support simultaneous editing.
- Document changes require manual saving.
- contentEditable uses a legacy browser formatting API.
- Imported Markdown is treated as text rather than
  rendered Markdown.
- Rich-text HTML is not sanitized by a dedicated
  HTML sanitization library.
- The basic demo sharing model is not suitable for
  production security requirements.

## 9. Future Improvements

With another 2–4 hours, I would prioritize:

1. Proper authentication and authorization.
2. Autosave and unsaved-change warnings.
3. Replacing the browser editor with TipTap.
4. HTML sanitization and stronger security validation.
5. Additional automated tests for sharing and deletion.
6. Improved error reporting and loading states.

## 10. Conclusion

DocSpace demonstrates a practical full-stack approach
to document management with persistent storage,
rich-text editing, file imports, sharing, exports,
and owner-controlled deletion.

The architecture intentionally favors maintainability,
clear functionality, and a usable reviewer experience.
