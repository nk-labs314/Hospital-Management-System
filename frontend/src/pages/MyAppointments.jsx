import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';

const statusColor = {
  CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
  CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed', NO_SHOW: 'badge-no_show'
};

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    appointmentAPI.getMine(user.id)
      .then(r => setAppointments(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? appointments
    : appointments.filter(a => a.status === filter);

  const handleCancel = async (apt) => {
    if (!cancelReason.trim()) { toast.error('Please provide a cancellation reason'); return; }
    setCancelling(true);
    try {
      await appointmentAPI.cancel(apt.id, cancelReason);
      toast.success('Appointment cancelled');
      setSelected(null);
      setCancelReason('');
      load();
    } catch {
      toast.error('Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const tabs = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

  return (
    <div>
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>Track and manage all your appointments</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t} className={`btn ${filter === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilter(t)}>
            {t} {t === 'ALL' ? `(${appointments.length})` : `(${appointments.filter(a => a.status === t).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <p>Loading appointments...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📅</div>
            <p>No appointments found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(apt => (
              <div key={apt.id} style={{
                border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
                padding: 16, background: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{apt.doctorName}</div>
                    <div style={{ color: 'var(--gray-700)', fontSize: 13, marginTop: 2 }}>
                      🏥 {apt.departmentName}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>📅 {apt.appointmentDate}</span>
                      <span>⏰ {apt.timeSlot}</span>
                      {apt.tokenNumber && <span style={{ fontWeight: 700, color: 'var(--primary)' }}>🎫 Token #{apt.tokenNumber}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-700)', marginTop: 4 }}>
                      📋 {apt.reasonForVisit}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className={`badge ${statusColor[apt.status]}`}>{apt.status}</span>
                    {apt.status === 'CONFIRMED' && (
                      <button className="btn btn-danger btn-sm" onClick={() => setSelected(apt)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes & prescription from doctor */}
                {(apt.notes || apt.prescription) && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-200)' }}>
                    {apt.notes && (
                      <div style={{ fontSize: 13, marginBottom: 6 }}>
                        <strong>Doctor's Notes:</strong> {apt.notes}
                      </div>
                    )}
                    {apt.prescription && (
                      <div style={{ fontSize: 13, background: 'var(--success-light)', padding: '8px 12px', borderRadius: 6 }}>
                        💊 <strong>Prescription:</strong> {apt.prescription}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16
        }}>
          <div className="card" style={{ maxWidth: 440, width: '100%' }}>
            <h3 style={{ marginBottom: 16 }}>Cancel Appointment</h3>
            <p style={{ fontSize: 14, marginBottom: 16 }}>
              Are you sure you want to cancel your appointment with <strong>{selected.doctorName}</strong> on <strong>{selected.appointmentDate} at {selected.timeSlot}</strong>?
            </p>
            <div className="form-group">
              <label className="form-label">Reason for Cancellation</label>
              <textarea className="form-control" rows={3} placeholder="Please provide a reason..."
                value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => { setSelected(null); setCancelReason(''); }}>
                Keep Appointment
              </button>
              <button className="btn btn-danger" onClick={() => handleCancel(selected)} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
