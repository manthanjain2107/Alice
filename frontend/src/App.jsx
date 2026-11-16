
import { useEffect, useRef, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [user, setUser] = useState("Alice");
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const selectedDoc = documents.find((d) => d.id === selected);

  async function request(path, options = {}) {
    const response = await fetch(API + path, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Something went wrong");
    }
    return data;
  }

  async function loadDocuments() {
    try {
      const docs = await request(`/documents?user=${user}`);
      setDocuments(docs);
    } catch (err) {
      setMessage(err.message);
    }
  }

  useEffect(() => {
    let active = true;
    request(`/documents?user=${user}`)
      .then((docs) => {
        if (active) setDocuments(docs);
      })
      .catch((err) => {
        if (active) setMessage(err.message);
      });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = selectedDoc?.content || "";
    }
  }, [selected, user]);

  async function createDocument() {
    try {
      const doc = await request(`/documents?user=${user}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Document", content: "" })
      });
      await loadDocuments();
      setSelected(doc.id);
      setMessage("Document created");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function saveDocument() {
    if (!selectedDoc) return;
    try {
      await request(`/documents/${selected}?user=${user}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedDoc.title,
          content: editorRef.current?.innerHTML || ""
        })
      });
      await loadDocuments();
      setMessage("Document saved successfully");
    } catch (err) {
      setMessage(err.message);
    }
  }

  
async function shareDocument() {
  if (!selectedDoc) return;

  const target = user === "Alice" ? "Bob" : "Alice";

  try {
    await saveDocument();

    const response = await fetch(
      `${API}/documents/${selectedDoc.id}/share?user=${encodeURIComponent(user)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: target
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Sharing failed");
    }

    await loadDocuments();
    setMessage(`Successfully shared with ${target}`);
  } catch (error) {
    setMessage(error.message);
  }
}


  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const doc = await request(`/upload?user=${user}`, {
        method: "POST",
        body: formData
      });
      await loadDocuments();
      setSelected(doc.id);
      setMessage("File imported successfully");
    } catch (err) {
      setMessage(err.message);
    }
    event.target.value = "";
  }

  function updateTitle(value) {
    setDocuments((docs) =>
      docs.map((d) => d.id === selected ? { ...d, title: value } : d)
    );
  }

  function format(command, value) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>📄 DocSpace</h2>
        <button onClick={createDocument}>+ New Document</button>

        <button style={{ marginTop: 10 }} onClick={() => fileRef.current?.click()}>
          ↑ Upload File
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md"
          hidden
          onChange={uploadFile}
        />
        <small>Supports .txt and .md files (max 1 MB)</small>

        <h3>Current User</h3>
        <select value={user} onChange={(e) => {
          setUser(e.target.value);
          setSelected(null);
          setDocuments([]);
          setMessage("");
        }}>
          <option value="Alice">Alice</option>
          <option value="Bob">Bob</option>
        </select>

        <h3>My Documents</h3>
        {documents.filter((d) => d.owner === user).map((d) => (
          <p key={d.id} onClick={() => setSelected(d.id)}>
            📄 {d.title}
          </p>
        ))}

        <h3>Shared With Me</h3>
        {documents.filter((d) => d.owner !== user).map((d) => (
          <p key={d.id} onClick={() => setSelected(d.id)}>
            📄 {d.title} <small>({d.owner})</small>
          </p>
        ))}
      </aside>

      <main className="editor">
        {message && <p style={{ color: "#2563eb" }}>{message}</p>}
        {selectedDoc ? (
          <>
            <input
              value={selectedDoc.title}
              onChange={(e) => updateTitle(e.target.value)}
            />

            <div className="toolbar">
              <button onClick={() => format("bold")}><b>B</b></button>
              <button onClick={() => format("italic")}><i>I</i></button>
              <button onClick={() => format("underline")}><u>U</u></button>
              <button onClick={() => format("formatBlock", "h2")}>H2</button>
              <button onClick={() => format("insertUnorderedList")}>• List</button>
              <button onClick={() => format("insertOrderedList")}>1. List</button>
              <button onClick={saveDocument}>💾 Save</button>
            </div>

            <div
              ref={editorRef}
              key={selected}
              className="content"
              contentEditable
              suppressContentEditableWarning
            />

            <button
              onClick={shareDocument}
              disabled={selectedDoc.owner !== user}
            >
              Share with {user === "Alice" ? "Bob" : "Alice"}
            </button>
          </>
        ) : (
          <h2>Select or create a document</h2>
        )}
      </main>
    </div>
  );
}

export default App;
