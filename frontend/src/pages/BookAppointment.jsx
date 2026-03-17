import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { deptAPI, apptAPI } from '../services/api';

const STEPS = ['Speciality', 'Doctor', 'Date & Slot', 'Confirm'];

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [depts, setDepts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState({ availableSlots:[], bookedSlots:[], nextAvailableDates:[] });
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [sel, setSel] = useState({ dept:null, doctor:null, date:today(), slot:null, reason:'', symptoms:'' });
  const [alts, setAlts] = useState(null);

  useEffect(() => { deptAPI.getAll().then(r => setDepts(r.data)); }, []);

  const selectDept = async (d) => {
    setSel(s => ({...s, dept:d, doctor:null, slot:null}));
    setLoading(true);
    const { data } = await deptAPI.getDoctors(d.id);
    setDoctors(data); setLoading(false); setStep(1);
  };

  const selectDoctor = async (doc) => {
    setSel(s => ({...s, doctor:doc, slot:null}));
    loadSlots(doc.id, sel.date); setStep(2);
  };

  const loadSlots = async (docId, date) => {
    setLoading(true);
    const { data } = await apptAPI.getSlots(docId, date);
    setSlots(data); setLoading(false);
  };

  const handleDate = (date) => {
    setSel(s => ({...s, date, slot:null}));
    if (sel.doctor) loadSlots(sel.doctor.id, date);
  };

  const handleBook = async () => {
    if (!sel.reason.trim()) { toast.error('Please enter a reason for visit'); return; }
    setBooking(true);
    try {
      const { data } = await apptAPI.book({
        patientId: user.id, doctorId: sel.doctor.id,
        appointmentDate: sel.date, timeSlot: sel.slot,
        reasonForVisit: sel.reason, symptoms: sel.symptoms,
      });
      if (data.booked) {
        toast.success(`🎉 Booked! Your token is #${data.tokenNumber}`);
        navigate('/appointments');
      } else {
        setAlts(data);
        toast.error('Slot just got taken! Alternatives shown below.');
      }
    } catch { toast.error('Booking failed'); }
    finally { setBooking(false); }
  };

  return (
    <div>
      <div className="page-header anim-up">
        <div className="page-title">Book Appointment</div>
        <div className="page-sub">Find a specialist and secure your slot in minutes</div>
      </div>

      {/* Steps */}
      <div className="steps-bar anim-up d100">
        {STEPS.map((lbl, i) => (
          <React.Fragment key={lbl}>
            <div className={`step ${i<step?'done':i===step?'active':''}`}>
              <div className="step-num">{i<step?'✓':i+1}</div>
              <span className="step-lbl">{lbl}</span>
            </div>
            {i<STEPS.length-1 && <div className={`step-line ${i<step?'done':''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0 */}
      {step===0 && (
        <div className="card anim-up d200">
          <div className="section-title">Choose a Speciality</div>
          <div className="dept-grid">
            {depts.map(d => (
              <div key={d.id} className={`dept-tile ${sel.dept?.id===d.id?'selected':''}`} onClick={()=>selectDept(d)}>
                <div className="dept-emoji">{d.icon}</div>
                <div className="dept-name">{d.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 */}
      {step===1 && (
        <div className="card anim-up d200">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="section-title" style={{ marginBottom:0 }}>Select a Doctor</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setStep(0)}>← Back</button>
          </div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>
            Department: <span style={{ color:'var(--teal)', fontWeight:600 }}>{sel.dept?.name}</span>
          </div>
          {loading ? <p style={{ color:'var(--text-muted)' }}>Loading doctors...</p> :
          doctors.length===0 ? <p style={{ color:'var(--text-muted)' }}>No doctors in this department.</p> : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {doctors.map(doc => (
                <div key={doc.id} className={`doctor-tile ${sel.doctor?.id===doc.id?'selected':''}`} onClick={()=>selectDoctor(doc)}>
                  <div className="doc-avatar">{doc.firstName[0]}{doc.lastName[0]}</div>
                  <div style={{ flex:1 }}>
                    <div className="doc-name">Dr. {doc.firstName} {doc.lastName}</div>
                    <div className="doc-spec">{doc.specialization} · {doc.qualification}</div>
                    <div className="doc-exp">{doc.experienceYears} yrs experience</div>
                    <div className="doc-fee">₹{doc.consultationFee} / visit</div>
                  </div>
                  {sel.doctor?.id===doc.id && <div style={{ color:'var(--teal)', fontSize:18 }}>✓</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2 */}
      {step===2 && (
        <div className="card anim-up d200">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div className="section-title" style={{ marginBottom:0 }}>Pick a Date & Slot</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setStep(1)}>← Back</button>
          </div>
          <div className="form-grid" style={{ marginBottom:20 }}>
            <div className="form-group">
              <label className="form-label">Select Date</label>
              <input className="form-control" type="date" min={today()} value={sel.date} onChange={e=>handleDate(e.target.value)} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', paddingBottom:18 }}>
              <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
                <div>Dr. {sel.doctor?.firstName} {sel.doctor?.lastName}</div>
                <div style={{ color:'var(--teal)', fontWeight:700, marginTop:3 }}>₹{sel.doctor?.consultationFee}</div>
              </div>
            </div>
          </div>

          {loading ? <p style={{ color:'var(--text-muted)' }}>Checking availability...</p> : (
            slots.availableSlots.length===0 ? (
              <div>
                <div className="alert alert-warning">No slots available on this date.</div>
                {slots.nextAvailableDates?.length>0 && (
                  <div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10, fontWeight:600 }}>NEXT AVAILABLE</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {slots.nextAvailableDates.map(d=>(
                        <button key={d.date} className="btn btn-outline btn-sm" onClick={()=>handleDate(d.date)}>
                          {d.dayOfWeek.slice(0,3)}, {d.date} ({d.availableSlotCount} slots)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10, fontWeight:600 }}>
                  AVAILABLE — {slots.availableSlots.length} SLOTS
                </div>
                <div className="slots-grid">
                  {[...new Set([...slots.availableSlots, ...slots.bookedSlots])].sort().map(slot => {
                    const booked = slots.bookedSlots.includes(slot);
                    return (
                      <button key={slot} className={`slot-pill ${booked?'booked':sel.slot===slot?'selected':''}`}
                        onClick={()=>!booked&&setSel(s=>({...s,slot}))} disabled={booked}>
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </>
            )
          )}

          {sel.slot && (
            <div style={{ marginTop:20 }}>
              <div className="alert alert-success" style={{ marginBottom:16 }}>
                ✅ Selected: <strong>{sel.slot}</strong> on <strong>{sel.date}</strong>
              </div>
              <button className="btn btn-primary" onClick={()=>setStep(3)}>Continue →</button>
            </div>
          )}
        </div>
      )}

      {/* Step 3 */}
      {step===3 && (
        <div className="card anim-up d200">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div className="section-title" style={{ marginBottom:0 }}>Confirm Appointment</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setStep(2)}>← Back</button>
          </div>

          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:20, marginBottom:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 24px' }}>
              {[
                ['Department', sel.dept?.name],
                ['Doctor', `Dr. ${sel.doctor?.firstName} ${sel.doctor?.lastName}`],
                ['Specialization', sel.doctor?.specialization],
                ['Date', sel.date],
                ['Time Slot', sel.slot],
                ['Fee', `₹${sel.doctor?.consultationFee}`],
              ].map(([k,v]) => (
                <div key={k}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Visit *</label>
            <input className="form-control" placeholder="e.g. Chest pain, routine check-up..."
              value={sel.reason} onChange={e=>setSel(s=>({...s,reason:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Symptoms (optional)</label>
            <textarea className="form-control" rows={3} placeholder="Describe your symptoms..."
              value={sel.symptoms} onChange={e=>setSel(s=>({...s,symptoms:e.target.value}))} />
          </div>
          <div className="alert alert-info" style={{ marginBottom:16 }}>
            📧 Confirmation email will be sent to <strong>{user.email}</strong>
          </div>

          {alts && (
            <div className="alert alert-warning" style={{ marginBottom:16 }}>
              <strong>⚠ Slot just got taken!</strong> Pick an alternative:
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:10 }}>
                {alts.sameDayAlternatives?.map(s=>(
                  <button key={s} className="btn btn-outline btn-sm" onClick={()=>{ setSel(p=>({...p,slot:s})); setAlts(null); }}>
                    {s} (same day)
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-lg" onClick={handleBook} disabled={booking}>
            {booking ? <><span className="spinner" style={{borderTopColor:'var(--bg-base)'}} /> Booking...</> : '✓ Confirm Appointment'}
          </button>
        </div>
      )}
    </div>
  );
}

function today() { return new Date().toISOString().split('T')[0]; }
