import pytest

def test_salesperson_cannot_delete_lead(client, sales_token, sample_lead):
    response = client.delete(f"/api/leads/{sample_lead.id}", headers=sales_token)
    assert response.status_code == 403
    assert "forbidden" in response.json()["detail"].lower()

def test_manager_can_delete_lead(client, manager_token, sales_token):
    # Create lead to delete
    create_resp = client.post(
        "/api/leads",
        json={
            "company_name": "Temporary Test Lead",
            "contact_name": "John Doe",
            "contact_email": "johndoe@templead.com",
            "industry": "Enterprise Software",
            "lead_source": "Website",
            "estimated_value": 30000.0,
            "stage": "NEW"
        },
        headers=sales_token
    )
    assert create_resp.status_code == 201
    lead_id = create_resp.json()["id"]

    # Manager deletes
    del_resp = client.delete(f"/api/leads/{lead_id}", headers=manager_token)
    assert del_resp.status_code == 204

    # Verify deleted
    get_resp = client.get(f"/api/leads/{lead_id}", headers=manager_token)
    assert get_resp.status_code == 404

def test_notes_authorization(client, sales_token, manager_token, sample_lead):
    # 1. Create a note as salesperson
    note_resp = client.post(
        f"/api/leads/{sample_lead.id}/notes",
        json={"content": "Important discovery meeting notes"},
        headers=sales_token
    )
    assert note_resp.status_code == 201
    note_id = note_resp.json()["id"]

    # 2. Update note as the author (salesperson)
    update_resp = client.put(
        f"/api/notes/{note_id}",
        json={"content": "Updated discovery meeting notes"},
        headers=sales_token
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["content"] == "Updated discovery meeting notes"

    # 3. Manager can delete the note
    del_resp = client.delete(f"/api/notes/{note_id}", headers=manager_token)
    assert del_resp.status_code == 204
