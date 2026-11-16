# DocSpace — Assessment Submission

## 1. Project Overview

**DocSpace** is a full-stack document management application built using React, FastAPI, and PostgreSQL.

It supports document creation, rich-text editing, persistence, file uploads, sharing, deletion, and PDF/Markdown export.

## 2. Project Links

| Resource | Link |
|---|---|
| Live Application | https://docspace-frontend-f1g1.onrender.com |
| Backend API | https://docspace-backend-7wpz.onrender.com |
| API Documentation | https://docspace-backend-7wpz.onrender.com/docs |
| GitHub Repository | https://github.com/manthanjain2107/Alice |
| Walkthrough Video | To be added after recording |

## 3. Demo Accounts

DocSpace uses two simulated users.

**User 1:** Alice  
**User 2:** Bob

No password or registration is required.

Use the user selector in the top-right corner to switch accounts.

### How to Test Sharing

1. Select Alice.
2. Create and save a document.
3. Click **Share with Bob**.
4. Switch to Bob.
5. Open the document under **Shared With Me**.
6. Edit the content and save.
7. Switch back to Alice to verify the saved changes.

## 4. Implemented Features

- Create, rename, edit, and save documents.
- Rich-text formatting: bold, italic, underline, headings, and lists.
- Persistent document storage using Neon PostgreSQL.
- Import UTF-8 `.txt` and `.md` files up to 1 MB.
- Share documents between simulated users.
- Separate views for owned and shared documents.
- Delete documents with owner-only permission checks.
- Export documents to Markdown.
- Export documents to PDF using the browser print dialog.
- Basic validation and error handling.
- Automated backend testing using Pytest.

## 5. Included Deliverables

- `frontend/` — React application source code.
- `backend/` — FastAPI backend source code.
- `README.md` — Local setup, run instructions, and feature overview.
- `ARCHITECTURE.md` — System architecture and engineering decisions.
- `AI_WORKFLOW.md` — AI usage, modifications, and verification approach.
- `SUBMISSION.md` — This submission guide.
- `walkthrough-link.txt` — Video URL (to be added).
- `screenshots/` — Application screenshots (to be added).

## 6. Local Setup

Follow the instructions in `README.md`.

**Backend:**

From the `backend` directory, create a Python virtual environment, install dependencies from `requirements.txt`, and start Uvicorn on port 8000.

**Frontend:**

From the `frontend` directory, run `npm install` followed by `npm run dev`.

Open http://localhost:5173.

## 7. Architecture Summary

The React frontend communicates with the FastAPI REST API.

FastAPI performs document operations, validates requests, checks document ownership, and communicates with PostgreSQL through SQLAlchemy.

Neon hosts the production database, while Render hosts the frontend and backend.

## 8. Automated Testing

From the `backend` directory, run:

`.\venv\Scripts\python.exe -m pytest -v`

The current automated test checks document creation and retrieval.

## 9. Known Limitations

- Users are simulated rather than authenticated.
- Real-time collaboration is not implemented.
- Document saving is manual.
- Rich-text editing uses the browser's legacy formatting commands.
- PDF export uses the browser print interface.
- Uploaded Markdown is imported as editable text rather than rendered Markdown.
- HTML sanitization and production-grade authentication remain future improvements.

## 10. Next Improvements

Given another 2–4 hours, I would prioritize authentication, autosave, richer editing, stronger content sanitization, and additional tests for sharing and deletion.

## 11. Reviewer Quick Start

1. Open the live application.
2. Select Alice.
3. Create and edit a document.
4. Save and refresh the page.
5. Share the document with Bob.
6. Switch to Bob to verify shared access.
7. Test file upload and PDF/Markdown export.
8. Review the source code, automated test, and architecture documentation.

**Note:** The free hosting instance may take some time to respond after inactivity.