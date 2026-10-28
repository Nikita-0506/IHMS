# Intelligent Hospital Management System (IHMS)

![IHMS Logo](images/ihms_logo_icon.png)

**IHMS** is an enterprise-grade hospital management platform integrating clinical operations, appointment scheduling, laboratory/pharmacy workflows, billing, and **AI-powered clinical triage and patient deterioration prediction**.

Built with a **Django 5.2 REST Framework** backend, an interactive **React 19 + Vite** frontend, and containerized deployment with **Docker & Docker Compose**.

---

## 🌟 Key Capabilities

### 🩺 1. Clinical Suite & AI Diagnostics
- **Patient Deterioration & Triage Scoring**: Machine learning models trained on multi-parameter clinical datasets classifying patient monitoring into **Continuous**, **Enhanced**, or **Routine** care with composite deterioration risk metrics (**High**, **Moderate**, **Low**).
- **Doctor View Clinical Dashboard**: 5-section unified clinical overview (Current Condition, Relevant History, Alerts, Pending Actions, Source Documents) with automated abnormal vital sign threshold detections (SpO2, Blood Pressure, Heart Rate, GCS, Blood Glucose).
- **Smart Doctor Assignment Engine**: Automatically matches patients to doctors based on department, prior continuity of care, and real-time active queue balancing.
- **Clinical Priority Queue**: Real-time patient queuing with instant bypass rules for emergency critical trauma patients.
- **Individual Patient Report Portal**: Search, filter, inspect, and export standalone clinical reports (`/patients/reports/`).

### 🏥 2. Hospital Operations & Workflows
- **Role-Based Authentication**: Granular role-based access control for Admins, Doctors, Patients, Pharmacists, and Lab Technicians.
- **Patient Lifecycle Management**: Medical histories, triage level, admission tracking, and clinical observations.
- **Doctor Coordination & Roster**: Live on-duty statuses, department allocations, and service request tracking.
- **Appointment Scheduling**: Real-time status tracking (Scheduled, Completed, Cancelled).
- **Billing & Finance**: Invoices, transactions, discount tracking, and payment processing.
- **Pharmacy & Laboratory**: Medication stock management, lab orders, test results, and OCR prescription ingestion.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.11+, Django 5.2, Django REST Framework, SimpleJWT, Celery, Redis |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Proxy Routing |
| **Machine Learning** | Scikit-Learn, Random Forest, Joblib, Pandas, NumPy, XGBoost |
| **Databases** | SQLite (Zero-config local dev) / PostgreSQL 18.4 (Docker & Production) |
| **Documentation** | OpenAPI / Swagger UI (`/swagger/`), ReDoc (`/redoc/`) |
| **Deployment** | Docker, Docker Compose, Gunicorn, Nginx |

---

## 📁 Repository Structure

```text
IHMS/
├── accounts/               # User authentication, profiles, JWT serializers & permissions
├── ai_analysis/            # AI diagnostics, OCR scanner, chatbot assistant, risk engines
├── api/                    # Consolidated REST API endpoints, routing, and serializers
├── appointments/           # Appointment scheduling, booking, and history
├── billing/                # Invoicing, transactions, and billing workflows
├── dashboard/              # Analytics aggregation and role-based dashboard APIs
├── docker/                 # Nginx and container deployment configurations
├── doctors/                # Doctor rosters, department services, assignment coordination
├── frontend/               # Modern React 19 + Vite SPA frontend
│   ├── public/             # Static UI assets, logos, and doctor/patient avatars
│   ├── src/
│   │   ├── components/     # UI views (Referrals, Appointments, Lab, Doctors, Patients, etc.)
│   │   ├── data/           # Clinical dataset definitions and models
│   │   └── App.jsx         # Main application container and routing
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.js      # Vite build config & proxy to backend
├── hospital_ai/            # Django root settings, WSGI/ASGI, URLs, and Celery app
├── images/                 # Project UI showcase and brand assets
├── laboratory/             # Lab test orders, specimens, and report records
├── ml_models/              # Trained ML models (.joblib), training pipelines, and datasets
│   ├── datasets/           # 20-Sheets CSV healthcare dataset & clinical monitoring CSVs
│   ├── patient_monitoring/ # Triage, care unit & 20-sheets inference modules
│   └── trained_models/     # Exported model artifacts (.joblib)
├── notifications/          # Notification dispatching and event queues
├── patients/               # Patient records, clinical monitoring model, reports generator
├── pharmacy/               # Medication inventory, dispensing, and orders
├── reports/                # Generated patient clinical HTML/JSON reports
├── scripts/                # Startup, training, dataset generation, and test scripts
├── static/                 # CSS stylesheets, UI icons, and typography
├── templates/              # Server-rendered web portals and report templates
├── db.sqlite3              # Pre-seeded local SQLite development database
├── docker-compose.yml      # Multi-container orchestration stack
├── Dockerfile              # Backend container build definition
├── manage.py               # Django management CLI
└── requirements.txt        # Python backend and data science dependencies
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.11 or higher (Python 3.11 / 3.12 / 3.14 compatible)
- **Node.js**: v18.0 or higher & npm
- **Git**

---

### Step 1: Clone Repository & Configure Environment

Create a `.env` file in the project root:

```env
# General Django Settings
SECRET_KEY=your-secure-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (Set True for instant zero-config SQLite)
USE_SQLITE=True

# PostgreSQL Configuration (Used when USE_SQLITE=False)
DB_NAME=IHMS_Project
DB_USER=Root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=5432
```

---

### Step 2: Set Up Backend Virtual Environment

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate
```

---

### Step 3: Run the Development Servers

#### Option A: Run Backend & Frontend in Parallel Terminals

**Terminal 1 — Backend (Django):**
```powershell
python manage.py runserver 127.0.0.1:8000
```
Application Backend & APIs: **http://127.0.0.1:8000**

**Terminal 2 — Frontend (React / Vite):**
```powershell
cd frontend
npm install
npm run dev
```
Frontend UI Application: **http://localhost:5173**

*(Vite automatically proxies `/api` and `/patients` requests to the Django backend on port 8000).*

---

## 🔑 Default Demo Credentials

The included pre-seeded database contains accounts ready for testing:

| Role | Username | Password | Access / Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `Password@123` | Full administrative control, all modules & Django Admin |
| **Doctor** | `dr_sharma` | `Password@123` | Doctor dashboard, patient records, triage, coordination |
| **Doctor** | `dr_kulkarni` | `Password@123` | Clinical reviews, prescriptions, and lab orders |
| **Patient** | `rahul_patil` | `Password@123` | Patient dashboard, appointments, medical history |

---

## 🤖 Machine Learning & Clinical Validation

### Retrain ML Deterioration & Triage Models
To train the patient deterioration and triage classifiers from the 20-Sheets healthcare dataset:
```powershell
python scripts/train_20_sheets_ml_model.py
```

### Run Batch Clinical Predictions
To execute vectorized feature engineering and batch inference across patient records:
```powershell
python scripts/run_clinical_predictions.py
```

### Run the Validation Suite
To execute full integration tests across the doctor view, triage queue, and smart doctor assignment:
```powershell
python scripts/test_clinical_suite.py
```

---

## 📑 API Endpoints & Documentation

Interactive API documentation is generated via OpenAPI:
- **Swagger UI**: [http://127.0.0.1:8000/swagger/](http://127.0.0.1:8000/swagger/)
- **ReDoc UI**: [http://127.0.0.1:8000/redoc/](http://127.0.0.1:8000/redoc/)

### Core Endpoint Categories:
- `/api/accounts/`: Registration, JWT token obtain/refresh, user profiles.
- `/api/patients/`: Patient management, clinical monitoring lists, and predictions.
- `/api/doctors/`: Coordination rosters, active queues, and assignment recommendations.
- `/api/appointments/`: Booking, rescheduling, and status updates.
- `/api/billing/`: Invoice generation, payments, and summaries.
- `/api/laboratory/`: Lab orders, specimens, and test reports.
- `/api/pharmacy/`: Medicine inventory and prescription dispatching.
- `/api/ai-analysis/`: Doctor view summaries, triage queues, OCR prescription reading.
- `/patients/reports/`: Web portal for individual patient clinical reports.

---

## 🐳 Docker Deployment

To launch the complete containerized stack (Django, PostgreSQL 18, Redis, Celery Worker, Celery Beat, and Nginx):

```powershell
# Set USE_SQLITE=False in .env with your PostgreSQL credentials
docker compose up --build -d
```

Verify running containers:
```powershell
docker compose ps
curl http://localhost:8000/api/v1/health/
```

---

## 🛡️ Security & Operational Best Practices

1. Never commit `.env` or sensitive secret keys into version control.
2. Ensure `DEBUG=False` in production environments.
3. Review `logs/` regularly for application exceptions and audit logs.
4. Model artifacts (`.joblib`) are stored under `ml_models/trained_models/`.
