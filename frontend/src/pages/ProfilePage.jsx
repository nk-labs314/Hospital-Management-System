import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    firstName: user.fullName?.split(' ')[0] || '',
    lastName:  user.fullName?.split(' ').slice(1).join(' ') || '',
    phone:     '',
    address:   '',
    bloodGroup: ''
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      // Refresh user
      const { data } = await authAPI.me();
      login(
        { ...user, fullName: `${form.firstName} ${form.lastName}` },
        localStorage.getItem('token')
      );
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Avatar Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="avatar" style={{
            width: 80, height: 80, fontSize: 28, margin: '0 auto 16px'
          }}>
            {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <h3 style={{ fontSize: 18 }}>{user.fullName}</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-700)', marginTop: 4 }}>{user.email}</p>
          <div style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 999,
            background: 'var(--primary-light)', color: 'var(--primary)',
            fontSize: 12, fontWeight: 700, marginTop: 10
          }}>
            {user.role}
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 20 }}>Personal Information</h3>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" value={form.firstName}
                  onChange={e => set('firstName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" value={form.lastName}
                  onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" value={user.email} disabled
                style={{ background: 'var(--gray-100)', cursor: 'not-allowed' }} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" placeholder="9876543210"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-control" value={form.bloodGroup}
                  onChange={e => set('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b =>
                    <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={3}
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
