import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';

const statusColor = {
  CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
  CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed', NO_SHOW: 'badge-no_show'
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getMine(user.id)
      .then(r => setAppointments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const upcoming = appointments.filter(a => ['CONFIRMED','PENDING'].includes(a.status));
  const past     = appointments.filter(a => ['COMPLETED','CANCELLED','NO_SHOW'].includes(a.status));

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user.fullName.split(' ')[0]} 👋</h1>
        <p>Manage your health appointments and medical records</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming Appointments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div><div className="stat-value">{appointments.filter(a=>a.status==='COMPLETED').length}</div><div className="stat-label">Completed Visits</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">📋</div>
          <div><div className="stat-value">{appointments.length}</div><div className="stat-label">Total Appointments</div></div>
        </div>
      </div>

      {/* Quick action */}
      <div className="card mb-4" style={{background:'linear-gradient(135deg,#1a73e8,#0d47a1)', color:'white', border:'none'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <h3 style={{fontSize:20, fontWeight:800}}>Book a New Appointment</h3>
            <p style={{opacity:0.85, marginTop:4}}>Choose a speciality and find the best doctor for you</p>
          </div>
          <Link to="/book" className="btn" style={{background:'white', color:'var(--primary)', flexShrink:0}}>
            📅 Book Now
          </Link>
        </div>
      </div>

      {/* Upcoming */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Upcoming Appointments</h3>
          <Link to="/appointments" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        {loading ? <p>Loading...</p> :
         upcoming.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📅</div>
            <p>No upcoming appointments. <Link to="/book" style={{color:'var(--primary)'}}>Book one now!</Link></p>
          </div>
         ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Doctor</th><th>Department</th><th>Date & Time</th><th>Token</th><th>Status</th></tr>
              </thead>
              <tbody>
                {upcoming.slice(0,5).map(apt => (
                  <tr key={apt.id}>
                    <td><strong>{apt.doctorName}</strong></td>
                    <td>{apt.departmentName}</td>
                    <td>{apt.appointmentDate} · {apt.timeSlot}</td>
                    <td>{apt.tokenNumber ? <strong style={{color:'var(--primary)'}}>#{apt.tokenNumber}</strong> : '—'}</td>
                    <td><span className={`badge ${statusColor[apt.status]}`}>{apt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         )}
      </div>

      {/* Recent history */}
      {past.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Visit History</h3>
            <Link to="/records" className="btn btn-ghost btn-sm">View records</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Doctor</th><th>Department</th><th>Date</th><th>Status</th><th>Prescription</th></tr>
              </thead>
              <tbody>
                {past.slice(0,5).map(apt => (
                  <tr key={apt.id}>
                    <td><strong>{apt.doctorName}</strong></td>
                    <td>{apt.departmentName}</td>
                    <td>{apt.appointmentDate}</td>
                    <td><span className={`badge ${statusColor[apt.status]}`}>{apt.status}</span></td>
                    <td>{apt.prescription ? <span style={{fontSize:13, color:'var(--success)'}}> ✅ Available</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
