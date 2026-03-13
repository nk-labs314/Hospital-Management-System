import axios from 'axios';

// ─── Auth ─────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => axios.post('/api/auth/register', data),
  login:    (data) => axios.post('/api/auth/login', data),
  me:       ()     => axios.get('/api/auth/me'),
  updateProfile: (data) => axios.put('/api/auth/profile', data),
};

// ─── Departments ──────────────────────────────────────────────────────
export const departmentAPI = {
  getAll: () => axios.get('/api/departments'),
  getDoctors: (id) => axios.get(`/api/departments/${id}/doctors`),
};

// ─── Doctors ──────────────────────────────────────────────────────────
export const doctorAPI = {
  getAll:            ()       => axios.get('/api/doctors/public'),
  getById:           (id)     => axios.get(`/api/doctors/public/${id}`),
  getByDepartment:   (deptId) => axios.get(`/api/doctors/public/department/${deptId}`),
  getProfile:        (userId) => axios.get(`/api/doctors/dashboard/profile?userId=${userId}`),
  updateSchedule:    (id, schedule) => axios.put(`/api/doctors/dashboard/${id}/schedule`, schedule),
  updateLeave:       (id, dates)    => axios.put(`/api/doctors/dashboard/${id}/leave`, { leaveDates: dates }),
};

// ─── Appointments ─────────────────────────────────────────────────────
export const appointmentAPI = {
  getSlots:       (doctorId, date) => axios.get(`/api/appointments/slots?doctorId=${doctorId}&date=${date}`),
  book:           (data)           => axios.post('/api/appointments/book', data),
  getMine:        (patientId)      => axios.get(`/api/appointments/my?patientId=${patientId}`),
  getById:        (id)             => axios.get(`/api/appointments/${id}`),
  cancel:         (id, reason)     => axios.patch(`/api/appointments/${id}/cancel`, { reason }),
  updateStatus:   (id, data)       => axios.patch(`/api/appointments/${id}/update`, data),
  getDoctorAppts: (doctorId)       => axios.get(`/api/appointments/doctor/${doctorId}`),
  getDoctorToday: (doctorId)       => axios.get(`/api/appointments/doctor/${doctorId}/today`),
  getDoctorStats: (doctorId)       => axios.get(`/api/appointments/doctor/${doctorId}/stats`),
};

// ─── Admin ────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats:        ()     => axios.get('/api/admin/stats'),
  getUsers:        ()     => axios.get('/api/admin/users'),
  getPatients:     ()     => axios.get('/api/admin/patients'),
  getDoctors:      ()     => axios.get('/api/admin/doctors'),
  createDoctor:    (data) => axios.post('/api/admin/doctors', data),
  deactivateDoctor:(id)   => axios.delete(`/api/admin/doctors/${id}`),
  toggleUser:      (id)   => axios.patch(`/api/admin/users/${id}/toggle`),
  getAppointments: ()     => axios.get('/api/admin/appointments'),
  getDepartments:  ()     => axios.get('/api/admin/departments'),
};
