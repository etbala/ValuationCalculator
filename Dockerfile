# Build React app
FROM node:23 as frontend
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

# Serve React + Flask
FROM python:3.12-slim as backend
WORKDIR /app
COPY backend/ .
COPY --from=frontend /app/build ../frontend/build
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000
CMD ["python", "app.py"]
