import React from 'react';
import { Shield, LogOut, User } from 'lucide-react';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar navbar-dark sticky-top navbar-expand-md p-0 shadow-sm border-bottom border-secondary">
      <a className="navbar-brand col-md-3 col-lg-2 me-0 px-4 fs-5 d-flex align-items-center fw-bold text-primary" href="/">
        <Shield className="me-2" size={24} />
        CTI PORTAL
      </a>
      <div className="navbar-nav w-100 d-none d-md-block px-3">
        <span className="text-muted small uppercase fw-semibold tracking-wider">Cyber Threat Intelligence Platform</span>
      </div>
      <div className="navbar-nav px-3 d-flex flex-row align-items-center">
        <div className="nav-item text-nowrap me-4 text-light d-flex align-items-center">
          <div className="bg-secondary bg-opacity-25 p-2 rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            <User size={16} className="text-primary" />
          </div>
          <div className="d-flex flex-column">
            <span className="small fw-bold text-light line-height-1">{user.name}</span>
            <span className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
              {user.role === 'admin' ? 'Administrator' : 'Analyst'}
            </span>
          </div>
        </div>
        <div className="nav-item text-nowrap border-start border-secondary ps-3">
          <button className="nav-link px-2 btn btn-link text-muted hover-light" onClick={onLogout} title="Sign Out">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
