import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

function Login({ onLogin }) {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { email, password, role });
      onLogin(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center pt-5">
        <div className="col-md-5">
          <div className="card shadow-lg border-secondary bg-dark-card p-4">
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
                <Shield size={48} className="text-primary" />
              </div>
              <h2 className="fw-bold text-light">CTI PORTAL</h2>
              <p className="text-muted small uppercase tracking-widest">Sign in to your account</p>
            </div>

            {/* error messages intentionally hidden in UI */}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small uppercase">Email</label>
                <input
                  type="email"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small uppercase">Password</label>
                <input
                  type="password"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small uppercase" htmlFor="role">
                  Sign in as
                </label>
                <select
                  id="role"
                  name="role"
                  className="form-select bg-dark border-secondary text-light"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold uppercase tracking-wider">Access Portal</button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted small">Need an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Register here</Link></p>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-muted" style={{ fontSize: '0.7rem' }}>Authorized access only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
