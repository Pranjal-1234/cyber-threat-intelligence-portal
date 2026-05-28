const API_BASE = 'http://localhost:5000';

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export default API_BASE;
