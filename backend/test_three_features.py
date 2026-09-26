import urllib.request
import json
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_features():
    print("=" * 65)
    print("TESTING 3 NEW FEATURES IN BACKEND")
    print("=" * 65)

    # -------------------------------------------------------------
    # 0. Setup: Authenticate Admin & Salesperson
    # -------------------------------------------------------------
    admin_login_data = json.dumps({'email': 'admin@leadiq.com', 'password': 'Admin@123'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=admin_login_data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        admin_token = json.loads(res.read())['access_token']
    admin_headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}

    sales_login_data = json.dumps({'email': 'salesperson@leadiq.com', 'password': 'Sales@123'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=sales_login_data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        sales_token = json.loads(res.read())['access_token']
    sales_headers = {'Authorization': f'Bearer {sales_token}', 'Content-Type': 'application/json'}

    # -------------------------------------------------------------
    # TEST 1 & TEST 2: Revenue-Aware Lead Prioritization
    # -------------------------------------------------------------
    print("\n[TEST 1 & 2] Revenue-Aware Lead Prioritization:")
    # College A: ₹30,00,000 (High Value)
    college_a_payload = json.dumps({
        'company_name': 'College A - High Investment',
        'contact_name': 'Dr. Sharma',
        'contact_email': 'sharma@college-a.edu',
        'industry': 'Education',
        'lead_source': 'Website',
        'estimated_value': 3000000.0,
        'expected_investment': 3000000.0,
        'stage': 'QUALIFIED'
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/leads', data=college_a_payload, headers=sales_headers, method='POST')
    with urllib.request.urlopen(req) as res:
        lead_a = json.loads(res.read())

    # Add demo activity to College A to give it high interest
    act_a = json.dumps({'activity_type': 'DEMO', 'description': 'Full campus software demo completed'}).encode('utf-8')
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/leads/{lead_a["id"]}/activities', data=act_a, headers=sales_headers, method='POST')
    urllib.request.urlopen(req)

    # Fetch updated College A details
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/leads/{lead_a["id"]}', headers=sales_headers)
    with urllib.request.urlopen(req) as res:
        lead_a_detail = json.loads(res.read())

    print(f"  College A: Deal={lead_a_detail['expected_investment_formatted']}, AI Score={lead_a_detail['ai_score']}, Business Priority={lead_a_detail['business_priority_score']}/100 ({lead_a_detail['business_priority_tier']})")
    print(f"             Factors: {lead_a_detail['business_priority_factors'][:2]}")

    # College B: ₹5,00,000 (Lower Value)
    college_b_payload = json.dumps({
        'company_name': 'College B - Modest Investment',
        'contact_name': 'Dr. Verma',
        'contact_email': 'verma@college-b.edu',
        'industry': 'Education',
        'lead_source': 'Website',
        'estimated_value': 500000.0,
        'expected_investment': 500000.0,
        'stage': 'QUALIFIED'
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/leads', data=college_b_payload, headers=sales_headers, method='POST')
    with urllib.request.urlopen(req) as res:
        lead_b = json.loads(res.read())

    # Add demo activity to College B
    act_b = json.dumps({'activity_type': 'DEMO', 'description': 'Product demo completed'}).encode('utf-8')
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/leads/{lead_b["id"]}/activities', data=act_b, headers=sales_headers, method='POST')
    urllib.request.urlopen(req)

    req = urllib.request.Request(f'http://127.0.0.1:8000/api/leads/{lead_b["id"]}', headers=sales_headers)
    with urllib.request.urlopen(req) as res:
        lead_b_detail = json.loads(res.read())

    print(f"  College B: Deal={lead_b_detail['expected_investment_formatted']}, AI Score={lead_b_detail['ai_score']}, Business Priority={lead_b_detail['business_priority_score']}/100 ({lead_b_detail['business_priority_tier']})")
    
    assert lead_a_detail['business_priority_score'] > lead_b_detail['business_priority_score'], "College A (₹30L) should have higher Business Priority than College B (₹5L)!"
    assert lead_a_detail['business_priority_tier'] in ['VERY HIGH', 'HIGH'], "College A should be VERY HIGH or HIGH!"
    print("  -> PASSED: Revenue-aware prioritization successfully ranks high investment over lower investment!")

    # -------------------------------------------------------------
    # TEST 3: Referral Workflow (PENDING -> REWARD_ELIGIBLE -> REWARD_GRANTED)
    # -------------------------------------------------------------
    print("\n[TEST 3] Referral & Reward System:")
    # 1. Ensure referrer exists (College A)
    # 2. Create referred lead: XYZ College
    xyz_payload = json.dumps({
        'company_name': 'XYZ Engineering College',
        'contact_name': 'Prof. Rajesh K',
        'contact_email': 'rajesh@xyzcollege.edu',
        'industry': 'Education',
        'lead_source': 'Referral',
        'estimated_value': 2000000.0,
        'expected_investment': 2000000.0,
        'referred_by_id': lead_a['id'],
        'stage': 'NEW'
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/leads', data=xyz_payload, headers=sales_headers, method='POST')
    with urllib.request.urlopen(req) as res:
        xyz_lead = json.loads(res.read())
    print(f"  Created Referred Lead: {xyz_lead['company_name']} (Referred by: {lead_a['company_name']})")

    # Verify referral was created in referrals table with PENDING
    req = urllib.request.Request('http://127.0.0.1:8000/api/referrals', headers=sales_headers)
    with urllib.request.urlopen(req) as res:
        refs = json.loads(res.read())
        xyz_ref = next((r for r in refs if r['referred_lead_id'] == xyz_lead['id']), None)
        assert xyz_ref is not None, "Referral record should exist in database!"
        assert xyz_ref['status'] == 'PENDING', f"Initial status should be PENDING, got {xyz_ref['status']}"
        print(f"  Referral Created: ID={xyz_ref['id']}, Status={xyz_ref['status']}, Potential Reward={xyz_ref['reward_value']}%")

    # Move XYZ College to WON
    won_payload = json.dumps({'stage': 'WON', 'note': 'Contract signed and closed successfully'}).encode('utf-8')
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/leads/{xyz_lead["id"]}/stage', data=won_payload, headers=sales_headers, method='PATCH')
    urllib.request.urlopen(req)

    # Verify referral is now REWARD_ELIGIBLE
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/referrals/{xyz_ref["id"]}', headers=sales_headers)
    with urllib.request.urlopen(req) as res:
        updated_ref = json.loads(res.read())
        assert updated_ref['status'] == 'REWARD_ELIGIBLE', f"Status should be REWARD_ELIGIBLE after WON, got {updated_ref['status']}"
        print(f"  After Lead Marked WON -> Referral Status={updated_ref['status']}, Reward Status={updated_ref['reward_status']}")

    # Grant reward
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/referrals/{xyz_ref["id"]}/grant?note=Granted+10pct+credit+note', headers=admin_headers, method='POST')
    with urllib.request.urlopen(req) as res:
        granted_ref = json.loads(res.read())
        assert granted_ref['status'] == 'REWARD_GRANTED', f"Status should be REWARD_GRANTED, got {granted_ref['status']}"
        print(f"  After Granting Reward -> Referral Status={granted_ref['status']}, Reward Status={granted_ref['reward_status']}")
    print("  -> PASSED: Complete referral reward lifecycle verified!")

    # -------------------------------------------------------------
    # TEST 4 & 5: Admin Login & Salesperson Account Management
    # -------------------------------------------------------------
    print("\n[TEST 4 & 5] Admin Login & Salesperson Management:")
    # 1. Admin accesses admin dashboard
    req = urllib.request.Request('http://127.0.0.1:8000/api/admin/dashboard', headers=admin_headers)
    with urllib.request.urlopen(req) as res:
        admin_dash = json.loads(res.read())
        print(f"  Admin Dashboard: Total Salespeople={admin_dash['total_salespeople']}, Active Leads={admin_dash['total_leads']}, Pipeline={admin_dash['total_pipeline_value_formatted']}")

    # 2. Admin creates new salesperson
    test_sp_email = f"alex.test.{int(time.time())}@leadiq.io"
    new_sp_payload = json.dumps({
        'name': 'Alex Salesperson',
        'email': test_sp_email,
        'password': 'SalesPassword@123',
        'phone': '+91 98765 43210',
        'department': 'Higher Education Sales',
        'role': 'SALESPERSON',
        'is_active': True
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/admin/users', data=new_sp_payload, headers=admin_headers, method='POST')
    with urllib.request.urlopen(req) as res:
        new_sp = json.loads(res.read())
        print(f"  Created Salesperson: {new_sp['name']} ({new_sp['email']})")

    # 3. Verify newly created salesperson can login
    sp_login_payload = json.dumps({'email': test_sp_email, 'password': 'SalesPassword@123'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=sp_login_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        new_sp_token = json.loads(res.read())['access_token']
        print(f"  New Salesperson Logged In Successfully! Token received.")

    # 4. Verify salesperson CANNOT access admin dashboard (expect 403 Forbidden)
    sp_headers = {'Authorization': f'Bearer {new_sp_token}', 'Content-Type': 'application/json'}
    req = urllib.request.Request('http://127.0.0.1:8000/api/admin/dashboard', headers=sp_headers)
    try:
        with urllib.request.urlopen(req) as res:
            print("  ERROR: Salesperson was able to access admin endpoint!")
            sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Expected 403 Forbidden, got {e.code}"
        print(f"  Salesperson Access To Admin Endpoint Blocked: HTTP {e.code} Forbidden (Access Denied as expected).")

    print("  -> PASSED: Admin management and role protection verified!")

    print("\n" + "=" * 65)
    print("ALL 5 BACKEND TEST SCENARIOS PASSED WITH FLYING COLORS!")
    print("=" * 65)

if __name__ == '__main__':
    test_features()
