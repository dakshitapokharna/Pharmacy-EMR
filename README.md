# Pharmacy EMR

A simple pharmacy management system to handle inventory, sales, and dashboard analytics.

**Live Demo:** [https://pharmacy-emr-rose.vercel.app/](https://pharmacy-emr-rose.vercel.app/)

---

## Project Structure

```
pharmacy-emr/
├── backend/      # Python REST API (FastAPI + SQLite)
└── frontend/     # React app (Vite + React Router)
└── Readme.md  
```


---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Axios |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | SQLite |
| Hosting | Vercel (frontend) |

---

## REST API Structure

Base URL: `http://127.0.0.1:8000`

### Medicines `/medicines`

| Method | Endpoint | What it does |
|---|---|---|
| `GET` | `/medicines/` | Get all medicines (supports `?search=` and `?status=` filters) |
| `POST` | `/medicines/` | Add a new medicine |
| `PUT` | `/medicines/{id}` | Update a medicine |
| `DELETE` | `/medicines/{id}` | Delete a medicine |

### Sales `/sales`

| Method | Endpoint | What it does |
|---|---|---|
| `POST` | `/sales/` | Record a new sale |
| `GET` | `/sales/` | Get all past sales |

### Dashboard `/dashboard`

| Method | Endpoint | What it does |
|---|---|---|
| `GET` | `/dashboard/today-sales` | Total sales amount for today |
| `GET` | `/dashboard/items-sold` | Total items sold today |
| `GET` | `/dashboard/low-stock` | List of low stock medicines |
| `GET` | `/dashboard/summary` | Total medicine count + inventory value |
| `GET` | `/dashboard/recent-sales` | Last 5 sales |

---

## How Data Consistency Works

When a sale is recorded (`POST /sales`), the backend does a few things atomically:

1. Checks if the medicine exists — returns 404 if not
2. Checks if there's enough stock — returns 400 if not
3. Deducts the sold quantity from inventory
4. Recalculates and updates the medicine status automatically:
   - `Expired` — if expiry date has passed
   - `Out of Stock` — if quantity hits 0
   - `Low Stock` — if quantity drops below 10
   - `Active` — otherwise
5. Saves the sale record with invoice number, amount, and date

All of this happens in a single database transaction, so the inventory and sale records are always in sync.

Similarly, when adding or updating a medicine (`POST` / `PUT`), the status is recalculated based on quantity and expiry — it's never manually set by the user.

---


## Live Backend API

Interactive API Docs (Swagger):  `https://pharmacy-emr1.onrender.com/docs`


## Running Locally

### Backend

```bash
cd backend
pip install fastapi uvicorn sqlalchemy pydantic
uvicorn main:app --reload
```

API will be live at `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App will open at `http://localhost:5173`

---

## Features

- Add, edit, delete medicines
- Auto status tracking (Active / Low Stock / Out of Stock / Expired)
- Sales billing with live stock deduction
- Dashboard with today's stats
- Search and filter inventory
- Export inventory to CSV
