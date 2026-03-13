import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { doctorAPI, appointmentAPI } from '../services/api';

const statusColor = {
  CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
  CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed', NO_SHOW: 'badge-no_show'
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [notesModal, setNotesModal] = useState(null);
  const [notesForm, setNotesForm] = useState({ notes: '', prescription: '', status: 'COMPLETED' });

  useEffect(() => {
    doctorAPI.getProfile(user.id).then(r => {
      setDoctor(r.data);
      return appointmentAPI.getDoctorStats(r.data.id);
    }).then(r => {
      setStats(r.data);
      return appointmentAPI.getDoctorToday(doctor?.id || '');
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    if (doctor) {
      appointmentAPI.getDoctorToday(doctor.id).then(r => setToday(r.data));
    }
  }, [doctor]);

  const openNotes = (apt) => {
    setNotesModal(apt);
    setNotesForm({ notes: apt.notes || '', prescription: apt.prescription || '', status: 'COMPLETED' });
  };

  const saveNotes = async () => {
    setUpdating(notesModal.id);
    try {
      await appointmentAPI.updateStatus(notesModal.id, notesForm);
      toast.success('Record updated');
      setNotesModal(null);
      const r = await appointmentAPI.getDoctorToday(doctor.id);
      setToday(r.data);
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const markNoShow = async (apt) => {
    setUpdating(apt.id);
    try {
      await appointmentAPI.updateStatus(apt.id, { status: 'NO_SHOW' });
      toast.success('Marked as no-show');
      const r = await appointmentAPI.getDoctorToday(doctor.id);
      setToday(r.data);
    } catch {
      toast.error('Failed');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="page-header"><p>Loading dashboard...</p></div>;

  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <h1>Good {getGreeting()}, Dr. {user.fullName.split(' ')[0]} 👨‍⚕️</h1>
        <p>{todayDate}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div><div className="stat-value">{today.length}</div><div className="stat-label">Today's Appointments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⏳</div>
          <div><div className="stat-value">{stats?.pendingAppointments || 0}</div><div className="stat-label">Pending</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div><div className="stat-value">{stats?.completedTotal || 0}</div><div className="stat-label">Total Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">❌</div>
          <div><div className="stat-value">{stats?.cancelledTotal || 0}</div><div className="stat-label">Cancelled</div></div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Today's Schedule</h3>
          <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>
            {today.filter(a => a.status === 'CONFIRMED').length} confirmed
          </span>
        </div>

        {today.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎉</div>
            <p>No appointments today. Enjoy your day!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {today.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)).map(apt => (
              <div key={apt.id} style={{
                border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
                padding: '14px 16px', display: 'flex', alignItems: 'center',
                gap: 16, flexWrap: 'wrap',
                background: apt.status === 'COMPLETED' ? 'var(--gray-50)' : 'white'
              }}>
                {/* Token */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, flexShrink: 0
                }}>
                  #{apt.tokenNumber || '?'}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{apt.patientName}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-700)', marginTop: 2 }}>
                    ⏰ {apt.timeSlot} · 📋 {apt.reasonForVisit}
                  </div>
                  {apt.symptoms && <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Symptoms: {apt.symptoms}</div>}
                </div>

                {/* Status & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${statusColor[apt.status]}`}>{apt.status}</span>
                  {apt.status === 'CONFIRMED' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => openNotes(apt)}>
                        ✅ Complete
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => markNoShow(apt)}
                        disabled={updating === apt.id}>
                        No Show
                      </button>
                    </>
                  )}
                  {apt.status === 'COMPLETED' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => openNotes(apt)}>
                      Edit Notes
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor info card */}
      {doctor && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 className="card-title" style={{ marginBottom: 14 }}>My Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px 24px', fontSize: 14 }}>
            <InfoItem label="Department" value={doctor.departmentName} />
            <InfoItem label="Specialization" value={doctor.specialization} />
            <InfoItem label="Qualification" value={doctor.qualification} />
            <InfoItem label="Experience" value={`${doctor.experienceYears} years`} />
            <InfoItem label="Consultation Fee" value={`₹${doctor.consultationFee}`} />
            <InfoItem label="Slot Duration" value={`${doctor.slotDurationMinutes} mins`} />
          </div>
        </div>
      )}

      {/* Complete / Notes Modal */}
      {notesModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16
        }}>
          <div className="card" style={{ maxWidth: 500, width: '100%' }}>
            <h3 style={{ marginBottom: 4 }}>Complete Visit</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 16 }}>
              Patient: <strong>{notesModal.patientName}</strong> · Token #{notesModal.tokenNumber}
            </p>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={notesForm.status}
                onChange={e => setNotesForm(f => ({ ...f, status: e.target.value }))}>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Doctor's Notes / Diagnosis</label>
              <textarea className="form-control" rows={3} placeholder="Diagnosis, observations..."
                value={notesForm.notes}
                onChange={e => setNotesForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Prescription</label>
              <textarea className="form-control" rows={4} placeholder="Medicines, dosage, instructions..."
                value={notesForm.prescription}
                onChange={e => setNotesForm(f => ({ ...f, prescription: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setNotesModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={saveNotes} disabled={updating === notesModal.id}>
                {updating === notesModal.id ? 'Saving...' : '✅ Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
