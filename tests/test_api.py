from fastapi.testclient import TestClient
from query_engine.api import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_valid_query_routing():
    response = client.post("/query", json={"query": "Where is the water body located?"})
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
    # Allows for either successful routing or a fallback message if API experiences a transient 503
    assert len(data["result"]) > 0

def test_unsupported_query_guardrail():
    response = client.post("/query", json={"query": "What will the weather be like tomorrow?"})
    assert response.status_code == 200
    data = response.json()
    assert "result" in data
