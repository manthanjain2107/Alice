
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_document_creation_and_persistence():
    response = client.post(
        "/documents?user=Alice",
        json={
            "title": "Automated Test Document",
            "content": "<p>Hello from Pytest!</p>"
        }
    )

    assert response.status_code == 201

    document = response.json()

    assert document["title"] == "Automated Test Document"
    assert document["owner"] == "Alice"

    response = client.get("/documents?user=Alice")

    assert response.status_code == 200

    assert any(
        doc["id"] == document["id"]
        and doc["content"] == "<p>Hello from Pytest!</p>"
        for doc in response.json()
    )
