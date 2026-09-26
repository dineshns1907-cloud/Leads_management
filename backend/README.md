# LeadIQ Backend — AI-Powered Behaviour-Based Lead Scoring System

A modular, production-ready REST API backend built with **Python 3.11+**, **FastAPI**, **SQLAlchemy**, **Pydantic v2**, and **MySQL** (with automated local SQLite fallback for development and testing).

The backend acts as the intelligence layer for the LeadIQ Sales CRM platform, processing digital telemetry (calls, emails, demos, proposals, pricing visits), evaluating stage stagnation, computing real-time conversion probabilities via an extensible ML scoring interface, and recommending prioritized next actions for sales teams.

---

## 1. Backend Architecture

```
backend/
├── app/
│   ├── main.py                     # FastAPI application setup, CORS, lifespan, and centralized error handling
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings environment variables and database URLs
│   │   └── security.py             # Password hashing (bcrypt), JWT generation/decoding, RBAC dependencies
│   ├── database/
│   │   ├── base.py                 # SQLAlchemy DeclarativeBase
│   │   └── connection.py           # Engine initialization (MySQL with SQLite fallback), get_db session generator
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── user.py                 # User (SALESPERSON, MANAGER, ADMIN)
│   │   ├── lead.py                 # Lead entity with firmographics, pipeline dates, and duration counters
│   │   ├── activity.py             # 11 Telemetry Activity types (CALL, EMAIL, DEMO, PROPOSAL, etc.)
│   │   ├── pipeline.py             # PipelineStage and LeadStatus enums
│   │   ├── note.py                 # Notes with AI signal extraction fields
│   │   ├── quotation.py            # Commercial quotations with amounts and validity
│   │   ├── proposal.py             # Proposals with digital view counter and status
│   │   ├── lead_score.py           # Persisted score, conversion probability, positive/negative factor attribution
│   │   └── recommendation.py       # AI-recommended actions, rationale, and urgency
│   ├── schemas/                    # Pydantic validation and serialization models
│   │   ├── user.py
│   │   ├── lead.py
│   │   ├── activity.py
│   │   ├── note.py
│   │   ├── score.py
│   │   ├── recommendation.py
│   │   └── analytics.py
│   ├── routers/                    # REST API route controllers
│   │   ├── auth.py                 # /api/auth (register, login, me, logout, token)
│   │   ├── users.py                # /api/users
│   │   ├── leads.py                # /api/leads (CRUD, search, multi-filter, pagination, stage advancement)
│   │   ├── activities.py           # /api/activities and /api/leads/{id}/activities
│   │   ├── notes.py                # /api/notes and /api/leads/{id}/notes
│   │   ├── pipeline.py             # /api/pipeline (Kanban stage groupings, ARR value, average score)
│   │   ├── scoring.py              # /api/leads/{id}/score (breakdown, factor attribution, recalculate)
│   │   ├── recommendations.py      # /api/recommendations and /api/recommendations/focus
│   │   ├── analytics.py            # /api/analytics (overview, sources, stages, engagement, conversion)
│   │   └── dashboard.py            # /api/dashboard (consolidated executive payload)
│   ├── services/                   # Business logic and domain services
│   │   ├── auth_service.py
│   │   ├── lead_service.py
│   │   ├── activity_service.py
│   │   ├── scoring_service.py
│   │   ├── recommendation_service.py
│   │   └── analytics_service.py
│   ├── ml/
│   │   └── scoring_interface.py    # BaseScoringModel protocol (rule-based heuristic + future ML pluggable model)
│   └── utils/
├── seeds/
│   └── seed_data.py                # Realistic seed script (3 accounts, 32 leads, quotations, proposals, activities)
├── tests/                          # Automated pytest suite (31 tests covering all domain flows)
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_leads.py
│   ├── test_activities.py
│   ├── test_scoring.py
│   ├── test_pipeline.py
│   ├── test_recommendations.py
│   ├── test_analytics.py
│   └── test_roles.py
├── requirements.txt
├── .env.example
├── .env
├── verify_api.py                   # Live verification script
└── README.md
```

---

## 2. Requirements & Prerequisites

- **Python**: `3.10` or `3.11+`
- **Database**: **MySQL 8.0+** or **MariaDB 10.5+** (running on `localhost:3306`)
- **Python MySQL Driver**: `PyMySQL 1.1+`
- **Database Migration Tool**: `Alembic 1.14+`
- **Virtual Environment**: `venv` or `conda`

---

## 3. Environment Configuration (`.env`)

The backend reads database credentials and operational configuration from environment variables.
Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp .env.example .env
```

Configuration variables in `backend/.env`:

```ini
# Database Connection (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=leadiq_db

# Fallback Mode (optional for offline testing)
USE_SQLITE_FALLBACK=False
SQLITE_DB_PATH=./leadiq.db

# JWT Security
JWT_SECRET_KEY=leadiq_super_secret_jwt_key_2026_sales_intelligence_production_ready
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Server Configuration
ENVIRONMENT=development
API_V1_STR=/api
CORS_ORIGINS=http://localhost:4200,http://localhost:3000,http://127.0.0.1:4200
```

> **Security Note:** `.env` is listed in `.gitignore` and must never be committed to source control.

---

## 4. MySQL Database Setup & Creation

### 4.1 Creating the Database

Connect to your MySQL server:

```bash
mysql -u root -p
```

Create the `leadiq_db` database if it does not already exist:

```sql
CREATE DATABASE IF NOT EXISTS leadiq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> **Data Safety Guarantee:** Never execute `DROP DATABASE` automatically. Existing data is preserved across application and database restarts.

### 4.2 Portable MariaDB / MySQL Setup (Windows / Non-Admin)

If running in an environment without administrative installation rights:
1. Portable MariaDB binaries are located in `scratch/leadiq/mysql_server/`
2. Initialize data directory (one time):
   ```powershell
   .\mysql_server\server\bin\mariadb-install-db.exe --datadir=.\mysql_server\data
   ```
3. Start the mysqld daemon:
   ```powershell
   .\mysql_server\server\bin\mysqld.exe --datadir=.\mysql_server\data --port=3306 --console
   ```

---

## 5. Installation

Create and activate a virtual environment:

```bash
# Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

---

## 6. Database Migrations (Alembic)

The LeadIQ backend uses **Alembic** to manage database schema evolution. Schema definitions are synchronized with SQLAlchemy models without relying solely on `create_all()`.

### Common Alembic Commands

- **Check Current Migration Status**:
  ```bash
  alembic current
  ```

- **Apply All Pending Migrations (Upgrade to Head)**:
  ```bash
  alembic upgrade head
  ```

- **Generate a New Migration (after modifying models)**:
  ```bash
  alembic revision --autogenerate -m "describe_schema_change"
  ```

- **Check Migration History**:
  ```bash
  alembic history --verbose
  ```

- **Roll Back One Revision**:
  ```bash
  alembic downgrade -1
  ```

Initial schema migration is located at `alembic/versions/34fd2954a58b_initial_leadiq_schema_with_mysql.py`.

---

## 7. Seeding the Database

Populate `leadiq_db` with realistic corporate data, sales users, historical activities, stage movements, quotations, proposals, and AI-computed scores:

```bash
python seeds/seed_data.py
```

### Seed Dataset Breakdown:
- **5 User Accounts**: 3 Sales Representatives, 1 Sales Manager, 1 System Admin (passwords securely bcrypt-hashed).
- **32 Diverse Leads**: 26 active opportunities across all 6 pipeline stages, 3 closed WON deals, 3 closed LOST deals.
- **10 Core Industries**: Technology, Healthcare, Financial Services, Manufacturing, Retail, Logistics, Education, Cybersecurity, Cloud Infrastructure, SaaS.
- **156 Historical Activities**: Chronologically ordered calls, emails, responses, demos, follow-ups, and quotation/proposal actions.
- **128 Pipeline History Records**: Stage movements tracking `previous_stage`, `new_stage`, `changed_by`, and `changed_at`.
- **32 Notes**: Unstructured sales representative feedback with embedded NLP intent signals.
- **10 Quotations & 10 Proposals**: Real-world commercial tracking documents.
- **32 AI Lead Scores**: Dynamically computed by `scoring_service` based on telemetry (scores 28 to 100).
- **25 Actionable Recommendations**: Dynamically generated next actions prioritizing active hot deals and stagnant opportunities.

---

## 8. Running the Backend

Start the Uvicorn development server:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The service will be live at:
- **Base API URL**: `http://127.0.0.1:8000`
- **Health Check**: `http://127.0.0.1:8000/api/health`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## 9. Verifying Database Connection

Test the live database health endpoint:

```bash
curl http://127.0.0.1:8000/api/health
```

Expected response when MySQL is connected:
```json
{
  "status": "healthy",
  "service": "LeadIQ Backend",
  "database": "connected"
}
```

If MySQL is unreachable, the response will report `"database": "disconnected"` with HTTP 503 status code without exposing sensitive connection strings.

---

## 10. Pre-Configured Test Accounts

All passwords are cryptographically hashed using **bcrypt**:

| Role | Name | Email | Password | Allowed Permissions |
|------|------|-------|----------|---------------------|
| **SALESPERSON** | Alex Morgan | `salesperson@leadiq.com` | `Sales@123` | View assigned leads, create leads, log activities & notes |
| **SALESPERSON** | Sarah Jenkins | `sales2@leadiq.com` | `Sales@123` | View assigned leads, create leads, log activities & notes |
| **SALESPERSON** | David Chen | `sales3@leadiq.com` | `Sales@123` | View assigned leads, create leads, log activities & notes |
| **MANAGER** | Elena Rostova | `manager@leadiq.com` | `Manager@123` | View team leads, delete leads, view analytics, manage pipeline |
| **ADMIN** | System Administrator | `admin@leadiq.com` | `Admin@123` | Full system access, user administration, system config |

---

## 11. Interactive Swagger API Documentation

Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to test all 26 REST API operations.

### Key API Categories:
- **Authentication**: `/api/auth/login`, `/api/auth/me`, `/api/auth/register`
- **Leads**: `/api/leads` (CRUD, filtering, search, stage advancement)
- **Activities**: `/api/activities`, `/api/leads/{id}/activities`
- **Notes**: `/api/notes`, `/api/leads/{id}/notes`
- **Pipeline Kanban**: `/api/pipeline`
- **Lead Scoring**: `/api/leads/{id}/score`, `/api/leads/{id}/score/recalculate`
- **AI Recommendations**: `/api/recommendations`, `/api/recommendations/focus`
- **Executive Analytics**: `/api/analytics/overview`, `/api/analytics/stages`, `/api/analytics/sources`
- **Dashboard Summary**: `/api/dashboard`

---

## 12. Troubleshooting MySQL Connection Issues

### Issue 1: Connection Refused (`Can't connect to MySQL server on 'localhost:3306'`)
- **Cause**: MySQL daemon is not running or listening on port 3306.
- **Solution**:
  - Check if the service is running (`Get-Service mysql` on Windows, or `sudo systemctl status mysql` on Linux).
  - If using the portable server:
    ```powershell
    .\mysql_server\server\bin\mysqld.exe --datadir=.\mysql_server\data --port=3306 --console
    ```

### Issue 2: Access Denied for User `root`@`localhost`
- **Cause**: Incorrect password in `.env`.
- **Solution**: Verify `DB_PASSWORD` in `backend/.env`. Test login directly via CLI:
  ```bash
  mysql -u root -p -h localhost -P 3306
  ```

### Issue 3: Unknown Database `leadiq_db`
- **Cause**: The database has not been created yet.
- **Solution**:
  ```sql
  CREATE DATABASE leadiq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

### Issue 4: Driver / Import Error (`ModuleNotFoundError: No module named 'pymysql'`)
- **Cause**: PyMySQL is not installed in the active virtual environment.
- **Solution**: Ensure your virtual environment is active, then run:
  ```bash
  pip install pymysql cryptography
  ```

---

## 13. Running Automated Tests

Run the full pytest suite:

```bash
pytest -v
```

All 31 unit and integration tests pass, validating authentication, role-based authorization (RBAC), lead stage transitions, activity telemetry, pipeline summaries, AI score recalculations, and recommendation generators.

---

## 14. Architecture Overview (Step 3 Status)

```
                LEADIQ FRONTEND
                     │
                     │  (Connection in Step 4)
                  NOT YET
                     │
                     X
                     │
              ┌──────────────┐
              │   FastAPI    │
              │   Backend    │
              │ (Port: 8000) │
              └──────┬───────┘
                     │
                 SQLAlchemy
                  (PyMySQL)
                     │
                     ▼
              ┌──────────────┐
              │    MySQL     │
              │  leadiq_db   │
              │ (Port: 3306) │
              └──────────────┘
```

The Angular frontend remains completely untouched in its premium Warm Ivory + Coral + Emerald + Violet design and is ready for integration in Step 4.
