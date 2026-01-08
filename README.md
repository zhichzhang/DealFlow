# DealFlow – Kafka + Redis Automated Weekly Deals Pipeline

## Overview
**DealFlow** is a Node.js + Supabase + Kafka + Redis pipeline that automates:

- Ingesting product deals and user preferences from JSON or other sources  
- Deduplicating and normalizing data with **Redis**  
- Publishing deal and email events to **Kafka topics**  
- Processing events asynchronously via consumers  
- Sending personalized weekly emails using Handlebars templates via **Resend API**  

This architecture supports scalable, reliable, and idempotent weekly execution.

---

## Architecture

```text
JSON Files / External Sources
        │
        ▼
  Data Ingestion Script
        │
        ▼
   Redis Deduplication  ←───── Prevent duplicate deals/emails
        │
        ▼
   Kafka Producers
  ┌──────────────────┐   ┌──────────────────┐
  │ deals.ingested    │   │ emails.weekly     │
  └──────────────────┘   └──────────────────┘
        │                      │
        ▼                      ▼
  Kafka Consumers           Kafka Consumers
  ┌──────────────┐         ┌──────────────┐
  │ dealConsumer │         │ emailConsumer│
  └──────────────┘         └──────────────┘
        │                      │
        ▼                      ▼
  Supabase Postgres         Resend API
````

---

## Environment Variables

Create a `.env` file in the project root. **Do not commit secrets.**

```text
# Redis configuration
REDIS_URL=      # Redis connection URL (e.g., redis://localhost:6379)
REDIS_USERNAME= # Redis username
REDIS_PWD=      # Redis password
REDIS_SOCKET_HOST= # Optional: Redis cloud host
REDIS_SOCKET_PORT= # Optional: Redis cloud port

# Kafka configuration
KAFKA_BROKERS=      # Comma-separated list of Kafka brokers (e.g., kafka:9092)
KAFKA_TOPIC_DEALS=  # Topic for ingested deals (e.g., deals.ingested)
KAFKA_TOPIC_EMAILS= # Topic for weekly email jobs (e.g., emails.weekly)

# Supabase configuration
SUPABASE_URL=             # Supabase project URL
SUPABASE_SECRET_KEY=      # Supabase service-role key for backend operations
SUPABASE_PUBLISHABLE_KEY= # Optional: client key if needed

# Resend email API
RESEND_API_KEY=            # API key for sending emails
```

**Purpose:**

* **Redis:** Deduplication of deals and email jobs
* **Kafka:** Event-driven ingestion and email queue
* **Supabase:** Normalized storage of users, retailers, products, and deals
* **Resend:** Delivery of personalized weekly emails

---

## Features

### Kafka + Redis Pipeline

* Deduplicates deals/emails via Redis
* Produces events to Kafka topics (`deals.ingested` and `emails.weekly`)
* Consumers asynchronously process events:

    * `dealConsumer`: upserts deals into Supabase
    * `emailConsumer`: generates and sends emails

### Data Ingestion

* Upserts users, retailers, products, and deals
* Deduplicates deals before publishing to Kafka
* Inserts only deals relevant to at least one user

### Email Delivery

* Queues weekly emails in Kafka (`emails.weekly`)
* Redis ensures users only receive one weekly email
* Fetches top deals per user, groups by retailer, renders HTML via Handlebars, sends via Resend

### Database Integration

* Fully typed TypeScript interfaces
* Supabase Postgres with foreign keys & unique constraints
* Tables: `users`, `retailers`, `products`, `deals`

---

## Workflow Example

```ts
// Entry point
await ingestData();         // Upsert users, publish deals to Kafka
await queueWeeklyEmails();  // Publish email jobs to Kafka

// Kafka consumers process asynchronously:
// dealConsumer → upsert deals in Supabase
// emailConsumer → send emails via Resend
```

---

## Benefits of Kafka + Redis Refactor

1. **Decoupled ingestion & delivery** – pipelines run independently
2. **Scalable** – multiple consumers can run in parallel
3. **Reliable** – Redis dedup prevents duplicate processing
4. **Idempotent** – safe retries for ingestion/email jobs
5. **Observability** – Kafka topics track queued and processed events

---

## Running the Pipeline

### Installation

```bash
npm install
```

### Run full weekly workflow

```bash
npm run send:weekly
```

Internally executes:

1. `ingestData()` → publishes deals to Kafka
2. `queueWeeklyEmails()` → publishes email jobs to Kafka

Consumers handle asynchronous processing.

---

## Database Schema (Supabase)

### Users

| Column              | Type   | Description             |
| ------------------- | ------ | ----------------------- |
| id                  | uuid   | Primary key             |
| name                | text   | User name               |
| email               | text   | Unique email            |
| preferred_retailers | text[] | Array of retailer names |

### Retailers

| Column | Type | Description          |
| ------ | ---- | -------------------- |
| id     | uuid | Primary key          |
| name   | text | Unique retailer name |

### Products

| Column   | Type | Description       |
| -------- | ---- | ----------------- |
| id       | uuid | Primary key       |
| name     | text | Product name      |
| size     | text | Product size      |
| category | text | Optional category |

### Deals

| Column                                      | Type          | Description             |
| ------------------------------------------- | ------------- | ----------------------- |
| id                                          | uuid          | Primary key             |
| retailer_id                                 | uuid          | FK → retailers.id       |
| product_id                                  | uuid          | FK → products.id        |
| price                                       | numeric(10,2) | Deal price              |
| start_date                                  | date          | Deal start date         |
| end_date                                    | date          | Deal end date           |
| created_at                                  | timestamp     | Defaults to now()       |
| UNIQUE(retailer_id, product_id, start_date) | Constraint    | Prevent duplicate deals |

---

## Future Improvements

1. Weekly scheduling: GitHub Actions, Supabase Functions, or cron
2. Admin dashboard: upload deals, preview emails, view ingestion logs
3. Advanced email personalization: "new vs returning deals", category filters
4. Data validation: JSON schema check, deduplication, normalization
5. Real-time ingestion from APIs, queue-based pipelines

---

## Sample Data

* `assets/data/sample-deal-data.json`
* `assets/data/test-user-data.json`

---

## Email Template

* `assets/temp/email-temp/email-temp.html`
* `assets/temp/email-temp/index.css`

---

## TypeScript Models

Defined in `types/models.ts`

* User
* Retailer
* Product
* Deal
* DealJSON (raw ingestion format)

---

## Summary

DealFlow provides a **production-ready, scalable, idempotent pipeline** for:

* Importing structured deal data
* Deduplicating and storing it in Supabase
* Generating personalized weekly emails
* Sending emails asynchronously via Kafka + Redis + Resend