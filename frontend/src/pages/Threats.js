import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Trash2, PlusCircle, Shield, AlertCircle, Globe, Activity, CheckCircle, Info, User, Clock, Check, X } from 'lucide-react';

function Threats({ user }) {
  const [threats, setThreats] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [pendingThreats, setPendingThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    indicator: '',
    type: 'Malicious IP',
    source: 'VirusTotal',
    risk_score: 50,
    confidence_score: 80,
    status: 'Active'
  });

  const fetchThreats = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/threats', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setThreats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch threats');
      setLoading(false);
    }
  }, [user.token]);

  const fetchPendingThreats = useCallback(async () => {
    if (user.role === 'admin') {
      try {
        const response = await axios.get('http://localhost:5000/threats/pending', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPendingThreats(response.data);
      } catch (err) {
        console.error('Failed to fetch pending threats');
      }
    }
  }, [user.token, user.role]);

  const fetchMySubmissions = useCallback(async () => {
    if (user.role !== 'admin') {
      try {
        const response = await axios.get('http://localhost:5000/threats/mine', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setMySubmissions(response.data);
      } catch (err) {
        console.error('Failed to fetch your submissions');
      }
    }
  }, [user.token, user.role]);

  useEffect(() => {
    fetchThreats();
    fetchPendingThreats();
    fetchMySubmissions();
  }, [fetchThreats, fetchPendingThreats, fetchMySubmissions]);

  const handleAddThreat = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/threats', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowAddForm(false);
      setFormData({ 
        indicator: '', 
        type: 'Malicious IP', 
        source: 'VirusTotal', 
        risk_score: 50, 
        confidence_score: 80, 
        status: 'Active' 
      });
      
      if (user.role === 'admin') {
        fetchThreats();
        fetchPendingThreats();
      } else {
        setError(response.data.message);
        fetchMySubmissions();
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit threat');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/threats/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchPendingThreats();
      fetchThreats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve threat');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/threats/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchPendingThreats();
      fetchThreats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject threat');
    }
  };

  const handleDeleteThreat = async (id) => {
    if (window.confirm('Are you sure you want to delete this threat?')) {
      try {
        await axios.delete(`http://localhost:5000/threats/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchThreats();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete threat');
      }
    }
  };

  const getRiskBadge = (level) => {
    switch(level) {
      case 'Low': return <span className="badge bg-success bg-opacity-75 border border-success">Low</span>;
      case 'Medium': return <span className="badge bg-warning text-dark border border-warning">Medium</span>;
      case 'High': return <span className="badge bg-opacity-75 border border-warning" style={{ backgroundColor: '#fd7e14', color: 'white' }}>High</span>;
      case 'Critical': return <span className="badge bg-danger bg-opacity-75 border border-danger shadow-glow">Critical</span>;
      default: return <span className="badge bg-secondary">{level}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return <span className="badge bg-success bg-opacity-20 text-success border border-success"><CheckCircle size={12} className="me-1" /> Active</span>;
      case 'Investigating': return <span className="badge bg-info bg-opacity-20 text-info border border-info"><Info size={12} className="me-1" /> Investigating</span>;
      case 'Resolved': return <span className="badge bg-primary bg-opacity-20 text-primary border border-primary"><Check size={12} className="me-1" /> Resolved</span>;
      case 'Pending Approval': return <span className="badge bg-secondary bg-opacity-20 text-secondary border border-secondary"><Clock size={12} className="me-1" /> Pending</span>;
      case 'Rejected': return <span className="badge bg-danger bg-opacity-20 text-danger border border-danger"><X size={12} className="me-1" /> Rejected</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getTypeIcon = (type) => {
    if (type.includes('IP')) return <Globe size={16} className="text-info me-2" />;
    if (type.includes('Phishing') || type.includes('URL')) return <AlertCircle size={16} className="text-warning me-2" />;
    return <Shield size={16} className="text-primary me-2" />;
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="badge bg-danger ms-2" style={{ fontSize: '0.6rem' }}>Admin</span>;
    }
    return <span className="badge bg-primary ms-2" style={{ fontSize: '0.6rem' }}>User</span>;
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div><h3 className="mt-3 text-light">Loading intelligence...</h3></div>;

  return (
    <div className="soc-theme">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-0 text-light fw-bold">Threat Intelligence Portal</h1>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center shadow-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <PlusCircle className="me-2" size={20} />
          {showAddForm ? 'Close' : user.role === 'admin' ? 'Ingest Threat' : 'Submit Threat'}
        </button>
      </div>

      {error && <div className="alert alert-info bg-info bg-opacity-10 border-info text-info mb-4">{error}</div>}

      {showAddForm && (
        <div className="card shadow-lg border-secondary bg-dark-card p-4 mb-4">
          <h4 className="mb-4 text-primary fw-bold">
            {user.role === 'admin' ? 'Threat Ingestion Form' : 'Submit Threat for Approval'}
          </h4>
          <form onSubmit={handleAddThreat} className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-muted small uppercase">Indicator (IP/URL/File)</label>
              <input 
                type="text" 
                className="form-control bg-dark border-secondary text-light" 
                placeholder="e.g. 192.168.1.1"
                value={formData.indicator}
                onChange={(e) => setFormData({...formData, indicator: e.target.value})}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small uppercase">Threat Type</label>
              <select 
                className="form-select bg-dark border-secondary text-light" 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Malicious IP">Malicious IP</option>
                <option value="Suspicious IP">Suspicious IP</option>
                <option value="Malware">Malware</option>
                <option value="Phishing">Phishing</option>
                <option value="DDoS">DDoS</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small uppercase">Risk Score (0-100)</label>
              <input 
                type="number" 
                className="form-control bg-dark border-secondary text-light" 
                min="0" max="100"
                value={formData.risk_score}
                onChange={(e) => setFormData({...formData, risk_score: e.target.value})}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small uppercase">Confidence (0-100)</label>
              <input 
                type="number" 
                className="form-control bg-dark border-secondary text-light" 
                min="0" max="100"
                value={formData.confidence_score}
                onChange={(e) => setFormData({...formData, confidence_score: e.target.value})}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small uppercase">Source</label>
              <select 
                className="form-select bg-dark border-secondary text-light" 
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
              >
                <option value="VirusTotal">VirusTotal</option>
                <option value="AbuseIPDB">AbuseIPDB</option>
                <option value="AlienVault OTX">AlienVault OTX</option>
                <option value="Internal Logs">Internal Logs</option>
              </select>
            </div>
            {user.role === 'admin' && (
              <div className="col-md-4">
                <label className="form-label text-muted small uppercase">Initial Status</label>
                <select 
                  className="form-select bg-dark border-secondary text-light" 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            )}
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success px-5">
                {user.role === 'admin' ? 'Submit Intelligence' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      )}

      {user.role !== 'admin' && (
        <div className="card shadow-lg border-0 bg-dark-card overflow-hidden mb-4">
          <div className="card-header bg-info bg-opacity-10 border-bottom border-info py-3">
            <h5 className="card-title text-info fw-bold mb-0">
              <Clock size={20} className="me-2" />
              My Submissions ({mySubmissions.length})
            </h5>
            <p className="text-muted small mb-0 mt-1">Threats you submitted appear here until an admin approves them.</p>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 soc-table">
              <thead>
                <tr className="bg-black text-muted small uppercase">
                  <th className="ps-4">Indicator</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th className="pe-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      You have not submitted any threats yet.
                    </td>
                  </tr>
                ) : (
                  mySubmissions.map((threat) => (
                    <tr key={threat.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          {getTypeIcon(threat.type)}
                          <span className="fw-bold text-data mono">{threat.indicator}</span>
                        </div>
                      </td>
                      <td><span className="text-info small">{threat.type}</span></td>
                      <td>{getRiskBadge(threat.risk_level)}</td>
                      <td className="text-data">{threat.source}</td>
                      <td>{getStatusBadge(threat.status)}</td>
                      <td className="pe-4 text-meta small">{new Date(threat.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {user.role === 'admin' && pendingThreats.length > 0 && (
        <div className="card shadow-lg border-0 bg-dark-card overflow-hidden mb-4">
          <div className="card-header bg-warning bg-opacity-10 border-bottom border-warning py-3">
            <h5 className="card-title text-warning fw-bold mb-0">
              <Clock size={20} className="me-2" />
              Pending Approval ({pendingThreats.length})
            </h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 soc-table">
              <thead>
                <tr className="bg-black text-muted small uppercase">
                  <th className="ps-4">Indicator</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th className="pe-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingThreats.map((threat) => (
                  <tr key={threat.id} className="opacity-75">
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        {getTypeIcon(threat.type)}
                        <span className="fw-bold text-data mono">{threat.indicator}</span>
                      </div>
                    </td>
                    <td><span className="text-info small">{threat.type}</span></td>
                    <td>{getRiskBadge(threat.risk_level)}</td>
                    <td className="text-data">{threat.source}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <User size={14} className="me-2 text-muted" />
                        <span className="text-data">{threat.creator_name || 'SYSTEM'}</span>
                        {getRoleBadge(threat.creator_role)}
                      </div>
                    </td>
                    <td className="text-meta small">{new Date(threat.date).toLocaleDateString()}</td>
                    <td className="pe-4">
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-xs btn-outline-success"
                          onClick={() => handleApprove(threat.id)}
                          title="Approve"
                        >
                          <Check size={14} className="me-1" /> Approve
                        </button>
                        <button 
                          className="btn btn-xs btn-outline-danger"
                          onClick={() => handleReject(threat.id)}
                          title="Reject"
                        >
                          <X size={14} className="me-1" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card shadow-lg border-0 bg-dark-card overflow-hidden">
        <div className="card-header bg-black border-bottom border-secondary py-3">
          <h5 className="card-title text-light fw-bold mb-0">Intelligence Feed</h5>
          {user.role !== 'admin' && (
            <p className="text-muted small mb-0 mt-1">Approved threats from all analysts. Yours appear here after admin approval.</p>
          )}
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 soc-table">
            <thead>
              <tr className="bg-black text-muted small uppercase">
                <th className="ps-4">Indicator</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Confidence</th>
                <th>Source</th>
                <th>Status</th>
                <th>Reported By</th>
                <th className={user.role === 'admin' ? '' : 'pe-4'}>Date</th>
                {user.role === 'admin' && <th className="pe-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {threats.length === 0 ? (
                <tr>
                  <td colSpan={user.role === 'admin' ? 9 : 8} className="text-center py-5 text-muted">No threat indicators in the intelligence feed.</td>
                </tr>
              ) : (
                threats.map((threat) => (
                  <tr key={threat.id} className={threat.risk_level === 'Critical' ? 'row-critical' : ''}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        {getTypeIcon(threat.type)}
                        <span className="fw-bold text-data mono">{threat.indicator}</span>
                      </div>
                    </td>
                    <td><span className="text-info small">{threat.type}</span></td>
                    <td>{getRiskBadge(threat.risk_level)}</td>
                    <td>
                      <div className="d-flex align-items-center" style={{ minWidth: '100px' }}>
                        <div className="progress w-100 me-2 bg-dark" style={{ height: '4px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${threat.confidence_score}%` }}
                          ></div>
                        </div>
                        <small className="text-meta">{threat.confidence_score}%</small>
                      </div>
                    </td>
                    <td className="text-data">{threat.source}</td>
                    <td>{getStatusBadge(threat.status)}</td>
                    <td>
                      <div className="d-flex align-items-center" title={`Created by ${threat.creator_role === 'admin' ? 'Admin' : 'User'}`}>
                        <User size={14} className="me-2 text-muted" />
                        <span className="text-data">{threat.creator_name || 'SYSTEM'}</span>
                        {getRoleBadge(threat.creator_role)}
                      </div>
                    </td>
                    <td className="text-meta small">{new Date(threat.date).toLocaleDateString()}</td>
                    {user.role === 'admin' && (
                      <td className="pe-4 text-center">
                        <button 
                          className="btn btn-xs btn-outline-danger"
                          onClick={() => handleDeleteThreat(threat.id)}
                          title="Delete threat"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Threats;