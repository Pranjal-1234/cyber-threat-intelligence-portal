import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Users as UsersIcon, Ban, CheckCircle } from 'lucide-react';
import API_BASE, { authHeaders } from '../api';

function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/users`, {
        headers: authHeaders(user.token)
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setMessage('Failed to load users');
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleBlock = async (u) => {
    const block = u.is_active !== 0;
    if (!window.confirm(`${block ? 'Block' : 'Unblock'} ${u.name}?`)) return;

    try {
      await axios.patch(
        `${API_BASE}/users/${u.id}/status`,
        { is_active: !block },
        { headers: authHeaders(user.token) }
      );
      setMessage(`${u.name} ${block ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="soc-theme">
      <h1 className="h2 text-light fw-bold mb-4 d-flex align-items-center">
        <UsersIcon className="me-2 text-primary" />
        Manage Users
      </h1>
      {message && <div className="alert alert-info bg-info bg-opacity-10 border-info text-info mb-4">{message}</div>}

      <div className="card shadow-lg border-0 bg-dark-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 soc-table">
            <thead>
              <tr className="bg-black text-muted small uppercase">
                <th className="ps-4">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="pe-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="ps-4 text-light fw-bold">{u.name}</td>
                  <td className="text-data">{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {u.role === 'admin' ? 'Administrator' : 'Analyst'}
                    </span>
                  </td>
                  <td>
                    {u.is_active !== 0 ? (
                      <span className="badge bg-success bg-opacity-20 text-success border border-success">Active</span>
                    ) : (
                      <span className="badge bg-danger bg-opacity-20 text-danger border border-danger">Blocked</span>
                    )}
                  </td>
                  <td className="text-meta small">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="pe-4 text-center">
                    {u.id !== user.id && u.role !== 'admin' && (
                      <button
                        type="button"
                        className={`btn btn-xs ${u.is_active !== 0 ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => toggleBlock(u)}
                      >
                        {u.is_active !== 0 ? (
                          <>
                            <Ban size={14} className="me-1" /> Block
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} className="me-1" /> Unblock
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;
