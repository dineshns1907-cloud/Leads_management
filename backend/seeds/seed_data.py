"""
Database Seeding Script for LeadIQ Backend.
Generates test accounts and at least 30 realistic leads with rich interactions,
proposals, quotations, activities, notes, and scores.
"""

import sys
import os
from datetime import datetime, timedelta, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.connection import SessionLocal, init_db
from app.models.user import User, UserRole
from app.models.lead import Lead
from app.models.pipeline import PipelineStage, LeadStatus
from app.models.activity import Activity, ActivityType
from app.models.note import Note
from app.models.quotation import Quotation
from app.models.proposal import Proposal
from app.models.pipeline_history import PipelineHistory
from app.models.recommendation import Recommendation
from app.core.security import get_password_hash
from app.services.scoring_service import scoring_service
from app.services.recommendation_service import recommendation_service

def seed_database():
    init_db()
    db = SessionLocal()

    try:
        print("[SEED] Seeding LeadIQ database...")

        # 1. Create or retrieve users
        users_data = [
            {
                "id": "user-sales-1",
                "name": "Alex Rivera",
                "email": "salesperson@leadiq.com",
                "password": "Sales@123",
                "role": UserRole.SALESPERSON.value,
                "phone": "+1 (555) 392-1084"
            },
            {
                "id": "user-sales-2",
                "name": "Marcus Vance",
                "email": "sales2@leadiq.com",
                "password": "Sales2@123",
                "role": UserRole.SALESPERSON.value,
                "phone": "+1 (555) 441-2090"
            },
            {
                "id": "user-sales-3",
                "name": "Chloe Bennett",
                "email": "sales3@leadiq.com",
                "password": "Sales3@123",
                "role": UserRole.SALESPERSON.value,
                "phone": "+1 (555) 773-9081"
            },
            {
                "id": "user-mgr-1",
                "name": "Elena Rostova",
                "email": "manager@leadiq.com",
                "password": "Manager@123",
                "role": UserRole.MANAGER.value,
                "phone": "+1 (555) 849-3021"
            },
            {
                "id": "user-admin-1",
                "name": "System Administrator",
                "email": "admin@leadiq.com",
                "password": "Admin@123",
                "role": UserRole.ADMIN.value,
                "phone": "+1 (555) 000-1122"
            }
        ]

        created_users = {}
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    id=u["id"],
                    name=u["name"],
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    phone=u["phone"],
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                created_users[u["email"]] = user
                print(f"  [OK] User created: {u['email']} ({u['role']})")
            else:
                created_users[u["email"]] = existing
                print(f"  [INFO] User exists: {u['email']}")

        sales_rep = created_users["salesperson@leadiq.com"]
        sales2 = created_users["sales2@leadiq.com"]
        sales3 = created_users["sales3@leadiq.com"]
        manager = created_users["manager@leadiq.com"]

        # 2. Seed Leads (32 leads: 26 active, 3 won, 3 lost)
        leads_data = [
            # High intent active leads
            {
                "id": "lead-1",
                "company": "Apex Cloud Systems",
                "contact": "Jennifer Ross",
                "email": "jross@apexcloud.io",
                "phone": "+1 (415) 892-3041",
                "industry": "Cloud Infrastructure",
                "size": "500-1,000",
                "location": "San Francisco, CA",
                "role": "VP Sales Strategy",
                "source": "Website",
                "value": 145000.0,
                "stage": PipelineStage.NEGOTIATION.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 4,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-2",
                "company": "ABC Technologies",
                "contact": "David Sterling",
                "email": "david.sterling@abctech.io",
                "phone": "+1 (650) 412-8899",
                "industry": "SaaS Platform",
                "size": "1,000-5,000",
                "location": "San Jose, CA",
                "role": "VP of Revenue Operations",
                "source": "Website",
                "value": 85000.0,
                "stage": PipelineStage.PROPOSAL.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 3,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-3",
                "company": "Veritas Financial",
                "contact": "Jonathan Wu",
                "email": "j.wu@veritasfin.com",
                "phone": "+1 (212) 774-1290",
                "industry": "Fintech & Banking",
                "size": "5,000+",
                "location": "New York, NY",
                "role": "Managing Director",
                "source": "Referral",
                "value": 210000.0,
                "stage": PipelineStage.NEGOTIATION.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": manager.id,
                "days_in_stage": 4,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-4",
                "company": "TechCorp Solutions",
                "contact": "Marcus Vance",
                "email": "m.vance@techcorp.com",
                "phone": "+1 (312) 554-9021",
                "industry": "Enterprise Software",
                "size": "1,000-5,000",
                "location": "Chicago, IL",
                "role": "Chief Technology Officer",
                "source": "Referral",
                "value": 120000.0,
                "stage": PipelineStage.DEMO.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 5,
                "demo": True,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-5",
                "company": "Global Health Partners",
                "contact": "Dr. Sarah Lin",
                "email": "slin@ghpartners.org",
                "phone": "+1 (617) 832-4411",
                "industry": "HealthTech",
                "size": "2,500-5,000",
                "location": "Boston, MA",
                "role": "Chief Medical Officer",
                "source": "Event / Webinar",
                "value": 98000.0,
                "stage": PipelineStage.PROPOSAL.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": manager.id,
                "days_in_stage": 4,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-6",
                "company": "Horizon Security Networks",
                "contact": "Rachel Thorne",
                "email": "rthorne@horizonsec.net",
                "phone": "+1 (202) 663-8821",
                "industry": "CyberSecurity",
                "size": "250-500",
                "location": "Washington, DC",
                "role": "Director of Cyber Defense",
                "source": "LinkedIn",
                "value": 75000.0,
                "stage": PipelineStage.DEMO.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 3,
                "demo": True,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-7",
                "company": "Pulse eCommerce",
                "contact": "Brandon Cole",
                "email": "bcole@pulsecommerce.com",
                "phone": "+1 (512) 441-9081",
                "industry": "Retail & eCommerce",
                "size": "500-1,000",
                "location": "Austin, TX",
                "role": "Head of Digital Marketing",
                "source": "Website",
                "value": 64000.0,
                "stage": PipelineStage.QUALIFIED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 2,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-8",
                "company": "Aura Intelligence Labs",
                "contact": "Sofia Alvarez",
                "email": "sofia@auraintel.ai",
                "phone": "+1 (415) 302-8811",
                "industry": "AI & Data Analytics",
                "size": "100-250",
                "location": "San Francisco, CA",
                "role": "Head of Machine Learning",
                "source": "Website",
                "value": 52000.0,
                "stage": PipelineStage.QUALIFIED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 3,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-9",
                "company": "Nexura Manufacturing",
                "contact": "Robert Kincaid",
                "email": "rkincaid@nexura-mfg.com",
                "phone": "+1 (313) 772-4011",
                "industry": "Manufacturing SaaS",
                "size": "1,000-5,000",
                "location": "Detroit, MI",
                "role": "VP Operations",
                "source": "Outbound",
                "value": 88000.0,
                "stage": PipelineStage.CONTACTED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 4,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-10",
                "company": "Cobalt Logistics",
                "contact": "Kavita Patel",
                "email": "kpatel@cobaltlogistics.com",
                "phone": "+1 (404) 991-3044",
                "industry": "Supply Chain",
                "size": "500-1,000",
                "location": "Atlanta, GA",
                "role": "Chief Logistics Officer",
                "source": "Outbound",
                "value": 68000.0,
                "stage": PipelineStage.PROPOSAL.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": manager.id,
                "days_in_stage": 9, # Warning stagnation
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-11",
                "company": "Strata Energy Services",
                "contact": "William Hayes",
                "email": "whayes@strataenergy.com",
                "phone": "+1 (713) 441-2099",
                "industry": "Energy & Cleantech",
                "size": "5,000+",
                "location": "Houston, TX",
                "role": "Procurement Director",
                "source": "Partner",
                "value": 180000.0,
                "stage": PipelineStage.DEMO.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": manager.id,
                "days_in_stage": 15, # Critical stagnation
                "demo": True,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-12",
                "company": "Vanguard Media Group",
                "contact": "Melissa Perez",
                "email": "mperez@vanguardmedia.com",
                "phone": "+1 (310) 902-3311",
                "industry": "Media & AdTech",
                "size": "250-500",
                "location": "Los Angeles, CA",
                "role": "VP Brand Partnerships",
                "source": "LinkedIn",
                "value": 46000.0,
                "stage": PipelineStage.CONTACTED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 8,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-13",
                "company": "BioGenix Diagnostics",
                "contact": "Dr. Ethan Wright",
                "email": "ewright@biogenix-diag.com",
                "phone": "+1 (858) 554-1188",
                "industry": "HealthTech",
                "size": "100-250",
                "location": "San Diego, CA",
                "role": "Director of Informatics",
                "source": "Website",
                "value": 72000.0,
                "stage": PipelineStage.NEW.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 1,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-14",
                "company": "Kinetix Robotics",
                "contact": "Taro Tanaka",
                "email": "ttanaka@kinetixrobotics.jp",
                "phone": "+81 3 5555 0192",
                "industry": "AI & Robotics",
                "size": "500-1,000",
                "location": "Tokyo, Japan",
                "role": "VP Global Operations",
                "source": "Event / Webinar",
                "value": 115000.0,
                "stage": PipelineStage.DEMO.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": manager.id,
                "days_in_stage": 4,
                "demo": True,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-15",
                "company": "Triton Maritime Logistics",
                "contact": "Lars Lindqvist",
                "email": "llindqvist@triton-marine.com",
                "phone": "+47 22 89 00 11",
                "industry": "Supply Chain",
                "size": "1,000-5,000",
                "location": "Oslo, Norway",
                "role": "Fleet Tech Director",
                "source": "Partner",
                "value": 94000.0,
                "stage": PipelineStage.QUALIFIED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 3,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-16",
                "company": "Solaris Clean Energy",
                "contact": "Aria Sterling",
                "email": "aria@solarisenergy.co",
                "phone": "+1 (303) 778-9922",
                "industry": "Energy & Cleantech",
                "size": "100-250",
                "location": "Denver, CO",
                "role": "Chief Sustainability Officer",
                "source": "Website",
                "value": 48000.0,
                "stage": PipelineStage.CONTACTED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 2,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-17",
                "company": "Beacon Analytics",
                "contact": "Daniel Zhao",
                "email": "dzhao@beaconanalytics.com",
                "phone": "+1 (206) 441-3902",
                "industry": "AI & Data Analytics",
                "size": "250-500",
                "location": "Seattle, WA",
                "role": "Head of Analytics",
                "source": "Website",
                "value": 62000.0,
                "stage": PipelineStage.PROPOSAL.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 5,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-18",
                "company": "CivicWorks GovTech",
                "contact": "Patricia Moore",
                "email": "pmoore@civicworks.gov",
                "phone": "+1 (202) 445-9011",
                "industry": "GovTech",
                "size": "500-1,000",
                "location": "Arlington, VA",
                "role": "IT Procurement Officer",
                "source": "Outbound",
                "value": 135000.0,
                "stage": PipelineStage.QUALIFIED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": manager.id,
                "days_in_stage": 6,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-19",
                "company": "Hyperion Gaming Studios",
                "contact": "Zack Ryder",
                "email": "zack@hyperiongames.com",
                "phone": "+1 (415) 662-7788",
                "industry": "Gaming & XR",
                "size": "100-250",
                "location": "San Francisco, CA",
                "role": "Lead Infrastructure Engineer",
                "source": "Website",
                "value": 41000.0,
                "stage": PipelineStage.NEW.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 1,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-20",
                "company": "Optima HR Cloud",
                "contact": "Claire Dupont",
                "email": "cdupont@optimahr.fr",
                "phone": "+33 1 42 68 55 00",
                "industry": "HR Tech",
                "size": "250-500",
                "location": "Paris, France",
                "role": "Chief People Officer",
                "source": "LinkedIn",
                "value": 54000.0,
                "stage": PipelineStage.DEMO.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 3,
                "demo": True,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-21",
                "company": "PrimeCare Medical Systems",
                "contact": "Dr. Gregory House",
                "email": "ghouse@primecaremed.com",
                "phone": "+1 (609) 332-9011",
                "industry": "HealthTech",
                "size": "1,000-5,000",
                "location": "Princeton, NJ",
                "role": "Chief Medical Officer",
                "source": "Referral",
                "value": 110000.0,
                "stage": PipelineStage.PROPOSAL.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": manager.id,
                "days_in_stage": 4,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-22",
                "company": "Quantum Leap EdTech",
                "contact": "Ananya Sharma",
                "email": "asharma@quantumleap.edu",
                "phone": "+1 (412) 662-8811",
                "industry": "EdTech",
                "size": "500-1,000",
                "location": "Pittsburgh, PA",
                "role": "Provost for Digital Learning",
                "source": "Website",
                "value": 65000.0,
                "stage": PipelineStage.QUALIFIED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 2,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-23",
                "company": "Starlight Hospitality",
                "contact": "Marco Rossi",
                "email": "mrossi@starlighthotels.it",
                "phone": "+39 06 698 1234",
                "industry": "Hospitality SaaS",
                "size": "1,000-5,000",
                "location": "Rome, Italy",
                "role": "Chief Information Officer",
                "source": "Outbound",
                "value": 78000.0,
                "stage": PipelineStage.CONTACTED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 3,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-24",
                "company": "Ironclad CyberDefense",
                "contact": "Vikram Sethi",
                "email": "vsethi@ironcladcyber.in",
                "phone": "+91 80 4455 6677",
                "industry": "CyberSecurity",
                "size": "500-1,000",
                "location": "Bengaluru, India",
                "role": "Chief Information Security Officer",
                "source": "LinkedIn",
                "value": 82000.0,
                "stage": PipelineStage.NEW.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 1,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-25",
                "company": "Veloce Fleet Logistics",
                "contact": "Mateo Rossi",
                "email": "mrossi@velocefleet.com",
                "phone": "+1 (305) 554-9988",
                "industry": "Supply Chain",
                "size": "250-500",
                "location": "Miami, FL",
                "role": "Head of Fleet Operations",
                "source": "Partner",
                "value": 45000.0,
                "stage": PipelineStage.CONTACTED.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": sales_rep.id,
                "days_in_stage": 2,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-26",
                "company": "Artemis BioPharma",
                "contact": "Dr. Beatrice Moreau",
                "email": "bmoreau@artemisbio.ch",
                "phone": "+41 22 799 00 11",
                "industry": "HealthTech",
                "size": "5,000+",
                "location": "Geneva, Switzerland",
                "role": "VP Global Research Operations",
                "source": "Referral",
                "value": 195000.0,
                "stage": PipelineStage.NEW.value,
                "status": LeadStatus.ACTIVE.value,
                "owner": manager.id,
                "days_in_stage": 1,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            # CLOSED WON LEADS
            {
                "id": "lead-won-1",
                "company": "NorthStar Media Network",
                "contact": "Samantha Brooks",
                "email": "sbrooks@northstarmedia.com",
                "phone": "+1 (212) 555-0199",
                "industry": "Media & AdTech",
                "size": "1,000-5,000",
                "location": "New York, NY",
                "role": "Chief Commercial Officer",
                "source": "Website",
                "value": 115000.0,
                "stage": PipelineStage.WON.value,
                "status": LeadStatus.WON.value,
                "owner": sales_rep.id,
                "days_in_stage": 12,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-won-2",
                "company": "Cascade Industrial IoT",
                "contact": "Eric Thorson",
                "email": "ethorson@cascade-iot.com",
                "phone": "+1 (503) 555-0144",
                "industry": "Manufacturing SaaS",
                "size": "500-1,000",
                "location": "Portland, OR",
                "role": "VP of Technology",
                "source": "Referral",
                "value": 92000.0,
                "stage": PipelineStage.WON.value,
                "status": LeadStatus.WON.value,
                "owner": manager.id,
                "days_in_stage": 8,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            {
                "id": "lead-won-3",
                "company": "Titanium Cloud Infrastructure",
                "contact": "Alexander Wright",
                "email": "awright@titaniumcloud.com",
                "phone": "+1 (415) 555-0812",
                "industry": "Cloud Infrastructure",
                "size": "2,500-5,000",
                "location": "San Francisco, CA",
                "role": "VP Engineering Operations",
                "source": "Partner",
                "value": 160000.0,
                "stage": PipelineStage.WON.value,
                "status": LeadStatus.WON.value,
                "owner": manager.id,
                "days_in_stage": 14,
                "demo": True,
                "quote": True,
                "proposal": True
            },
            # CLOSED LOST LEADS
            {
                "id": "lead-lost-1",
                "company": "Legacy Retail Distribution",
                "contact": "Howard Finch",
                "email": "hfinch@legacyretail.com",
                "phone": "+1 (312) 555-0182",
                "industry": "Retail & eCommerce",
                "size": "500-1,000",
                "location": "Chicago, IL",
                "role": "Director of Supply Chain",
                "source": "Outbound",
                "value": 38000.0,
                "stage": PipelineStage.LOST.value,
                "status": LeadStatus.LOST.value,
                "owner": sales_rep.id,
                "days_in_stage": 20,
                "demo": False,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-lost-2",
                "company": "Breeze Telecom Corp",
                "contact": "Nathan Drake",
                "email": "ndrake@breezetelecom.com",
                "phone": "+1 (404) 555-0176",
                "industry": "Enterprise Software",
                "size": "1,000-5,000",
                "location": "Atlanta, GA",
                "role": "Head of IT Infrastructure",
                "source": "Website",
                "value": 54000.0,
                "stage": PipelineStage.LOST.value,
                "status": LeadStatus.LOST.value,
                "owner": sales_rep.id,
                "days_in_stage": 18,
                "demo": True,
                "quote": False,
                "proposal": False
            },
            {
                "id": "lead-lost-3",
                "company": "Vortex Travel Systems",
                "contact": "Chloe Frazier",
                "email": "cfrazier@vortextravel.com",
                "phone": "+1 (702) 555-0193",
                "industry": "Hospitality SaaS",
                "size": "250-500",
                "location": "Las Vegas, NV",
                "role": "Procurement Manager",
                "source": "Outbound",
                "value": 32000.0,
                "stage": PipelineStage.LOST.value,
                "status": LeadStatus.LOST.value,
                "owner": sales_rep.id,
                "days_in_stage": 25,
                "demo": False,
                "quote": False,
                "proposal": False
            }
        ]

        now = datetime.now(timezone.utc)

        for ld in leads_data:
            existing = db.query(Lead).filter(Lead.id == ld["id"]).first()
            if existing:
                continue

            stage_date = now - timedelta(days=ld["days_in_stage"])
            created_date = stage_date - timedelta(days=12)

            lead = Lead(
                id=ld["id"],
                company_name=ld["company"],
                contact_name=ld["contact"],
                contact_email=ld["email"],
                contact_phone=ld["phone"],
                industry=ld["industry"],
                company_size=ld["size"],
                location=ld["location"],
                contact_role=ld["role"],
                lead_source=ld["source"],
                estimated_value=ld["value"],
                stage=ld["stage"],
                status=ld["status"],
                owner_id=ld["owner"],
                created_at=created_date,
                updated_at=stage_date,
                last_activity_at=now - timedelta(days=min(ld["days_in_stage"], 3)),
                stage_entered_at=stage_date
            )
            db.add(lead)
            db.commit()

            # Add activities
            # 1. Initial creation
            db.add(Activity(
                lead_id=lead.id,
                user_id=lead.owner_id,
                activity_type=ActivityType.STAGE_CHANGE.value,
                description=f"Inbound lead received via {lead.lead_source}",
                activity_date=created_date,
                activity_metadata={"score_impact": 10}
            ))

            # 2. Email outreach
            db.add(Activity(
                lead_id=lead.id,
                user_id=lead.owner_id,
                activity_type=ActivityType.EMAIL.value,
                description=f"Initial discovery sequence email sent to {lead.contact_name}",
                activity_date=created_date + timedelta(days=1),
                activity_metadata={"score_impact": 2}
            ))

            if ld["stage"] != PipelineStage.NEW.value:
                # 3. Email response
                db.add(Activity(
                    lead_id=lead.id,
                    user_id=lead.owner_id,
                    activity_type=ActivityType.EMAIL_RESPONSE.value,
                    description=f"{lead.contact_name} replied confirming interest in evaluation",
                    activity_date=created_date + timedelta(days=2),
                    activity_metadata={"score_impact": 12}
                ))

                # 4. Call
                db.add(Activity(
                    lead_id=lead.id,
                    user_id=lead.owner_id,
                    activity_type=ActivityType.CALL.value,
                    description=f"Discovery alignment call with {lead.contact_name} (25 mins)",
                    activity_date=created_date + timedelta(days=4),
                    activity_metadata={"score_impact": 5}
                ))

            if ld["demo"]:
                db.add(Activity(
                    lead_id=lead.id,
                    user_id=lead.owner_id,
                    activity_type=ActivityType.DEMO.value,
                    description="Deep-dive product demonstration attended by technical team",
                    activity_date=stage_date - timedelta(days=2),
                    activity_metadata={"score_impact": 15}
                ))

            if ld["quote"]:
                quotation = Quotation(
                    id=f"quot-{lead.id}",
                    lead_id=lead.id,
                    quotation_number=f"QT-2026-{lead.id.replace('lead-', '')}",
                    amount=lead.estimated_value,
                    status="SENT",
                    requested_at=stage_date - timedelta(days=1),
                    valid_until=stage_date + timedelta(days=30)
                )
                db.add(quotation)
                db.add(Activity(
                    lead_id=lead.id,
                    user_id=lead.owner_id,
                    activity_type=ActivityType.QUOTATION.value,
                    description=f"Formal pricing quotation {quotation.quotation_number} generated",
                    activity_date=stage_date - timedelta(days=1),
                    activity_metadata={"quotation_number": quotation.quotation_number, "score_impact": 18}
                ))

            if ld["proposal"]:
                proposal = Proposal(
                    id=f"prop-{lead.id}",
                    lead_id=lead.id,
                    title=f"Enterprise Solution Proposal - {lead.company_name}",
                    amount=lead.estimated_value,
                    status="VIEWED",
                    sent_at=stage_date,
                    opened_at=stage_date + timedelta(hours=3),
                    view_count=4
                )
                db.add(proposal)
                db.add(Activity(
                    lead_id=lead.id,
                    user_id=lead.owner_id,
                    activity_type=ActivityType.PROPOSAL.value,
                    description=f"Commercial proposal viewed by decision committee (4 views)",
                    activity_date=stage_date + timedelta(hours=3),
                    activity_metadata={"title": proposal.title, "score_impact": 10}
                ))

            # Add sales notes
            db.add(Note(
                lead_id=lead.id,
                user_id=lead.owner_id,
                content=f"Initial discovery notes: {lead.contact_name} indicated strong need to consolidate their stack before end of Q3. Budget approved up to ${lead.estimated_value:,.0f}.",
                ai_signals=["Budget / Commercial Authority", "Near-Term Buying Urgency"],
                created_at=created_date + timedelta(days=3)
            ))

            # Add pipeline history stage transitions
            stage_order = [
                PipelineStage.NEW.value,
                PipelineStage.CONTACTED.value,
                PipelineStage.QUALIFIED.value,
                PipelineStage.DEMO.value,
                PipelineStage.PROPOSAL.value,
                PipelineStage.NEGOTIATION.value,
            ]
            if ld["stage"] == PipelineStage.WON.value:
                stage_order.append(PipelineStage.WON.value)
            elif ld["stage"] == PipelineStage.LOST.value:
                stage_order.append(PipelineStage.LOST.value)

            prev_stage = None
            trans_date = created_date
            for s in stage_order:
                db.add(PipelineHistory(
                    lead_id=lead.id,
                    previous_stage=prev_stage,
                    new_stage=s,
                    changed_by=lead.owner_id,
                    changed_at=trans_date
                ))
                prev_stage = s
                trans_date += timedelta(days=2)
                if s == ld["stage"]:
                    break

            db.commit()

            # Calculate AI score
            score_res = scoring_service.calculate_score_for_lead(db, lead, persist=True)

            # Generate and persist recommendation for active leads
            if lead.status == LeadStatus.ACTIVE.value:
                rec_info = recommendation_service.generate_recommendation_for_lead(lead, score_res.score, score_res.conversion_probability)
                db.add(Recommendation(
                    id=f"rec-{lead.id}",
                    lead_id=lead.id,
                    action=rec_info["action"],
                    reason=rec_info["reason"],
                    urgency=rec_info["urgency"],
                    category=rec_info["category"],
                    completed=False,
                    created_at=now
                ))
                db.commit()

        print(f"  [OK] Successfully seeded {len(leads_data)} leads with rich activities, quotations, proposals, and AI scores.")
        print("[DONE] Database seeding complete.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
