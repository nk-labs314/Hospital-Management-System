import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { departmentAPI, doctorAPI, appointmentAPI } from '../services/api';

const STEPS = ['Speciality', 'Doctor', 'Date & Slot', 'Confirm'];

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState({ availableSlots: [], bookedSlots: [], nextAvailableDates: [] });
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const [selected, setSelected] = useState({
    department: null, doctor: null,
    date: new Date().toISOString().split('T')[0],
    slot: null, reason: '', symptoms: ''
  });

  const [alternatives, setAlternatives] = useState(null); // shown when slot unavailable

  useEffect(() => {
    departmentAPI.getAll().then(r => setDepartments(r.data));
  }, []);

  const selectDept = async (dept) => {
    setSelected(s => ({...s, department: dept, doctor: null, slot: null}));
    setLoading(true);
    try {
      const { data } = await departmentAPI.getDoctors(dept.id);
      setDoctors(data);
    } finally {
      setLoading(false);
    }
    setStep(1);
  };

  const selectDoctor = async (doc) => {
    setSelected(s => ({...s, doctor: doc, slot: null}));
    setStep(2);
    loadSlots(doc.id, selected.date);
  };

  const loadSlots = async (doctorId, date) => {
    setLoading(true);
    try {
      const { data } = await appointmentAPI.getSlots(doctorId, date);
      setSlots(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelected(s => ({...s, date, slot: null}));
    if (selected.doctor) loadSlots(selected.doctor.id, date);
  };

  const handleBook = async () => {
    if (!selected.reason.trim()) { toast.error('Please enter reason for visit'); return; }
    setBooking(true);
    try {
      const { data } = await appointmentAPI.book({
        patientId: user.id,
        doctorId: selected.doctor.id,
        appointmentDate: selected.date,
        timeSlot: selected.slot,
        reasonForVisit: selected.reason,
        symptoms: selected.symptoms,
      });

      if (data.booked) {
        toast.success(`🎉 Appointment confirmed! Token #${data.tokenNumber}`);
        navigate('/appointments');
      } else {
        // Slot taken — show alternatives
        setAlternatives(data);
        toast.error('That slot just got taken! Check alternatives below.');
      }
    } catch (err) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const pickAlternativeSlot = (date, slot) => {
    setSelected(s => ({...s, date, slot}));
    setAlternatives(null);
    loadSlots(selected.doctor.id, date);
  };

  // Today minimum date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="page-header">
        <h1>Book Appointment</h1>
        <p>Find the right doctor and secure your slot</p>
      </div>

      {/* Steps bar */}
      <div className="steps-bar">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Speciality */}
      {step === 0 && (
        <div className="card">
          <h3 className="section-title">Choose a Speciality</h3>
          <div className="dept-grid">
            {departments.map(dept => (
              <div key={dept.id} className="dept-card" onClick={() => selectDept(dept)}>
                <div className="dept-icon">{dept.icon}</div>
                <div className="dept-name">{dept.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Doctor */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Select a Doctor</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>← Back</button>
          </div>
          <p style={{fontSize:13, color:'var(--gray-700)', marginBottom:16}}>
            Department: <strong>{selected.department?.name}</strong>
          </p>
          {loading ? <p>Loading doctors...</p> :
           doctors.length === 0 ? <p>No doctors available in this department.</p> : (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {doctors.map(doc => (
                <div key={doc.id}
                  className={`doctor-card ${selected.doctor?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => selectDoctor(doc)}>
                  <div className="doctor-avatar">
                    {doc.firstName[0]}{doc.lastName[0]}
                  </div>
                  <div className="doctor-info" style={{flex:1}}>
                    <h4>{doc.firstName} {doc.lastName}</h4>
                    <p>{doc.specialization} · {doc.qualification}</p>
                    <p>{doc.experienceYears} years experience</p>
                    <div className="doctor-fee">₹{doc.consultationFee} consultation fee</div>
                  </div>
                  <div style={{fontSize:13, color:'var(--gray-500)'}}>
                    ⭐ {doc.rating > 0 ? doc.rating.toFixed(1) : 'New'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Date & Slot */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pick a Date & Time Slot</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Back</button>
          </div>

          <div className="form-grid" style={{marginBottom:20}}>
            <div className="form-group">
              <label className="form-label">Select Date</label>
              <input className="form-control" type="date" min={today}
                value={selected.date} onChange={e => handleDateChange(e.target.value)} />
            </div>
            <div style={{display:'flex', flexDirection:'column', justifyContent:'flex-end', paddingBottom:18}}>
              <p style={{fontSize:13, color:'var(--gray-700)'}}>
                Doctor: <strong>{selected.doctor?.firstName} {selected.doctor?.lastName}</strong><br/>
                Fee: <strong>₹{selected.doctor?.consultationFee}</strong>
              </p>
            </div>
          </div>

          {loading ? <p>Loading available slots...</p> : (
            <>
              {slots.availableSlots.length === 0 ? (
                <div className="alert alert-info">
                  No slots available on this date.
                  {slots.nextAvailableDates?.length > 0 && (
                    <div style={{marginTop:10}}>
                      <strong>Next available dates:</strong>
                      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
                        {slots.nextAvailableDates.map(d => (
                          <button key={d.date} className="btn btn-outline btn-sm"
                            onClick={() => handleDateChange(d.date)}>
                            {d.dayOfWeek.slice(0,3)}, {d.date} ({d.availableSlotCount} slots)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="section-title">
                    Available Slots
                    <span style={{fontSize:13, fontWeight:400, color:'var(--gray-500)', marginLeft:8}}>
                      ({slots.availableSlots.length} available)
                    </span>
                  </p>
                  <div className="slots-grid">
                    {/* Show all slots: booked greyed, available clickable */}
                    {[...slots.availableSlots, ...slots.bookedSlots]
                      .sort()
                      .map(slot => {
                        const isBooked = slots.bookedSlots.includes(slot);
                        return (
                          <button key={slot}
                            className={`slot-btn ${isBooked ? 'booked' : selected.slot === slot ? 'selected' : ''}`}
                            onClick={() => !isBooked && setSelected(s => ({...s, slot}))}
                            disabled={isBooked}>
                            {slot}{isBooked ? ' 🔴' : ''}
                          </button>
                        );
                      })}
                  </div>
                </>
              )}
            </>
          )}

          {selected.slot && (
            <div style={{marginTop:20}}>
              <div className="alert alert-success">
                ✅ Selected: <strong>{selected.slot}</strong> on <strong>{selected.date}</strong>
              </div>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Confirm Appointment</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>← Back</button>
          </div>

          {/* Summary */}
          <div style={{background:'var(--gray-50)', borderRadius:'var(--radius-md)', padding:20, marginBottom:20}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px', fontSize:14}}>
              {[
                ['Department', selected.department?.name],
                ['Doctor', `${selected.doctor?.firstName} ${selected.doctor?.lastName}`],
                ['Specialization', selected.doctor?.specialization],
                ['Date', selected.date],
                ['Time Slot', selected.slot],
                ['Consultation Fee', `₹${selected.doctor?.consultationFee}`],
              ].map(([k,v]) => (
                <div key={k}>
                  <span style={{color:'var(--gray-500)', fontSize:12}}>{k}</span>
                  <div style={{fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Visit *</label>
            <input className="form-control" placeholder="e.g. Chest pain, Routine checkup..."
              value={selected.reason} onChange={e => setSelected(s => ({...s, reason: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Symptoms (optional)</label>
            <textarea className="form-control" rows={3}
              placeholder="Describe your symptoms..."
              value={selected.symptoms} onChange={e => setSelected(s => ({...s, symptoms: e.target.value}))} />
          </div>

          <div className="alert alert-info" style={{marginBottom:16}}>
            📧 A confirmation email will be sent to <strong>{user.email}</strong>
          </div>

          {alternatives && (
            <div className="alert alert-danger" style={{marginBottom:16}}>
              <strong>⚠️ Slot just got taken!</strong> Here are alternatives:
              <div style={{marginTop:10, display:'flex', flexWrap:'wrap', gap:8}}>
                {alternatives.sameDayAlternatives?.map(s => (
                  <button key={s} className="btn btn-outline btn-sm"
                    onClick={() => pickAlternativeSlot(selected.date, s)}>
                    {s} (same day)
                  </button>
                ))}
                {alternatives.nextAvailableDates?.slice(0,3).map(d => (
                  <button key={d.date} className="btn btn-ghost btn-sm"
                    onClick={() => { setStep(2); handleDateChange(d.date); }}>
                    {d.date} ({d.firstSlot})
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-success" style={{padding:'12px 28px'}}
            onClick={handleBook} disabled={booking}>
            {booking ? <><span className="spinner" /> Booking...</> : '✅ Confirm Appointment'}
          </button>
        </div>
      )}
    </div>
  );
}
