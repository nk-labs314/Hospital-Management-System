import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import { RolePage, LoginPage, PatientRegisterPage, DoctorRegisterPage } from './pages/AuthPages';
import { PatientDashboard, MyAppointments, MedicalRecords, ProfilePage } from './pages/PatientPages';
import BookAppointment from './pages/BookAppointment';
import { DoctorDashboard, DoctorSchedule, AdminDashboard, AdminDoctors, AdminPatients, AdminAppointments } from './pages/OtherPages';
import './index.css';

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/welcome" replace />;
  if (user.role === 'ADMIN')  return <Navigate to="/admin" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth */}
      <Route path="/"          element={<RootRedirect />} />
      <Route path="/welcome"   element={<RolePage />} />
      <Route path="/login"     element={<LoginPage />} />
      <Route path="/register"  element={<PatientRegisterPage />} />
      <Route path="/register/doctor" element={<DoctorRegisterPage />} />

      {/* Patient */}
      <Route path="/dashboard"    element={<Guard roles={['PATIENT']}><PatientDashboard /></Guard>} />
      <Route path="/book"         element={<Guard roles={['PATIENT']}><BookAppointment /></Guard>} />
      <Route path="/appointments" element={<Guard roles={['PATIENT']}><MyAppointments /></Guard>} />
      <Route path="/records"      element={<Guard roles={['PATIENT']}><MedicalRecords /></Guard>} />
      <Route path="/profile"      element={<Guard roles={['PATIENT']}><ProfilePage /></Guard>} />

      {/* Doctor */}
      <Route path="/doctor"          element={<Guard roles={['DOCTOR','ADMIN']}><DoctorDashboard /></Guard>} />
      <Route path="/doctor/schedule" element={<Guard roles={['DOCTOR','ADMIN']}><DoctorSchedule /></Guard>} />

      {/* Admin */}
      <Route path="/admin"              element={<Guard roles={['ADMIN']}><AdminDashboard /></Guard>} />
      <Route path="/admin/doctors"      element={<Guard roles={['ADMIN']}><AdminDoctors /></Guard>} />
      <Route path="/admin/patients"     element={<Guard roles={['ADMIN']}><AdminPatients /></Guard>} />
      <Route path="/admin/appointments" element={<Guard roles={['ADMIN']}><AdminAppointments /></Guard>} />

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: 'var(--bg-base)' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: 'var(--bg-base)' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
