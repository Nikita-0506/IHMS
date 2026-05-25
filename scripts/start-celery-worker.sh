#!/bin/sh
set -e

python scripts/wait_for_services.py

exec celery -A hospital_ai worker --loglevel=info --pool=solo
