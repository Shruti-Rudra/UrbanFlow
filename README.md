# 🏙️ UrbanFlow: Production-Level Technical Documentation

This document provides a comprehensive, developer-ready guide to the UrbanFlow transit intelligence system. It covers everything from architectural theory to practical setup and troubleshooting.

---

## 📂 1. Complete Project Folder Structure

### High-Level Overview
```text
UrbanFlow/
├── backend/            # Node.js + Express API Gateway
├── frontend/           # React + Vite Client Dashboard
├── ml-service/         # Python + FastAPI Prediction Engine
└── info.text           # This technical documentation
```

### Detailed Structure
- **`backend/`**:
    - `src/config/`: Database connections, seed scripts, and environment configuration.
    - `src/controllers/`: Business logic for Auth, Transit, and Predictions.
    - `src/middlewares/`: JWT verification, RBAC (Role Based Access Control), and security headers.
    - `src/models/`: MongoDB schemas (User, Bus, Route, Station).
    - `src/routes/`: Express route definitions.
    - `src/services/`: External integrations (e.g., calling the ML microservice).
- **`frontend/`**:
    - `src/components/`: Reusable UI components (Map, Dashboard cards, Auth inputs).
    - `src/contexts/`: Global state providers for Authentication and Transit data.
    - `src/pages/`: Main screen views (Home, Dashboard, Login, Admin).
    - `src/services/`: Axios API clients.
- **`ml-service/`**:
    - `models/`: Trained `.pkl` files for the arrival time model.
    - `main.py`: The FastAPI server entry point.
    - `requirements.txt`: Python dependency list.

---

## ⚙️ 2. Step-by-Step Project Setup & Run Guide

### Step 1: Initialize ML Service (Python)
1. Navigate to `ml-service/`.
2. Create virtual environment & activate it.
3. Install dependencies: `pip install -r requirements.txt`.
4. Run server: `uvicorn main:app --reload --port 8000`.

### Step 2: Initialize Backend (Node.js)
1. Navigate to `backend/`.
2. Install dependencies: `npm install`.
3. Configure `.env` with `MONGO_URI` and `JWT_SECRET`.
4. Run server: `npm run dev`.

### Step 3: Initialize Frontend (React)
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Start UI: `npm run dev`.

---

## 🔌 3. Ports & Service Mapping
| Service | Port | Description |
| :-- | :-- | :-- |
| **Frontend** | `5173` | The User Interface. Hits port 5000 for data. |
| **Backend** | `5000` | The API Gateway. Connects to MongoDB and Hits port 8000 for ML. |
| **ML Service** | `8000` | The Prediction Engine. Receives distance data, returns ETAs. |

---

## ⏱️ 4. API Testing Examples (Testing ETAs)
```bash
curl -X POST http://localhost:5000/api/predict \
-H "Content-Type: application/json" \
-d '{ "Route_Name": "R-102", "Distance_km": 5.2, "Weather": "Sunny", "Is_Peak_Hour": 1 }'
```

---

## 🧠 5. Smart City Intelligence (Advanced Features)

### Transit Intelligence Core
The system features a real-time monitor panel that tracks:
- **Network Pulse**: Active vs. Idle bus fleet ratio.
- **Environmental Context**: Simulated weather (Sunny/Rainy) which actively affects ML ETA predictions.
- **Traffic Modeling**: Dynamic congestion levels (Low/Medium/High) factored into prediction vectors.

### Infrastructure Search
A localized search engine is integrated into the Sidebar, allowing users to find any Surat station by code (e.g., `SUR-101`) or name, instantly focusing the map.

---

## 🛡️ 6. RBAC & Admin Operations
UrbanFlow implements strict **Role-Based Access Control**:
- **User Role**: Access to Dashboard, Map, and Personal Tracking.
- **Admin Role**: Exclusive access to the **System Control Center**, which allows full **CRUD (Create, Read, Update, Delete)** operations on Fleet, Routes, and Infrastructure.

---

## 🧪 7. Common Bugs & Fixes
| Issue | Cause | Fix |
| :-- | :-- | :-- |
| **Map Snap-Back** | Re-centering logic firing on every re-render. | Check `initialCenterSet` flag before centering. |
| **503 Predict Error** | FastAPI is not running. | Verify `uvicorn` process is active on port 8000. |
| **Auth Fail (401)** | Token expired or invalid. | Clear localStorage/Cookies and re-authenticate via OTP. |

---

## 🖼️ 8. UI Architecture
The app follows a **Premium Glassmorphism** design system with:
- **Responsive Navbar**: Context-aware branding for Surat Metropolitan.
- **Smart Sidebar**: Houses the search hub and navigation tree.
- **Live Map**: Real-time vector-based vehicle interpolation.
  
## 9. run the project
**in cmd run this it will open the jupyter notbook**
pip install notebook pandas scikit-learn matplotlib seaborn
jupyter notebook

**Run the project**
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

cd backend
npm install 
npm start

cd frontend
npm install 
npm run dev

admin 
Email : admin@urbanflow.com
Password : password123
---

**UrbanFlow Technical Documentation v1.2 | 2026**
