# =========================================================
# Base Python Image
# =========================================================
FROM python:3.11-slim

# =========================================================
# Build Arguments
# =========================================================
ARG OCR_PACKAGE=tesseract-ocr

# =========================================================
# Environment Variables
# =========================================================
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HOME=/home/ihms

# =========================================================
# Set Working Directory
# =========================================================
WORKDIR /app

# =========================================================
# Install System Dependencies
# =========================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    ffmpeg \
    libsndfile1 \
    ${OCR_PACKAGE} \
    curl \
    && rm -rf /var/lib/apt/lists/*

# =========================================================
# Copy Requirements File
# =========================================================
COPY requirements.txt .

# =========================================================
# ---------------------------------------------------------
# Install Python Dependencies
# =========================================================
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

# =========================================================
# Copy Project Files
# =========================================================
COPY . .

# =========================================================
# Create Required Application Directories
# =========================================================
RUN mkdir -p /app/logs /app/media /app/staticfiles /app/history

# =========================================================
# Create Non-Root User for Security
# =========================================================
RUN addgroup --system ihms && \
    adduser --system --home /home/ihms --shell /bin/sh --ingroup ihms ihms && \
    mkdir -p /home/ihms && \
    chown -R ihms:ihms /app /home/ihms

# =========================================================
# Create Non-Root User for Security
# =========================================================
USER ihms

# =========================================================
# Expose Application Port
# =========================================================
EXPOSE 8000

# =========================================================
# Start Application
# =========================================================
CMD ["sh", "scripts/start-web.sh"]

