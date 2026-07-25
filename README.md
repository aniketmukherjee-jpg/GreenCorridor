# GreenCorridor 🚑🚦

GreenCorridor is a next-generation, AI-driven Emergency Vehicle Routing and Dynamic Traffic Signal Preemption platform. The application synchronizes citizens, hospital dispatch centers, ambulance drivers, and traffic police to guarantee uninterrupted transit corridors (green traffic signals) for emergency vehicles, saving critical minutes during life-threatening events.

---

## 🚀 Key Features

*   **🗺️ Citizen Incident Reporting:** Interactive map (Leaflet) allowing the public to drop location pins and report accidents, pothole obstructions, or floods with severity details.
*   **🏥 Hospital Dispatch Panel:** Triage coordinators can track patient severity, check real-time resource occupancy (beds, oxygen, vehicles), and assign/dispatch units.
*   **🚑 Driver Navigation Console:** Mounted dashboard displaying live turn-by-turn routing, dynamic ETA estimation, and real-time corridor status indicators.
*   **🛡️ Traffic Police Override:** Visual municipal map with live GPS vehicle locations and manual traffic signal override buttons to clear congestion ahead of ambulances.
*   **📈 Municipal Admin Dashboard:** Secured analytics center visualizing response times, dispatch metrics, and resource graphs (built with Recharts), protected by an admin security key.
*   **⚡ Developer Presentation Features:**
    *   **Global Command Palette (`Ctrl + K` or `Cmd + K`):** Quick overlay dialog to jump between roles and dashboard pages.
    *   **Cinematic Demo Mode (`Ctrl + Shift + P`):** Runs an automated 34-second demonstration script showcasing a live end-to-end dispatch and routing scenario.
    *   **Mock Database Seeder (`Ctrl + Shift + D`):** Instantly populates the local client database with sample incidents, active corridors, and vehicles.
    *   **Smooth Preloader Screen:** Eliminates browser page refresh flicker and introduces a dark loading logo screen.

---

## 🛠️ Technology Stack

### Frontend (SPA)
*   **Framework:** React 19 (via Vite)
*   **Styling:** Tailwind CSS v4 & PostCSS (for modern, dark-mode glassmorphic layouts)
*   **Interactive Maps:** Leaflet & React-Leaflet
*   **Data Visualization:** Recharts
*   **Routing & State:** React Router DOM v7 & Context Providers (`SimulationContext`, `ToastContext`, `ThemeContext`)

### Backend (REST API)
*   **Framework:** Django 6.0 & Django REST Framework (DRF)
*   **Authentication:** JWT (JSON Web Tokens) via `rest_framework_simplejwt`
*   **Database:** SQLite (development database with PostGIS compatibility)
*   **CORS Configuration:** Enabled via `corsheaders` for seamless client connection

---

## 📂 Project Structure

```text
GreenCorridor/
├── backend/
│   ├── core/                  # Django project settings & main URLs
│   ├── users/                 # Custom User Model & RBAC roles
│   ├── reports/               # Incident Report models, views, and APIs
│   ├── missions/              # Hospital, Ambulance, & Emergency Mission management
│   ├── police/                # Police zones, alerts, and manual overrides
│   ├── manage.py              # Django manager command-line tool
│   └── db.sqlite3             # Pre-seeded database file
├── frontend/
│   ├── src/
│   │   ├── components/        # Dashboards (Admin, Analytics, Driver, Hospital, Police, Map)
│   │   ├── context/           # SimulationContext & ToastContext providers
│   │   ├── contexts/          # ThemeContext provider
│   │   ├── mock/              # Client fallback seed records
│   │   ├── App.jsx            # Main Router & Provider tree wrapper
│   │   └── main.jsx           # ReactDOM renderer entry point
│   ├── package.json           # Frontend dependencies & package build scripts
│   └── vite.config.js         # Build tooling config
├── docker-compose.yml         # Container definitions (PostgreSQL/PostGIS, Redis)
└── README.md                  # System Documentation
```

---

## ⚙️ Prerequisites

To run this project locally, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python](https://www.python.org/) (v3.10+)
*   [Git](https://git-scm.com/)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/aniketmukherjee-jpg/GreenCorridor.git
cd GreenCorridor
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install django djangorestframework rest_framework_simplejwt django-cors-headers opencv-python-headless numpy
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the backend server:
   ```bash
   python manage.py runserver
   ```
   The backend server will run on `http://127.0.0.1:8000/`.

### 3. Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend app will run on `http://localhost:5173/` (or the next available port).

---

## 🔑 Administrative Credentials
To access the **Admin Analytics Console** (`/admin`), you can register a new admin account. To authorize, use the system's protected key:
*   **Admin Authorization Key:** `ADMIN2026`

---

## 🔌 Core API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login/` | `POST` | Generate JWT access and refresh token pair |
| `/api/auth/refresh/` | `POST` | Refresh access token |
| `/api/reports/` | `GET/POST` | Fetch or submit incident reports (coordinates, category, description) |
| `/api/reports/<id>/confirm/` | `POST` | Increment community validation count for an incident |
| `/api/missions/` | `GET/POST` | Retrieve active ambulance mission lists or dispatch units |
| `/api/police/alerts/` | `GET` | Retrieve live traffic zone alerts |

---

## 🛠️ Troubleshooting

*   **Vite Hot-Reload Lag:** If page changes do not render instantly on save, perform a hard reload on your browser tab (`Ctrl + F5` or `Cmd + Shift + R`).
*   **Leaflet Map Tiles Missing:** Verify your internet connection, as Leaflet tiles are fetched dynamically from CartoCDN.
*   **CORS Conflicts:** The Django configuration is pre-configured to allow all origins (`CORS_ALLOW_ALL_ORIGINS = True`) for rapid development. For production environments, configure specific origins inside `settings.py`.
