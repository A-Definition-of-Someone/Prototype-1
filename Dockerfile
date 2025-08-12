# Use a slim Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Expose Daphne port
EXPOSE 8000

# Set Azure port environment variable
ENV WEBSITES_PORT=8000

# Start Daphne with your ASGI app
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "Phantom_Chess.asgi:application"]
