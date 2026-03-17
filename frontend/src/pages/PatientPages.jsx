import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apptAPI, authAPI } from '../services/api';

const SB = { CONFIRMED:'b-confirmed', PENDING:'b-pending', CANCELLED:'b-cancelled', COMPLETED:'b-completed', NO_SHOW:'b-no_show' };

/* ═══ Patient Dashboard ═══ */
export function PatientDashboard() {
  const { user } = useAuth();
  const [apts, setApts] = useState([]);

  useEffect(() => {
    apptAPI.getMine(user.id).then(r => setApts(r.data)).catch(console.error);
  }, [user.id]);

  const upcoming = apts.filter(a => ['CONFIRMED','PENDING'].includes(a.status));
  const completed = apts.filter(a => a.status === 'COMPLETED').length;

  return (
    <div>
      <div className="page-header anim-up">
        <div className="page-title">Good {greeting()}, {user.fullName.split(' ')[0]} 👋</div>
        <div className="page-sub">Here's your health summary for today</div>
      </div>

      <div className="stats-grid anim-up d100">
        <StatCard icon="📅" color="si-teal"  val={upcoming.length}  label="Upcoming Visits" />
        <StatCard icon="✅" color="si-green" val={completed}         label="Completed" />
        <StatCard icon="📋" color="si-blue"  val={apts.length}       label="Total Appointments" />
        <StatCard icon="💊" color="si-amber" val={apts.filter(a=>a.prescription).length} label="Prescriptions" />
      </div>

      {/* Hero book card */}
      <div className="anim-up d200" style={{
        background: 'linear-gradient(135deg, #0a2a4a 0%, #0d3a5c 50%, #0a2440 100%)',
        border: '1px solid rgba(0,201,177,0.2)',
        borderRadius: 'var(--r-xl)', padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(0,201,177,0.08) 0%, transparent 70%)',
        }} />
        <div>
          <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>Quick Action</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Book a New Appointment
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 340 }}>
            Choose from 12 specialities and 500+ doctors. Instant slot confirmation.
          </div>
        </div>
        <Link to="/book" className="btn btn-primary btn-lg" style={{ flexShrink: 0 }}>
          Book Now →
        </Link>
      </div>

      {/* Upcoming */}
      <div className="card anim-up d300">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 18 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Upcoming Appointments</div>
          <Link to="/appointments" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-text">No upcoming appointments. <Link to="/book" style={{color:'var(--teal)'}}>Book one now!</Link></div></div>
        ) : (
          upcoming.slice(0,4).map(a => <AptRow key={a.id} apt={a} />)
        )}
      </div>
    </div>
  );
}

/* ═══ My Appointments ═══ */
export function MyAppointments() {
  const { user } = useAuth();
  const [apts, setApts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reason, setReason] = useState('');

  const load = () => apptAPI.getMine(user.id).then(r => setApts(r.data));
  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? apts : apts.filter(a => a.status === filter);

  const doCancel = async () => {
    if (!reason.trim()) { toast.error('Please enter a reason'); return; }
    await apptAPI.cancel(cancelTarget.id, reason);
    toast.success('Appointment cancelled');
    setCancelTarget(null); setReason('');
    load();
  };

  return (
    <div>
      <div className="page-header anim-up">
        <div className="page-title">My Appointments</div>
        <div className="page-sub">Track and manage your visit history</div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }} className="anim-up d100">
        {['ALL','CONFIRMED','COMPLETED','PENDING','CANCELLED'].map(t => (
          <button key={t} className={`btn btn-sm ${filter===t?'btn-outline':'btn-ghost'}`} onClick={()=>setFilter(t)}>
            {t} {t==='ALL'?`(${apts.length})`:`(${apts.filter(a=>a.status===t).length})`}
          </button>
        ))}
      </div>

      <div className="card anim-up d200">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">No appointments found.</div></div>
        ) : (
          filtered.map(apt => (
            <div key={apt.id} style={{ padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                <div>
                  <div style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:3 }}>{apt.doctorName}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>🏥 {apt.departmentName}</div>
                  <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:6, display:'flex', gap:16, flexWrap:'wrap' }}>
                    <span>📅 {apt.appointmentDate}</span>
                    <span>⏰ {apt.timeSlot}</span>
                    {apt.tokenNumber && <span style={{ color:'var(--teal)', fontWeight:700 }}>🎫 #{apt.tokenNumber}</span>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>📋 {apt.reasonForVisit}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                  <span className={`badge ${SB[apt.status]}`}>{apt.status}</span>
                  {apt.status==='CONFIRMED' && (
                    <button className="btn btn-danger btn-sm" onClick={()=>setCancelTarget(apt)}>Cancel</button>
                  )}
                </div>
              </div>
              {(apt.notes||apt.prescription) && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                  {apt.notes && <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:6 }}><span style={{color:'var(--text-muted)'}}>Notes: </span>{apt.notes}</div>}
                  {apt.prescription && (
                    <div style={{ fontSize:13, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'var(--r-sm)', padding:'10px 12px', color:'#86efac' }}>
                      💊 {apt.prescription}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {cancelTarget && (
        <div className="modal-overlay" onClick={()=>setCancelTarget(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontFamily:'var(--font-display)', marginBottom:12 }}>Cancel Appointment</h3>
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>
              Cancel appointment with <strong>{cancelTarget.doctorName}</strong> on {cancelTarget.appointmentDate} at {cancelTarget.timeSlot}?
            </p>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea className="form-control" rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Why are you cancelling?" />
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button className="btn btn-ghost" onClick={()=>setCancelTarget(null)}>Keep it</button>
              <button className="btn btn-danger" onClick={doCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ Medical Records ═══ */
export function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    apptAPI.getMine(user.id).then(r => {
      setRecords(r.data.filter(a => a.status==='COMPLETED' || a.notes || a.prescription));
    });
  }, []);

  return (
    <div>
      <div className="page-header anim-up">
        <div className="page-title">Medical Records</div>
        <div className="page-sub">Complete history of diagnoses and prescriptions</div>
      </div>

      {records.length === 0 ? (
        <div className="card anim-up"><div className="empty-state"><div className="empty-icon">🗂️</div><div className="empty-text">No records yet. Completed visits will appear here.</div></div></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }} className="anim-up d100">
          {records.map(rec => (
            <div key={rec.id} className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}
                onClick={()=>setExpanded(expanded===rec.id?null:rec.id)}>
                <div>
                  <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{rec.doctorName}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                    {rec.departmentName} · {rec.appointmentDate} · {rec.timeSlot}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  {rec.prescription && <span className="badge b-confirmed">💊 Rx</span>}
                  <span style={{ color:'var(--text-muted)', fontSize:12 }}>{expanded===rec.id?'▲':'▼'}</span>
                </div>
              </div>
              {expanded===rec.id && (
                <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)', background:'var(--bg-elevated)' }}>
                  <div className="form-grid" style={{ gap:'10px 24px', marginBottom:16 }}>
                    {[['Reason',rec.reasonForVisit],['Symptoms',rec.symptoms||'—'],['Status',rec.status],['Token',rec.tokenNumber?`#${rec.tokenNumber}`:'—']].map(([k,v])=>(
                      <div key={k}>
                        <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:3 }}>{k}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {rec.notes && <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:10 }}><span style={{color:'var(--text-muted)'}}>Notes: </span>{rec.notes}</div>}
                  {rec.prescription && (
                    <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'var(--r-sm)', padding:'12px 14px', fontSize:13, color:'#86efac', whiteSpace:'pre-line' }}>
                      💊 <strong>Prescription:</strong><br/>{rec.prescription}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ Profile ═══ */
export function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ firstName:user.fullName?.split(' ')[0]||'', lastName:user.fullName?.split(' ').slice(1).join(' ')||'', phone:'', address:'', bloodGroup:'' });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await authAPI.updateProfile(form);
      login({ ...user, fullName:`${form.firstName} ${form.lastName}` }, localStorage.getItem('token'));
      toast.success('Profile updated!');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header anim-up"><div className="page-title">My Profile</div><div className="page-sub">Manage personal information</div></div>
      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:20, alignItems:'start' }} className="anim-up d100">
        <div className="card" style={{ textAlign:'center', padding:28 }}>
          <div className="avatar avatar-lg" style={{ margin:'0 auto 16px' }}>
            {user.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div style={{ fontWeight:700, marginBottom:4 }}>{user.fullName}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>{user.email}</div>
          <span className="badge b-patient">Patient</span>
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom:20 }}>Edit Information</div>
          <form onSubmit={save}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={form.firstName} onChange={e=>set('firstName',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={form.lastName} onChange={e=>set('lastName',e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={user.email} disabled style={{opacity:0.5,cursor:'not-allowed'}} /></div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-control" value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><textarea className="form-control" rows={2} value={form.address} onChange={e=>set('address',e.target.value)} /></div>
            <button className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */
function AptRow({ apt }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom:'1px solid var(--border)', flexWrap:'wrap', gap:8 }}>
      <div>
        <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:14 }}>{apt.doctorName}</div>
        <div style={{ fontSize:12, color:'var(--text-muted)' }}>{apt.departmentName} · {apt.appointmentDate} · {apt.timeSlot}</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {apt.tokenNumber && <span style={{ color:'var(--teal)', fontWeight:700, fontSize:13 }}>#{apt.tokenNumber}</span>}
        <span className={`badge ${SB[apt.status]}`}>{apt.status}</span>
      </div>
    </div>
  );
}

function StatCard({ icon, color, val, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrap ${color}`}><span>{icon}</span></div>
      <div><div className="stat-value">{val}</div><div className="stat-label">{label}</div></div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h<12?'Morning':h<17?'Afternoon':'Evening';
}
