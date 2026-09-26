# LeadIQ: Angular Frontend to FastAPI Backend Integration Guide

## 1. System Overview & Service URLs

LeadIQ unites an Angular 17+ single-page application with a high-performance Python FastAPI backend, backed by SQLAlchemy, real-time behavioral AI scoring, and JWT authentication.

| Service | Local URL | Role / Purpose |
| :--- | :--- | :--- |
| **Angular Frontend** | [http://localhost:4200](http://localhost:4200) | Responsive SPA with Warm Ivory, Coral, Emerald, and Violet design system |
| **FastAPI Backend** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | RESTful API engine providing database persistence and AI heuristics |
| **API Base URL** | [http://localhost:8000/api](http://localhost:8000/api) | Prefix for all application data endpoints |
| **Swagger Interactive Docs**| [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive OpenAPI documentation and test runner |
| **ReDoc Reference** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Alternative formatted OpenAPI reference documentation |

---

## 2. Authentication & Authorization Architecture

### 2.1 JWT Bearer Token Workflow
1. **User Sign-In (`POST /api/auth/login`)**:
   - The user inputs their credentials (`email`, `password`) on the `/login` route.
   - On success, the backend returns an access token (`Bearer <JWT>`) along with user metadata.
   - The Angular `AuthService` stores the token in `localStorage` under `leadiq_auth_token` and updates reactive signals (`currentUser`, `isAuthenticated`).
2. **HTTP Interceptor (`authInterceptor`)**:
   - Every outgoing HTTP request to `/api` is intercepted by `src/app/core/interceptors/auth.interceptor.ts`.
   - Automatically injects `Authorization: Bearer <token>` into HTTP headers.
   - Handles `401 Unauthorized` responses by cleanly clearing invalid sessions and navigating to `/login` without redirect loops.
   - Handles `403 Forbidden` responses when unauthorized roles attempt restricted actions (such as lead deletion).
3. **Session Rehydration (`initAuth()`)**:
   - When the browser reloads, `AuthService.initAuth()` verifies the existing token by querying `GET /api/auth/me`.
   - If valid, user state is seamlessly restored without re-prompting for credentials.
4. **Sign-Out (`POST /api/auth/logout`)**:
   - Notifies backend to revoke session and clears local storage.

### 2.2 Test Credentials & Roles
| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Salesperson** | `salesperson@leadiq.com` | `Sales@123` | View dashboard, manage leads, log activities, drag-and-drop pipeline stages |
| **Manager** | `manager@leadiq.com` | `Manager@123` | All salesperson actions + delete leads + view team analytics |
| **Admin** | `admin@leadiq.com` | `Admin@123` | Full system access and configuration |

---

## 3. Endpoints & Module Mapping Table

All 9 primary modules of LeadIQ are connected directly to live FastAPI endpoints:

| Frontend Module | Angular Service Method | FastAPI Endpoint | HTTP Method | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `AuthService.login()` | `/auth/login` | `POST` | Authenticates user, returns JWT |
| | `AuthService.getCurrentUser()` | `/auth/me` | `GET` | Validates session token & profile |
| | `AuthService.logout()` | `/auth/logout` | `POST` | Clears user session |
| **Dashboard** | `LeadService.loadDashboard()` | `/dashboard` | `GET` | Fetches KPI summary, priority queue, recs |
| **Leads Catalog** | `LeadService.loadLeads()` | `/leads` | `GET` | Fetches filtered, searched & sorted leads |
| | `LeadService.addLead()` | `/leads` | `POST` | Creates new lead with calculated AI score |
| | `LeadService.deleteLead()` | `/leads/{id}` | `DELETE` | Removes lead (Role: Manager/Admin only) |
| **Lead Detail** | `LeadService.fetchLeadDetail()` | `/leads/{id}` | `GET` | Retrieves deep profile, history, and notes |
| | `LeadService.recalculateScore()` | `/leads/{id}/score/recalculate` | `POST` | Re-evaluates AI score & behavioral signals |
| **Pipeline (Kanban)** | `LeadService.loadPipeline()` | `/pipeline` | `GET` | Stage breakdown, stage metrics & value |
| | `LeadService.updateLeadStage()`| `/leads/{id}/stage` | `PATCH` | Updates stage on drag-and-drop |
| **Recommendations** | `LeadService.loadRecommendations()` | `/recommendations` | `GET` | Next best actions ranked by priority |
| | `LeadService.loadFocusLeads()` | `/recommendations/focus` | `GET` | Top 5 priority accounts requiring attention |
| | `LeadService.completeRecommendation()` | `/recommendations/{id}/complete` | `POST` | Dismisses/completes recommendation |
| **Touchpoint Logging** | `LeadService.simulateActivity()` | `/leads/{id}/activities` | `POST` | Logs meeting, demo, visit + triggers scoring |
| | `LeadService.loadActivities()` | `/activities` | `GET` | Recent behavioral event timeline |
| **Notes** | `LeadService.addNote()` | `/leads/{id}/notes` | `POST` | Attaches pinned or regular notes to lead |
| **Analytics** | `LeadService.loadAnalytics()` | `/analytics/overview` | `GET` | Pipeline velocity, conversions, sources |

---

## 4. Bidirectional Data Adapters

All transformations between backend snake_case schemas and Angular camelCase models occur in `src/app/core/mappers/api-adapter.ts`.

### Schema Comparison

| Backend Attribute (FastAPI) | Angular Model Property | Type / Transformation |
| :--- | :--- | :--- |
| `id` | `id` | `string` |
| `company_name` | `company` | `string` |
| `contact_name` | `contactName` | `string` |
| `contact_email` | `contactEmail` | `string` |
| `contact_phone` | `contactPhone` | `string` |
| `industry` | `industry` | `string` |
| `lead_source` | `source` | `string` |
| `estimated_value` | `dealSize` | Transformed to currency format (e.g. `$95,000`) |
| `stage` | `pipelineStage` / `stage` | `NEW` -> `New`, `PROPOSAL` -> `Proposal`, etc. |
| `ai_score` | `aiScore` | `number` (0-100) |
| `conversion_probability` | `conversionProbability` | Transformed to percentage (`High (85%)`) |
| `classification` | `priority` | `HOT` -> `hot`, `WARM` -> `warm`, `COLD` -> `cold` |
| `stagnation_status` | `stagnationStatus` | `NORMAL` -> `normal`, `WARNING` -> `warning`, `CRITICAL` -> `critical` |
| `days_in_current_stage` | `stageAgeDays` | `number` |
| `score_breakdown` | `scoreBreakdown` | Mapped positive and negative signal weights |

---

## 5. UI Design & Aesthetic Preservation

The integration completely preserves the existing visual system:
- **Warm Ivory Palette**: `#FAF8F5` background, `#FFFFFF` surfaces, `#E8E4DC` subtle borders.
- **Coral Primary Accents**: `#F46036` primary action buttons, key highlights, and active tabs.
- **Emerald Status Indicators**: `#10B981` positive momentum indicators, won deals, and hot status badges.
- **Deep Violet AI Accents**: `#4F46E5` AI score badges, smart recommendation pills, and spark tags.
- **No Template or Layout Alterations**: Zero HTML elements removed; cards, sidebars, modals, and tables retain their exact visual styling and layout proportions.

---

## 6. End-to-End Verification Test Results

Automated regression script (`backend/test_e2e_integration.py`) tests all 9 critical user flows against the live server:

```
[TEST] Starting 9 End-to-End LeadIQ API Integration Tests...
  [PASS] Test 1 - Login Flow: User 'Alex Rivera' authenticated. Role: SALESPERSON. JWT token issued.
  [PASS] Test 2 - Leads List & Filter: Successfully retrieved 5 HOT leads. Top lead: Apex Cloud Systems (100 score).
  [PASS] Test 3 - Add Lead Flow: Created lead 'Quantum Logic Systems' (ID: lead-aa4c31d9). Initial AI Score: 65 (WARM).
  [PASS] Test 4a - Activity Added: Recorded 'PRICING_PAGE_VISIT' for lead lead-aa4c31d9.
  [PASS] Test 4b - Dynamic Scoring: AI Score recalculated to 71 (Engagement: MEDIUM, Class: WARM).
  [PASS] Test 5 - Pipeline Stage Move: Updated stage from DEMO to PROPOSAL.
  [PASS] Test 6 - Focus Mode: 5 prioritized leads with actionable recommendations returned. Priority #1: Apex Cloud Systems -> Finalize commercial terms and routing for e-signature.
  [PASS] Test 7 - Analytics Overview: Total Pipeline: $2,712,000, Avg Score: 76.0, Conversion Rate: 50.0%.
  [PASS] Test 8 - Role Authorization: Manager deleted test lead. Status: 204 No Content.
  [PASS] Test 9 - Logout Flow: JWT session successfully revoked: Successfully logged out from LeadIQ session.

[SUCCESS] ALL 9 END-TO-END INTEGRATION TESTS PASSED 100%!
```
