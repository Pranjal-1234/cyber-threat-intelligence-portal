import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, UserPlus, LogIn } from 'lucide-react';

function Sidebar({ user }) {
  return (
    <div className="position-sticky pt-3 h-100 d-flex flex-column">
      <div className="flex-grow-1 px-3">
        <h6 className="sidebar-heading text-muted small uppercase px-2 mb-3 tracking-wider">
          Main Dashboard
        </h6>
        <ul className="nav flex-column mb-4">
          <li className="nav-item">
            <NavLink className={({ isActive }) => `nav-link d-flex align-items-center py-2 px-2 rounded ${isActive ? 'active bg-primary bg-opacity-10' : 'text-muted hover-bg-dark'}`} to="/" end>
              <LayoutDashboard className="me-2" size={18} />
              Command Center
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({ isActive }) => `nav-link d-flex align-items-center py-2 px-2 rounded ${isActive ? 'active bg-primary bg-opacity-10' : 'text-muted hover-bg-dark'}`} to="/threats">
              <ShieldAlert className="me-2" size={18} />
              Threat Intelligence
            </NavLink>
          </li>
        </ul>

        {!user && (
          <>
            <h6 className="sidebar-heading text-muted small uppercase px-2 mt-4 mb-3 tracking-wider">
              Authentication
            </h6>
            <ul className="nav flex-column mb-4">
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link d-flex align-items-center py-2 px-2 rounded ${isActive ? 'active bg-primary bg-opacity-10' : 'text-muted hover-bg-dark'}`} to="/login">
                  <LogIn className="me-2" size={18} />
                  Access Portal
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link d-flex align-items-center py-2 px-2 rounded ${isActive ? 'active bg-primary bg-opacity-10' : 'text-muted hover-bg-dark'}`} to="/register">
                  <UserPlus className="me-2" size={18} />
                  Enlist Agent
                </NavLink>
              </li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
