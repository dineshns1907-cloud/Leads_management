import urllib.request
import json

def verify():
    # 1. Login
    login_payload = json.dumps({'email': 'salesperson@leadiq.com', 'password': 'Sales@123'}).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/login', data=login_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        token = json.loads(res.read())['access_token']

    auth_header = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

    # 2. Test Dashboard conversion_probability_summary
    req = urllib.request.Request('http://127.0.0.1:8000/api/dashboard', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        dash = json.loads(res.read())
        prob = dash.get('conversion_probability_summary')
        print(f"Dashboard Prob Summary: Hot={prob['hot']} ({prob['hot_percentage']}%), Warm={prob['warm']} ({prob['warm_percentage']}%), Nurture={prob['nurture']} ({prob['nurture_percentage']}%), Cold={prob['cold']} ({prob['cold_percentage']}%)")

    # 3. Test Search
    req = urllib.request.Request('http://127.0.0.1:8000/api/search?q=Apex', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        search = json.loads(res.read())
        print(f"Search: count={search['total_results']}, first match={search['results'][0]['title']}")

    # 4. Test Settings GET and PUT
    req = urllib.request.Request('http://127.0.0.1:8000/api/settings/scoring', headers=auth_header)
    with urllib.request.urlopen(req) as res:
        sett = json.loads(res.read())
        print(f"Settings weights (pricing_quotation_requested): {sett['weights']['pricing_quotation_requested']}")

    put_payload = json.dumps({
        'pricing_quotation_requested': 20,
        'product_demo_completed': 16,
        'email_response': 12,
        'commercial_proposal_opened': 10,
        'executive_meeting_booked': 8,
        'pricing_page_visited': 6,
        'inactivity_decay': -12,
        'followup_unopened_decay': -8
    }).encode('utf-8')
    put_req = urllib.request.Request('http://127.0.0.1:8000/api/settings/scoring', data=put_payload, headers=auth_header, method='PUT')
    with urllib.request.urlopen(put_req) as res:
        put_sett = json.loads(res.read())
        print(f"Updated settings: pricing_quotation_requested={put_sett['weights']['pricing_quotation_requested']}")

    # 5. Test Recommendations complete (PUT)
    req = urllib.request.Request('http://127.0.0.1:8000/api/recommendations/rec-lead-1/complete', headers=auth_header, method='PUT')
    with urllib.request.urlopen(req) as res:
        comp = json.loads(res.read())
        print(f"Rec complete result: status={comp['status']}, id={comp['id']}")

    print("\nALL BACKEND STEP 5 ENDPOINTS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    verify()
