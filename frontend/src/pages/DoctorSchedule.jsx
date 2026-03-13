import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { doctorAPI, appointmentAPI } from '../services/api';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function generateAllSlots() {
  const slots = [];
  for (let h = 6; h < 22; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    slots.push(`${String(h).padStart(2,'0')}:30`);
  }
  return slots;
}

const ALL_SLOTS = generateAllSlots();

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');

  useEffect(() => {
    doctorAPI.getProfile(user.id).then(r => {
      setDoctor(r.data);
      setSchedule(r.data.weeklySchedule || {});
      return appointmentAPI.getDoctorAppts(r.data.id);
    }).then(r => setAllAppointments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const toggleSlot = (day, slot) => {
    setSchedule(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot)
        ? daySlots.filter(s => s !== slot)
        : [...daySlots, slot].sort();
      return { ...prev, [day]: updated };
    });
  };

  const toggleDay = (day) => {
    setSchedule(prev => {
      if (prev[day]?.length > 0) {
        return { ...prev, [day]: [] };
      } else {
        return { ...prev, [day]: generateAllSlots().filter(s => s >= '09:00' && s < '17:00') };
      }
    });
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      await doctorAPI.updateSchedule(doctor.id, schedule);
      toast.success('Schedule updated successfully!');
    } catch {
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = {
    CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
    CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed', NO_SHOW: 'badge-no_show'
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Schedule Management</h1>
        <p>Configure your available time slots and view all appointments</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['schedule', 'appointments'].map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'schedule' ? '🗓️ Weekly Schedule' : '📋 All Appointments'}
          </button>
        ))}
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Weekly Availability</h3>
            <button className="btn btn-primary" onClick={saveSchedule} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Schedule'}
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 20 }}>
            Click a day header to toggle default 9–5 hours. Click individual slots to fine-tune.
          </p>

          {DAYS.map(day => {
            const daySlots = schedule[day] || [];
            const isActive = daySlots.length > 0;
            return (
              <div key={day} style={{
                marginBottom: 16, border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden'
              }}>
                <div style={{
                  padding: '10px 16px', background: isActive ? 'var(--primary-light)' : 'var(--gray-100)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer'
                }} onClick={() => toggleDay(day)}>
                  <span style={{ fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--gray-700)' }}>
                    {isActive ? '✅' : '⭕'} {day}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>
                    {daySlots.length} slots
                  </span>
                </div>

                {isActive && (
                  <div style={{ padding: 12 }}>
                    <div className="slots-grid">
                      {ALL_SLOTS.filter(s => s >= '06:00' && s < '22:00').map(slot => (
                        <button key={slot}
                          className={`slot-btn ${daySlots.includes(slot) ? 'selected' : ''}`}
                          onClick={() => toggleSlot(day, slot)}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* All Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">All Appointments</h3>
            <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{allAppointments.length} total</span>
          </div>
          {allAppointments.length === 0 ? (
            <div className="empty-state"><div className="icon">📋</div><p>No appointments yet.</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Token</th><th>Patient</th><th>Date</th><th>Time</th>
                    <th>Reason</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allAppointments.map(apt => (
                    <tr key={apt.id}>
                      <td><strong style={{ color: 'var(--primary)' }}>#{apt.tokenNumber || '—'}</strong></td>
                      <td><strong>{apt.patientName}</strong><br /><span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{apt.patientEmail}</span></td>
                      <td>{apt.appointmentDate}</td>
                      <td>{apt.timeSlot}</td>
                      <td style={{ maxWidth: 180, fontSize: 13 }}>{apt.reasonForVisit}</td>
                      <td><span className={`badge ${statusColor[apt.status]}`}>{apt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
