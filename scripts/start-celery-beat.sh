#!/bin/sh
set -e

python scripts/wait_for_services.py

exec celery -A hospital_ai beat --loglevel=info
