# Conversational Data Analyst (Banking Domain)

A secure, full-stack natural-language analytics application that allows business users to query structured banking datasets using plain English, receive instant executive insights, and view dynamic visualisations (KPIs, tables, bar charts, and line charts) without writing SQL.

I disclose:
Which AI development tools were used- Google gemini and google search
Which architectural and implementation decisions were made personally. - Folder structure for whole codebase is decided by me. Instead of any other database, i have used SQLite.

## Setup Instructions:
Open terminal and clone repositry.
Prerequisites
Node.js (v18 or higher recommended)
npm (comes packaged with Node.js)

For backend: open new terminal and run following commands one by (it will run on browser on http://localhost:5000)-
npm install
npm run db:seed
npm run dev
for tests: npm run test

For frontend: open new terminal and run following commands one by (it will run on browser on http://localhost:3000)-
npm install
npm run dev
for tests: npm run test



---

## 🏗️ System Architecture

The application implements a strict **Frontend / Backend separation** model with an intermediate SQL sanitization and safety guardrail layer.


```

┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│                 │       │  Node.js API    │       │  NL-to-SQL Core  │       │     SQLite      │
│  React Frontend ├──────►│  (TypeScript)   ├──────►│  (Rule Engine /  │       │  Database (WAL) │
│  (Chat UI)      │       │  - Sanitizer    │       │   LLM Service)   │       │                 │
│                 │◄──────┤  - AST Validator│◄──────┤                  │       │                 │
└─────────────────┘       └─────────────────┘       └──────────────────┘       └─────────────────┘

```

### Technology Stack
* **Frontend**: React (Vite), TypeScript, Tailwind CSS, Recharts, Lucide Icons.
* **Backend**: Node.js, Express, TypeScript.
* **Database**: SQLite (`better-sqlite3`) utilizing Write-Ahead Logging (WAL) for safe concurrent reads.
* **Security Layer**: Custom SQL Ast/Syntax Sanitizer ensuring strict read-only query execution.

---

## 📊 Sample Data & Schema Design

The application seeds and manages four logically distinct relational banking datasets:
1. **`branches`**: Physical branch metadata (`id`, `name`, `city`, `region`).
2. **`customers`**: Client profiles linked to branches (`id`, `branch_id`, `full_name`, `segment`, `status`).
3. **`applications`**: Account and product onboarding requests (`id`, `customer_id`, `product_type`, `status`, `requested_amount`, `submitted_at`).
4. **`transactions`**: Financial ledger entries (`id`, `customer_id`, `channel`, `category`, `type`, `amount`, `timestamp`).

---

## ✨ Completed Functionality

* **Conversational Chat UI**: Multi-turn chat interface supporting continuous queries, preset prompt chips, and conversation clearing.
* **Natural Language Processing (NLP)**: Translates conversational inquiries into structured database queries mapped to customer, application, and transaction tables.
* **SQL Security Guardrails**: Enforces strict `SELECT`/`WITH` query boundaries, blocks destructive operations (`DROP`, `DELETE`, `UPDATE`, `INSERT`), and injects maximum row limits (`LIMIT 500`).
* **Multi-Format Data Visualisation**: Automatically detects and renders output into:
  * **KPI Cards**: Single prominent metric displays.
  * **Bar & Line Charts**: Powered by Recharts with responsive scaling and custom tooltips.
  * **Data Tables**: Clean, formatted columns with user-friendly headers.
* **Export & Copy Tools**: One-click actions to copy plain-text executive summaries or export raw data payloads as JSON.
* **Graceful Error Handling**: Comprehensive backend try-catch blocks and frontend visual alerts for failed queries, invalid syntax, or network timeouts.

---

## 🧠 Assumptions

1. **Read-Only Access**: The application assumes database operations are strictly analytical (`SELECT` queries). No write privileges are exposed through the conversational interface.
2. **Schema Uniformity**: Database foreign keys (`branch_id`, `customer_id`) are indexed to support fast joins across the four core tables.
3. **Intent Categorization**: The translation layer assumes questions map to core analytical intents (branch performance, customer segments, transaction volumes, and financial aggregates).
4. **Single-Tenant Deployment**: SQLite is configured as an embedded file database suitable for local development, rapid prototyping, and moderate concurrent workloads.

---

## ⚠️ Known Limitations

1. **Context Memory**: The current natural language parser evaluates each query independently rather than maintaining deep conversational memory of multi-step iterative filters (e.g., "Filter the previous results to only show Wealth customers").
2. **Dialect Specificity**: Queries are optimized specifically for SQLite syntax. Migrating to PostgreSQL or MySQL requires minor adjustments to date functions or string aggregations.
3. **Complex Free-Form NL**: Highly ambiguous or deeply nuanced queries outside pre-mapped analytical intents fall back to a generic pipeline status view.

---

## 🚀 Productionisation Approach

To scale this application for an enterprise production environment:

1. **Database Migration**: 
   * Transition from SQLite to managed enterprise databases (AWS RDS PostgreSQL or Google Cloud SQL) with strict read-only database user permissions (`GRANT SELECT`).
   * Implement connection pooling and query timeout limits (e.g., `statement_timeout = 5000ms`).
2. **Robust LLM Integration**:
   * Replace rule-based matching with production LLM APIs (OpenAI GPT-4o or Anthropic Claude 3.5 Sonnet) using **Structured Outputs / JSON Mode**.
   * Implement few-shot prompt tuning with complete database schema DDL definitions and business terminology glossaries.
3. **Security & Authentication**:
   * Add OAuth2 / JWT authentication (Auth0 or Okta) to secure API endpoints.
   * Enforce Row-Level Security (RLS) so users can only query data matching their specific branch or regional authorization scope.
4. **Caching & Rate Limiting**:
   * Implement Redis caching for frequent natural-language queries to reduce LLM latency and database load.
   * Add API rate limiting (`express-rate-limit`) to prevent brute-force abuse.
5. **Observability**:
   * Integrate structured logging (Winston) and Application Performance Monitoring (Datadog / OpenTelemetry) to monitor query execution times and LLM token usage.

```