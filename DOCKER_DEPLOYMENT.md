# IHMS Docker Deployment Guide

## Services
- `web`: Django + Gunicorn application
- `db`: PostgreSQL database
- `redis`: Redis broker/cache
- `celery-worker`: background task worker
- `celery-beat`: periodic task scheduler
- `nginx`: reverse proxy and static/media serving

## Prerequisites
- Docker Engine 24+
- Docker Compose v2+

## Quick Start
1. Create environment file:
   - Copy `.env.docker.example` to `.env`
   - Update secrets and credentials

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

## Production Notes
- Set `DEBUG=False`
- Use strong `SECRET_KEY`
- Use managed PostgreSQL and Redis in cloud environments
- Add TLS termination (Nginx with certificates or cloud load balancer)
- Configure centralized logging and backup strategy

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

# Stop and remove volumes
docker compose down -v
```
