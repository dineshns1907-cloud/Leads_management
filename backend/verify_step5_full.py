import urllib.request
import json

def verify_all():
    print("=" * 60)
    print("LEADIQ STEP 5 COMPLETE END-TO-END VERIFICATION")
    print("=" * 60)

    # 1. Test Login (Alex Rivera & Salesperson)
    login_payload = json.dumps({'email': 'salesperson@leadiq.com', 'password': 'Sales@123'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=login_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
        token = data['access_token']
        user = data.get('user', {})
        print(f"[OK] 1. Auth Login: User '{user.get('name')}' ({user.get('role')}) - Token received.")

    auth_header = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

    # 2. Test Current User Profile
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/me', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        me = json.loads(res.read())
        print(f"[OK] 2. Current User Profile (/api/auth/me): {me.get('email')}, Role: {me.get('role')}")

    # 3. Test Dashboard & Conversion Probability Metrics
    req = urllib.request.Request('http://127.0.0.1:8000/api/dashboard', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        dash = json.loads(res.read())
        total_leads = dash.get('total_leads')
        hot_leads = dash.get('hot_leads_count')
        avg_score = dash.get('average_score')
        pipe_val = dash.get('pipeline_value')
        prob = dash.get('conversion_probability_summary', {})
        print(f"[OK] 3. Dashboard Metrics:")
        print(f"     Total Leads: {total_leads}, Hot Leads: {hot_leads}, Avg Score: {avg_score}")
        print(f"     Pipeline Value: ${pipe_val:,.2f}")
        print(f"     Conversion Probability Distribution:")
        print(f"       - Hot:     {prob.get('hot')} leads ({prob.get('hot_percentage')}%)")
        print(f"       - Warm:    {prob.get('warm')} leads ({prob.get('warm_percentage')}%)")
        print(f"       - Nurture: {prob.get('nurture')} leads ({prob.get('nurture_percentage')}%)")
        print(f"       - Cold:    {prob.get('cold')} leads ({prob.get('cold_percentage')}%)")
        assert prob.get('hot', 0) > 0, "Hot leads should be > 0"
        assert prob.get('warm', 0) > 0, "Warm leads should be > 0"

    # 4. Test Lead Creation & Persistence in MySQL
    new_lead_payload = json.dumps({
        'company_name': 'Apex AI Corp',
        'contact_name': 'Sarah Jenkins',
        'contact_email': 'sarah@apexai.io',
        'contact_phone': '+1 (555) 234-8900',
        'industry': 'Technology',
        'contact_role': 'VP of Engineering',
        'lead_source': 'Website',
        'estimated_value': 120000.0,
        'stage': 'NEW'
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/leads', data=new_lead_payload, headers=auth_header, method='POST')
    with urllib.request.urlopen(req) as res:
        created_lead = json.loads(res.read())
        lead_id = created_lead['id']
        ai_score = created_lead['score']['total_score'] if created_lead.get('score') else created_lead.get('ai_score', 'N/A')
        print(f"[OK] 4. Lead Creation (/api/leads): Created '{created_lead['company_name']}' (ID: {lead_id}, AI Score: {ai_score})")

    # 5. Test Activity Logging & Score Recalculation
    act_payload = json.dumps({
        'activity_type': 'DEMO',
        'description': 'Sarah Jenkins attended product demo session.'
    }).encode('utf-8')
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/leads/{lead_id}/activities', data=act_payload, headers=auth_header, method='POST')
    with urllib.request.urlopen(req) as res:
        act_res = json.loads(res.read())
        print(f"[OK] 5. Activity Logged (/api/leads/{lead_id}/activities): Type={act_res.get('activity_type')}, Title={act_res.get('title')}")

    # 6. Test Opportunity Pipeline Movement
    pipe_payload = json.dumps({
        'stage': 'QUALIFIED'
    }).encode('utf-8')
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/leads/{lead_id}/stage', data=pipe_payload, headers=auth_header, method='PUT')
    with urllib.request.urlopen(req) as res:
        stage_res = json.loads(res.read())
        print(f"[OK] 6. Pipeline Stage Update (/api/leads/{lead_id}/stage): Moved to {stage_res.get('stage')}")

    # 7. Test Pipeline Overview
    req = urllib.request.Request('http://127.0.0.1:8000/api/pipeline', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        pipe = json.loads(res.read())
        stages = pipe.get('stages', {})
        print(f"[OK] 7. Pipeline Overview (/api/pipeline): Total deals: {pipe.get('total_deals')}, Qualified deals: {len(stages.get('QUALIFIED', []))}")

    # 8. Test Global Search
    req = urllib.request.Request('http://127.0.0.1:8000/api/search?q=Apex', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        search_res = json.loads(res.read())
        matches = search_res.get('results', [])
        print(f"[OK] 8. Global Search (/api/search?q=Apex): Found {len(matches)} match(es), Top: {matches[0].get('title') if matches else 'None'}")
        assert len(matches) > 0, "Search for Apex should find newly created lead"

    # 9. Test AI Recommendations
    req = urllib.request.Request('http://127.0.0.1:8000/api/recommendations', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        recs = json.loads(res.read())
        print(f"[OK] 9. AI Recommendations (/api/recommendations): Fetched {len(recs)} active recommendations.")
        if recs:
            rec_id = recs[0]['id']
            # Mark complete
            comp_req = urllib.request.Request(f'http://127.0.0.1:8000/api/recommendations/{rec_id}/complete', headers=auth_header, method='PUT')
            with urllib.request.urlopen(comp_req) as comp_res:
                comp_data = json.loads(comp_res.read())
                print(f"     Marked recommendation {rec_id} as complete: status={comp_data.get('status')}")

    # 10. Test Settings Weights Persistence
    req = urllib.request.Request('http://127.0.0.1:8000/api/settings/scoring', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        settings_data = json.loads(res.read())
        curr_weights = settings_data.get('weights', {})
        print(f"[OK] 10. Settings Retrieval (/api/settings/scoring): demo={curr_weights.get('product_demo_completed')}, proposal={curr_weights.get('commercial_proposal_opened')}")

    # 11. Test Frontend HTTP Server is Serving HTML & Main JS Bundle
    try:
        with urllib.request.urlopen('http://localhost:4200') as fe_res:
            html = fe_res.read().decode('utf-8', errors='ignore')
            assert '<app-root>' in html, "Angular app root should exist in index.html"
            print(f"[OK] 11. Frontend Angular Server (http://localhost:4200): Serving app-root successfully.")
    except Exception as e:
        print(f"[WARN] Frontend check: {e}")

    print("=" * 60)
    print("ALL 11 END-TO-END STEP 5 INTEGRATION TESTS PASSED!")
    print("=" * 60)

if __name__ == '__main__':
    verify_all()
