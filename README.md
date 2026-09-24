# TraceNet — AI-Powered Criminal Network Analysis System
> Smart India Hackathon 2026 | Problem: SIH26189 | Ministry of Home Affairs

**TraceNet** is a decision-support tool for law enforcement investigators. It ingests fragmented criminal data (FIRs, CDRs, financial transactions), extracts entities via NLP, builds an interactive relationship graph, and surfaces hidden connections, key influencers, and suspicious patterns — all framed as investigator leads requiring human verification.

> ⚠️ **Every insight in TraceNet is a lead — not evidence of guilt. All outputs require human verification.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                      │
│  Dashboard │ Cases │ Evidence │ Graph Explorer │ Analytics    │
│  Framer Motion animations │ Cytoscape.js │ Recharts          │
└───────────────────────┬─────────────────────────────────────-┘
                        │ REST API + JWT
┌───────────────────────▼──────────────────────────────────────┐
│                  SERVER (Node.js + Express)                    │
│  /api/auth  │ /api/cases │ /api/evidence │ /api/entities      │
│  /api/graph │ /api/audit                                       │
│  NLP Service: compromise.js + regex                           │
│  Analytics: graphology (centrality + Louvain community)       │
└───────────────────────┬──────────────────────────────────────-┘
                        │ Mongoose ODM
┌───────────────────────▼──────────────────────────────────────┐
│                    MongoDB                                     │
│  Users │ Cases │ Evidence │ Entities │ Relationships │ Audit  │
└──────────────────────────────────────────────────────────────-┘
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **MongoDB** running locally on port 27017 (or update `MONGO_URI`)

### 1. Clone & Setup
```bash
cd E:\Trang

# Copy env
cp .env.example server/.env
```

### 2. Install Dependencies
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Seed the Database
```bash
cd server
npm run seed
```
This creates 4 mock cases, 5 evidence files, 35+ entities, and 31 relationships.

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tracenet.in | Admin@1234 |
| Investigator | priya@tracenet.in | Inv@12345 |
| Analyst | shreya@tracenet.in | Ana@12345 |

### 4. Start Servers
```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 5-Minute Demo Script

### Step 1 — Login (30s)
1. Open http://localhost:5173
2. Click **Admin** demo button → Sign In
3. Notice: role badge, greeting, stat cards on dashboard

### Step 2 — Explore Cases (45s)
1. Navigate to **Cases** → see 4 pre-seeded operations
2. Filter by `active` status → shows Operation Shadownet + Redline
3. Notice: priority badges, case numbers, jurisdiction tags

### Step 3 — Upload Evidence (60s)
1. Navigate to **Evidence**
2. Select "Operation Shadownet" from dropdown
3. Click "Upload Evidence" → set type to FIR
4. Drag any .txt file in
5. See SHA-256 hash appear → green "Uploaded successfully"
6. Watch processing status change from `pending` → `done`

### Step 4 — View the Network Graph (90s)
1. Navigate to **Graph Explorer**
2. Select "Operation Shadownet" case
3. See nodes appear: people (blue), phones (green), accounts (red), vehicles (orange)
4. Notice flagged nodes have **red borders**
5. Click **Arjun Malhotra** → drawer slides in from right
6. See: influence score bars, source evidence with SHA-256 hashes, community ID
7. Toggle **Community** color mode → clusters light up in different colors
8. Use zoom controls to navigate

### Step 5 — Influencer Ranking + Explainability (60s)
1. Navigate to **Analytics**
2. See "Daud Ibrahim Shaikh" ranked #1 (score 91%)
3. Click to expand → see "Why Flagged?" explainability panel
4. View Degree vs Betweenness breakdown
5. Read the disclaimer: "Investigator lead — requires verification"
6. Check the pie chart: entity type distribution

### Step 6 — Audit Trail (30s)
1. Navigate to **Audit Log** (admin-only)
2. See every action logged: logins, uploads, views
3. Filter by "EVIDENCE" to see only evidence access
4. Each entry shows: user, action, target, timestamp

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | JWT login |
| `/api/auth/me` | GET | Get current user |
| `/api/cases` | GET/POST | List/create cases |
| `/api/cases/:id` | GET/PATCH/DELETE | Case CRUD |
| `/api/evidence/:caseId` | POST | Upload evidence file |
| `/api/evidence/:caseId` | GET | List evidence for case |
| `/api/entities` | GET | Search/list entities |
| `/api/entities/merge/suggestions` | GET | Fuzzy merge candidates |
| `/api/entities/merge` | POST | Merge two entities |
| `/api/graph/:caseId` | GET | Graph nodes + edges |
| `/api/graph/:caseId/influencers` | GET | Top influencer ranking |
| `/api/audit` | GET | Audit log (admin) |

---

## Data Models

```
User        { name, email, passwordHash, role, badgeId, department }
Case        { title, description, status, priority, assignedTo, caseNumber, tags }
Evidence    { caseId, type, fileUrl, sha256Hash, rawText, processingStatus }
Entity      { name, type, aliases, caseIds, influenceScore, communityId, flagged }
Relationship{ sourceEntityId, targetEntityId, type, weight, confidence, sourceEvidenceIds }
AuditLog    { userId, action, targetId, targetType, ip, timestamp }
```

---

## Security Features
- JWT authentication with 7-day expiry
- RBAC: Admin > Investigator > Analyst
- Rate limiting (100 req/15min, 20 req/15min for auth)
- Helmet security headers
- SHA-256 file integrity hashing
- Full audit trail in MongoDB
- Input validation via express-validator

---

## Ethical AI Principles
1. **Human-in-the-loop**: Entity merges require investigator confirmation
2. **Traceable evidence**: Every score links to source documents
3. **Explainability**: "Why flagged?" panel for every flag
4. **No verdicts**: All outputs labelled "investigator leads"
5. **Audit accountability**: Every access logged with user + timestamp

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Animations | Framer Motion |
| Graph | Cytoscape.js + cose layout |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| NLP | compromise.js + regex |
| Analytics | graphology (degree/betweenness/Louvain) |
| Upload | Multer |
| Security | Helmet + express-rate-limit + express-validator |
