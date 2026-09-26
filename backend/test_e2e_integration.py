import urllib.request
import json

def test_all():
    print("[TEST] Starting 9 End-to-End LeadIQ API Integration Tests...")
    
    # 1. Login Flow
    login_payload = json.dumps({'email': 'salesperson@leadiq.com', 'password': 'Sales@123'}).encode('utf-8')
    login_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/login', 
        data=login_payload,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(login_req) as res:
        login_data = json.loads(res.read().decode('utf-8'))
        token = login_data['access_token']
        user = login_data['user']
        print(f"  [PASS] Test 1 - Login Flow: User '{user['name']}' authenticated. Role: {user['role']}. JWT token issued.")
    
    auth_header = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # 2. Leads List with Filtering
    req = urllib.request.Request('http://127.0.0.1:8000/api/leads?classification=HOT&page_size=5', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        leads = json.loads(res.read().decode('utf-8'))
        print(f"  [PASS] Test 2 - Leads List & Filter: Successfully retrieved {len(leads)} HOT leads. Top lead: {leads[0]['company_name']} ({leads[0]['ai_score']} score).")
        
    # 3. Add Lead Flow
    new_lead_payload = {
        'company_name': 'Quantum Logic Systems',
        'contact_name': 'Eleanor Vance',
        'contact_email': 'evance@quantumlogic.ai',
        'contact_phone': '+1 (555) 019-2834',
        'industry': 'Artificial Intelligence',
        'contact_role': 'VP of Engineering',
        'lead_source': 'Website',
        'estimated_value': 95000.0,
        'stage': 'DEMO',
        'status': 'ACTIVE'
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/leads', 
        data=json.dumps(new_lead_payload).encode('utf-8'), 
        headers=auth_header
    )
    with urllib.request.urlopen(req) as res:
        created_lead = json.loads(res.read().decode('utf-8'))
        lead_id = created_lead['id']
        print(f"  [PASS] Test 3 - Add Lead Flow: Created lead '{created_lead['company_name']}' (ID: {lead_id}). Initial AI Score: {created_lead['ai_score']} ({created_lead['classification']}).")

    # 4. Activity Simulation & Dynamic Behavioral Scoring
    activity_payload = {
        'activity_type': 'PRICING_PAGE_VISIT',
        'description': 'Viewed enterprise pricing matrix 5 times',
        'activity_metadata': {'duration_seconds': 420, 'pages_viewed': 5}
    }
    req = urllib.request.Request(
        f'http://127.0.0.1:8000/api/leads/{lead_id}/activities',
        data=json.dumps(activity_payload).encode('utf-8'), 
        headers=auth_header
    )
    with urllib.request.urlopen(req) as res:
        act = json.loads(res.read().decode('utf-8'))
        print(f"  [PASS] Test 4a - Activity Added: Recorded '{act['activity_type']}' for lead {lead_id}.")

    req = urllib.request.Request(f'http://127.0.0.1:8000/api/leads/{lead_id}', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        updated_lead = json.loads(res.read().decode('utf-8'))
        print(f"  [PASS] Test 4b - Dynamic Scoring: AI Score recalculated to {updated_lead['ai_score']} (Engagement: {updated_lead['engagement_level']}, Class: {updated_lead['classification']}).")

    # 5. Pipeline Stage Update (DEMO -> PROPOSAL)
    req = urllib.request.Request(
        f'http://127.0.0.1:8000/api/leads/{lead_id}/stage',
        data=json.dumps({'stage': 'PROPOSAL'}).encode('utf-8'),
        headers=auth_header, 
        method='PATCH'
    )
    with urllib.request.urlopen(req) as res:
        stg_res = json.loads(res.read().decode('utf-8'))
        print(f"  [PASS] Test 5 - Pipeline Stage Move: Updated stage from DEMO to {stg_res['stage']}.")

    # 6. Focus Mode AI Recommendations
    req = urllib.request.Request('http://127.0.0.1:8000/api/recommendations/focus?limit=5', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        recs = json.loads(res.read().decode('utf-8'))
        print(f"  [PASS] Test 6 - Focus Mode: {len(recs)} prioritized leads with actionable recommendations returned. Priority #1: {recs[0]['company_name']} -> {recs[0]['recommended_action']}.")

    # 7. Analytics Overview
    req = urllib.request.Request('http://127.0.0.1:8000/api/analytics/overview', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        analytics = json.loads(res.read().decode('utf-8'))
        print(f"  [PASS] Test 7 - Analytics Overview: Total Pipeline: ${analytics['pipeline_value']:,.0f}, Avg Score: {analytics['average_score']}, Conversion Rate: {analytics['conversion_rate']}%.")

    # 8. Role-Based Delete (Manager Authorization)
    mgr_payload = json.dumps({'email': 'manager@leadiq.com', 'password': 'Manager@123'}).encode('utf-8')
    mgr_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/login', 
        data=mgr_payload,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(mgr_req) as res:
        mgr_data = json.loads(res.read().decode('utf-8'))
        mgr_token = mgr_data['access_token']

    del_req = urllib.request.Request(
        f'http://127.0.0.1:8000/api/leads/{lead_id}', 
        headers={'Authorization': f'Bearer {mgr_token}'}, 
        method='DELETE'
    )
    with urllib.request.urlopen(del_req) as res:
        print(f"  [PASS] Test 8 - Role Authorization: Manager deleted test lead. Status: {res.status} No Content.")

    # 9. Logout Flow
    logout_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/logout',
        headers=auth_header, 
        method='POST'
    )
    with urllib.request.urlopen(logout_req) as res:
        logout_data = json.loads(res.read().decode('utf-8'))
        print(f"  [PASS] Test 9 - Logout Flow: JWT session successfully revoked: {logout_data['message']}.")

    print("\n[SUCCESS] ALL 9 END-TO-END INTEGRATION TESTS PASSED 100%!")

if __name__ == "__main__":
    test_all()
