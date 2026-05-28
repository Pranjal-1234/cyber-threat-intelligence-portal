import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import API_BASE, { authHeaders } from '../api';

function QuickCheck({ user }) {
  const [indicator, setIndicator] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post(
        `${API_BASE}/check`,
        { indicator },
        { headers: authHeaders(user.token) }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soc-theme">
      <div className="mb-4">
        <h1 className="h2 text-light fw-bold">Suspicious Link / IP Check</h1>
        <p className="text-muted small mb-0">
          Preliminary rule-based scan — not a live VirusTotal API check. Submit a full report for admin verification.
        </p>
      </div>

      <div className="card shadow-lg border-secondary bg-dark-card p-4 mb-4">
        <form onSubmit={handleCheck} className="row g-3 align-items-end">
          <div className="col-md-9">
            <label className="form-label text-muted small uppercase">URL, domain, or IP</label>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-light"
              placeholder="e.g. abc-login-security.com or 203.0.113.1"
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center" disabled={loading}>
              <Search className="me-2" size={18} />
              {loading ? 'Checking...' : 'Run Check'}
            </button>
          </div>
        </form>
        {error && <div className="alert alert-danger mt-3 mb-0 py-2 small">{error}</div>}
      </div>

      {result && (
        <div className="card shadow-lg border-0 bg-dark-card p-4">
          <div className="d-flex align-items-start mb-3">
            {result.suggestedRiskScore >= 45 ? (
              <AlertTriangle className="text-warning me-3 flex-shrink-0" size={32} />
            ) : (
              <ShieldCheck className="text-success me-3 flex-shrink-0" size={32} />
            )}
            <div>
              <h4 className="text-light fw-bold mb-1">{result.verdict}</h4>
              <p className="text-muted small mb-0">
                Suggested risk score: <strong className="text-info">{result.suggestedRiskScore}</strong>
                {' · '}Level: <strong>{result.suggestedLevel}</strong>
              </p>
            </div>
          </div>
          <ul className="text-muted small mb-3">
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="alert alert-info bg-info bg-opacity-10 border-info text-info small mb-3">{result.disclaimer}</p>
          <Link to="/threats" className="btn btn-outline-primary btn-sm">
            Submit full threat report for admin verification →
          </Link>
        </div>
      )}
    </div>
  );
}

export default QuickCheck;
