import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import MedicalRecords from './pages/MedicalRecords';
import ProfilePage from './pages/ProfilePage';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorSchedule from './pages/DoctorSchedule';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';
import { AdminAppointments, AdminPatients } from './pages/AdminPages';
import './index.css';

// ─── Layout wrapper (sidebar + content) ─────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// ─── Route guards ────────────────────────────────────────────────────────
function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RequireAnyRole({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN')  return <Navigate to="/admin" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor" replace />;
  return <Navigate to="/dashboard" replace />;
}

// ─── App ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<RootRedirect />} />

      {/* Patient routes */}
      <Route path="/dashboard" element={
        <RequireAuth role="PATIENT">
          <AppLayout><PatientDashboard /></AppLayout>
        </RequireAuth>
      }/>
      <Route path="/book" element={
        <RequireAuth role="PATIENT">
          <AppLayout><BookAppointment /></AppLayout>
        </RequireAuth>
      }/>
      <Route path="/appointments" element={
        <RequireAuth role="PATIENT">
          <AppLayout><MyAppointments /></AppLayout>
        </RequireAuth>
      }/>
      <Route path="/records" element={
        <RequireAuth role="PATIENT">
          <AppLayout><MedicalRecords /></AppLayout>
        </RequireAuth>
      }/>
      <Route path="/profile" element={
        <RequireAuth role="PATIENT">
          <AppLayout><ProfilePage /></AppLayout>
        </RequireAuth>
      }/>

      {/* Doctor routes */}
      <Route path="/doctor" element={
        <RequireAnyRole roles={['DOCTOR','ADMIN']}>
          <AppLayout><DoctorDashboard /></AppLayout>
        </RequireAnyRole>
      }/>
      <Route path="/doctor/schedule" element={
        <RequireAnyRole roles={['DOCTOR','ADMIN']}>
          <AppLayout><DoctorSchedule /></AppLayout>
        </RequireAnyRole>
      }/>

      {/* Admin routes */}
      <Route path="/admin" element={
        <RequireAuth role="ADMIN">
          <AppLayout><AdminDashboard /></AppLayout>
        </RequireAuth>
      }/>
      <Route path="/admin/doctors" element={
        <RequireAuth role="ADMIN">
          <AppLayout><AdminDoctors /></AppLayout>
        </RequireAuth>
      }/>
      <Route path="/admin/patients" element={
        <RequireAuth role="ADMIN">
          <AppLayout><AdminPatients /></AppLayout>
        </RequireAuth>
      }/>
      <Route path="/admin/appointments" element={
        <RequireAuth role="ADMIN">
          <AppLayout><AdminAppointments /></AppLayout>
        </RequireAuth>
      }/>

      {/* Catch all */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { fontSize: 14, fontFamily: 'var(--font)' }
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
