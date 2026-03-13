import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-header"><p>Loading dashboard...</p></div>;

  const apptStats = stats?.appointmentStats || {};
  const byDept = apptStats.appointmentsByDepartment || {};
  const recent = apptStats.recentAppointments || [];

  const statusColor = {
    CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
    CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed', NO_SHOW: 'badge-no_show'
  };

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard 🏥</h1>
        <p>Hospital-wide overview and management</p>
      </div>

      {/* Top stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div><div className="stat-value">{stats?.totalPatients || 0}</div><div className="stat-label">Total Patients</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👨‍⚕️</div>
          <div><div className="stat-value">{stats?.totalDoctors || 0}</div><div className="stat-label">Doctors</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">🏥</div>
          <div><div className="stat-value">{stats?.totalDepartments || 0}</div><div className="stat-label">Departments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div><div className="stat-value">{apptStats.totalAppointments || 0}</div><div className="stat-label">Total Appointments</div></div>
        </div>
      </div>

      {/* Appointment breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Appointment Status Breakdown</h3>
          {[
            { label: 'Confirmed', value: apptStats.confirmedAppointments || 0, color: '#2e7d32', bg: '#e8f5e9' },
            { label: 'Completed', value: apptStats.completedAppointments || 0, color: '#1a73e8', bg: '#e8f0fe' },
            { label: 'Pending',   value: apptStats.pendingAppointments || 0,   color: '#f57c00', bg: '#fff3e0' },
          ].map(item => {
            const total = apptStats.totalAppointments || 1;
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{item.value} ({pct}%)</span>
                </div>
                <div style={{ height: 8, background: 'var(--gray-200)', borderRadius: 999 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: 999, transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>Appointments by Department</h3>
          {Object.entries(byDept).length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(byDept)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([dept, count]) => (
                  <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>{dept}</span>
                    <strong style={{ color: 'var(--primary)' }}>{count}</strong>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { to: '/admin/doctors',   icon: '👨‍⚕️', label: 'Manage Doctors', desc: 'Add or deactivate doctors' },
          { to: '/admin/patients',  icon: '👥', label: 'View Patients',  desc: 'Browse registered patients' },
          { to: '/admin/appointments', icon: '📋', label: 'All Appointments', desc: 'Monitor all bookings' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent appointments */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Appointments</h3>
          <Link to="/admin/appointments" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>No appointments yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map(apt => (
                  <tr key={apt.id}>
                    <td><strong>{apt.patientName}</strong></td>
                    <td>{apt.doctorName}</td>
                    <td>{apt.departmentName}</td>
                    <td>{apt.appointmentDate} · {apt.timeSlot}</td>
                    <td><span className={`badge ${statusColor[apt.status]}`}>{apt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
