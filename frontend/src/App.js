import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Threats from './pages/Threats';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    // Flatten the user data to make role, name, and token easily accessible
    const userToSave = { ...userData.user, token: userData.token };
    localStorage.setItem('user', JSON.stringify(userToSave));
    setUser(userToSave);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app-container">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <div className="container-fluid">
          <div className="row">
            {user && (
              <div className="col-md-3 col-lg-2 d-md-block sidebar collapse px-0">
                <Sidebar user={user} />
              </div>
            )}
            <main className={`${user ? 'col-md-9 ms-sm-auto col-lg-10' : 'col-12'} px-md-4 py-4`}>
              <Routes>
                <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/threats" element={<ProtectedRoute><Threats user={user} /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
