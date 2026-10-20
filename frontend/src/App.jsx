
import './App.css'

const navigation = [
  { label: 'Overview', icon: '▦', active: true },
  { label: 'Test runs', icon: '↗', active: false },
  { label: 'Targets', icon: '◎', active: false },
  { label: 'Thresholds', icon: '⌁', active: false },
]

const metrics = [
  { label: 'HTTP REQUEST RATE', value: '—', unit: 'req/s', note: 'Waiting for test data' },
  { label: 'P95 LATENCY', value: '—', unit: 'ms', note: 'Waiting for test data' },
  { label: 'FAILED REQUESTS', value: '—', unit: '%', note: 'Waiting for test data' },
  { label: 'ACTIVE VUS', value: '0', unit: 'users', note: 'No test running' },
]

function App() {
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
            <span className="status-indicator idle" />
            <span>
              <strong>Test engine idle</strong>
              <small>No active test session</small>
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
              <span className="status-indicator idle" />
              Local environment
            </span>
            <span className="user-avatar" aria-label="Local user">PC</span>
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
            onClick={() => document.getElementById('test-runs')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span>＋</span> View test runs
          </button>
        </section>

        <section className="metrics-grid" aria-label="Current performance metrics">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <div className="metric-label">{metric.label}</div>
              <div className="metric-reading">
                <strong>{metric.value}</strong>
                <span>{metric.unit}</span>
              </div>
              <div className="metric-note">
                <span className="status-indicator idle" />
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
            <span className="panel-tag">NO DATA</span>
          </div>

          <div className="empty-chart">
            <div className="empty-chart-icon">⌁</div>
            <strong>No metrics available</strong>
            <p>Run a k6 test and connect its output to Prometheus to populate this chart.</p>
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
          <span>Local development · Metrics not connected</span>
        </footer>
      </main>
    </div>
  )
}

export default App
