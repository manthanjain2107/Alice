# DocSpace — AI-Native Development Workflow

## 1. AI Tools Used

I used **ChatGPT (OpenAI)** as a development assistant while building DocSpace.

AI supported code scaffolding, debugging, frontend styling, backend API development, deployment troubleshooting, and technical documentation.

## 2. Where AI Accelerated Development

**Frontend Development:** AI helped generate the initial React component structure, document dashboard, formatting toolbar, and CSS. I integrated these into the application and tested the document editing workflow.

**Backend Development:** AI accelerated the initial FastAPI endpoint implementation for document creation, editing, sharing, uploading, and deletion.

**Debugging:** I used AI to investigate API failures and deployment errors. For example, deployment logs revealed a PostgreSQL driver mismatch, which I addressed by switching to the appropriate Psycopg dependency.

**Documentation:** AI helped structure setup instructions, architecture decisions, and the submission checklist.

## 3. AI-Generated Output I Changed or Rejected

I did not treat generated code as automatically correct.

- I updated the initial in-memory document workflow to persist documents through FastAPI and a database.
- I revised the initial UI styling to improve contrast, readability, navigation, and editor usability.
- I corrected the PostgreSQL driver dependency after reviewing actual deployment errors.
- I retained a simple simulated-user sharing model rather than attempting to build a complex authentication system within the assessment timeframe.

These changes helped keep the implementation focused on working functionality rather than unnecessary complexity.

## 4. How I Verified Correctness

I used a combination of local execution, automated testing, and manual feature checks.

- **Backend:** Ran FastAPI and checked API routes and responses.
- **Persistence:** Created documents, saved changes, refreshed the browser, and reopened documents.
- **Sharing:** Switched between Alice and Bob to check owned and shared document access.
- **File Upload:** Imported supported text files and checked whether their content could be edited.
- **Export:** Tested Markdown downloads and browser-based PDF output.
- **Deletion:** Checked the deletion confirmation and owner-only permission model.
- **Automated Testing:** Used Pytest with FastAPI TestClient to verify document creation and retrieval.
- **Deployment:** Inspected Render build and runtime logs, corrected failures, and deployed the backend and frontend.

## 5. What I Prioritized

I prioritized a complete end-to-end document workflow over implementing every feature of Google Docs.

The main goal was to deliver a usable application with clear document ownership, persistent storage, sharing, rich-text editing, and