# IHMS Docker Deployment Guide

## Services
- `web`: Django + Gunicorn application
- `db`: PostgreSQL 18.4 database
- `redis`: Redis broker/cache
- `celery-worker`: background task worker
- `celery-beat`: periodic task scheduler
- `nginx`: reverse proxy and static/media serving

## Prerequisites
- Docker Engine 24+
- Docker Compose v2+

## Quick Start
1. Create a root `.env` file and set `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. Keep credentials private; Compose uses the database values for PostgreSQL and configures containers to connect to the `db` service.

2. Build and run stack:
```bash
docker compose up --build -d
```

3. Check service status:
```bash
docker compose ps
```

4. View logs:
```bash
docker compose logs -f web
```

5. Access application:
- App URL: `http://localhost:8000`
- Health URL: `http://localhost:8000/api/v1/health/`

The Compose stack includes PostgreSQL and Redis; it does not include MongoDB. ML datasets are read from CSV files in the project tree. Adding a MongoDB or external API integration requires application configuration and code, not only environment credentials.

PostgreSQL 18.4 stores its cluster in a versioned directory in a new `postgres_data_v18` volume. The previous PostgreSQL 16 volume is left untouched, but PostgreSQL does not migrate it automatically; migrate and back up existing database contents separately before relying on them.

## Production Notes
- Set `DEBUG=False`
- Use strong `SECRET_KEY`
- Use managed PostgreSQL and Redis in cloud environments
- Add TLS termination (Nginx with certificates or cloud load balancer)
- Configure centralized logging and backup strategy

## Patient Clinical Monitoring & Individual Reports (Docker)

All individual patient reports are stored in `/app/reports/patients/` inside the container and mounted directly to `./reports/patients/` on the host.

```bash
# 1. Generate individual report for a specific patient
docker compose exec web python manage.py generate_patient_reports --patient-id PAT-000001

# 2. Batch generate reports for patients (e.g. top 50 or by Care Unit)
docker compose exec web python manage.py generate_patient_reports --all --limit 50
docker compose exec web python manage.py generate_patient_reports --all --unit ICU

# 3. View Reports in Browser (Portal & Individual Reports)
# Portal:             http://localhost:8000/patients/reports/
# Individual Patient: http://localhost:8000/patients/reports/PAT-000001/
# Download HTML/PDF:  http://localhost:8000/patients/reports/PAT-000001/download/

# 4. Copy generated reports from Docker container to local machine:
docker cp ihms-web:/app/reports ./exported_reports
```

## Common Commands
```bash
# Apply migrations
docker compose exec web python manage.py migrate

# Create superuser
docker compose exec web python manage.py createsuperuser

# Run tests
docker compose exec web python manage.py test

# Stop stack
docker compose down

# WARNING: remove this deployment's named volumes, including its database contents
docker compose down -v
```

