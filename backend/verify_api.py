import urllib.request
import json

def run_verification():
    print("[VERIFY] Starting LeadIQ live backend endpoint tests on http://127.0.0.1:8000 ...")

    # 1. Health check
    req = urllib.request.urlopen('http://127.0.0.1:8000/api/health')
    health = json.loads(req.read().decode('utf-8'))
    print(f"  [OK] Health Check: status={req.status}, response={health}")

    # 2. Login
    login_payload = json.dumps({'email': 'salesperson@leadiq.com', 'password': 'Sales@123'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=login_payload, headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    login_data = json.loads(res.read().decode('utf-8'))
    token = login_data['access_token']
    print(f"  [OK] Login Successful: user={login_data['user']['name']}, role={login_data['user']['role']}")

    # 3. Get Leads
    auth_header = {'Authorization': f'Bearer {token}'}
    req = urllib.request.Request('http://127.0.0.1:8000/api/leads?page_size=5', headers=auth_header)
    res = urllib.request.urlopen(req)
    leads = json.loads(res.read().decode('utf-8'))
    print(f"  [OK] Leads API: fetched {len(leads)} leads. Top lead: {leads[0]['company_name']} (Score: {leads[0]['ai_score']}, Classification: {leads[0]['classification']})")

    # 4. Pipeline
    req = urllib.request.Request('http://127.0.0.1:8000/api/pipeline', headers=auth_header)
    res = urllib.request.urlopen(req)
    pipe = json.loads(res.read().decode('utf-8'))
    print(f"  [OK] Pipeline API: active leads={pipe['lead_count']}, total value={pipe['formatted_pipeline_value']}, avg score={pipe['average_score']}")

    # 5. Focus mode
    req = urllib.request.Request('http://127.0.0.1:8000/api/recommendations/focus?limit=3', headers=auth_header)
    res = urllib.request.urlopen(req)
    focus = json.loads(res.read().decode('utf-8'))
    print(f"  [OK] Focus Mode API: returned {len(focus)} priority leads. Top: {focus[0]['company_name']} -> Action: {focus[0]['recommended_action']}")

    # 6. Dashboard
    req = urllib.request.Request('http://127.0.0.1:8000/api/dashboard', headers=auth_header)
    res = urllib.request.urlopen(req)
    dash = json.loads(res.read().decode('utf-8'))
    print(f"  [OK] Dashboard API: total={dash['total_leads']}, hot={dash['hot_leads_count']}, pipeline=${dash['pipeline_value']:,.0f}")

    # 7. Swagger docs
    req = urllib.request.urlopen('http://127.0.0.1:8000/docs')
    print(f"  [OK] Swagger Interactive Docs: status={req.status}")

    print("\n[SUCCESS] All backend live endpoints verified successfully!")

if __name__ == "__main__":
    run_verification()
