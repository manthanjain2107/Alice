
# DocSpace – Document Management Workspace

DocSpace is a lightweight full-stack document management
application built using React, FastAPI, and SQLite.

The application allows users to create, edit, organize,
upload, share, export, and delete documents.

## Features

- Create and rename documents
- Rich-text editing with bold, italic, underline,
  headings, and lists
- Save and reopen documents
- Import .txt and .md files (maximum 1 MB)
- Share documents between Alice and Bob
- View owned and shared documents separately
- Export documents to Markdown
- Export documents to PDF using browser printing
- Delete documents with owner-only permission
- Persistent local storage using SQLite
- Basic validation and error handling
- Automated backend testing

## Technology Stack

Frontend:
- React
- Vite
- CSS
- Lucide React
- Turndown

Backend:
- Python
- FastAPI
- SQLAlchemy
- SQLite

Testing:
- Pytest
- FastAPI TestClient

## Local Setup

Requirements:
- Node.js and npm
- Python 3.12+
- Git

### 1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL

cd DocSpace

### 2. Start the backend

cd backend

python -m venv venv

Windows:

.\venv\Scripts\python.exe -m pip install fastapi uvicorn sqlalchemy python-multipart pytest httpx

.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

Backend URL:
http://127.0.0.1:8000

API documentation:
http://127.0.0.1:8000/docs

### 3. Start the frontend

Open another terminal from the project root.

cd frontend

npm install

npm run dev

Frontend URL:
http://localhost:5173

## Demo Users

The application includes two simulated users:

- Alice
- Bob

Use the user dropdown in the top-right corner
to switch between users.

To test sharing:

1. Select Alice.
2. Create a document.
3. Save it.
4. Click Share with Bob.
5. Switch to Bob.
6. Open the document in Shared With Me.

## Supported Upload Formats

- .txt
- .md

Maximum file size: 1 MB.

Uploaded text becomes an editable document.

## Export Functionality

Markdown:
Downloads the current document as a .md file.

PDF:
Opens the browser print dialog. Select
"Save as PDF" to download the document.

## Automated Testing

From the backend folder, run:

.\venv\Scripts\python.exe -m pytest -v

The automated test verifies document creation
and retrieval through the API.

Note: The current test creates a document in
the local development database.

## Architecture

React provides the user interface and
communicates with the FastAPI REST API.

FastAPI handles document operations,
sharing rules, file upload, and validation.

SQLAlchemy manages database operations.

SQLite stores documents and sharing records
in the local development environment.

Rich-text document content is stored as HTML.

## Design Decisions

The project prioritizes a working end-to-end
document workflow over advanced collaboration
features.

Simulated users simplify the sharing demonstration.

Markdown export uses Turndown, while PDF export
uses the browser printing capability.

## Known Limitations

- Authentication is simulated, not production-grade.
- Real-time collaborative editing is not supported.
- Users must save document changes manually.
- The editor uses the browser's legacy execCommand API.
- Uploaded Markdown is imported as editable text,
  not rendered Markdown.
- SQLite persistence is intended for local development.
- Production hosting requires persistent database storage.

## Future Improvements

- Real authentication
- Document version history
- Autosave
- Real-time collaboration
- More advanced rich-text editing
- Expanded document permissions

## AI-Assisted Development

AI assistance was used to accelerate initial
scaffolding, API implementation, UI development,
and documentation.

Implementation behavior was checked through
local development testing and feature walkthroughs.

See AI_WORKFLOW.md for the detailed workflow note.
