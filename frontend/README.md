# Xeno AI-Native Mini CRM 🚀

Xeno is an **AI-Native Marketing CRM** designed for brands to manage customer segments, generate hyper-targeted AI outreach copy, dispatch campaigns through simulated carriers, track deliveries in real time, and analyze performance funnel analytics with an AI copilot.

This project is divided into two decoupled, independent services:
- **`frontend`**: Next.js 15 Full-Stack application (Dashboard UI, API Route Handlers, NextAuth, Prisma ORM, and Gemini API integration).
- **`channel-service`**: Node.js + Express microservice simulating delivery carriers, processing message broadcasts, and executing timeout-based webhook callbacks.

---

## 1. System Architecture

The CRM leverages a unified Next.js dashboard that interacts with a PostgreSQL database and calls the Gemini API for intelligence and copywriting. Campaign delivery is delegated to the Express simulation service, which runs carrier timeouts and webhooks callbacks back to Next.js routes.

```mermaid
graph TD
    User([Marketer]) -->|Interacts| UI[Next.js React Frontend]
    
    subgraph CRM Next.js Application
        UI -->|Next.js APIs| API[Route Handlers]
        API -->|ORM Queries| Prisma[Prisma ORM]
        Prisma -->|Read/Write| DB[(PostgreSQL Database)]
        API -->|Insights & AI Chat| Gemini[Gemini API - gemini-1.5-flash]
    end
    
    subgraph Simulated Carrier Service
        API -->|POST /api/channel/send| Express[Express Server]
        Express -->|Asynchronous Event simulation| Simulation[setTimeout Pipeline]
        Simulation -->|SENT, DELIVERED, OPENED, CLICKED, CONVERTED| Webhook[POST /api/webhooks/campaign]
    end
    
    Webhook -->|Prisma Transactional Update| API
```

---

## 2. Webhook & Message Lifecycle

Outbox campaign deliveries are asynchronous. When a campaign is launched, the CRM queues communication logs and fires requests to the `channel-service`. The channel service responds instantly with a `200 OK` and spins off a setTimeout pipeline simulating carrier hops:

```mermaid
sequenceDiagram
    autonumber
    CRM ->> Channel Service: POST /api/channel/send (campaignId, customerId, channel, message)
    Note over Channel Service: Immediate HTTP 200 OK Response
    
    par Asynchronous Timeout Chain
        Note over Channel Service: Delay 500ms
        Channel Service ->> CRM: POST /api/webhooks/campaign (status: SENT)
        Note over CRM: Transaction: Log Event, Update Log to SENT, Increment Sent Count
    and
        Note over Channel Service: Delay 1000ms
        alt Success (90%)
            Channel Service ->> CRM: POST /api/webhooks/campaign (status: DELIVERED)
            Note over CRM: Transaction: Log Event, Update Log to DELIVERED, Increment Delivered Count
        else Failure (10%)
            Channel Service ->> CRM: POST /api/webhooks/campaign (status: FAILED, errorMessage)
            Note over CRM: Transaction: Log Event, Update Log to FAILED, Increment Failed Count
        end
    and
        Note over Channel Service: Delay 1500ms (If Delivered)
        Channel Service ->> CRM: POST /api/webhooks/campaign (status: OPENED)
        Note over CRM: Transaction: Log Event, Update Log to OPENED, Increment Opened Count
    and
        Note over Channel Service: Delay 1000ms (If Opened)
        Channel Service ->> CRM: POST /api/webhooks/campaign (status: CLICKED)
        Note over CRM: Transaction: Log Event, Update Log to CLICKED, Increment Clicked Count
    and
        Note over Channel Service: Delay 1500ms (If Clicked & 30% Convert Probability)
        Channel Service ->> CRM: POST /api/webhooks/campaign (status: CLICKED, converted: true)
        Note over CRM: Transaction: Log Event, Update Metadata to {converted: true}, Increment Converted Count
    end
```

---

## 3. AI-Native Decisions & Gemini Integration

Xeno implements artificial intelligence as a core product feature rather than an afterthought:

1. **Natural Language Segmentation (AI-First)**:
   Marketers write plain English requests (e.g. *"skincare buyers inactive for 60 days"*). Gemini parses this into a structured JSON condition rule tree.
2. **Deterministic Fallback Parsing**:
   To ensure robustness against model hallucinations or network errors, the CRM uses a local keyword-regex parsing engine ([fallback.ts](file:///c:/Users/anupd/OneDrive/Desktop/Resume%20projects/Xeno%20SDE%20Intern%20Assignment/frontend/lib/audience/fallback.ts)) as a recovery layer.
3. **AI Copywriter**:
   Generates optimized copy based on custom directions and the channel (Email, SMS, WhatsApp, RCS). E.g. email generates subjects and HTML-free text; SMS generates under 160 characters.
4. **Contextual Campaign Chat ("Ask AI About This Campaign")**:
   Allows marketers to chat directly with their campaign reports. The system aggregates campaign statistics (funnels, delivery logs) and feeds them as prompt context so Gemini answers question queries accurately.

---

## 4. Technical Tradeoffs & Scalability

### Architectural Tradeoffs
- **Co-located Route Handlers (Next.js)**:
  * *Tradeoff*: Decoupling Next.js API route logic and page files speeds up development, but binds releasing and scaling together.
  * *Next Steps*: If the CRM traffic surges, the business route handlers should be migrated to a dedicated microservice (Go/Node/Java) while Next.js focuses on serving frontend layouts.
- **In-Memory Aggregate Queries for Segments**:
  * *Tradeoff*: Temporal criteria (like repeat order counts `ordersCount` within `lookbackDays`) are filtered in JavaScript memory. This runs quickly for MVP datasets but will hit memory limits on millions of rows.
  * *Next Steps*: Port JS aggregate logic into SQL views or pre-computed, event-driven materialized database caches.

### Scalability and Concurrency Controls
- **Transactional Consistency**:
  To protect campaign analytics counters from concurrent webhook callbacks, updates are wrapped in a Prisma `$transaction` database lock.
- **Deduplication and Catch-up Logic**:
  If webhook events arrive out of order (e.g., `OPENED` arriving before `SENT` due to network delays), the webhook processor checks the current database status score and avoids double-incrementing counters. It automatically "catches up" any preceding events.
- **Simulated Carrier Retries**:
  The `channel-service` implements recursive webhook post loops that retry up to 3 times with a 1-second delay upon carrier errors.

---

## 5. Local Setup Guide

### 1. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Channel Service
cd ../channel-service
npm install
```

### 2. Configure Environment Variables
Create `.env` files in both directories based on their `.env.example` templates:

**`frontend/.env`**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_crm"
AUTH_SECRET="replace-with-strong-secret-key"
AUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
CHANNEL_SERVICE_URL="http://localhost:4001"
```

**`channel-service/.env`**:
```env
PORT="4001"
FRONTEND_ORIGIN="http://localhost:3000"
```

### 3. Run Database Migrations & Seeds
Initialize your PostgreSQL database and populate realistic ecommerce logs:
```bash
cd frontend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development Servers
Start both servers locally:

- **Frontend (Port 3000)**: `cd frontend && npm run dev`
- **Channel Service (Port 4001)**: `cd channel-service && npm run dev`

---

## 6. Deployment Instructions

### Frontend (Vercel)
1. Push the repository to GitHub.
2. Link the repository in the Vercel Dashboard. Set the **Root Directory** to `frontend`.
3. Configure your production environment variables (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `GEMINI_API_KEY`, and `CHANNEL_SERVICE_URL`).
4. Trigger the build command: `npm run build`.

### Channel Service (Render / Railway)
1. Create a Web Service instance.
2. Set the directory context to `channel-service`.
3. Set variables: `PORT=4001` and `FRONTEND_ORIGIN` (pointing to your deployed Vercel domain).
4. Update the Vercel frontend `CHANNEL_SERVICE_URL` environment variable to point to this deployed Express URL.
