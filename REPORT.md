# BorderFlow System Report

**Date:** April 2026  
**Version:** 1.0  
**Prepared by:** BorderFlow Development Team

---

## 1. System Overview

BorderFlow is a multi-site cross-border logistics management platform. It tracks the movement of shipping containers across depots, ports, and border posts spanning South Africa (SA), Mozambique (MOZ), and Mauritius (MRU). A central Control tower aggregates data from all three sites for oversight.

**Core capabilities:**
- Trip scheduling: assign drivers, vehicles, and containers to a route
- Container tracking: status updates from departure through border clearance to delivery
- Milestone recording: timestamped events at each site along a route
- Border clearance: document submission and customs clearance workflow
- Handover: seal-verified custody transfer between sites
- Incident reporting: damage, theft, and delay events linked to trips

---

## 2. Architecture

### Tech Stack
| Layer       | Technology                     |
|-------------|-------------------------------|
| Database    | MariaDB 11 (one per site)     |
| Backend     | Python 3.11 / Flask / Gunicorn |
| Frontend    | React 18 (Create React App)   |
| Infra       | Kubernetes (Kind cluster)     |
| Auth        | bcrypt password hashing       |

### Deployment

Four independent Flask API pods run inside a Kubernetes cluster, each connected to its own MariaDB StatefulSet:

| Site     | K8s Deployment          | DB Service          | DB Name              |
|----------|-------------------------|---------------------|----------------------|
| SA       | borderflow-api-sa       | sa-db-service:3306  | borderflow_sa        |
| MOZ      | borderflow-api-moz      | moz-db-service:3306 | borderflow_moz       |
| MRU      | borderflow-api-mru      | mru-db-service:3306 | borderflow_mru       |
| Control  | borderflow-api-control  | control-db-service  | borderflow_control   |

A sync worker (`sync_worker.py`) periodically pushes milestones, clearances, handovers, and incidents from each site to the Control database.

### API Routes (all sites)
```
POST /login              — authenticate staff or client
GET  /drivers            — list drivers
GET  /vehicles           — list vehicles
GET  /containers         — list containers
GET  /containers/all     — containers with trip assignments
GET  /sites              — list sites
GET  /consignments       — list consignments
GET  /audit              — sync audit log
```

---

## 3. User Roles

| Role          | Username prefix | Access                                  |
|---------------|-----------------|-----------------------------------------|
| manager       | control_        | Control tower — all sites read-only     |
| dispatcher    | sa_ / moz_ / mru_ | Schedule trips, assign containers    |
| driver        | sa_             | View assigned trips                     |
| port_agent    | moz_ / mru_     | Record port milestones and handovers    |
| depot_clerk   | any             | Manage depot inventory                  |
| border_agent  | any             | Submit and process clearances           |
| client        | sa_ / moz_ / mru_ | Track their own consignments          |

All test passwords are set to `password`.

---

## 4. Database Summary (Live Data)

### South Africa (borderflow_sa)
| Table           | Rows |
|-----------------|------|
| country         | 1    |
| site            | 10   |
| staff           | 4    |
| driver          | 20   |
| vehicle         | 20   |
| client          | 1    |
| container       | 22   |
| trip            | 10   |
| trip_container  | 12   |
| milestone       | 2    |
| clearance       | 3    |
| handover        | 2    |
| incident        | 2    |

### Mozambique (borderflow_moz)
| Table           | Rows |
|-----------------|------|
| country         | 10   |
| site            | 12   |
| staff           | 3    |
| driver          | 25   |
| vehicle         | 25   |
| client          | 1    |
| container       | 25   |
| trip            | 20   |
| trip_container  | 20   |
| milestone       | 11   |
| clearance       | 2    |
| handover        | 11   |
| incident        | 1    |

### Mauritius (borderflow_mru)
| Table           | Rows |
|-----------------|------|
| country         | 10   |
| site            | 10   |
| staff           | 3    |
| driver          | 11   |
| vehicle         | 11   |
| client          | 1    |
| container       | 11   |
| trip            | 7    |
| trip_container  | 8    |
| milestone       | 2    |
| clearance       | 1    |
| handover        | 1    |
| incident        | 1    |

### Control (borderflow_control)
Entity tables empty — receives synced events only (3 milestones, 1 clearance, 3 handovers, 2 incidents).

---

## 5. Running the System Locally

**Prerequisites:** Docker Desktop, Kind, kubectl, Python 3.11, Node 18+

**Step 1 — Port-forward the target site API:**
```bash
kubectl port-forward pod/<mru-pod-name> 5003:5000
```

**Step 2 — Start the React frontend:**
```bash
cd borderflow_api/frontend/my-app
npm start          # opens http://localhost:3000
```
The `"proxy": "http://localhost:5003"` in `package.json` routes all API calls through the dev server, eliminating CORS issues.

**Step 3 — Log in:**

| Site | Username         | Role       | Password  |
|------|-----------------|------------|-----------|
| MRU  | mru_cmabunda    | dispatcher | password  |
| MRU  | mru_jmucavele   | manager    | password  |
| SA   | sa_zmokoena     | dispatcher | password  |
| MOZ  | moz_cmabunda    | dispatcher | password  |

---

## 6. Seed Files

The following SQL files reproduce the current live dataset:

| File             | Database          |
|------------------|-------------------|
| `seed_sa.sql`    | borderflow_sa     |
| `seed_moz.sql`   | borderflow_moz    |
| `seed_mru.sql`   | borderflow_mru    |
| `seed_control.sql`| borderflow_control|

Apply with:
```bash
mysql -h 127.0.0.1 -P 30013 -u root -proot borderflow_sa < seed_sa.sql
mysql -h 127.0.0.1 -P 30012 -u root -proot borderflow_moz < seed_moz.sql
mysql -h 127.0.0.1 -P 30011 -u root -proot borderflow_mru < seed_mru.sql
mysql -h 127.0.0.1 -P 30010 -u root -proot borderflow_control < seed_control.sql
```

---

*BorderFlow — Cross-border logistics visibility across Southern and Eastern Africa.*
