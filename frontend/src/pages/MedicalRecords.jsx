import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    appointmentAPI.getMine(user.id)
      .then(r => {
        const completed = r.data.filter(a => a.status === 'COMPLETED' || a.notes || a.prescription);
        setRecords(completed);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Medical Records</h1>
        <p>Your complete visit history, doctor notes and prescriptions</p>
      </div>

      {/* Profile summary card */}
      <div className="card mb-4" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20 }}>{user.fullName}</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-700)', marginTop: 2 }}>{user.email}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13 }}>📊 {records.length} Completed Visits</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>Visit History & Prescriptions</h3>

        {loading ? <p>Loading records...</p> :
          records.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🗂️</div>
              <p>No medical records yet. Completed appointments will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {records.map(rec => (
                <div key={rec.id} style={{
                  border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      padding: '14px 18px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: expanded === rec.id ? 'var(--primary-light)' : 'white'
                    }}
                    onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{rec.doctorName}</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-700)', marginTop: 2 }}>
                        🏥 {rec.departmentName} · 📅 {rec.appointmentDate} · ⏰ {rec.timeSlot}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {rec.prescription && (
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: '3px 10px',
                          background: 'var(--success-light)', color: 'var(--success)',
                          borderRadius: 999
                        }}>
                          💊 Prescription
                        </span>
                      )}
                      <span style={{ fontSize: 18 }}>{expanded === rec.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expanded === rec.id && (
                    <div style={{ padding: '16px 18px', borderTop: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 16 }}>
                        <InfoRow label="Reason for Visit" value={rec.reasonForVisit} />
                        <InfoRow label="Symptoms" value={rec.symptoms || '—'} />
                        <InfoRow label="Status" value={rec.status} />
                        <InfoRow label="Token No." value={rec.tokenNumber ? `#${rec.tokenNumber}` : '—'} />
                      </div>

                      {rec.notes && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Doctor's Notes
                          </div>
                          <div style={{
                            background: 'white', border: '1.5px solid var(--gray-200)',
                            borderRadius: 8, padding: '12px 14px', fontSize: 14
                          }}>
                            {rec.notes}
                          </div>
                        </div>
                      )}

                      {rec.prescription && (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Prescription
                          </div>
                          <div style={{
                            background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                            borderRadius: 8, padding: '12px 14px', fontSize: 14,
                            whiteSpace: 'pre-line'
                          }}>
                            💊 {rec.prescription}
                          </div>
                        </div>
                      )}

                      {!rec.notes && !rec.prescription && (
                        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                          No notes or prescription added by the doctor yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
    </div>
  );
}
