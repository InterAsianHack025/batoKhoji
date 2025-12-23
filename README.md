# 🚌 बाटो भेटियो (batoVetiyo) — Kathmandu Bus Navigator

**“I was lost, now I found the way.”**

---

##  Problem Statement
In Kathmandu, millions rely on buses daily, but with no digital maps or real-time information, commuters are often left:
-  Confused about which bus to take  
-  Delayed due to missed routes  
-  Dependent on word-of-mouth guidance  
- Tourists and newcomers struggle even more since **no centralized source of information exists** in English or Nepali  

---

##  Solution
**बाटो भेटियो (batoVetiyo)** is a web app that serves as a **digital guide for public transport in Kathmandu**.  

It helps users by providing:
-  Nearby bus stops based on current location  
-  Best bus routes to reach any destination  
-  Estimated fares and travel times  
-  Multi-language support (English & Nepali)  
-  Travel reminders and suggestions for frequent commuters  

---

## Key Features
-  Show nearby bus stops and routes using geolocation
-  Route planner with turn-by-turn stops and walking directions
-  Estimated travel time and fares
-  Reminders/notifications for upcoming trips
-  English & Nepali localization
- Progressive-friendly UI with caching for low-connectivity areas

---

##  Tech Stack
- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **Database:** (seeded) SQL (Postgres / MySQL recommended)
- **Maps:** Google Maps / OpenStreetMap (configurable)

---

##  Repository Structure
- `/frontend` — React app (Vite)
- `/backend` — Express server, route definitions, DB seed
- `/frontend/src/components` — UI components and utilities

---

##  Getting Started (Local)
Prerequisites: Node.js (v18+), npm, optionally a SQL DB.

1. Clone the repo

   ```bash
   git clone https://github.com/InterAsianHack025/batoKhoji.git
   cd batoKhoji
   ```

2. Backend

   ```bash
   cd backend
   npm install
   # create .env with DB and API keys (see .env.example if provided)
   node db_seed.js       # populate seed data (optional)
   npm run dev           # or `node server.js` if not using nodemon
   ```

3. Frontend

   ```bash
   cd ../frontend
   npm install
   npm run dev           # starts Vite dev server
   ```

Open the frontend at the address printed by Vite (usually http://localhost:5173).

---

##  Environment & Config
- Add map API keys and DB connection string to the backend `.env` (example keys: `MAP_API_KEY`, `DATABASE_URL`)
- Frontend may require a `.env` with `VITE_API_BASE` pointing to the backend

---

##  How to Test
- Manual: use the UI to plan routes, verify stops, and test language toggles
- Backend: test API endpoints in `/backend/bus_routes.js` using Postman or curl


---

## Hackathon Acknowledgement
Built at **AsianHack 2025** hosted by the **Asian School of Science and Management**  a collaborative effort to improve Kathmandu’s public transport experience.

---

##  Contact / Maintainers
- Project team: Anushka Hadkhale, Harina Khati, Luna Dahal, Rinju Pokhrel
- Repo: https://github.com/InterAsianHack025/batoKhoji

---