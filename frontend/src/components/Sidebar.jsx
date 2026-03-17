import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  PATIENT: [
    { to: '/dashboard',    icon: '⬡',  label: 'Dashboard' },
    { to: '/book',         icon: '＋',  label: 'Book Appointment' },
    { to: '/appointments', icon: '◷',  label: 'My Appointments' },
    { to: '/records',      icon: '⊟',  label: 'Medical Records' },
    { to: '/profile',      icon: '◉',  label: 'Profile' },
  ],
  DOCTOR: [
    { to: '/doctor',          icon: '⬡', label: 'Dashboard' },
    { to: '/doctor/schedule', icon: '◷', label: 'Schedule' },
    { to: '/doctor/patients', icon: '◎', label: 'My Patients' },
  ],
  ADMIN: [
    { to: '/admin',                icon: '⬡', label: 'Overview' },
    { to: '/admin/doctors',        icon: '◎', label: 'Doctors' },
    { to: '/admin/patients',       icon: '◎', label: 'Patients' },
    { to: '/admin/appointments',   icon: '◷', label: 'Appointments' },
    { to: '/admin/departments',    icon: '⊟', label: 'Departments' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV[user?.role] || [];
  const initials = user?.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';

  const handleLogout = () => { logout(); navigate('/'); };

  const roleLabel = { PATIENT: 'Patient', DOCTOR: 'Physician', ADMIN: 'Administrator' }[user?.role] || '';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="logo-icon">🏥</div>
          <div>
            <div className="logo-text">Medi<span>Care</span></div>
            <div className="logo-sub">HMS Platform</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon" style={{ fontSize: 13, fontFamily: 'monospace', opacity: 0.8 }}>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName}
            </div>
            <div className="user-role">{roleLabel}</div>
          </div>
          <div className="pulse-dot" />
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>⏻</span> Sign Out
        </button>
      </div>
    </div>
  );
}
