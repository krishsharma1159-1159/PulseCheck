
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'
const REFRESH_INTERVAL = 5000

const navigation = [
  { label: 'Overview', icon: '▦', active: true },
  { label: 'Test runs', icon: '↗', active: false },
  { label: 'Targets', icon: '◎', active: false },
  { label: 'Thresholds', icon: '⌁', active: false },
]

const initialMetrics = [
  { label: 'HTTP REQUEST RATE', value: '—', unit: 'req/s' },
  { label: 'P95 LATENCY', value: '—', unit: 'ms' },
  { label: 'FAILED REQUESTS', value: '—', unit: '%' },
  { label: 'ACTIVE VUS', value: '0', unit: 'users' },
]

function App() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [overview, setOverview] = useState(null)
  const [apiError, setApiError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    let cancelled = false
    let requestInProgress = false

    async function fetchOverview() {
      if (requestInProgress) return

      requestInProgress = true

      try {
        const [healthResponse, overviewResponse] = await Promise.all([
          fetch(`${API_URL}/api/health`),
          fetch(`${API_URL}/api/overview`),
        ])

        if (!healthResponse.ok || !overviewResponse.ok) {
          throw new Error('Backend returned an unsuccessful response.')
        }

        const healthData = await healthResponse.json()
        const overviewData = await overviewResponse.json()

        if (cancelled) return

        setApiStatus(
          healthData.status === 'healthy' ? 'connected' : 'error',
        )
        setOverview(overviewData)
        setApiError('')
        setLastUpdated(new Date())
      } catch {
        if (!cancelled) {
          setApiStatus('error')
          setApiError(
            'Could not reach the backend. Check that FastAPI and Prometheus are running.',
          )
        }
      } finally {
        requestInProgress = false
      }
    }

    fetchOverview()

    const intervalId = setInterval(fetchOverview, REFRESH_INTERVAL)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [])

  const metricValues = {
    'HTTP REQUEST RATE': overview?.request_rate,
    'P95 LATENCY': overview?.p95_latency_ms,
    'FAILED REQUESTS': overview?.failed_requests_percent,
    'ACTIVE VUS': overview?.active_vus,
  }

  const metrics = initialMetrics.map((metric) => {
    const value = metricValues[metric.label]

    return {
      ...metric,
      value: value == null ? metric.value : String(value),
      note:
        value == null
          ? metric.label === 'ACTIVE VUS'
            ? 'No current sample'
            : 'Waiting for metric data'
          : 'Received from Prometheus',
    }
  })

  const formattedUpdate = lastUpdated
    ? lastUpdated.toLocaleTimeString()
    : 'Waiting for first response'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark">P</span>
          <span>
            <strong>PulseCheck</strong>
            <small>LOAD TESTING PLATFORM</small>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <div className="workspace-switcher">
          <span className="workspace-avatar">D</span>
          <span className="workspace-name">
            <strong>Development</strong>
            <small>Local workspace</small>
          </span>
          <span className="switcher-chevron">⌄</span>
        </div>

        <div className="nav-section-label">MONITORING</div>

        <nav className="navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <a
              key={item.label}
              className={`nav-link ${item.active ? 'active' : ''}`}
              href={item.label === 'Test runs' ? '#test-runs' : '#overview'}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span
              className={`status-indicator ${
                apiStatus === 'connected' ? 'online' : 'idle'
              }`}
            />
            <span>
              <strong>
                {apiStatus === 'checking'
                  ? 'Checking backend'
                  : apiStatus === 'connected'
                    ? 'Backend connected'
                    : 'Backend unavailable'}
              </strong>
              <small>
                {apiStatus === 'connected'
                  ? 'FastAPI health check passed'
                  : apiStatus === 'checking'
                    ? 'Checking API connection'
                    : 'Check the local API server'}
              </small>
            </span>
          </div>

          <div className="sidebar-version">
            <span>PulseCheck</span>
            <span>LOCAL DEV</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Overview</strong>
          </div>

          <div className="topbar-meta">
            <span className="connection-label">
              <span
                className={`status-indicator ${
                  apiStatus === 'connected' ? 'online' : 'idle'
                }`}
              />
              {apiStatus === 'connected'
                ? 'API connected'
                : apiStatus === 'checking'
                  ? 'Connecting...'
                  : 'API disconnected'}
            </span>

            <span className="user-avatar" aria-label="Local user">
              PC
            </span>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <div className="section-kicker">PERFORMANCE / OVERVIEW</div>
            <h1>Overview</h1>
            <p>Inspect test execution and application performance.</p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() =>
              document
                .getElementById('test-runs')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <span>＋</span> View test runs
          </button>
        </section>

        {apiError && (
          <div className="api-error" role="alert">
            {apiError}
          </div>
        )}

        <section
          className="metrics-grid"
          aria-label="Current performance metrics"
        >
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <div className="metric-label">{metric.label}</div>

              <div className="metric-reading">
                <strong>{metric.value}</strong>
                <span>{metric.unit}</span>
              </div>

              <div className="metric-note">
                <span
                  className={`status-indicator ${
                    apiStatus === 'connected' ? 'online' : 'idle'
                  }`}
                />
                {metric.note}
              </div>
            </article>
          ))}
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Request metrics</h2>
              <p>Time-series data from the selected test run</p>
            </div>

            <span className="panel-tag">
              {apiStatus === 'connected' && overview
                ? 'API CONNECTED'
                : 'NO DATA'}
            </span>
          </div>

          <div className="empty-chart">
            <div className="empty-chart-icon">⌁</div>
            <strong>No time-series chart available</strong>
            <p>
              {overview?.message ||
                'Waiting for performance metrics from Prometheus.'}
            </p>
            <p>Last updated: {formattedUpdate}</p>
            <p>Refresh interval: 5 seconds</p>
          </div>
        </section>

        <section className="panel runs-panel" id="test-runs">
          <div className="panel-heading">
            <div>
              <h2>Test runs</h2>
              <p>Execution history for this workspace</p>
            </div>

            <span className="panel-tag">0 RUNS</span>
          </div>

          <div className="empty-runs">
            <div className="empty-runs-icon">↗</div>
            <div>
              <strong>No test runs recorded</strong>
              <p>Your completed test executions will appear here.</p>
            </div>
          </div>
        </section>

        <footer className="page-footer">
          <span>PulseCheck / Performance tooling</span>
          <span>
            Local development ·{' '}
            {apiStatus === 'connected'
              ? `Metrics polling active · Updated ${formattedUpdate}`
              : 'Metrics connection unavailable'}
          </span>
        </footer>
      </main>
    </div>
  )
}

export default App
