
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="PulseCheck API",
    description="Performance testing and monitoring platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to PulseCheck API",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "pulsecheck-backend",
    }


@app.get("/api/overview")
def get_overview():
    return {
        "request_rate": None,
        "p95_latency_ms": None,
        "failed_requests_percent": None,
        "active_vus": 0,
        "message": "No test data available yet",
    }
