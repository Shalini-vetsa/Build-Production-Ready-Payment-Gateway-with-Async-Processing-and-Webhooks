# System Architecture

## Components

1. Checkout UI (React + Vite)
   - Port: 3001
   - Used by customers to complete payment

2. Merchant Dashboard UI (React + Vite)
   - Port: 3002
   - Used by merchants to view orders & payments

3. Backend API (Node.js + Express)
   - Port: 8000
   - Handles authentication, orders, payments, webhooks

4. Database (PostgreSQL)
   - Stores merchants, orders, payments

---

## Data Flow

Merchant
→ Dashboard UI
→ Backend API
→ PostgreSQL

Customer
→ Checkout UI
→ Backend API
→ PostgreSQL

Payment Processing
→ processing
→ success / failed (async simulation)

---

## Deployment

All services run using:
docker-compose up -d
