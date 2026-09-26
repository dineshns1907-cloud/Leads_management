# LeadIQ — AI-Powered B2B Lead Prioritization & Pipeline CRM

LeadIQ is an enterprise-grade AI lead intelligence and pipeline scoring platform. It combines an **Angular 17+ single-page frontend** with a high-performance **Python FastAPI backend**, backed by SQLAlchemy, real-time behavioral AI scoring, and JWT authentication.

## 🚀 Live Services

- **Frontend (Angular)**: [http://localhost:4200](http://localhost:4200)
- **Backend (FastAPI)**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive API Documentation (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Integration Documentation**: [docs/API_INTEGRATION.md](file:///C:/Users/Dines/.gemini/antigravity-ide/scratch/leadiq/docs/API_INTEGRATION.md)

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Salesperson** | `salesperson@leadiq.com` | `Sales@123` | View dashboard, manage leads, log activities, drag-and-drop pipeline stages |
| **Manager** | `manager@leadiq.com` | `Manager@123` | All salesperson actions + delete leads + view team analytics |
| **Admin** | `admin@leadiq.com` | `Admin@123` | Full system access and configuration |

---

## 🛠️ Starting the Application Locally

### 1. Backend (FastAPI + SQLAlchemy)
```bash
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend (Angular 17+)
```bash
npm start
```
Navigate to `http://localhost:4200`.

---

## 🧪 Automated End-to-End Verification
To execute the automated regression test suite covering all 9 integration workflows:
```bash
cd backend
.\.venv\Scripts\python.exe test_e2e_integration.py
```
All 9 tests will execute against the live API and report status.
