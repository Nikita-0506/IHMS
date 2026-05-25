#!/bin/sh
set -e

python scripts/wait_for_services.py

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn hospital_ai.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120 --worker-tmp-dir /tmp --access-logfile - --error-logfile -
