#!/bin/bash
set -e


WORKERS=${WEB_CONCURRENCY:-2}
echo "Starting Uvicorn server with $WORKERS workers..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers $WORKERS
