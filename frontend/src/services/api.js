import axios from 'axios';

export const authAPI = {
  register:      (d) => axios.post('/api/auth/register', d),
  registerDoctor:(d) => axios.post('/api/auth/register-doctor', d),
  login:         (d) => axios.post('/api/auth/login', d),
  me:            ()  => axios.get('/api/auth/me'),
  updateProfile: (d) => axios.put('/api/auth/profile', d),
};
export const deptAPI = {
  getAll:      () => axios.get('/api/departments'),
  getDoctors:  (id) => axios.get(`/api/departments/${id}/doctors`),
};
export const doctorAPI = {
  getAll:         () => axios.get('/api/doctors/public'),
  getById:        (id) => axios.get(`/api/doctors/public/${id}`),
  getByDept:      (id) => axios.get(`/api/doctors/public/department/${id}`),
  getProfile:     (uid) => axios.get(`/api/doctors/dashboard/profile?userId=${uid}`),
  updateSchedule: (id, s) => axios.put(`/api/doctors/dashboard/${id}/schedule`, s),
};
export const apptAPI = {
  getSlots:      (dId, date) => axios.get(`/api/appointments/slots?doctorId=${dId}&date=${date}`),
  book:          (d) => axios.post('/api/appointments/book', d),
  getMine:       (pid) => axios.get(`/api/appointments/my?patientId=${pid}`),
  cancel:        (id, r) => axios.patch(`/api/appointments/${id}/cancel`, { reason: r }),
  updateStatus:  (id, d) => axios.patch(`/api/appointments/${id}/update`, d),
  getDoctorAppts:(id) => axios.get(`/api/appointments/doctor/${id}`),
  getDoctorToday:(id) => axios.get(`/api/appointments/doctor/${id}/today`),
  getDoctorStats:(id) => axios.get(`/api/appointments/doctor/${id}/stats`),
};
export const adminAPI = {
  getStats:      () => axios.get('/api/admin/stats'),
  getPatients:   () => axios.get('/api/admin/patients'),
  getDoctors:    () => axios.get('/api/admin/doctors'),
  createDoctor:  (d) => axios.post('/api/admin/doctors', d),
  updateDoctorVerification: (id, d) => axios.patch(`/api/admin/doctors/${id}/verification`, d),
  deactivate:    (id) => axios.delete(`/api/admin/doctors/${id}`),
  toggleUser:    (id) => axios.patch(`/api/admin/users/${id}/toggle`),
  getAppointments:()  => axios.get('/api/admin/appointments'),
  getDepts:      ()   => axios.get('/api/admin/departments'),
};
