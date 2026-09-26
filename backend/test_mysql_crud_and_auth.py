import urllib.request
import json
import pymysql

BASE_URL = "http://127.0.0.1:8000/api"

def request_json(url, method="GET", payload=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, json.loads(body) if body else {}

def run_tests():
    print("=" * 60)
    print("RUNNING LEADIQ MYSQL INTEGRATION & CRUD TEST SUITE")
    print("=" * 60)

    # 1. Health check with database connection
    print("\n1. Health Check (Verifying MySQL Connection)")
    status_code, health = request_json(f"{BASE_URL}/health")
    print(f"   Status: {status_code}, Response: {health}")
    assert status_code == 200, f"Expected 200, got {status_code}"
    assert health.get("database") == "connected", f"Expected database connected, got {health}"
    print("   [PASS] Health check verified live MySQL connection.")

    # 2. Authentication: Salesperson, Manager, Admin
    print("\n2. Authentication & JWT Verification")
    status_code, sales_auth = request_json(
        f"{BASE_URL}/auth/login",
        method="POST",
        payload={"email": "salesperson@leadiq.com", "password": "Sales@123"}
    )
    assert status_code == 200, f"Sales login failed: {sales_auth}"
    sales_token = sales_auth["access_token"]
    print(f"   [PASS] Salesperson login successful. Token acquired: {sales_token[:20]}...")

    status_code, sales_me = request_json(f"{BASE_URL}/auth/me", token=sales_token)
    assert status_code == 200 and sales_me["role"] == "SALESPERSON"
    print(f"   [PASS] /auth/me verified: {sales_me['name']} ({sales_me['role']})")

    status_code, mgr_auth = request_json(
        f"{BASE_URL}/auth/login",
        method="POST",
        payload={"email": "manager@leadiq.com", "password": "Manager@123"}
    )
    assert status_code == 200
    mgr_token = mgr_auth["access_token"]
    status_code, mgr_me = request_json(f"{BASE_URL}/auth/me", token=mgr_token)
    assert status_code == 200 and mgr_me["role"] == "MANAGER"
    print(f"   [PASS] Manager /auth/me verified: {mgr_me['name']} ({mgr_me['role']})")

    status_code, admin_auth = request_json(
        f"{BASE_URL}/auth/login",
        method="POST",
        payload={"email": "admin@leadiq.com", "password": "Admin@123"}
    )
    assert status_code == 200
    admin_token = admin_auth["access_token"]
    status_code, admin_me = request_json(f"{BASE_URL}/auth/me", token=admin_token)
    assert status_code == 200 and admin_me["role"] == "ADMIN"
    print(f"   [PASS] Admin /auth/me verified: {admin_me['name']} ({admin_me['role']})")

    # 3. CREATE Lead
    print("\n3. Lead CRUD in MySQL")
    lead_payload = {
        "company_name": "CyberShield Defense Corp",
        "contact_name": "Evelyn Reed",
        "contact_email": "evelyn@cybershield.io",
        "contact_phone": "+1 (415) 890-1122",
        "industry": "Cybersecurity",
        "company_size": "250-500",
        "location": "San Francisco, CA",
        "contact_role": "Chief Information Security Officer",
        "lead_source": "Website",
        "estimated_value": 78000.0,
        "stage": "NEW",
        "status": "ACTIVE"
    }
    status_code, created_lead = request_json(f"{BASE_URL}/leads", method="POST", payload=lead_payload, token=sales_token)
    assert status_code == 201, f"Create lead failed: {created_lead}"
    lead_id = created_lead["id"]
    print(f"   [PASS] Created lead: {lead_id} ({created_lead['company_name']})")

    # 4. READ Lead
    status_code, fetched_lead = request_json(f"{BASE_URL}/leads/{lead_id}", token=sales_token)
    assert status_code == 200 and fetched_lead["company_name"] == "CyberShield Defense Corp"
    print(f"   [PASS] Fetched lead details: Score={fetched_lead['ai_score']}, Stage={fetched_lead['stage']}")

    # 5. UPDATE Lead
    status_code, updated_lead = request_json(
        f"{BASE_URL}/leads/{lead_id}",
        method="PUT",
        payload={"estimated_value": 95000.0, "contact_role": "Global CISO"},
        token=sales_token
    )
    assert status_code == 200 and updated_lead["estimated_value"] == 95000.0
    print(f"   [PASS] Updated lead: value=${updated_lead['estimated_value']:,.0f}")

    # 6. UPDATE Pipeline Stage
    print("\n4. Pipeline Stage Advancement & History")
    status_code, stage_res = request_json(
        f"{BASE_URL}/leads/{lead_id}/stage",
        method="PATCH",
        payload={"stage": "DEMO", "note": "Completed initial scoping call with technical lead"},
        token=sales_token
    )
    assert status_code == 200 and stage_res["stage"] == "DEMO"
    print(f"   [PASS] Advanced stage to DEMO. Returned stage={stage_res['stage']}")

    # 7. CREATE Activity
    print("\n5. Activity CRUD & Score Impact")
    status_code, act_res = request_json(
        f"{BASE_URL}/leads/{lead_id}/activities",
        method="POST",
        payload={
            "activity_type": "DEMO",
            "description": "Product demo delivered to 5 team leads; highly engaged questions on API security",
            "activity_metadata": {"attendees": 5, "duration_minutes": 45}
        },
        token=sales_token
    )
    assert status_code == 201
    act_id = act_res["id"]
    print(f"   [PASS] Logged DEMO activity: {act_id}")

    # 8. READ Activities
    status_code, activities = request_json(f"{BASE_URL}/leads/{lead_id}/activities", token=sales_token)
    assert status_code == 200 and len(activities) >= 2  # creation + stage change + demo
    print(f"   [PASS] Fetched {len(activities)} activities for lead.")

    # 9. RECALCULATE Lead Score
    print("\n6. AI Lead Score Recalculation")
    status_code, recalc_res = request_json(f"{BASE_URL}/leads/{lead_id}/score/recalculate", method="POST", token=sales_token)
    assert status_code == 200
    print(f"   [PASS] Recalculated score: previous={recalc_res['previous_score']}, new={recalc_res['new_score']}, change=+{recalc_res['score_change']}")

    # 10. CREATE & READ Notes
    print("\n7. Notes CRUD & Permissions")
    status_code, note_res = request_json(
        f"{BASE_URL}/leads/{lead_id}/notes",
        method="POST",
        payload={"content": "Evelyn confirmed budget allocation for Q4. Follow up by Tuesday."},
        token=sales_token
    )
    assert status_code == 201
    note_id = note_res["id"]
    print(f"   [PASS] Created note: {note_id}")

    # UPDATE Note
    status_code, note_upd = request_json(
        f"{BASE_URL}/notes/{note_id}",
        method="PUT",
        payload={"content": "Evelyn confirmed budget allocation for Q4. Executive proposal requested."},
        token=sales_token
    )
    assert status_code == 200 and "Executive proposal" in note_upd["content"]
    print(f"   [PASS] Updated note: {note_id}")

    # 11. Role Authorization: Salesperson cannot delete lead, Manager can
    print("\n8. Role-Based Access Control")
    status_code, del_forbidden = request_json(f"{BASE_URL}/leads/{lead_id}", method="DELETE", token=sales_token)
    assert status_code == 403, f"Expected 403 for salesperson deleting lead, got {status_code}"
    print("   [PASS] Salesperson forbidden from deleting lead (403 received as expected).")

    # Manager deletes note
    status_code, _ = request_json(f"{BASE_URL}/notes/{note_id}", method="DELETE", token=mgr_token)
    assert status_code == 204
    print("   [PASS] Manager deleted note successfully (204).")

    # Manager deletes lead
    status_code, _ = request_json(f"{BASE_URL}/leads/{lead_id}", method="DELETE", token=mgr_token)
    assert status_code == 204
    print("   [PASS] Manager deleted lead successfully (204).")

    # Verify lead deleted
    status_code, _ = request_json(f"{BASE_URL}/leads/{lead_id}", token=sales_token)
    assert status_code == 404
    print("   [PASS] Verified lead is deleted (404).")

    # 12. Direct MySQL verification of data integrity & no orphans
    print("\n9. Direct MySQL Data Integrity & Foreign Key Verification")
    conn = pymysql.connect(host='localhost', port=3306, user='root', password='', database='leadiq_db')
    with conn.cursor() as cur:
        # Check orphaned activities
        cur.execute("SELECT COUNT(*) FROM activities a LEFT JOIN leads l ON a.lead_id = l.id WHERE l.id IS NULL;")
        orphan_act = cur.fetchone()[0]
        assert orphan_act == 0, f"Found {orphan_act} orphaned activities"

        # Check orphaned notes
        cur.execute("SELECT COUNT(*) FROM notes n LEFT JOIN leads l ON n.lead_id = l.id WHERE l.id IS NULL;")
        orphan_notes = cur.fetchone()[0]
        assert orphan_notes == 0, f"Found {orphan_notes} orphaned notes"

        # Check orphaned scores
        cur.execute("SELECT COUNT(*) FROM lead_scores s LEFT JOIN leads l ON s.lead_id = l.id WHERE l.id IS NULL;")
        orphan_scores = cur.fetchone()[0]
        assert orphan_scores == 0, f"Found {orphan_scores} orphaned scores"

        # Check orphaned pipeline history
        cur.execute("SELECT COUNT(*) FROM pipeline_history p LEFT JOIN leads l ON p.lead_id = l.id WHERE l.id IS NULL;")
        orphan_hist = cur.fetchone()[0]
        assert orphan_hist == 0, f"Found {orphan_hist} orphaned pipeline history records"

        print(f"   [PASS] Zero orphaned records in MySQL across activities, notes, scores, and pipeline_history.")
    conn.close()

    print("\n" + "=" * 60)
    print("ALL MYSQL INTEGRATION & CRUD TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
