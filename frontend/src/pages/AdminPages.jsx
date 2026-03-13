import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

// ─── Admin: All Appointments ────────────────────────────────────────────
export function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getAppointments().then(r => setAppointments(r.data)).finally(() => setLoading(false));
  }, []);

  const statusColor = {
    CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
    CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed', NO_SHOW: 'badge-no_show'
  };

  const filtered = appointments
    .filter(a => filter === 'ALL' || a.status === filter)
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      return a.patientName?.toLowerCase().includes(q) ||
             a.doctorName?.toLowerCase().includes(q) ||
             a.departmentName?.toLowerCase().includes(q);
    });

  return (
    <div>
      <div className="page-header">
        <h1>All Appointments</h1>
        <p>Monitor every booking across the hospital</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" style={{ maxWidth: 260 }}
          placeholder="Search patient, doctor, dept..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'CONFIRMED', 'COMPLETED', 'PENDING', 'CANCELLED'].map(t => (
            <button key={t} className={`btn ${filter === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              onClick={() => setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? <p>Loading...</p> :
          filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">📋</div><p>No appointments found.</p></div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 14 }}>{filtered.length} records</p>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Dept.</th><th>Date & Time</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(apt => (
                      <tr key={apt.id}>
                        <td><strong style={{ color: 'var(--primary)' }}>#{apt.tokenNumber || '—'}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{apt.patientEmail}</div>
                        </td>
                        <td>{apt.doctorName}</td>
                        <td>{apt.departmentName}</td>
                        <td>{apt.appointmentDate}<br /><span style={{ fontSize: 12, color: 'var(--gray-700)' }}>{apt.timeSlot}</span></td>
                        <td><span className={`badge ${statusColor[apt.status]}`}>{apt.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

// ─── Admin: All Patients ────────────────────────────────────────────────
export function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    adminAPI.getPatients().then(r => setPatients(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success('User status updated');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
           p.email?.toLowerCase().includes(q) ||
           p.phone?.includes(q);
  });

  return (
    <div>
      <div className="page-header">
        <h1>Patients</h1>
        <p>View and manage all registered patients</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input className="form-control" style={{ maxWidth: 320 }}
          placeholder="Search by name, email or phone..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? <p>Loading...</p> :
          filtered.length === 0 ? (
            <div className="empty-state"><div className="icon">👥</div><p>No patients found.</p></div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 14 }}>{filtered.length} patients</p>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Patient</th><th>Phone</th><th>Gender</th><th>Blood Group</th><th>Registered</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                              {p.firstName?.[0]}{p.lastName?.[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</div>
                              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{p.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.phone || '—'}</td>
                        <td>{p.gender || '—'}</td>
                        <td>{p.bloodGroup || '—'}</td>
                        <td style={{ fontSize: 13 }}>{p.createdAt?.split('T')[0]}</td>
                        <td>
                          <span className={`badge ${p.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                            {p.active ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td>
                          <button className={`btn btn-sm ${p.active ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleToggle(p.id)}>
                            {p.active ? 'Block' : 'Unblock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
