
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from typing import Optional
from pathlib import Path
import html


import os

BASE_DIR = Path(__file__).resolve().parent

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR / 'docspace.db'}"
)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), default="Untitled Document")
    content = Column(Text, default="")
    owner = Column(String(50), nullable=False)

class Share(Base):
    __tablename__ = "shares"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    username = Column(String(50), nullable=False)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DocSpace API")



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://docspace-frontend-f1g1.onrender.com",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)



USERS = {"Alice", "Bob"}

class DocumentInput(BaseModel):
    title: str = Field(default="Untitled Document", min_length=1, max_length=200)
    content: str = ""

class ShareInput(BaseModel):
    username: str

def check_user(user):
    if user not in USERS:
        raise HTTPException(400, "Unknown user")

def serialize(doc, db):
    shared = db.query(Share).filter(Share.document_id == doc.id).all()
    return {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "owner": doc.owner,
        "sharedWith": [s.username for s in shared]
    }

def get_accessible(db, doc_id, user):
    doc = db.get(Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    shared = db.query(Share).filter(
        Share.document_id == doc_id,
        Share.username == user
    ).first()
    if doc.owner != user and not shared:
        raise HTTPException(403, "Access denied")
    return doc

@app.get("/documents")
def list_documents(user: str):
    check_user(user)
    with SessionLocal() as db:
        docs = db.query(Document).all()
        return [
            serialize(d, db) for d in docs
            if d.owner == user or db.query(Share).filter(
                Share.document_id == d.id,
                Share.username == user
            ).first()
        ]

@app.post("/documents", status_code=201)
def create_document(data: DocumentInput, user: str):
    check_user(user)
    with SessionLocal() as db:
        doc = Document(title=data.title, content=data.content, owner=user)
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return serialize(doc, db)

@app.put("/documents/{doc_id}")
def update_document(doc_id: int, data: DocumentInput, user: str):
    check_user(user)
    with SessionLocal() as db:
        doc = get_accessible(db, doc_id, user)
        doc.title = data.title
        doc.content = data.content
        db.commit()
        return serialize(doc, db)

@app.post("/documents/{doc_id}/share")
def share_document(doc_id: int, data: ShareInput, user: str):
    check_user(user)
    check_user(data.username)
    with SessionLocal() as db:
        doc = db.get(Document, doc_id)
        if not doc:
            raise HTTPException(404, "Document not found")
        if doc.owner != user:
            raise HTTPException(403, "Only the owner can share")
        if data.username != user:
            existing = db.query(Share).filter(
                Share.document_id == doc_id,
                Share.username == data.username
            ).first()
            if not existing:
                db.add(Share(document_id=doc_id, username=data.username))
                db.commit()
        return serialize(doc, db)

@app.post("/upload", status_code=201)
async def upload_document(user: str, file: UploadFile = File(...)):
    check_user(user)
    filename = file.filename or ""
    suffix = Path(filename).suffix.lower()
    if suffix not in {".txt", ".md"}:
        raise HTTPException(400, "Only .txt and .md files are supported")
    raw = await file.read(1024 * 1024 + 1)
    if len(raw) > 1024 * 1024:
        raise HTTPException(400, "Maximum file size is 1 MB")
    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(400, "File must use UTF-8 encoding")
    safe_content = "<p>" + html.escape(content).replace(
        "\n", "<br>"
    ) + "</p>"
    with SessionLocal() as db:
        doc = Document(
            title=Path(filename).stem[:200] or "Imported Document",
            content=safe_content,
            owner=user
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return serialize(doc, db)

@app.get("/health")
def health():
    return {"status": "ok"}



@app.delete("/documents/{doc_id}")
def delete_document(doc_id: int, user: str):
    check_user(user)

    with SessionLocal() as db:
        doc = db.get(Document, doc_id)

        if not doc:
            raise HTTPException(404, "Document not found")

        if doc.owner != user:
            raise HTTPException(
                403, "Only the owner can delete this document"
            )

        db.query(Share).filter(
            Share.document_id == doc_id
        ).delete(synchronize_session=False)

        db.delete(doc)
        db.commit()

        return {"message": "Document deleted successfully"}
