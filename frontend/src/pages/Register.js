import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters with letters and numbers only.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/auth/register', formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center pt-5">
        <div className="col-md-5">
          <div className="card shadow-lg border-secondary bg-dark-card p-4">
            <div className="text-center mb-4">
              <div className="bg-success bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
                <UserPlus size={48} className="text-success" />
              </div>
              <h2 className="fw-bold text-light">Create Account</h2>
              <p className="text-muted small uppercase tracking-widest">Register as User or Admin</p>
            </div>
            {/* error messages intentionally hidden in UI */}
            {success && <div className="alert alert-success bg-success bg-opacity-10 border-success text-success py-2 small">Registration successful! Redirecting...</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small uppercase">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small uppercase">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small uppercase">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control bg-dark border-secondary text-light"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small uppercase" htmlFor="role">
                  Register as
                </label>
                <select
                  id="role"
                  name="role"
                  className="form-select bg-dark border-secondary text-light"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-success w-100 py-2 fw-bold uppercase tracking-wider">Register</button>
            </form>
            <div className="text-center mt-4">
              <p className="text-muted small">Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
