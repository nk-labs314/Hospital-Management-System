import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login({ id: data.id, email: data.email, fullName: data.fullName, role: data.role }, data.token);
      toast.success(`Welcome back, ${data.fullName}!`);
      if (data.role === 'ADMIN')  navigate('/admin');
      else if (data.role === 'DOCTOR') navigate('/doctor');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="emoji">🏥</div>
          <h1>Hospital Management</h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'12px'}} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>
        <div className="alert alert-info" style={{marginTop: 20}}>
          <strong>Demo credentials:</strong><br/>
          Admin: admin@hospital.com / Admin@123<br/>
          Doctor: dr.sharma@hospital.com / Doctor@123
        </div>
        <p className="text-center mt-4" style={{fontSize:14}}>
          Don't have an account? <Link to="/register" style={{color:'var(--primary)', fontWeight:600}}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', password:'',
    phone:'', dateOfBirth:'', gender:'', bloodGroup:'', address:''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login({ id: data.id, email: data.email, fullName: data.fullName, role: data.role }, data.token);
      toast.success('Account created! Welcome.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{maxWidth: 520}}>
        <div className="auth-logo">
          <div className="emoji">🏥</div>
          <h1>Create Account</h1>
          <p>Register as a new patient</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-control" placeholder="John" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" placeholder="Doe" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} required minLength={6} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" placeholder="9876543210" value={form.phone} onChange={e=>set('phone',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-control" type="date" value={form.dateOfBirth} onChange={e=>set('dateOfBirth',e.target.value)} />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-control" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-control" value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-control" rows={2} placeholder="Your address" value={form.address} onChange={e=>set('address',e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'12px'}} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-4" style={{fontSize:14}}>
          Already have an account? <Link to="/login" style={{color:'var(--primary)', fontWeight:600}}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
