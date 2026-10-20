
import json
import os
import time
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode
from urllib.request import urlopen

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

PROMETHEUS_URL = os.getenv(
    "PROMETHEUS_URL",
    "http://localhost:9090",
)

app = FastAPI(
    title="PulseCheck API",
    description="Performance testing and monitoring platform",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def prometheus_request(endpoint: str, params: dict):
    url = f"{PROMETHEUS_URL}{endpoint}?{urlencode(params)}"

    try:
        with urlopen(url, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))

        if payload.get("status") != "success":
            return None

        return payload.get("data")

    except (URLError, HTTPError, TimeoutError, ValueError):
        return None


def query_instant(query: str):
    data = prometheus_request(
        "/api/v1/query",
        {"query": query},
    )

    if not data:
        return None

    results = data.get("result", [])

    if not results:
        return None

    try:
        return float(results[0]["value"][1])
    except (KeyError, IndexError, TypeError, ValueError):
        return None


def query_recent_sample(query: str, lookback_seconds: int = 900):
    end = int(time.time())
    start = end - lookback_seconds

    data = prometheus_request(
        "/api/v1/query_range",
        {
            "query": query,
            "start": start,
            "end": end,
            "step": 15,
        },
    )

    if not data:
        return None

    results = data.get("result", [])

    if not results:
        return None

    # Select the most recent sample across returned series.
    latest_sample = None

    for series in results:
        for sample in series.get("values", []):
            try:
                timestamp = float(sample[0])
                value = float(sample[1])

                if latest_sample is None or timestamp > latest_sample[0]:
                    latest_sample = (timestamp, value)
            except (TypeError, ValueError, IndexError):
                continue

    if latest_sample is None:
        return None

    return latest_sample


@app.get("/")
def root():
    return {
        "message": "Welcome to PulseCheck API",
        "status": "running",
        "version": "0.3.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "pulsecheck-backend",
    }


@app.get("/api/overview")
def get_overview():
    # The request counter is cumulative; use a rate over its recent samples.
    request_rate = query_instant(
        "sum(rate(k6_http_reqs_total[5m]))"
    )

    # Read recent samples if an instant query has no result.
    p95_sample = query_recent_sample("k6_http_req_duration_p95")
    failed_sample = query_recent_sample("k6_http_req_failed_rate")

    # VUs should represent a current sample, not a completed run's last value.
    vus_sample = query_recent_sample("k6_vus", lookback_seconds=60)

    p95_seconds = (
        query_instant("max(k6_http_req_duration_p95)")
        if p95_sample is None
        else p95_sample[1]
    )

    failed_rate = (
        query_instant("max(k6_http_req_failed_rate)")
        if failed_sample is None
        else failed_sample[1]
    )

    active_vus = (
        vus_sample[1]
        if vus_sample is not None
        else 0
    )

    has_metrics = any(
        value is not None
        for value in [
            request_rate,
            p95_seconds,
            failed_rate,
            vus_sample[1] if vus_sample else None,
        ]
    )

    return {
        "request_rate": round(request_rate, 2)
        if request_rate is not None else None,
        "p95_latency_ms": round(p95_seconds * 1000, 2)
        if p95_seconds is not None else None,
        "failed_requests_percent": round(failed_rate * 100, 2)
        if failed_rate is not None else None,
        "active_vus": int(active_vus),
        "prometheus_connected": True,
        "message": (
            "Metrics retrieved from Prometheus"
            if has_metrics
            else "No recent metric samples available"
        ),
    }
