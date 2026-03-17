import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { doctorAPI, apptAPI, adminAPI } from '../services/api';

const SB = { CONFIRMED:'b-confirmed', PENDING:'b-pending', CANCELLED:'b-cancelled', COMPLETED:'b-completed', NO_SHOW:'b-no_show' };
const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

/* ══════════════════════════════════
   DOCTOR DASHBOARD
══════════════════════════════════ */
export function DoctorDashboard() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState([]);
  const [noteModal, setNoteModal] = useState(null);
  const [noteForm, setNoteForm] = useState({ notes:'', prescription:'', status:'COMPLETED' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorAPI.getProfile(user.id).then(r => {
      setDoctor(r.data);
      apptAPI.getDoctorStats(r.data.id).then(s => setStats(s.data));
      apptAPI.getDoctorToday(r.data.id).then(t => setToday(t.data));
    });
  }, [user.id]);

  const openNote = (apt) => { setNoteModal(apt); setNoteForm({ notes:apt.notes||'', prescription:apt.prescription||'', status:'COMPLETED' }); };

  const saveNote = async () => {
    setSaving(true);
    try {
      await apptAPI.updateStatus(noteModal.id, noteForm);
      toast.success('Visit record saved');
      setNoteModal(null);
      apptAPI.getDoctorToday(doctor.id).then(r => setToday(r.data));
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header anim-up">
        <div className="page-title">Good {greet()}, Dr. {user.fullName.split(' ')[0]} 👨‍⚕️</div>
        <div className="page-sub">{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
      </div>

      <div className="stats-grid anim-up d100">
        {[
          {icon:'📅', c:'si-teal',  v: today.length,               l:'Today\'s Patients'},
          {icon:'⏳', c:'si-amber', v: stats?.pendingAppointments||0, l:'Pending'},
          {icon:'✅', c:'si-green', v: stats?.completedTotal||0,      l:'Completed Total'},
          {icon:'❌', c:'si-red',   v: stats?.cancelledTotal||0,      l:'Cancelled'},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className={`stat-icon-wrap ${s.c}`}>{s.icon}</div>
            <div><div className="stat-value">{s.v}</div><div className="stat-label">{s.l}</div></div>
          </div>
        ))}
      </div>

      <div className="card anim-up d200">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div className="section-title" style={{ marginBottom:0 }}>Today's Schedule</div>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{today.filter(a=>a.status==='CONFIRMED').length} confirmed</span>
        </div>
        {today.length===0 ? (
          <div className="empty-state"><div className="empty-icon">🎉</div><div className="empty-text">No appointments today!</div></div>
        ) : (
          today.sort((a,b)=>a.timeSlot.localeCompare(b.timeSlot)).map(apt => (
            <div key={apt.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
              <div style={{
                width:40, height:40, borderRadius:'50%',
                background:'var(--teal-glow)', border:'1px solid var(--teal-border)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-display)', fontWeight:800, fontSize:13, color:'var(--teal)', flexShrink:0
              }}>#{apt.tokenNumber||'?'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{apt.patientName}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>⏰ {apt.timeSlot} · {apt.reasonForVisit}</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span className={`badge ${SB[apt.status]}`}>{apt.status}</span>
                {apt.status==='CONFIRMED' && (
                  <button className="btn btn-success btn-sm" onClick={()=>openNote(apt)}>Complete ✓</button>
                )}
                {apt.status==='COMPLETED' && (
                  <button className="btn btn-ghost btn-sm" onClick={()=>openNote(apt)}>Edit</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {doctor && (
        <div className="card anim-up d300" style={{ marginTop:20 }}>
          <div className="section-title">My Details</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px 24px' }}>
            {[['Department',doctor.departmentName],['Specialization',doctor.specialization],['Qualification',doctor.qualification],['Experience',`${doctor.experienceYears} yrs`],['Fee',`₹${doctor.consultationFee}`],['Slot',`${doctor.slotDurationMinutes} min`]].map(([k,v])=>(
              <div key={k}>
                <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {noteModal && (
        <div className="modal-overlay" onClick={()=>setNoteModal(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontFamily:'var(--font-display)', marginBottom:4 }}>Complete Visit</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:18 }}>
              {noteModal.patientName} · Token #{noteModal.tokenNumber}
            </p>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={noteForm.status} onChange={e=>setNoteForm(f=>({...f,status:e.target.value}))}>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Diagnosis / Notes</label>
              <textarea className="form-control" rows={3} value={noteForm.notes} onChange={e=>setNoteForm(f=>({...f,notes:e.target.value}))} placeholder="Findings, diagnosis..." />
            </div>
            <div className="form-group">
              <label className="form-label">Prescription</label>
              <textarea className="form-control" rows={4} value={noteForm.prescription} onChange={e=>setNoteForm(f=>({...f,prescription:e.target.value}))} placeholder="Medicines, dosage, instructions..." />
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button className="btn btn-ghost" onClick={()=>setNoteModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={saveNote} disabled={saving}>{saving?'Saving...':'Save Record ✓'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   DOCTOR SCHEDULE
══════════════════════════════════ */
export function DoctorSchedule() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [allApts, setAllApts] = useState([]);
  const [tab, setTab] = useState('schedule');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorAPI.getProfile(user.id).then(r => {
      setDoctor(r.data); setSchedule(r.data.weeklySchedule||{});
      apptAPI.getDoctorAppts(r.data.id).then(a => setAllApts(a.data));
    });
  }, [user.id]);

  const allSlots = () => {
    const s=[];
    for(let h=6;h<22;h++){s.push(`${String(h).padStart(2,'0')}:00`);s.push(`${String(h).padStart(2,'0')}:30`);}
    return s;
  };

  const toggleSlot = (day, slot) => {
    setSchedule(p => {
      const cur = p[day]||[];
      return {...p, [day]: cur.includes(slot)?cur.filter(s=>s!==slot):[...cur,slot].sort()};
    });
  };
  const toggleDay = (day) => {
    setSchedule(p => ({...p, [day]: (p[day]?.length>0)?[]:allSlots().filter(s=>s>='09:00'&&s<'17:00')}));
  };
  const save = async () => {
    setSaving(true);
    try { await doctorAPI.updateSchedule(doctor.id, schedule); toast.success('Schedule saved!'); }
    catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header anim-up">
        <div className="page-title">Schedule Management</div>
        <div className="page-sub">Configure available time slots and view appointments</div>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:20 }} className="anim-up d100">
        {['schedule','appointments'].map(t=>(
          <button key={t} className={`btn ${tab===t?'btn-outline':'btn-ghost'}`} onClick={()=>setTab(t)}>
            {t==='schedule'?'🗓 Weekly Schedule':'📋 All Appointments'}
          </button>
        ))}
      </div>

      {tab==='schedule' && (
        <div className="card anim-up d200">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div className="section-title" style={{ marginBottom:0 }}>Weekly Availability</div>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save Schedule'}</button>
          </div>
          {DAYS.map(day => {
            const daySlots = schedule[day]||[];
            const active = daySlots.length>0;
            return (
              <div key={day} style={{ marginBottom:12, border:'1px solid var(--border)', borderRadius:'var(--r-md)', overflow:'hidden' }}>
                <div style={{ padding:'10px 16px', background:active?'var(--teal-glow)':'var(--bg-elevated)', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', borderBottom:active?'1px solid var(--teal-border)':'none' }} onClick={()=>toggleDay(day)}>
                  <span style={{ fontWeight:700, color:active?'var(--teal)':'var(--text-secondary)', fontSize:13 }}>{active?'◉':'○'} {day}</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{daySlots.length} slots</span>
                </div>
                {active && (
                  <div style={{ padding:12 }}>
                    <div className="slots-grid">
                      {allSlots().map(s => (
                        <button key={s} className={`slot-pill ${daySlots.includes(s)?'selected':''}`} onClick={()=>toggleSlot(day,s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab==='appointments' && (
        <div className="card anim-up d200">
          <div className="section-title">All Appointments ({allApts.length})</div>
          {allApts.length===0 ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">No appointments yet.</div></div> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Token</th><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {allApts.map(a=>(
                    <tr key={a.id}>
                      <td><strong style={{ color:'var(--teal)' }}>#{a.tokenNumber||'—'}</strong></td>
                      <td><div style={{ fontWeight:600, color:'var(--text-primary)' }}>{a.patientName}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.patientEmail}</div></td>
                      <td>{a.appointmentDate}</td><td>{a.timeSlot}</td>
                      <td style={{ maxWidth:160, fontSize:12, color:'var(--text-secondary)' }}>{a.reasonForVisit}</td>
                      <td><span className={`badge ${SB[a.status]}`}>{a.status}</span></td>
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

/* ══════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════ */
export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { adminAPI.getStats().then(r=>setStats(r.data)); }, []);
  const appt = stats?.appointmentStats||{};
  const recent = appt.recentAppointments||[];
  const byDept = appt.appointmentsByDepartment||{};

  return (
    <div>
      <div className="page-header anim-up">
        <div className="page-title">Admin Overview 🏥</div>
        <div className="page-sub">Hospital-wide statistics and management</div>
      </div>
      <div className="stats-grid anim-up d100">
        {[
          {icon:'👥',c:'si-teal',  v:stats?.totalPatients||0,        l:'Total Patients'},
          {icon:'👨‍⚕️',c:'si-blue', v:stats?.totalDoctors||0,         l:'Doctors'},
          {icon:'🏥',c:'si-green', v:stats?.totalDepartments||0,      l:'Departments'},
          {icon:'📅',c:'si-amber', v:appt.totalAppointments||0,       l:'Total Appointments'},
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div className={`stat-icon-wrap ${s.c}`}>{s.icon}</div>
            <div><div className="stat-value">{s.v}</div><div className="stat-label">{s.l}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div className="section-title">Appointment Breakdown</div>
          {[{l:'Confirmed',v:appt.confirmedAppointments||0,c:'#22c55e'},{l:'Completed',v:appt.completedAppointments||0,c:'var(--blue)'},{l:'Pending',v:appt.pendingAppointments||0,c:'var(--warning)'}].map(item=>{
            const pct = Math.round((item.v/(appt.totalAppointments||1))*100);
            return (
              <div key={item.l} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
                  <span style={{ color:'var(--text-secondary)' }}>{item.l}</span>
                  <span style={{ fontWeight:700 }}>{item.v} <span style={{ color:'var(--text-muted)', fontWeight:400 }}>({pct}%)</span></span>
                </div>
                <div style={{ height:6, background:'var(--bg-elevated)', borderRadius:999 }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:item.c, borderRadius:999, transition:'width 0.6s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="section-title">By Department</div>
          {Object.entries(byDept).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([dept,cnt])=>(
            <div key={dept} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ color:'var(--text-secondary)' }}>{dept}</span>
              <span style={{ fontWeight:700, color:'var(--teal)' }}>{cnt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Recent Appointments</div>
        {recent.length===0 ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>No data yet.</p> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map(a=>(
                  <tr key={a.id}>
                    <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{a.patientName}</td>
                    <td>{a.doctorName}</td><td>{a.departmentName}</td>
                    <td>{a.appointmentDate} · {a.timeSlot}</td>
                    <td><span className={`badge ${SB[a.status]}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   ADMIN: DOCTORS
══════════════════════════════════ */
export function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [depts, setDepts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'Doctor@123', phone:'', departmentId:'', specialization:'', qualification:'', experienceYears:0, consultationFee:500, bio:'' });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const load = () => Promise.all([adminAPI.getDoctors(), adminAPI.getDepts()]).then(([d,dp])=>{ setDoctors(d.data); setDepts(dp.data); });
  useEffect(()=>{ load(); },[]);

  const create = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await adminAPI.createDoctor(form); toast.success('Doctor created!'); setShowForm(false); load(); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };
  const deactivate = async (id) => {
    if(!window.confirm('Deactivate doctor?')) return;
    await adminAPI.deactivate(id); toast.success('Deactivated'); load();
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }} className="anim-up">
        <div><div className="page-title">Manage Doctors</div><div className="page-sub">Add and manage physician accounts</div></div>
        <button className="btn btn-primary" onClick={()=>setShowForm(true)}>+ Add Doctor</button>
      </div>
      <div className="card anim-up d100">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Doctor</th><th>Department</th><th>Specialization</th><th>Exp</th><th>Fee</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {doctors.map(d=>(
                <tr key={d.id}>
                  <td>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div className="doc-avatar" style={{ width:34, height:34, fontSize:12 }}>{d.firstName?.[0]}{d.lastName?.[0]}</div>
                      <div><div style={{ fontWeight:700, color:'var(--text-primary)' }}>Dr. {d.firstName} {d.lastName}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{d.email}</div></div>
                    </div>
                  </td>
                  <td>{d.departmentName}</td><td>{d.specialization}</td>
                  <td>{d.experienceYears}y</td><td>₹{d.consultationFee}</td>
                  <td><span className={`badge ${d.active?'b-active':'b-inactive'}`}>{d.active?'Active':'Inactive'}</span></td>
                  <td>{d.active&&<button className="btn btn-danger btn-sm" onClick={()=>deactivate(d.id)}>Deactivate</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal-box" style={{ maxWidth:540 }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)' }}>Add New Doctor</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={create}>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={form.firstName} onChange={e=>set('firstName',e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={form.lastName} onChange={e=>set('lastName',e.target.value)} required /></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-control" value={form.departmentId} onChange={e=>set('departmentId',e.target.value)} required>
                  <option value="">Select</option>
                  {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Specialization</label><input className="form-control" value={form.specialization} onChange={e=>set('specialization',e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Qualification</label><input className="form-control" value={form.qualification} onChange={e=>set('qualification',e.target.value)} required /></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Experience (yrs)</label><input className="form-control" type="number" value={form.experienceYears} onChange={e=>set('experienceYears',e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Fee (₹)</label><input className="form-control" type="number" value={form.consultationFee} onChange={e=>set('consultationFee',e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Bio</label><textarea className="form-control" rows={2} value={form.bio} onChange={e=>set('bio',e.target.value)} /></div>
              <div className="alert alert-info" style={{ fontSize:12, marginBottom:14 }}>Default password: <strong>Doctor@123</strong></div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Creating...':'Create Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   ADMIN: PATIENTS
══════════════════════════════════ */
export function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const load = () => adminAPI.getPatients().then(r=>setPatients(r.data));
  useEffect(()=>{ load(); },[]);
  const toggle = async (id) => { await adminAPI.toggleUser(id); toast.success('Updated'); load(); };
  const filtered = patients.filter(p => {
    const q=search.toLowerCase();
    return !q||`${p.firstName} ${p.lastName}`.toLowerCase().includes(q)||p.email?.includes(q);
  });
  return (
    <div>
      <div className="page-header anim-up"><div className="page-title">Patients</div><div className="page-sub">View and manage registered patients</div></div>
      <div style={{ marginBottom:16 }} className="anim-up d100">
        <input className="form-control" style={{ maxWidth:300 }} placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      <div className="card anim-up d200">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Patient</th><th>Phone</th><th>Gender</th><th>Blood</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(p=>(
                <tr key={p.id}>
                  <td>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div className="avatar" style={{ width:32, height:32, fontSize:12 }}>{p.firstName?.[0]}{p.lastName?.[0]}</div>
                      <div><div style={{ fontWeight:600, color:'var(--text-primary)' }}>{p.firstName} {p.lastName}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{p.email}</div></div>
                    </div>
                  </td>
                  <td>{p.phone||'—'}</td><td>{p.gender||'—'}</td><td>{p.bloodGroup||'—'}</td>
                  <td><span className={`badge ${p.active?'b-active':'b-inactive'}`}>{p.active?'Active':'Blocked'}</span></td>
                  <td><button className={`btn btn-sm ${p.active?'btn-danger':'btn-success'}`} onClick={()=>toggle(p.id)}>{p.active?'Block':'Unblock'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   ADMIN: APPOINTMENTS
══════════════════════════════════ */
export function AdminAppointments() {
  const [apts, setApts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  useEffect(()=>{ adminAPI.getAppointments().then(r=>setApts(r.data)); },[]);
  const filtered = apts.filter(a=>filter==='ALL'||a.status===filter).filter(a=>{
    const q=search.toLowerCase();
    return !q||a.patientName?.toLowerCase().includes(q)||a.doctorName?.toLowerCase().includes(q)||a.departmentName?.toLowerCase().includes(q);
  });
  return (
    <div>
      <div className="page-header anim-up"><div className="page-title">All Appointments</div><div className="page-sub">Monitor every booking across the hospital</div></div>
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }} className="anim-up d100">
        <input className="form-control" style={{ maxWidth:240 }} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['ALL','CONFIRMED','COMPLETED','PENDING','CANCELLED'].map(t=>(
            <button key={t} className={`btn btn-sm ${filter===t?'btn-outline':'btn-ghost'}`} onClick={()=>setFilter(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="card anim-up d200">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Dept</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id}>
                  <td><strong style={{ color:'var(--teal)' }}>#{a.tokenNumber||'—'}</strong></td>
                  <td><div style={{ fontWeight:600, color:'var(--text-primary)' }}>{a.patientName}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.patientEmail}</div></td>
                  <td style={{ color:'var(--text-secondary)' }}>{a.doctorName}</td>
                  <td>{a.departmentName}</td>
                  <td style={{ fontSize:12 }}>{a.appointmentDate}<br/><span style={{ color:'var(--text-muted)' }}>{a.timeSlot}</span></td>
                  <td><span className={`badge ${SB[a.status]}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function greet() { const h=new Date().getHours(); return h<12?'Morning':h<17?'Afternoon':'Evening'; }
