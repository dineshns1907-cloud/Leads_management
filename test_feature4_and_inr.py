import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000"

import sys
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app.database.connection import SessionLocal
from sqlalchemy import text

def reset_test_state():
    db = SessionLocal()
    try:
        test_leads = db.execute(text("SELECT id FROM leads WHERE public_lead_id LIKE 'LEAD-000%'")).fetchall()
        test_lead_ids = [r[0] for r in test_leads]
        if test_lead_ids:
            ids_str = ",".join(f"'{lid}'" for lid in test_lead_ids)
            db.execute(text(f"DELETE FROM activities WHERE lead_id IN ({ids_str})"))
            db.execute(text(f"DELETE FROM lead_scores WHERE lead_id IN ({ids_str})"))
            db.execute(text(f"DELETE FROM recommendations WHERE lead_id IN ({ids_str})"))
            db.execute(text(f"DELETE FROM referrals WHERE referrer_customer_id IN ({ids_str}) OR referred_lead_id IN ({ids_str})"))
            db.execute(text(f"DELETE FROM leads WHERE id IN ({ids_str})"))
        db.execute(text("TRUNCATE TABLE lead_sequences"))
        db.execute(text("ALTER TABLE lead_sequences AUTO_INCREMENT = 1"))
        db.commit()
        print("Cleaned up previous test leads and reset sequence counter to 1.")
    except Exception as e:
        print(f"Cleanup error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

AUTH_TOKEN = None

def login():
    global AUTH_TOKEN
    login_data = {"email": "salesperson@leadiq.com", "password": "Sales@123"}
    status, res = http_post(f"{BASE_URL}/api/auth/login", login_data)
    assert status == 200, f"Login failed: {res}"
    AUTH_TOKEN = res["access_token"]
    print("Logged in as salesperson@leadiq.com successfully!")

def http_post(url, data):
    headers = {"Content-Type": "application/json"}
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers=headers
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"POST {url} failed with {e.code}: {e.read().decode('utf-8')}")
        raise

def http_get(url):
    headers = {}
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"GET {url} failed with {e.code}: {e.read().decode('utf-8')}")
        raise

def run_tests():
    login()
    reset_test_state()
    print("--- 1. Testing Lead Creation Sequence ---")
    
    # Test Lead 1
    payload1 = {
        "company_name": "Tata Consultancy Horizons",
        "contact_name": "Aarav Sharma",
        "contact_email": "aarav.sharma@tcs-enterprises.in",
        "contact_phone": "+91 98765 43210",
        "industry": "Enterprise Software",
        "company_size": "1000+",
        "estimated_value": 7500000, # ₹75L
        "status": "ACTIVE",
        "stage": "QUALIFIED",
        "lead_source": "Inbound Website"
    }
    
    status1, lead1 = http_post(f"{BASE_URL}/api/leads", payload1)
    assert status1 == 201, f"Expected 201, got {status1}: {lead1}"
    print(f"Lead 1 created: id={lead1.get('id')}, public_lead_id={lead1.get('public_lead_id')}")
    assert lead1.get("public_lead_id") == "LEAD-000001", f"Expected LEAD-000001, got {lead1.get('public_lead_id')}"

    # Test Lead 2
    payload2 = {
        "company_name": "Reliance Retail Cloud",
        "contact_name": "Priya Patel",
        "contact_email": "priya.patel@reliance-retail.in",
        "contact_phone": "+91 98765 11223",
        "industry": "Retail & E-Commerce",
        "company_size": "500-1000",
        "estimated_value": 12500000, # ₹1.25 Cr
        "status": "ACTIVE",
        "stage": "DEMO",
        "lead_source": "Outbound SDR"
    }
    
    status2, lead2 = http_post(f"{BASE_URL}/api/leads", payload2)
    assert status2 == 201, f"Expected 201, got {status2}: {lead2}"
    print(f"Lead 2 created: id={lead2.get('id')}, public_lead_id={lead2.get('public_lead_id')}")
    assert lead2.get("public_lead_id") == "LEAD-000002", f"Expected LEAD-000002, got {lead2.get('public_lead_id')}"

    # Test Lead 3
    payload3 = {
        "company_name": "HDFC Digital Solutions",
        "contact_name": "Rohan Verma",
        "contact_email": "rohan.v@hdfc-fintech.in",
        "contact_phone": "+91 98123 45678",
        "industry": "Financial Services",
        "company_size": "250-500",
        "estimated_value": 4500000, # ₹45L
        "status": "ACTIVE",
        "stage": "PROPOSAL",
        "lead_source": "Referral"
    }
    
    status3, lead3 = http_post(f"{BASE_URL}/api/leads", payload3)
    assert status3 == 201, f"Expected 201, got {status3}: {lead3}"
    print(f"Lead 3 created: id={lead3.get('id')}, public_lead_id={lead3.get('public_lead_id')}")
    assert lead3.get("public_lead_id") == "LEAD-000003", f"Expected LEAD-000003, got {lead3.get('public_lead_id')}"

    print("\n--- 2. Testing Lead Retrieval by ID and Public Lead ID ---")
    status_get1, lead_get1 = http_get(f"{BASE_URL}/api/leads/{lead1['id']}")
    assert status_get1 == 200
    assert lead_get1.get("public_lead_id") == "LEAD-000001"

    status_get2_pub, lead_get2_pub = http_get(f"{BASE_URL}/api/leads/LEAD-000002")
    assert status_get2_pub == 200, f"Expected 200 for lookup by public_lead_id, got {status_get2_pub}"
    assert lead_get2_pub.get("contact_name") == "Priya Patel"
    print("Lookup by public_lead_id ('LEAD-000002') succeeded!")

    print("\n--- 3. Testing Global Search by Lead ID ---")
    status_search, search_data = http_get(f"{BASE_URL}/api/search?q=LEAD-000002")
    assert status_search == 200
    results = search_data.get("results", [])
    found = any(item.get("public_lead_id") == "LEAD-000002" or "LEAD-000002" in item.get("subtitle", "") for item in results)
    print(f"Global search results for 'LEAD-000002': {len(results)} found, matched: {found}")
    assert found, "Global search did not find LEAD-000002"

    print("\n--- 4. Testing Leads Filter by Lead ID ---")
    status_filter, filter_data = http_get(f"{BASE_URL}/api/leads?search=LEAD-000003")
    assert status_filter == 200
    leads_filter_data = filter_data if isinstance(filter_data, list) else filter_data.get("leads", [])
    assert len(leads_filter_data) >= 1
    assert leads_filter_data[0].get("public_lead_id") == "LEAD-000003"
    print(f"Leads filter returned lead: {leads_filter_data[0].get('company_name')}")

    print("\n--- 5. Testing Activities & Lead Public ID association ---")
    status_act, act_data = http_get(f"{BASE_URL}/api/activities")
    assert status_act == 200
    activities = act_data if isinstance(act_data, list) else act_data.get("activities", [])
    lead_public_ids = [a.get("lead_public_id") for a in activities if a.get("lead_public_id")]
    print(f"Activities found with lead_public_id: {len(lead_public_ids)}")
    assert len(lead_public_ids) > 0, "No activities found with lead_public_id"

    print("\n--- 6. Testing Pipeline INR formatted value ---")
    status_pipe, pipe_data = http_get(f"{BASE_URL}/api/pipeline")
    assert status_pipe == 200
    formatted_pipe = pipe_data.get("formatted_pipeline_value")
    print(f"Pipeline formatted value: {formatted_pipe}")
    assert "₹" in formatted_pipe, f"Expected INR symbol ₹ in formatted_pipeline_value, got {formatted_pipe}"
    assert "$" not in formatted_pipe, f"Dollar sign still present in pipeline value: {formatted_pipe}"

    print("\n--- 7. Testing Analytics INR formatted values ---")
    status_analytics, analytics_data = http_get(f"{BASE_URL}/api/analytics/overview")
    assert status_analytics == 200
    stage_metrics = analytics_data.get("stage_metrics", [])
    for sm in stage_metrics:
        fmt_val = sm.get("formatted_value")
        print(f"Stage {sm.get('stage')}: {fmt_val}")
        assert "₹" in fmt_val, f"Stage metric {sm.get('stage')} missing ₹: {fmt_val}"
        assert "$" not in fmt_val, f"Dollar sign still present in stage metric: {fmt_val}"

    print("\n--- 8. Testing Referral Creation with Public Lead IDs ---")
    ref_payload = {
        "referrer_customer_id": lead1["id"],
        "referred_lead_id": lead2["id"],
        "reward_type": "PERCENTAGE_DISCOUNT",
        "reward_value": 15.0,
        "notes": "Referred at Cloud Summit Mumbai"
    }
    status_ref, ref_data = http_post(f"{BASE_URL}/api/referrals", ref_payload)
    assert status_ref == 201
    print(f"Referral created: id={ref_data.get('id')}, referrer_pub_id={ref_data.get('referrer_public_lead_id')}, referred_pub_id={ref_data.get('referred_public_lead_id')}")
    assert ref_data.get("referrer_public_lead_id") == "LEAD-000001"
    assert ref_data.get("referred_public_lead_id") == "LEAD-000002"

    print("\n============================================")
    print("ALL BACKEND & API TESTS PASSED SUCCESSFULLY!")
    print("============================================")

if __name__ == "__main__":
    run_tests()
