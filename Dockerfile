# Use a lightweight Python base image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy all project files into the container
COPY . /app

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Collect static files (optional, if using WhiteNoise)
RUN python manage.py collectstatic --noinput || true

# Set environment variable for Azure
ENV PORT=8000

# Start Daphne ASGI server
CMD ["python", "-m", "daphne", "-b", "0.0.0.0", "-p", "8000", "Phantom_Chess.asgi:application"]
