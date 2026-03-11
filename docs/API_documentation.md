# Payment Gateway API Documentation

Base URL:
http://localhost:8000

---

## Authentication

All API endpoints (except `/health`) require these headers:

X-Api-Key: key_test_abc123  
X-Api-Secret: secret_test_xyz789

---

## Health Check

GET /health

Response (200):
```
{
  "status": "healthy",
  "database": "connected"
}
```

---

## Create Order

POST /api/v1/orders

Headers:
X-Api-Key, X-Api-Secret

Request Body:
```
{
  "amount": 500
}
```

Response (201):
```
{
  "id": "order_xxxxxxxxxxxxxxxx",
  "status": "created"
}
```

---

## Create Payment (UPI)

POST /api/v1/payments

Request Body:
```
{
  "order_id": "order_xxxxxxxxxxxxxxxx",
  "method": "upi",
  "vpa": "test@upi"
}
```

Response:
```
{
  "id": "pay_xxxxxxxxxxxxxxxx",
  "status": "processing"
}
```

---

## Create Payment (Card)

POST /api/v1/payments

Request Body:
```
{
  "order_id": "order_xxxxxxxxxxxxxxxx",
  "method": "card",
  "card": {
    "number": "4111111111111111",
    "exp_month": "12",
    "exp_year": "2028",
    "cvv": "123"
  }
}
```

---

## Get Payment Status

GET /api/v1/payments/{payment_id}

Response:
```
{
  "id": "pay_xxxx",
  "status": "success"
}
```

---

## List All Payments (Merchant)

GET /api/v1/payments

Response:
```
[
  {
    "id": "pay_xxxx",
    "order_id": "order_xxxx",
    "status": "success"
  }
]
```
