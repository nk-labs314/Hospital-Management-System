import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

/* ── Shared background with medical grid pattern ── */
function AuthBg({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow blobs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,201,177,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%',
        width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(79,172,254,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      {/* Dot grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.35,
        backgroundImage: 'radial-gradient(circle, rgba(139,167,196,0.25) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {children}
    </div>
  );
}

/* ── Left panel (visual) ── */
function LeftPanel() {
  return (
    <div style={{
      width: '46%', minHeight: '100vh',
      background: 'linear-gradient(160deg, #091424 0%, #050d1a 100%)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '60px 56px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', bottom: -120, right: -120,
        width: 400, height: 400, borderRadius: '50%',
        border: '1px solid rgba(0,201,177,0.1)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, right: -60,
        width: 250, height: 250, borderRadius: '50%',
        border: '1px solid rgba(0,201,177,0.08)',
      }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
        <div className="logo-icon" style={{ width: 44, height: 44, fontSize: 22 }}>🏥</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
            Medi<span style={{ color: 'var(--teal)' }}>Care</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Hospital Management
          </div>
        </div>
      </div>

      <div className="anim-up">
        <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 18 }}>
          ◆ Trusted Healthcare Platform
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800,
          lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20,
        }}>
          Your health,<br />
          <span style={{ color: 'var(--teal)' }}>our priority.</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 360, marginBottom: 48 }}>
          Book specialist appointments, manage your medical history, and connect with top doctors — all in one place.
        </p>
      </div>

      {/* Stats row */}
      <div className="anim-up d200" style={{ display: 'flex', gap: 32 }}>
        {[['500+', 'Doctors'], ['12', 'Departments'], ['50k+', 'Patients']].map(([val, lbl]) => (
          <div key={lbl}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--teal)' }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Feature pills */}
      <div className="anim-up d300" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 40 }}>
        {['Smart Scheduling', 'Email Alerts', 'Medical Records', '24/7 Access'].map(f => (
          <span key={f} style={{
            background: 'rgba(0,201,177,0.08)', border: '1px solid var(--teal-border)',
            color: 'var(--teal)', fontSize: 11, fontWeight: 600,
            padding: '5px 12px', borderRadius: 999,
          }}>{f}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROLE SELECTION (landing / entry point)
═══════════════════════════════════════════ */
export function RolePage() {
  const navigate = useNavigate();
  return (
    <AuthBg>
      <LeftPanel />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="anim-up" style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Select how you'd like to continue
            </p>
          </div>

          <div className="anim-up d100" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {[
              {
                role: 'patient',
                icon: '🧑‍⚕️',
                title: 'I\'m a Patient',
                desc: 'Book appointments, view medical records, manage your health',
                color: 'var(--teal)',
                glow: 'rgba(0,201,177,0.12)',
                border: 'var(--teal-border)',
              },
              {
                role: 'doctor',
                icon: '👨‍⚕️',
                title: 'I\'m a Doctor',
                desc: 'Manage your schedule, view patients, update prescriptions',
                color: '#60a5fa',
                glow: 'rgba(96,165,250,0.1)',
                border: 'rgba(96,165,250,0.25)',
              },
            ].map(item => (
              <button key={item.role}
                onClick={() => navigate(`/login?role=${item.role}`)}
                style={{
                  width: '100%', padding: '20px 22px', borderRadius: 'var(--r-lg)',
                  background: item.glow, border: `1.5px solid ${item.border}`,
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${item.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14, fontSize: 24,
                  background: `rgba(255,255,255,0.05)`, border: `1px solid ${item.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{item.icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: item.color, marginBottom: 3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: item.color, fontSize: 18 }}>→</div>
              </button>
            ))}
          </div>

          <div className="anim-up d200" style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Admin? <Link to="/login?role=admin" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Sign in here</Link>
          </div>
        </div>
      </div>
    </AuthBg>
  );
}

/* ═══════════════════════════════════════════
   LOGIN (shared, role-aware)
═══════════════════════════════════════════ */
export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role') || 'patient';

  const roleConfig = {
    patient: { label: 'Patient', color: 'var(--teal)', border: 'var(--teal-border)', glow: 'var(--teal-glow)', icon: '🧑‍⚕️' },
    doctor: { label: 'Doctor', color: '#60a5fa', border: 'rgba(96,165,250,0.25)', glow: 'rgba(96,165,250,0.08)', icon: '👨‍⚕️' },
    admin: { label: 'Admin', color: '#c084fc', border: 'rgba(192,132,252,0.25)', glow: 'rgba(168,85,247,0.08)', icon: '🔐' },
  }[role] || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login({ id: data.id, email: data.email, fullName: data.fullName, role: data.role }, data.token);
      toast.success(`Welcome back, ${data.fullName.split(' ')[0]}!`);
      if (data.role === 'ADMIN') navigate('/admin');
      else if (data.role === 'DOCTOR') navigate('/doctor');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <AuthBg>
      <LeftPanel />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Role badge */}
          <div className="anim-up" style={{ marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: roleConfig.glow, border: `1px solid ${roleConfig.border}`,
              borderRadius: 999, padding: '6px 14px', marginBottom: 20,
            }}>
              <span style={{ fontSize: 14 }}>{roleConfig.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: roleConfig.color, letterSpacing: '0.5px' }}>
                {roleConfig.label} Portal
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Sign in</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Not {roleConfig.label.toLowerCase()}?{' '}
              <Link to="/" style={{ color: 'var(--teal)', fontWeight: 600 }}>Go back</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="anim-up d100">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ borderTopColor: 'var(--bg-base)' }} /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          {role !== 'admin' && (
            <div className="anim-up d200" style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to={`/register?role=${role}`} style={{ color: 'var(--teal)', fontWeight: 600 }}>
                Register as {roleConfig.label}
              </Link>
            </div>
          )}

          {/* Demo hint */}
          <div className="anim-up d300" style={{
            marginTop: 28, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>🔑 Demo Credentials</div>
            {role === 'admin' && <div>admin@hospital.com / Admin@123</div>}
            {role === 'doctor' && <div>dr.sharma@hospital.com / Doctor@123</div>}
            {role === 'patient' && <div>test@gmail.com / 123456</div>}
          </div>
        </div>
      </div>
    </AuthBg>
  );
}

/* ═══════════════════════════════════════════
   PATIENT REGISTRATION
═══════════════════════════════════════════ */
export function PatientRegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '', gender: '', bloodGroup: '', address: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login({ id: data.id, email: data.email, fullName: data.fullName, role: data.role }, data.token);
      toast.success('Account created! Welcome to MediCare.');
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthBg>
      <LeftPanel />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div className="anim-up" style={{ marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--teal-glow)', border: '1px solid var(--teal-border)',
              borderRadius: 999, padding: '6px 14px', marginBottom: 18,
            }}>
              <span>🧑‍⚕️</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)' }}>New Patient</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Create your account</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Already registered? <Link to="/login?role=patient" style={{ color: 'var(--teal)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="anim-up d100">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" placeholder="Doe" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-control" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-control" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={2} placeholder="Your address" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ borderTopColor: 'var(--bg-base)' }} /> Creating account...</> : 'Create Patient Account →'}
            </button>
          </form>
        </div>
      </div>
    </AuthBg>
  );
}

/* ═══════════════════════════════════════════
   DOCTOR SELF-REGISTRATION
═══════════════════════════════════════════ */
export function RegisterPage() {
  const role = new URLSearchParams(window.location.search).get('role');
  return role === 'doctor' ? <DoctorRegisterPage /> : <PatientRegisterPage />;
}

export function DoctorRegisterPage() {
  const [step, setStep] = useState(1); // 1 = account, 2 = professional
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    specialization: '', qualification: '', experienceYears: '', bio: '',
    departmentId: '',
    certificationImageName: '', certificationImageDataUrl: '',
  });
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    import('../services/api').then(m => m.deptAPI.getAll().then(r => setDepts(r.data)));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCertificationChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      set('certificationImageName', '');
      set('certificationImageDataUrl', '');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Upload a certification image file');
      event.target.value = '';
      set('certificationImageName', '');
      set('certificationImageDataUrl', '');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Certification image must be 2 MB or smaller');
      event.target.value = '';
      set('certificationImageName', '');
      set('certificationImageDataUrl', '');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      set('certificationImageName', file.name);
      set('certificationImageDataUrl', dataUrl);
    } catch {
      toast.error('Could not read the certification image');
      event.target.value = '';
      set('certificationImageName', '');
      set('certificationImageDataUrl', '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    if (!form.certificationImageDataUrl) {
      toast.error('Upload your degree or certification image');
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.registerDoctor(form);
      login({ id: data.id, email: data.email, fullName: data.fullName, role: data.role }, data.token);
      toast.success('Doctor account submitted for admin review.');
      navigate('/doctor');
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthBg>
      <LeftPanel />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          <div className="anim-up" style={{ marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)',
              borderRadius: 999, padding: '6px 14px', marginBottom: 18,
            }}>
              <span>👨‍⚕️</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>Doctor Registration</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Join as a Doctor</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Already have an account? <Link to="/login?role=doctor" style={{ color: '#60a5fa', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: 3, borderRadius: 999,
                background: step >= s ? '#60a5fa' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
            Step {step} of 2 — {step === 1 ? 'Account Details' : 'Professional Info'}
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="anim-up d100">

            {step === 1 && (
              <>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-control" placeholder="Rajesh" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-control" placeholder="Sharma" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input className="form-control" type="email" placeholder="dr.you@hospital.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-control" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <button className="btn btn-lg" type="submit" style={{
                  width: '100%', justifyContent: 'center',
                  background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)',
                  color: '#60a5fa', marginTop: 4,
                }}>
                  Next: Professional Details →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Department / Speciality</label>
                  <select className="form-control" value={form.departmentId} onChange={e => set('departmentId', e.target.value)} required>
                    <option value="">Select your department</option>
                    {depts.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input className="form-control" placeholder="e.g. Interventional Cardiology" value={form.specialization} onChange={e => set('specialization', e.target.value)} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input className="form-control" placeholder="MBBS, MD..." value={form.qualification} onChange={e => set('qualification', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience (years)</label>
                    <input className="form-control" type="number" min="0" placeholder="5" value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Short Bio</label>
                  <textarea className="form-control" rows={3} placeholder="Tell patients a bit about yourself..." value={form.bio} onChange={e => set('bio', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Degree / Certification Image</label>
                  <input className="form-control" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCertificationChange} required />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Upload a JPG, PNG, or WebP image up to 2 MB.
                  </div>
                  {form.certificationImageName && (
                    <div style={{ fontSize: 12, color: '#60a5fa', marginTop: 8 }}>
                      Selected: {form.certificationImageName}
                    </div>
                  )}
                </div>

                <div className="alert alert-info" style={{ marginBottom: 18, fontSize: 12 }}>
                  ℹ️ Your profile stays hidden from patients until an admin approves it. You can still log in and prepare your schedule.
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button className="btn btn-lg" type="submit" style={{
                    flex: 2, justifyContent: 'center',
                    background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.35)',
                    color: '#60a5fa',
                  }} disabled={loading}>
                    {loading ? <><span className="spinner" style={{ borderTopColor: '#60a5fa' }} /> Registering...</> : '✓ Create Doctor Account'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </AuthBg>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
