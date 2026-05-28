import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ShieldAlert, ShieldCheck, ShieldOff, AlertTriangle, Activity, Globe } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [stats, setStats] = useState({ 
    total: 0, 
    critical: 0, 
    high: 0, 
    medium: 0, 
    low: 0, 
    pending: 0,
    topSources: [], 
    recentActivity: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get('http://localhost:5000/threats/stats', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(prev => ({ ...prev, ...response.data }));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const critical = Number(stats.critical) || 0;
  const high = Number(stats.high) || 0;
  const medium = Number(stats.medium) || 0;
  const low = Number(stats.low) || 0;
  const total = Number(stats.total) || 0;
  const pending = Number(stats.pending) || 0;
  const chartMax = Math.max(critical, high, medium, low, 1);

  const chartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Approved threats',
        data: [critical, high, medium, low],
        backgroundColor: [
          '#dc3545',
          '#fd7e14',
          '#ffc107',
          '#198754',
        ],
        borderColor: '#0d1117',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: chartMax,
        ticks: {
          color: '#8b949e',
          font: { size: 10 },
          stepSize: 1,
          precision: 0,
          callback: (value) => (Number.isInteger(value) ? value : '')
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        ticks: { color: '#8b949e', font: { size: 10 } },
        grid: { display: false }
      }
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'Critical': return 'text-danger';
      case 'High': return 'text-warning';
      case 'Medium': return 'text-warning opacity-75';
      case 'Low': return 'text-success';
      default: return 'text-muted';
    }
  };

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status"></div>
      <h3 className="mt-3 text-muted small uppercase">Synchronizing Command Center...</h3>
    </div>
  );

  return (
    <div className="soc-dashboard pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-light fw-bold">Command Center</h1>
          <p className="text-muted small mb-0 uppercase tracking-wider">Live Threat Intelligence Feed</p>
        </div>
        <div className="text-end">
          <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
            <Activity size={14} className="me-2" /> SYSTEM ONLINE
          </span>
        </div>
      </div>

      {pending > 0 && (
        <div className="alert alert-warning bg-warning bg-opacity-10 border-warning text-warning mb-4 py-2 small">
          {pending} threat{pending !== 1 ? 's' : ''} awaiting admin approval (not included in charts below).
        </div>
      )}
      
      <div className="row g-3 mb-4">
        <div className="col">
          <div className="card shadow-sm border-0 bg-dark-card h-100">
            <div className="card-body py-3">
              <h6 className="text-muted small uppercase mb-3">Total Ingested</h6>
              <div className="d-flex align-items-center">
                <ShieldAlert className="text-primary me-3" size={28} />
                <h3 className="mb-0 fw-bold text-light">{total}</h3>
              </div>
              <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.65rem' }}>
                Matches severity breakdown ({critical + high + medium + low})
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm border-0 bg-dark-card h-100 border-start border-danger border-4">
            <div className="card-body py-3">
              <h6 className="text-muted small uppercase mb-3">Critical Alerts</h6>
              <div className="d-flex align-items-center">
                <AlertTriangle className="text-danger me-3" size={28} />
                <h3 className="mb-0 fw-bold text-light">{critical}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card shadow-sm border-0 bg-dark-card h-100">
            <div className="card-body py-3">
              <h6 className="text-muted small uppercase mb-3">High Risk</h6>
              <div className="d-flex align-items-center">
                <AlertTriangle style={{ color: '#fd7e14' }} className="me-3" size={28} />
                <h3 className="mb-0 fw-bold text-light">{high}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col d-none d-lg-block">
          <div className="card shadow-sm border-0 bg-dark-card h-100">
            <div className="card-body py-3">
              <h6 className="text-muted small uppercase mb-3">Medium Risk</h6>
              <div className="d-flex align-items-center">
                <ShieldOff className="text-warning me-3" size={28} />
                <h3 className="mb-0 fw-bold text-light">{medium}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col d-none d-lg-block">
          <div className="card shadow-sm border-0 bg-dark-card h-100">
            <div className="card-body py-3">
              <h6 className="text-muted small uppercase mb-3">Low Risk</h6>
              <div className="d-flex align-items-center">
                <ShieldCheck className="text-success me-3" size={28} />
                <h3 className="mb-0 fw-bold text-light">{low}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 bg-dark-card p-4 mb-4">
            <h5 className="card-title text-light fw-bold mb-1">Severity Distribution</h5>
            <p className="text-muted small mb-3">Same counts as the cards above (approved threats only).</p>
            <div style={{ height: '300px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="card shadow-sm border-0 bg-dark-card overflow-hidden">
            <div className="card-header bg-black border-bottom border-secondary py-3">
              <h5 className="card-title text-light fw-bold mb-0">Live Intelligence Feed</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 small">
                <thead>
                  <tr className="text-muted uppercase">
                    <th className="ps-4">Indicator</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td className="ps-4 fw-bold mono text-info">{activity.indicator}</td>
                        <td>{activity.type}</td>
                        <td><span className={getRiskColor(activity.risk_level)}>{activity.risk_level}</span></td>
                        <td>
                          <span className={`badge bg-opacity-10 border ${activity.status === 'Active' ? 'bg-danger text-danger border-danger' : activity.status === 'Investigating' ? 'bg-info text-info border-info' : 'bg-success text-success border-success'}`}>
                            {activity.status}
                          </span>
                        </td>
                        <td className="pe-4 text-end text-muted">
                          {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-3 text-muted">No recent activity logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 bg-dark-card">
            <div className="card-body">
              <h5 className="card-title text-light fw-bold mb-1 d-flex align-items-center">
                <Globe className="text-primary me-2" size={20} />
                Intelligence Sources
              </h5>
              <p className="text-muted small mb-3">Share of approved threats by source (top 5).</p>
              <div className="sources-list">
                {stats.topSources && stats.topSources.length > 0 ? (
                  stats.topSources.map((src, index) => (
                    <div key={src.source} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted small">{src.source}</span>
                        <span className="text-light fw-bold small">{src.count}</span>
                      </div>
                      <div className="progress bg-black" style={{ height: '6px' }}>
                        <div 
                          className={`progress-bar ${index === 0 ? 'bg-primary' : 'bg-secondary opacity-50'}`} 
                          style={{ width: `${stats.total ? (src.count / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small text-center py-3">No sources recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
