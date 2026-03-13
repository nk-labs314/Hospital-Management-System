import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: 'Doctor@123',
    phone: '', departmentId: '', specialization: '', qualification: '',
    experienceYears: 0, consultationFee: 500, bio: ''
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([adminAPI.getDoctors(), adminAPI.getDepartments()])
      .then(([d, depts]) => { setDoctors(d.data); setDepartments(depts.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createDoctor(form);
      toast.success('Doctor created successfully!');
      setShowForm(false);
      setForm({ firstName:'',lastName:'',email:'',password:'Doctor@123',phone:'',departmentId:'',specialization:'',qualification:'',experienceYears:0,consultationFee:500,bio:'' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this doctor?')) return;
    try {
      await adminAPI.deactivateDoctor(id);
      toast.success('Doctor deactivated');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Manage Doctors</h1>
          <p>Add, view and manage doctor accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Add Doctor
        </button>
      </div>

      <div className="card">
        {loading ? <p>Loading...</p> :
          doctors.length === 0 ? (
            <div className="empty-state"><div className="icon">👨‍⚕️</div><p>No doctors added yet.</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Doctor</th><th>Department</th><th>Specialization</th><th>Exp.</th><th>Fee</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                            {doc.firstName?.[0]}{doc.lastName?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>Dr. {doc.firstName} {doc.lastName}</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{doc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{doc.departmentName}</td>
                      <td>{doc.specialization}</td>
                      <td>{doc.experienceYears} yrs</td>
                      <td>₹{doc.consultationFee}</td>
                      <td>
                        <span className={`badge ${doc.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                          {doc.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {doc.active && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(doc.id)}>
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Add Doctor Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
          padding: 16, overflowY: 'auto'
        }}>
          <div className="card" style={{ maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>Add New Doctor</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select className="form-control" value={form.departmentId} onChange={e => set('departmentId', e.target.value)} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <input className="form-control" value={form.specialization} onChange={e => set('specialization', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <input className="form-control" placeholder="MBBS, MD..." value={form.qualification} onChange={e => set('qualification', e.target.value)} required />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-control" type="number" value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input className="form-control" type="number" value={form.consultationFee} onChange={e => set('consultationFee', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-control" rows={2} value={form.bio} onChange={e => set('bio', e.target.value)} />
              </div>
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                Default password: <strong>Doctor@123</strong> (doctor can change after login)
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : '✅ Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
