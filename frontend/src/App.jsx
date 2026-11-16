import TurndownService from "turndown";
import { useEffect, useRef, useState } from "react";
import {
  FileText, Plus, Upload, Save, Share2, UserRound,
  Bold, Italic, Underline, Heading2, List,
  ListOrdered, FolderOpen, CheckCircle2, AlertCircle,
  Cloud, FilePlus2, Clock3, Download, FileDown, Trash2
} from "lucide-react";
import "./App.css";


const API = import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


function App() {
  const [user, setUser] = useState("Alice");
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const editorRef = useRef(null);
  const fileRef = useRef(null);

  const current = documents.find(d => d.id === selected);

  async function request(path, options = {}) {
    const response = await fetch(API + path, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Request failed"
      );
    }
    return data;
  }

  function notify(text, isError = false) {
    setMessage(text);
    setError(isError);
  }

  async function loadDocuments() {
    const docs = await request(
      `/documents?user=${encodeURIComponent(user)}`
    );
    setDocuments(docs);
    return docs;
  }

  useEffect(() => {
    let active = true;

    request(`/documents?user=${encodeURIComponent(user)}`)
      .then(docs => {
        if (active) setDocuments(docs);
      })
      .catch(err => {
        if (active) notify(err.message, true);
      });

    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = current?.content || "";
    }
  }, [selected, user]);

  async function createDocument() {
    try {
      const doc = await request(`/documents?user=${user}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Document",
          content: ""
        })
      });

      await loadDocuments();
      setSelected(doc.id);
      notify("New document created");
    } catch (err) {
      notify(err.message, true);
    }
  }

  function updateTitle(value) {
    setDocuments(docs =>
      docs.map(d =>
        d.id === selected ? { ...d, title: value } : d
      )
    );
  }

  async function saveDocument() {
    if (!current) return false;

    if (!current.title.trim()) {
      notify("Document title cannot be empty", true);
      return false;
    }

    setSaving(true);

    try {
      await request(`/documents/${selected}?user=${user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: current.title,
          content: editorRef.current?.innerHTML || ""
        })
      });

      await loadDocuments();
      notify("All changes saved successfully");
      return true;
    } catch (err) {
      notify(err.message, true);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function shareDocument() {
    if (!current || current.owner !== user) return;

    const target = user === "Alice" ? "Bob" : "Alice";

    try {
      const saved = await saveDocument();
      if (!saved) return;

      await request(`/documents/${selected}/share?user=${user}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: target })
      });

      await loadDocuments();
      notify(`Document successfully shared with ${target}`);
    } catch (err) {
      notify(err.message, true);
    }
  }

  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/\.(txt|md)$/i.test(file.name)) {
      notify("Only .txt and .md files are supported", true);
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      notify("Maximum file size is 1 MB", true);
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const doc = await request(`/upload?user=${user}`, {
        method: "POST",
        body: formData
      });

      await loadDocuments();
      setSelected(doc.id);
      notify("File imported successfully");
    } catch (err) {
      notify(err.message, true);
    }

    event.target.value = "";
  }

  function format(command, value) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }

  function toolButton(icon, label, command, value) {
    return (
      <button
        type="button"
        className="tool-btn"
        title={label}
        aria-label={label}
        onMouseDown={e => e.preventDefault()}
        onClick={() => format(command, value)}
      >
        {icon}
      </button>
    );
  }

  // DELETE DOCUMENT
  async function deleteDocument() {
    if (!current || current.owner !== user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${current.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await request(
        `/documents/${current.id}?user=${encodeURIComponent(user)}`,
        { method: "DELETE" }
      );

      setSelected(null);
      await loadDocuments();
      notify("Document deleted successfully");
    } catch (err) {
      notify(err.message, true);
    }
  }

  // EXPORT AS MARKDOWN
  function exportMarkdown() {
    if (!current) return;

    const turndown = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced"
    });

    const html = editorRef.current?.innerHTML || "";
    const markdown = turndown.turndown(html);

    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const filename = current.title
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
      .trim() || "document";

    link.href = url;
    link.download = `${filename}.md`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    notify("Markdown document exported successfully");
  }

  // EXPORT AS PDF USING BROWSER PRINT
  function exportPDF() {
    if (!current) return;

    window.print();
  }


  function switchUser(value) {
    setUser(value);
    setSelected(null);
    setDocuments([]);
    setMessage("");
  }

  function selectDocument(id) {
    if (id === selected) return;
    if (selected !== null) {
      notify("Save your changes before switching documents");
    }
    setSelected(id);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <FileText size={24} />
          </div>
          <div>
            <h2>DocSpace</h2>
            <span>YOUR DIGITAL WORKSPACE</span>
          </div>
        </div>

        <div className="sidebar-actions">
          <button className="create-btn" onClick={createDocument}>
            <Plus size={19} />
            New Document
          </button>

          <button
            className="upload-btn"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={18} />
            Import File
          </button>

          <input
            type="file"
            hidden
            accept=".txt,.md"
            ref={fileRef}
            onChange={uploadFile}
          />
          <div className="upload-hint">TXT or MD • Up to 1 MB</div>
        </div>

        <div className="workspace-label">
          <FolderOpen size={16} />
          WORKSPACE
        </div>

        <div className="section-heading">
          <span>MY DOCUMENTS</span>
          <span className="count">
            {documents.filter(d => d.owner === user).length}
          </span>
        </div>

        <div className="document-list">
          {documents.filter(d => d.owner === user).map(doc => (
            <button
              key={doc.id}
              className={`document-item ${selected === doc.id ? "active" : ""
                }`}
              onClick={() => selectDocument(doc.id)}
            >
              <FileText size={17} />
              <span>{doc.title}</span>
            </button>
          ))}
        </div>

        <div className="section-heading shared-heading">
          <span>SHARED WITH ME</span>
          <span className="count">
            {documents.filter(d => d.owner !== user).length}
          </span>
        </div>

        <div className="document-list">
          {documents.filter(d => d.owner !== user).map(doc => (
            <button
              key={doc.id}
              className={`document-item ${selected === doc.id ? "active" : ""
                }`}
              onClick={() => selectDocument(doc.id)}
            >
              <Share2 size={17} />
              <span>{doc.title}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-icon">
            <Cloud size={19} />
          </div>
          <div>
            <strong>Your workspace</strong>
            <small>Powered by DocSpace</small>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <span className="breadcrumb">Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{current?.title || "Documents"}</strong>
          </div>

          <div className="topbar-right">
            <span className="online-status">
              <span className="online-dot" />
              Workspace
            </span>

            <div className="user-box">
              <div className="avatar">
                <UserRound size={18} />
              </div>
              <select
                value={user}
                onChange={e => switchUser(e.target.value)}
              >
                <option value="Alice">Alice</option>
                <option value="Bob">Bob</option>
              </select>
            </div>
          </div>
        </header>

        <main className="main-content">
          {message && (
            <div className={`notification ${error ? "error" : ""}`}>
              {error
                ? <AlertCircle size={17} />
                : <CheckCircle2 size={17} />}
              {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {current ? (
            <div className="document-workspace">
              <div className="document-heading">
                <div>
                  <div className="eyebrow">
                    <FileText size={15} />
                    DOCUMENT EDITOR
                  </div>
                  <h1>Edit your document</h1>
                  <p>
                    Create, format and save your content
                  </p>
                </div>

                <div className="document-actions">

                  <button
                    className="export-action"
                    onClick={exportMarkdown}
                    title="Download as Markdown"
                  >
                    <Download size={17} />
                    Export Markdown
                  </button>

                  <button
                    className="export-action"
                    onClick={exportPDF}
                    title="Save document as PDF"
                  >
                    <FileDown size={17} />
                    Export PDF
                  </button>

                  {current.owner === user && (
                    <button
                      className="delete-action"
                      onClick={deleteDocument}
                      title="Delete document"
                    >
                      <Trash2 size={17} />
                      Delete
                    </button>
                  )}

                  {current.owner === user && (
                    <button
                      className="share-action"
                      onClick={shareDocument}
                    >
                      <Share2 size={17} />
                      Share with {user === "Alice" ? "Bob" : "Alice"}
                    </button>
                  )}

                  <button
                    className="save-action"
                    onClick={saveDocument}
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="editor-panel">
                <div className="editor-title-row">
                  <h1 className="print-document-title">
                    {current.title}
                  </h1>
                  <input
                    className="document-title-input"
                    value={current.title}
                    onChange={e => updateTitle(e.target.value)}
                    placeholder="Document title..."
                    maxLength={200}
                  />
                  <div className="owner-tag">
                    {current.owner === user
                      ? "Owner"
                      : `Shared by ${current.owner}`}
                  </div>
                </div>

                <div className="editor-toolbar">
                  <span className="toolbar-label">FORMAT</span>

                  {toolButton(
                    <Bold size={18} />, "Bold", "bold"
                  )}
                  {toolButton(
                    <Italic size={18} />, "Italic", "italic"
                  )}
                  {toolButton(
                    <Underline size={18} />, "Underline", "underline"
                  )}

                  <span className="tool-separator" />

                  {toolButton(
                    <Heading2 size={19} />,
                    "Heading 2", "formatBlock", "h2"
                  )}

                  <span className="tool-separator" />

                  {toolButton(
                    <List size={19} />,
                    "Bulleted list", "insertUnorderedList"
                  )}
                  {toolButton(
                    <ListOrdered size={19} />,
                    "Numbered list", "insertOrderedList"
                  )}
                </div>

                <div className="editor-paper">
                  <div
                    key={selected}
                    ref={editorRef}
                    className="document-content"
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Start writing your document here..."
                    role="textbox"
                    aria-label="Document content"
                    aria-multiline="true"
                  />
                </div>

                <div className="editor-statusbar">
                  <span>
                    <Clock3 size={15} />
                    Click Save Changes to persist edits
                  </span>
                  <span>
                    <CheckCircle2 size={15} />
                    Rich-text editing enabled
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <FilePlus2 size={37} />
              </div>
              <h1>Welcome to DocSpace</h1>
              <p>
                Your personal workspace to create, edit,
                organize and share documents.
              </p>

              <button className="welcome-create" onClick={createDocument}>
                <Plus size={19} />
                Create Your First Document
              </button>

              <div className="welcome-features">
                <span><FileText size={17} /> Rich-text editing</span>
                <span><Cloud size={17} /> Saved documents</span>
                <span><Share2 size={17} /> Easy sharing</span>
              </div>
            </div>
          )}
        </main>

        <footer className="app-footer">
          <span>© 2026 DocSpace · Document Workspace</span>
          <span>Built with React & FastAPI</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
