import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const patientNav = [
  { to: '/dashboard',   icon: '🏠', label: 'Dashboard' },
  { to: '/book',        icon: '📅', label: 'Book Appointment' },
  { to: '/appointments',icon: '📋', label: 'My Appointments' },
  { to: '/records',     icon: '🗂️',  label: 'Medical Records' },
  { to: '/profile',     icon: '👤', label: 'My Profile' },
];

const doctorNav = [
  { to: '/doctor',         icon: '🏠', label: 'Dashboard' },
  { to: '/doctor/schedule',icon: '📅', label: 'My Schedule' },
  { to: '/doctor/patients',icon: '👥', label: 'Patients' },
  { to: '/doctor/profile', icon: '👤', label: 'My Profile' },
];

const adminNav = [
  { to: '/admin',           icon: '🏠', label: 'Dashboard' },
  { to: '/admin/doctors',   icon: '👨‍⚕️', label: 'Doctors' },
  { to: '/admin/patients',  icon: '👥', label: 'Patients' },
  { to: '/admin/appointments', icon: '📋', label: 'Appointments' },
  { to: '/admin/departments',  icon: '🏥', label: 'Departments' },
];

export default function Sidebar() {
  const { user, logout, isAdmin, isDoctor } = useAuth();
  const navigate = useNavigate();

  const navItems = isAdmin ? adminNav : isDoctor ? doctorNav : patientNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span>🏥</span>
        <h2>MediCare HMS</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end className={({isActive}) => `nav-item${isActive?' active':''}`}>
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.fullName}</div>
            <div className="user-role">{user?.role?.toLowerCase()}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
