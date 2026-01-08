# DealFlow — Automated Weekly Deals Pipeline

Automated backend workflow for retailer deal recommendations.  
This project provides an end-to-end pipeline to:

- Ingest deal, user, product, and retailer data
- Normalize and store in Supabase Postgres
- Generate personalized weekly deal emails
- Send emails automatically via Resend API

It can be scheduled using cron, GitHub Actions, or Supabase scheduled functions.

## Features

### Main Features

- **Data Ingestion**
  - Batch import users, retailers, products, and deals from JSON files
  - Automatic deduplication logic to avoid duplicate inserts
  - Dynamic linking between user preferences and deals

- **Email Generation**
  - Fetch weekly relevant deals based on user preferences
  - Render personalized HTML emails using Handlebars templates
  - Weekly automated email delivery

- **Database Integration**
  - Supabase Postgres
  - Foreign keys and unique constraints for data integrity
  - Fully typed with TypeScript interfaces

## Project Structure

```

.
├── src/
│   ├── db.ts                  # Supabase connection
│   ├── ingestData.ts          # Scripts to ingest deal/user/product data
│   ├── sendEmails.ts          # Email generation and sending
│   ├── assets/
│   │   ├── data/              # Sample/test data
│   │   │   ├── sample-deal-data.json
│   │   │   ├── test-user-data.json
│   │   ├── email-temp/        # Email templates
│   │   │   ├── email-temp.html
│   │   │   ├── index.css
│   ├── cli/
│   │   └── sendWeekly.ts      # CLI entry point
│   └── types/
│       └── models.ts          # TypeScript type definitions
├── prisma.config.ts           # DB schema / migration log
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema (Supabase)

### Users

| Column               | Type      | Description                     |
|---------------------|-----------|---------------------------------|
| `id`                | uuid      | Primary key, Supabase gen_random_uuid() |
| `name`              | text      | User name                        |
| `email`             | text      | Email address                    |
| `preferred_retailers` | text[]   | List of preferred retailer names |

### Retailers

| Column | Type | Description  |
|--------|------|--------------|
| `id`   | uuid | Primary key  |
| `name` | text | Retailer name|

### Products

| Column     | Type | Description    |
|------------|------|----------------|
| `id`       | uuid | Primary key    |
| `name`     | text | Product name   |
| `size`     | text | Product size   |
| `category` | text | Product category|

### Deals

| Column       | Type           | Description                        |
|-------------|----------------|------------------------------------|
| `id`        | uuid           | Primary key                        |
| `retailer_id` | uuid         | Foreign key → `retailers.id`       |
| `product_id`  | uuid         | Foreign key → `products.id`        |
| `price`      | numeric(10,2)  | Deal price                          |
| `start_date` | date           | Deal start date                     |
| `end_date`   | date           | Deal end date                       |
| `created_at` | timestamp      | Record creation timestamp           |

Unique constraints ensure no duplicate deals are inserted.

## Architecture Overview

The pipeline consists of four main components: **Data Ingestion**, **Kafka Messaging**, **Redis Caching**, and **Email Rendering & Sending**.

```
     +--------------------+
     |   Source Data      |
     | JSON / CSV Files   |
     +---------+----------+
               |
               v
     +--------------------+
     |   Ingestion Script |
     |  (Node.js / TS)    |
     +---------+----------+
               |
               v
    ----------------------
   | Kafka Topics         |
   |  - deals.ingested    |
   |  - users.ingested    |
   |  - emails.jobs       |
   |  - emails.render     |
   |  - emails.send       |
    ----------------------
       |          |
       v          v
+---------------+  +----------------+
| Redis Cache   |  | Supabase DB    |
| (optional)    |  | Deals / Users  |
+-------+-------+  +--------+-------+
|                  |
+--------+---------+
|
v
+--------------------+
| Email Rendering    |
| (Handlebars HTML)  |
+---------+----------+
|
v
+--------------------+
|  Resend API        |
|  Email Delivery    |
+--------------------+

```

- **Data Ingestion**: Reads source JSON/CSV files, deduplicates, and publishes to Kafka topics.  
- **Kafka**: Handles message streaming for deals, users, and email jobs.  
- **Redis**: Optional caching layer for frequently accessed data.  
- **Supabase**: Stores normalized deals, products, retailers, and users.  
- **Email Rendering**: Handlebars templates generate personalized HTML emails.  
- **Resend API**: Sends the generated emails to users automatically.

## Environment Variables

Create a `.env` file in the project root:

```

# Redis configuration

REDIS_URL=redis://localhost:6379
REDIS_USERNAME=default
REDIS_PWD=your_redis_password
REDIS_SOCKET_HOST=your_redis_host
REDIS_SOCKET_PORT=your_redis_port

# Kafka configuration

KAFKA_BROKERS=your_kafka_broker:9092
KAFKA_TOPIC_DEALS=deals.ingested
KAFKA_TOPIC_USERS=users.ingested
KAFKA_TOPIC_EMAIL_JOB=emails.jobs
KAFKA_TOPIC_EMAIL_RENDER=emails.render
KAFKA_TOPIC_EMAIL_SEND=emails.send

# Supabase configuration

SUPABASE_URL=your_supabase_url
SUPABASE_SECRET_KEY=your_supabase_service_key
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Resend API key

RESEND_API_KEY=your_resend_api_key
````

### Notes

- Do not commit actual secrets to GitHub; replace with placeholder values.
- `REDIS_SOCKET_HOST` and `REDIS_SOCKET_PORT` are optional if using a local Redis instance.
- Kafka topics can be modified if needed.
- Supabase keys include both `SECRET_KEY` for server-side and `PUBLISHABLE_KEY` for client-side usage.
- Resend API key is used to send emails programmatically.

## Installation

Install dependencies:

```bash
npm install
````

## Run and Deployment

### Local Testing

**1. Ingest Data**

```bash
npx ts-node src/ingestData.ts
```

**2. Send Weekly Emails**

```bash
npm run send:weekly
```

## Sample Data

Located in `src/assets/data/`:

* `sample-deal-data.json`
* `test-user-data.json`

These files can be used to test the full pipeline locally.

## Email Template

Default template: `src/assets/email-temp/email-temp.html`
Supports dynamic variables using Handlebars.

## Project Goals

* Automate data cleaning and ingestion
* Weekly personalized deal email delivery
* Production-ready TypeScript + Supabase integration
* Modular, extensible workflow

## Future Ideas

* Scheduler with GitHub Actions / cron / Supabase triggers
* Web dashboard for deal insights
* Logging and alerting
* Multiple data source integration
