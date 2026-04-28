# BorderFlow — Distributed Logistics Management System

BorderFlow is a multi-site, offline-tolerant logistics platform built for cross-border container shipping across South Africa, Mozambique, and Mauritius. It tracks every container from depot gate-in through border clearance, port loading, and final delivery, with a central control tower that aggregates data from all three sites automatically.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [How the Data Flows](#2-how-the-data-flows)
3. [Database Design](#3-database-design)
4. [Backend — Flask API](#4-backend--flask-api)
5. [Frontend — React SPA](#5-frontend--react-spa)
6. [Role-Based Dashboards](#6-role-based-dashboards)
7. [Sync System — Offline Tolerance](#7-sync-system--offline-tolerance)
8. [Kubernetes Infrastructure](#8-kubernetes-infrastructure)
9. [Tools & Technologies](#9-tools--technologies)
10. [Local Development Setup](#10-local-development-setup)
11. [Deployment Reference](#11-deployment-reference)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEVELOPER MACHINE                        │
│                                                                 │
│   React Dev Server :3001  ──proxy──►  kubectl port-forward      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                         ┌──────▼──────────────────────────────────┐
                         │     KUBERNETES CLUSTER (Docker Desktop) │
                         │                                         │
                         │  ┌──────────────────────────────────┐   │
                         │  │         SITE APIs (Flask)        │   │
                         │  │                                  │   │
                         │  │  borderflow-api-sa  :5000        │   │
                         │  │  borderflow-api-moz :5000        │   │
                         │  │  borderflow-api-mru :5000        │   │
                         │  │  borderflow-api-control :5000    │   │
                         │  └──────────────────────────────────┘   │
                         │           │               │             │
                         │    ┌──────▼───────┐  ┌───▼──────────┐  │
                         │    │  Site DBs    │  │  Control DB  │  │
                         │    │  (MariaDB)   │  │  (MariaDB)   │  │
                         │    │              │  │              │  │
                         │    │  sa_db :3306 │  │ control_db   │  │
                         │    │  moz_db:3306 │  │      :3306   │  │
                         │    │  mru_db:3306 │  └──────────────┘  │
                         │    └──────────────┘        ▲           │
                         │                            │           │
                         │  ┌─────────────────────────┘           │
                         │  │  CronJobs (every 5 min)             │
                         │  │  sync-worker-sa                     │
                         │  │  sync-worker-moz                    │
                         │  │  sync-worker-mru                    │
                         │  └─────────────────────────────────────┘
                         └─────────────────────────────────────────┘
```

### Four Independent Zones

| Zone | API Pod | Database | NodePort |
|------|---------|----------|----------|
| South Africa | `borderflow-api-sa` | `borderflow_sa` (MariaDB) | 30013 |
| Mozambique | `borderflow-api-moz` | `borderflow_moz` (MariaDB) | 30012 |
| Mauritius | `borderflow-api-mru` | `borderflow_mru` (MariaDB) | 30011 |
| Control Tower | `borderflow-api-control` | `borderflow_control` (MariaDB) | 30010 |

Each site is fully independent. If a site loses network connectivity, it continues operating locally. The sync process catches up automatically when connectivity is restored.

---

## 2. How the Data Flows

### Normal Operation

```
1. Dispatcher creates a trip
   └─► INSERT into local site DB (trip table)
   └─► INSERT into sync_log (status = 'pending')

2. Staff log events (milestones, incidents, clearances, handovers)
   └─► INSERT/UPDATE into local site DB
   └─► INSERT into sync_log (status = 'pending')

3. Every 5 minutes — CronJob fires sync_worker.py
   └─► SELECT pending rows from sync_log
   └─► POST batch to http://control-api/control/sync
   └─► Control API writes records into borderflow_control DB
   └─► Control API returns 200
   └─► sync_worker marks rows as 'success' in sync_log

4. Management dashboard reads from the site's own DB
   (All data is local — no cross-site queries at runtime)
```

### Offline / Low-Connectivity Operation

```
1. Staff continue working normally — all writes go to local DB + sync_log
2. sync_worker fails to reach control-api → logs error, exits, leaves rows as 'pending'
3. When connectivity resumes → next CronJob run picks up ALL pending rows
4. No data is lost — sync_log is the durable queue
```

### Key Design Principle

Every write to the system produces two records:
- The **entity record** (trip, milestone, etc.) in the local DB
- A **sync_log record** with the full JSON payload

The sync_log is the tamper-evident audit trail. It is append-only; rows are only ever marked `success` — never deleted or modified.

---

## 3. Database Design

Each of the four databases (SA, MOZ, MRU, Control) shares the same schema.

### Core Tables

```sql
driver          -- truck drivers (driver_id, first_name, last_name, license_number, phone, status)
vehicle         -- trucks (vehicle_id, registration, make, model, max_payload_kg, status)
site            -- depots, ports, borders, destinations (site_id, country_id, name, site_type, address, lat, lng)
country         -- SA, MOZ, MRU (country_id, name, iso_code)
staff           -- all non-driver employees (staff_id, site_id, first_name, last_name, role, email, username, password)
client          -- shipping customers (client_id, company_name, contact_name, email, phone, username, password)
```

### Operational Tables

```sql
consignment         -- a client's shipping order (consignment_id, client_id, reference_number, status)
consignment_container -- which containers are in a consignment (with seal_number)
trip                -- one truck journey (trip_id, vehicle_id, driver_id, origin_site_id, destination_site_id, status)
trip_container      -- which containers are on a trip
milestone           -- timestamped event on a trip/container (gate_in, loaded_on_vessel, etc.)
incident            -- problems reported during a trip (severity, type, status)
handover            -- container transfer between parties at a border (with seal check)
clearance           -- customs paperwork at a border site (status: pending → cleared/rejected)
```

### Audit Table

```sql
sync_log  -- append-only event log
  log_id        VARCHAR(36)   -- UUID, primary key
  site_id       INT           -- which site wrote this
  entity_type   VARCHAR(50)   -- 'trip', 'milestone', 'incident', etc.
  entity_id     INT           -- ID of the entity
  operation     ENUM          -- INSERT | UPDATE | DELETE
  payload       JSON          -- full snapshot of the record at write time
  local_time    DATETIME      -- when the event was recorded locally
  synced_at     DATETIME      -- when it was pushed to control (NULL if pending)
  sync_status   ENUM          -- pending | success | failed
```

### Username Prefix Convention

All staff usernames carry a site prefix so a single auth endpoint can route to the correct database:

| Prefix | Site |
|--------|------|
| `sa_` | South Africa |
| `moz_` | Mozambique |
| `mru_` | Mauritius |
| `control_` | Control Tower |

---

## 4. Backend — Flask API

### Structure

```
borderflow_api/
├── app.py              # Flask app factory — registers blueprints per SITE env var
├── config.py           # DB connection config — driven by SITE env var
├── db.py               # MySQL connector helper
├── sync_worker.py      # Standalone script — reads sync_log, POSTs to control API
└── routes/
    ├── auth.py             # POST /login — shared across all sites
    ├── resources.py        # GET /drivers /vehicles /containers /sites /consignments /audit
    ├── sync_control.py     # POST /control/sync — receives sync batches into control DB
    ├── trip_sa.py          # GET /trips  POST /trip  (SA)
    ├── trip_moz.py         # GET /trips  POST /trip  (MOZ)
    ├── trip_mru.py         # GET /trips  POST /trip  (MRU)
    ├── incident_*.py       # GET/POST/PUT/DELETE /incidents
    ├── milestone_*.py      # GET/POST/PUT/DELETE /milestones
    ├── handover_*.py       # GET/POST/PUT/DELETE /handovers
    ├── clearance_*.py      # GET/POST/PUT/DELETE /clearances
    └── client_*.py         # GET/POST/PUT/DELETE /clients
```

### How Blueprint Registration Works

`app.py` reads the `SITE` environment variable and conditionally imports only the blueprints relevant to that site. The auth and resources blueprints are always registered (they work across all sites by reading the username prefix):

```python
# Always registered
app.register_blueprint(auth_bp)         # /login
app.register_blueprint(sync_control_bp) # /control/sync
app.register_blueprint(resources_bp)    # /drivers, /vehicles, /containers, /sites ...

# Only for SITE=mru
if SITE == "mru":
    app.register_blueprint(trip_mru_bp)
    app.register_blueprint(incident_mru_bp)
    # ... etc
```

### Auth Flow

1. Client sends `POST /login` with `{ username, password, role }`
2. Auth route reads the username prefix (`sa_`, `moz_`, `mru_`, `control_`) to select the correct database
3. For `role = "client"` → queries the `client` table
4. For all other roles → queries the `staff` table with `WHERE username = ? AND role = ?`
5. Passwords are compared using bcrypt (or plain text for legacy accounts)
6. Returns `{ message, site, role, user }` — no session tokens, no JWT; session is stored in `localStorage`

### Sync Write Pattern

Every mutating route follows this pattern:

```python
# 1. Write the entity
cursor.execute("INSERT INTO trip (...) VALUES (...)", ...)
trip_id = cursor.lastrowid

# 2. Write the sync log entry with full payload
cursor.execute("""
    INSERT INTO sync_log
    (log_id, site_id, entity_type, entity_id, operation, payload, local_time, synced_at, sync_status)
    VALUES (%s, %s, %s, %s, %s, %s, NOW(), NULL, 'pending')
""", (str(uuid.uuid4()), Config.SITE_ID, "trip", trip_id, "INSERT", json.dumps(payload)))

db.commit()
```

The sync_log row is written **in the same transaction** as the entity, ensuring no write is ever lost from the audit trail.

### Running the API

```bash
gunicorn --bind 0.0.0.0:5000 --workers 1 --timeout 120 app:app
```

---

## 5. Frontend — React SPA

### Structure

```
frontend/my-app/src/
├── App.js                  # Route table — maps URL path to dashboard component
├── shared.js               # Common utilities: api(), getSession(), Nav, Badge, Table ...
├── Logindashboard.jsx      # Login page — country select, role select, credentials
├── DispatcherDashboard.jsx # /dispatcher
├── DriverDashboard.jsx     # /driver
├── PortAgentDashboard.jsx  # /port-agent
├── ManagementDashboard.jsx # /management
├── DepotClerkDashboard.jsx # /depot-clerk
├── BorderAgentDashboard.jsx # /border-agent
└── ClientDashboard.jsx     # /tracking
```

### Routing Without React Router

Routing is handled by reading `window.location.pathname` at app load. After login, `window.location.href` is set to the role's path which causes a full page reload, so App.js re-reads the path and renders the correct dashboard:

```js
const ROUTES = {
  '/dispatcher':   <DispatcherDashboard />,
  '/driver':       <DriverDashboard />,
  '/port-agent':   <PortAgentDashboard />,
  '/management':   <ManagementDashboard />,
  '/depot-clerk':  <DepotClerkDashboard />,
  '/border-agent': <BorderAgentDashboard />,
  '/tracking':     <ClientDashboard />,
};
export default function App() {
  return ROUTES[window.location.pathname] ?? <LoginDashboard />;
}
```

### CORS Resolution via CRA Proxy

The React dev server runs on port 3001. All API calls use relative paths (`/login`, `/trips`, etc.). The CRA proxy in `package.json` forwards these to the Flask backend:

```json
"proxy": "http://localhost:5003"
```

This means there are no cross-origin requests from the browser — everything appears same-origin. The `kubectl port-forward` exposes one backend pod locally on port 5003.

### Session Management

On successful login, three keys are written to `localStorage`:

```js
localStorage.setItem('currentUser', JSON.stringify(result.user))
localStorage.setItem('user_site',   result.site)   // 'SA', 'MOZ', 'MRU'
localStorage.setItem('user_role',   result.role)   // 'dispatcher', 'driver', etc.
```

Every dashboard reads these on mount to display the user's name and site badge.

### Username Auto-Prefix

The login page selects a country and then automatically prepends the correct prefix to whatever the user types:

```
User types "john", selects Mauritius → sends "mru_john" to the API
```

---

## 6. Role-Based Dashboards

| Role | Path | Primary Actions |
|------|------|----------------|
| Dispatcher | `/dispatcher` | Create trips (select real drivers, vehicles, containers, sites from DB), view consignments, monitor incidents |
| Driver | `/driver` | View active trips, log field events (picked_up → handover_completed), report incidents |
| Port Agent | `/port-agent` | Log port milestones (gate_in_port, loaded_on_vessel, vessel_departed), manage clearances |
| Management | `/management` | KPI overview cards, full audit log (sync_log), read-only trip/incident/clearance views |
| Depot Clerk | `/depot-clerk` | Container yard view, log gate-in/gate-out/seal events, report depot incidents |
| Border Agent | `/border-agent` | Submit customs clearances, update clearance status inline, log cross-border handovers |
| Client | `/tracking` | Read-only — shipment list with clickable container timeline |

### Milestone Type Reference

| Actor | Milestone Types |
|-------|----------------|
| Driver | `container_picked_up`, `departed_depot`, `arrived_at_checkpoint`, `arrived_at_border`, `cleared_border`, `arrived_at_destination`, `handover_completed` |
| Depot Clerk | `gate_in`, `gate_out`, `seal_verified`, `seal_broken`, `inspection_passed`, `inspection_failed`, `storage_assigned` |
| Port Agent | `gate_in_port`, `customs_inspection`, `documentation_submitted`, `loaded_on_vessel`, `vessel_departed`, `vessel_arrived`, `released_to_consignee` |

---

## 7. Sync System — Offline Tolerance

### sync_worker.py (the sync agent)

Runs as a Kubernetes CronJob every 5 minutes per site. It is a standalone Python script (not a Flask route):

```
1. Connect to local site DB (env-configured)
2. SELECT all sync_log rows WHERE sync_status = 'pending'
3. If none → exit cleanly
4. Build JSON batch of all pending records
5. POST to http://control-api/control/sync
6. If POST succeeds → UPDATE sync_log SET sync_status='success', synced_at=NOW()
7. If POST fails → log error, exit (rows stay pending, retried next run)
```

### sync_control.py (the control receiver)

Flask route `POST /control/sync` on the control API pod:

```
1. Receive batch of log entries from a site
2. For each entry:
   a. Check if log_id already exists (idempotency guard)
   b. INSERT into control DB's sync_log
   c. Apply the payload to the corresponding control DB table
      (INSERT IGNORE for new records, UPDATE for mutations)
3. SET FOREIGN_KEY_CHECKS = 0 during writes (avoids ordering issues)
4. Commit → return { applied: N }
```

The `INSERT IGNORE` pattern means re-sending the same sync batch is safe — duplicate records are silently skipped. This makes the entire system **at-least-once** with idempotent delivery.

### CronJob Configuration

```yaml
schedule: "*/5 * * * *"      # every 5 minutes
concurrencyPolicy: Forbid     # never run two workers simultaneously
restartPolicy: OnFailure      # retry if the pod crashes mid-sync
imagePullPolicy: Never        # use local Docker image (no registry needed)
```

---

## 8. Kubernetes Infrastructure

### All Resources

```
Deployments (API pods)
  borderflow-api-sa       — Flask, SITE=sa,      port 5000
  borderflow-api-moz      — Flask, SITE=moz,     port 5000
  borderflow-api-mru      — Flask, SITE=mru,     port 5000
  borderflow-api-control  — Flask, SITE=control, port 5000

StatefulSets (databases — persistent volumes)
  sa-db      — MariaDB 10.11, database: borderflow_sa
  moz-db     — MariaDB 10.11, database: borderflow_moz
  mru-db     — MariaDB 10.11, database: borderflow_mru
  control-db — MariaDB 10.11, database: borderflow_control

Services
  sa-api / moz-api / mru-api / control-api   — ClusterIP :80 → pod :5000
  sa-db-service    — NodePort 30013 → MariaDB :3306
  moz-db-service   — NodePort 30012 → MariaDB :3306
  mru-db-service   — NodePort 30011 → MariaDB :3306
  control-db-service — NodePort 30010 → MariaDB :3306
  sa-db / moz-db / mru-db / control-db — Headless (StatefulSet DNS)

CronJobs
  sync-worker-sa   — */5 * * * *  runs sync_worker.py for SA
  sync-worker-moz  — */5 * * * *  runs sync_worker.py for MOZ
  sync-worker-mru  — */5 * * * *  runs sync_worker.py for MRU
```

### Local Access (Development)

```bash
# Expose MRU API locally on port 5003 (used by React proxy)
kubectl port-forward deployment/borderflow-api-mru 5003:5000

# Direct DB access (for tools like DBeaver / TablePlus)
# MRU:     localhost:30011
# SA:      localhost:30013
# MOZ:     localhost:30012
# Control: localhost:30010
# Credentials: root / root
```

### Deploying Changes Without Rebuilding the Image

Since no registry is used, changes are deployed by copying files directly into running pods and sending a graceful reload signal:

```bash
kubectl cp routes/resources.py <pod-name>:/app/routes/resources.py
kubectl exec <pod-name> -- sh -c "kill -HUP 1"
# kill -HUP 1 sends SIGHUP to gunicorn (PID 1), which gracefully reloads workers
```

---

## 9. Tools & Technologies

### Backend

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.11 | Runtime language |
| **Flask** | 3.x | Lightweight WSGI web framework |
| **Flask-CORS** | 4.x | Cross-origin request handling |
| **Gunicorn** | 21.x | Production WSGI server (1 worker per pod) |
| **mysql-connector-python** | 9.x | MariaDB/MySQL driver |
| **bcrypt** | 4.x | Password hashing and verification |
| **requests** | 2.x | HTTP client used by sync_worker.py |
| **uuid** | stdlib | Generating unique log IDs |

### Database

| Tool | Version | Purpose |
|------|---------|---------|
| **MariaDB** | 10.11 | Relational database (MySQL-compatible) |
| **Kubernetes StatefulSet** | — | Stable pod identity + persistent volumes for DB data |
| **PersistentVolumeClaim** | 1Gi per DB | Survives pod restarts |

### Frontend

| Tool | Version | Purpose |
|------|---------|---------|
| **React** | 19.x | UI library |
| **Create React App** | 5.x | Build toolchain, dev server, proxy |
| **react-scripts** | 5.0.1 | CRA scripts (build, start, test) |

No external UI component library is used — all components are written with inline styles matching the dark theme.

### Infrastructure & Orchestration

| Tool | Version | Purpose |
|------|---------|---------|
| **Docker Desktop** | 4.x | Container runtime on Windows |
| **Kubernetes** | 1.29 (bundled with Docker Desktop) | Container orchestration |
| **kubectl** | 1.29 | Kubernetes CLI for deployments and port-forwarding |
| **Kubernetes CronJob** | batch/v1 | Scheduled sync agent (every 5 minutes) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Node.js** (18+) | Required to run the React dev server |
| **npm** | Package manager for frontend |
| **DBeaver / TablePlus** | GUI database client (connects via NodePort) |
| **VS Code** | IDE with Claude Code extension |

---

## 10. Local Development Setup

### Prerequisites

- Docker Desktop with Kubernetes enabled
- Node.js 18+
- Python 3.11
- kubectl

### Step 1 — Start the Kubernetes cluster

Ensure Docker Desktop is running and Kubernetes is enabled in its settings.

```bash
kubectl get nodes   # should show 1 node Ready
```

### Step 2 — Deploy all resources

```bash
# Databases (StatefulSets)
kubectl apply -f mru_db.yaml
kubectl apply -f moz_db.yaml
kubectl apply -f sa_db.yaml
kubectl apply -f control_db.yaml

# API deployments
kubectl apply -f borderflow_api/deployment_mru.yaml
kubectl apply -f borderflow_api/deployment_moz.yaml
kubectl apply -f borderflow_api/deployment_sa.yaml
kubectl apply -f borderflow_api/deployment_control.yaml

# Services
kubectl apply -f borderflow_api/mru_service.yaml
kubectl apply -f borderflow_api/moz_service.yaml
kubectl apply -f borderflow_api/sa_service.yaml
kubectl apply -f borderflow_api/control_service.yaml

# Sync CronJobs
kubectl apply -f borderflow_api/sync_cronjobs.yaml
```

### Step 3 — Port-forward the API you want to develop against

```bash
# Use MRU as the primary development backend
kubectl port-forward deployment/borderflow-api-mru 5003:5000
```

### Step 4 — Start the React dev server

```bash
cd borderflow_api/frontend/my-app
npm install
npm start
# Opens http://localhost:3001
```

### Step 5 — Log in

Select a country, select a role, and enter your credentials with the site prefix:

```
Country:  Mauritius
Role:     Dispatcher
Username: john          (auto-prefixed to mru_john)
Password: your-password
```

### Deploying Code Changes to a Running Pod

```bash
# Copy a changed file
kubectl cp borderflow_api/routes/resources.py <pod-name>:/app/routes/resources.py

# Gracefully reload gunicorn (picks up the new file, zero downtime)
kubectl exec <pod-name> -- sh -c "kill -HUP 1"

# Get pod names
kubectl get pods
```

---

## 11. Deployment Reference

### Environment Variables (API pods)

| Variable | Example | Purpose |
|----------|---------|---------|
| `SITE` | `mru` | Which site this pod serves (`sa`, `moz`, `mru`, `control`) |
| `DB_HOST` | `mru-db-service` | Kubernetes service name of the database |
| `DB_PORT` | `3306` | Database port |
| `DB_USER` | `root` | Database user |
| `DB_PASS` | `root` | Database password |

### Environment Variables (sync_worker CronJobs)

| Variable | Example | Purpose |
|----------|---------|---------|
| `SITE` | `mru` | Which site to sync from |
| `DB_HOST` | `mru-db-service` | Local site database host |
| `DB_NAME` | `borderflow_mru` | Local site database name |
| `CONTROL_URL` | `http://control-api/control/sync` | Control API endpoint |

### NodePort Database Access

| Site | Host | Port |
|------|------|------|
| Control | `localhost` | `30010` |
| MRU | `localhost` | `30011` |
| MOZ | `localhost` | `30012` |
| SA | `localhost` | `30013` |

---

## How Everything Works Together — End-to-End Example

```
1.  Dispatcher logs in (mru_alice / password, role=dispatcher)
    └─► /login reads "mru_" prefix → queries borderflow_mru.staff
    └─► Returns { site: "MRU", role: "dispatcher", user: {...} }
    └─► Browser stores session in localStorage, redirects to /dispatcher

2.  Dispatcher opens "New Trip"
    └─► Modal loads /drivers, /vehicles, /containers, /sites in parallel
    └─► All fetched from borderflow_mru database
    └─► Dispatcher selects Driver #3 (Jean-Marc), Vehicle REG-MU-001,
        containers MRUU1234567 + MRUU9876543,
        Origin: Port Louis Depot → Destination: Port Louis Port

3.  Dispatcher submits → POST /trip
    └─► Checks: vehicle not in active trip ✓
    └─► Checks: driver not in active trip ✓
    └─► Checks: containers not in active trips ✓
    └─► INSERT INTO trip → trip_id = 42
    └─► INSERT INTO trip_container (42, container_1), (42, container_2)
    └─► INSERT INTO sync_log (uuid, site=3, entity=trip, op=INSERT, payload=..., status=pending)
    └─► Returns { trip_id: 42 }

4.  Driver logs in (mru_jeanmarc / password, role=driver)
    └─► /driver dashboard → Active Trips tab shows Trip #42

5.  Driver picks up containers → Log Event tab
    └─► Selects Trip #42, Container MRUU1234567, Site "Port Louis Depot"
    └─► Milestone type: container_picked_up
    └─► POST /milestones → recorded + sync_log entry added (pending)

6.  Trip reaches border → Border Agent logs in (mru_agent1 / password)
    └─► Submit Clearance tab → selects Trip #42, container, border site
    └─► POST /clearances → clearance_id = 7, status = pending + sync_log entry

7.  Customs approved → Border Agent updates clearance
    └─► Clicks clearance row → modal → status = cleared, reference = SARS-2024-007
    └─► PUT /clearances/7 → UPDATE + sync_log entry (UPDATE, pending)

8.  Five minutes later — sync-worker-mru CronJob fires
    └─► Reads all pending sync_log rows (trip #42, milestone, clearance INSERT, clearance UPDATE)
    └─► POST to http://control-api/control/sync with batch of 4 entries
    └─► Control API: INSERT IGNORE trip #42 into borderflow_control.trip
    └─► Control API: INSERT IGNORE milestone into borderflow_control.milestone
    └─► Control API: INSERT IGNORE clearance into borderflow_control.clearance
    └─► Control API: UPDATE clearance status in borderflow_control
    └─► sync_worker marks all 4 rows as 'success'

9.  Management logs in (control_manager / password, role=manager)
    └─► /management → Audit Log tab
    └─► Sees complete immutable trail: trip creation, pickup, clearance, approval
    └─► All timestamped, all traceable to the MRU site

10. Client logs in (mru_clientco / password, role=client)
    └─► /tracking → My Shipments → clicks their consignment
    └─► Sees containers MRUU1234567 + MRUU9876543
    └─► Timeline shows: container_picked_up → [border events pending sync]
    └─► Status: "In Transit"
```
