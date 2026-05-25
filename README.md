# Hospital AI Management System (IHMS)

A Django-based hospital management platform with AI-assisted analysis modules.

## Features

- User/account management with role-based access
- Patient, doctor, appointment, billing, laboratory, and dashboard modules
- AI analysis services (chatbot, OCR scanner, inference pipelines)
- Background task support (Celery)
- Docker-based deployment support

## Tech Stack

- Python
- Django + Django REST Framework
- Celery
- Docker + Docker Compose

## Project Structure

- `accounts/` - authentication, users, permissions
- `appointments/` - appointment workflows
- `billing/` - billing and invoice operations
- `doctors/` - doctor profiles and services
- `patients/` - patient records and management
- `laboratory/` - lab workflows and reports
- `dashboard/` - dashboard and aggregation services
- `ai_analysis/` - AI features and model-facing APIs
- `hospital_ai/` - core Django settings and routing

## Local Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Apply database migrations:

```bash
python manage.py migrate
```

4. Run the development server:

```bash
python manage.py runserver
```

## Docker Setup

Run with Docker Compose:

```bash
docker-compose up --build
```

See `DOCKER_DEPLOYMENT.md` for deployment details.

## Environment Variables

Create a `.env` file for local configuration (database, secret keys, external service credentials, etc.).

## Testing

Run tests with:

```bash
python manage.py test
```

## Notes

- Keep secrets out of source control.
- Store large model files and generated artifacts outside Git-tracked paths when possible.
