# Intelligent Hospital Management System (IHMS)

IHMS is a modular Django 5 platform for hospital operations, clinical workflows, and AI-assisted analysis.
It provides REST APIs, web dashboards, scheduled/background processing with Celery, and containerized deployment with Docker.

## Core Capabilities

- Authentication and account management with role-aware permissions
- Patient lifecycle management (registration, records, clinical context)
- Doctor management and service coordination
- Appointment scheduling and task automation
- Billing and finance operations
- Pharmacy and laboratory workflow modules
- AI analysis features (chatbot, OCR pipeline, inference/feature processing)
- Notifications and dashboard aggregation
- Audit/history and structured logging support

## Technology Stack

- Python 3.x
- Django 5.2
- Django REST Framework + Simple JWT
- PostgreSQL
- Redis (cache + Celery broker)
- Celery worker + Celery beat
- Gunicorn + Nginx (Docker deployment)
- drf-yasg (Swagger)
- ML/AI libraries: TensorFlow, PyTorch, transformers, Whisper, scikit-learn, and related tooling

## High-Level Project Structure

- accounts/: users, auth flows, JWT serializers, permissions
- patients/: patient entities and APIs
- doctors/: doctor profiles, services, module APIs
- appointments/: booking, scheduling, async workflows
- billing/: billing models, selectors, APIs
- pharmacy/: pharmacy module APIs and domain logic
- laboratory/: lab records and lab operations
- ai_analysis/: AI APIs, chatbot, OCR, preprocessing, inference, tasks
- dashboard/: system and role dashboards, aggregation services
- notifications/: notification flows
- api/: shared/aggregated API endpoints, permissions, serializers
- hospital_ai/: Django settings, URL routing, ASGI/WSGI, Celery config
- templates/: server-rendered web views (login/dashboard/module views)
- scripts/: startup scripts for web/celery containers
- docker/: Nginx and deployment-related container config
- logs/, history/: operational logs, reports, historical artifacts
- media/, static/, staticfiles/: uploaded and static assets

## URL and API Overview

Main routes include:

- / : web login
- /dashboard/ : web dashboard
- /admin/ : Django admin
- /swagger/ : Swagger UI (permission protected)
- /api/accounts/
- /api/patients/
- /api/doctors/
- /api/appointments/
- /api/billing/
- /api/laboratory/
- /api/pharmacy/
- /api/ai-analysis/
- /api/dashboard/
- /api/notifications/
- /api/v1/ : consolidated API routes (including health endpoint)

## Local Development Setup

### 1) Create and activate a virtual environment

Windows PowerShell:

	python -m venv venv
	.\venv\Scripts\Activate.ps1

### 2) Install dependencies

	pip install -r requirements.txt

### 3) Configure environment variables

Create a .env file in the project root (same level as manage.py) and define at least:

- SECRET_KEY
- DEBUG
- ALLOWED_HOSTS
- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_HOST
- DB_PORT

Recommended additional variables:

- CORS_ALLOW_ALL_ORIGINS
- CORS_ALLOWED_ORIGINS
- CSRF_TRUSTED_ORIGINS
- SECURE_SSL_REDIRECT
- SESSION_COOKIE_SECURE
- CSRF_COOKIE_SECURE
- CELERY_BROKER_URL
- CACHES_DEFAULT_LOCATION

### 4) Apply migrations

	python manage.py migrate

### 5) Create admin user (optional but recommended)

	python manage.py createsuperuser

### 6) Run development server

	python manage.py runserver

Application URL: http://127.0.0.1:8000

## Running Background Workers (Local)

In separate terminals (with virtual environment activated):

Celery worker:

	celery -A hospital_ai worker -l info

Celery beat:

	celery -A hospital_ai beat -l info

## Docker Deployment

The included compose stack starts:

- web (Django/Gunicorn)
- db (PostgreSQL)
- redis
- celery-worker
- celery-beat
- nginx (public entry on port 8000)

Start stack:

	docker compose up --build -d

Check status:

	docker compose ps

View logs:

	docker compose logs -f web

Useful commands:

	docker compose exec web python manage.py migrate
	docker compose exec web python manage.py createsuperuser
	docker compose exec web python manage.py test
	docker compose down

For full details, see DOCKER_DEPLOYMENT.md.

## Testing

Run all tests:

	python manage.py test

If using pytest in your workflow:

	pytest

## Security and Operations Notes

- Do not commit .env or secret keys.
- Use strong production credentials and set DEBUG=False in production.
- Prefer managed DB/Redis and TLS termination for production environments.
- Keep model artifacts and large generated files outside source control where possible.
- Review logs and history directories regularly as part of operations and auditing.

## License / Usage

Add your project license and organization usage policy in this section if not already defined elsewhere.
