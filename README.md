# 🏥 MediCare – Hospital Management System

A full-stack Hospital Management System built with **Spring Boot + MongoDB + React**.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Authentication** | JWT-based login/register, role-based access (Patient, Doctor, Admin) |
| **Appointment Booking** | 4-step wizard: Speciality → Doctor → Date/Slot → Confirm |
| **Smart Availability Engine** | Real-time slot checking, suggests alternatives if slot taken |
| **Token System** | Auto-assigned token numbers per doctor per day |
| **Email Notifications** | Confirmation, cancellation, day-before reminders (async) |
| **Doctor Dashboard** | Today's schedule, complete visits, add notes & prescriptions |
| **Patient Medical Records** | Full visit history with doctor notes and prescriptions |
| **Admin Panel** | Manage doctors, patients, view all appointments, stats |
| **Scheduler** | Daily 8 AM cron sends appointment reminders |

---

## 🏗️ Tech Stack

```
Backend:  Java 17 · Spring Boot 3.2 · Spring Security · Spring Data MongoDB · JWT · JavaMail
Frontend: React 18 · React Router 6 · Axios · React Hot Toast
Database: MongoDB
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB running locally on port 27017

---

### 1. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Linux
sudo systemctl start mongod

# Windows
net start MongoDB

# Or use Docker:
docker run -d -p 27017:27017 --name mongo mongo:6
```

---

### 2. Backend Setup

```bash
cd hospital-management/backend

# Configure email (optional – skip for local testing)
# Edit src/main/resources/application.properties:
#   spring.mail.username = your-gmail@gmail.com
#   spring.mail.password = your-app-password

# Build and run
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

On first run, the DataSeeder automatically creates:
- 12 departments (Cardiology, Dentistry, Neurology, etc.)
- 7 sample doctors
- Admin account

**Default credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | Admin@123 |
| Doctor | dr.sharma@hospital.com | Doctor@123 |
| Doctor | dr.gupta@hospital.com | Doctor@123 |

---

### 3. Frontend Setup

```bash
cd hospital-management/frontend

npm install
npm start
```

Frontend starts on **http://localhost:3000**

---

## 📁 Project Structure

```
hospital-management/
├── backend/
│   └── src/main/java/com/hospital/
│       ├── config/
│       │   ├── SecurityConfig.java       # JWT + CORS + roles
│       │   └── DataSeeder.java           # Auto-seeds DB on startup
│       ├── controller/
│       │   ├── AuthController.java       # /api/auth/*
│       │   ├── AppointmentController.java# /api/appointments/*
│       │   ├── DoctorController.java     # /api/doctors/*
│       │   └── AdminController.java      # /api/admin/*
│       ├── model/
│       │   ├── User.java                 # Patient/Doctor/Admin
│       │   ├── Doctor.java               # Doctor profile + schedule
│       │   ├── Appointment.java          # Full appointment lifecycle
│       │   └── Department.java           # Specialities
│       ├── service/
│       │   ├── AvailabilityService.java  # Core slot engine
│       │   ├── AppointmentService.java   # Booking logic
│       │   ├── EmailService.java         # Async email notifications
│       │   └── ReminderScheduler.java    # Daily reminder cron
│       └── security/
│           ├── JwtUtils.java
│           ├── JwtAuthFilter.java
│           └── UserDetailsServiceImpl.java
│
└── frontend/src/
    ├── context/AuthContext.jsx          # JWT auth + axios interceptors
    ├── services/api.js                  # All API calls
    ├── pages/
    │   ├── AuthPages.jsx               # Login + Register
    │   ├── PatientDashboard.jsx        # Patient home
    │   ├── BookAppointment.jsx         # 4-step booking wizard
    │   ├── MyAppointments.jsx          # View + cancel appointments
    │   ├── MedicalRecords.jsx          # Visit history + prescriptions
    │   ├── ProfilePage.jsx             # Edit profile
    │   ├── DoctorDashboard.jsx         # Doctor's today schedule
    │   ├── DoctorSchedule.jsx          # Manage availability
    │   ├── AdminDashboard.jsx          # Admin overview + stats
    │   ├── AdminDoctors.jsx            # Add/manage doctors
    │   └── AdminPages.jsx              # Patients + Appointments tables
    └── components/common/Sidebar.jsx   # Role-aware sidebar nav
```

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register     Register new patient
POST /api/auth/login        Login (returns JWT)
GET  /api/auth/me           Get current user
PUT  /api/auth/profile      Update profile
```

### Appointments
```
GET  /api/appointments/slots?doctorId=&date=    Available slots for a date
POST /api/appointments/book                      Book an appointment
GET  /api/appointments/my?patientId=            Patient's appointments
PATCH /api/appointments/{id}/cancel             Cancel appointment
PATCH /api/appointments/{id}/update             Doctor updates status/notes
GET  /api/appointments/doctor/{id}/today        Doctor's today schedule
GET  /api/appointments/doctor/{id}/stats        Dashboard stats
```

### Doctors & Departments
```
GET /api/departments                         All active departments
GET /api/departments/{id}/doctors            Doctors in a department
GET /api/doctors/public                      All active doctors
GET /api/doctors/public/{id}                 Doctor profile
```

### Admin
```
GET    /api/admin/stats           Hospital-wide statistics
GET    /api/admin/patients        All patients
POST   /api/admin/doctors         Create new doctor
DELETE /api/admin/doctors/{id}    Deactivate doctor
GET    /api/admin/appointments    All appointments
PATCH  /api/admin/users/{id}/toggle  Block/unblock user
```

---

## 🧠 Availability Engine Logic

```
bookAppointment(patientId, doctorId, date, timeSlot)
  │
  ├─ isSlotAvailable(doctorId, date, timeSlot)?
  │   ├─ Get doctor's weeklySchedule for that DayOfWeek
  │   ├─ Get all CONFIRMED appointments for that date
  │   ├─ Subtract booked slots + past slots (if today)
  │   └─ Check if requested slot is in available set
  │
  ├─ YES → Create Appointment (CONFIRMED)
  │         → Assign token number
  │         → Send emails (async)
  │
  └─ NO  → suggestAlternatives()
            ├─ Same-day slots sorted by proximity to requested time
            └─ Next 5 dates with available slots
```

---

## ⚙️ Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/hospital_db

# JWT (change secret in production!)
app.jwt.secret=YourSuperSecretKey...
app.jwt.expiration=86400000   # 24 hours

# Email (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your@gmail.com
spring.mail.password=your-app-password    # Use Gmail App Password
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App passwords

---

## 🔐 Role-Based Access

| Route | Patient | Doctor | Admin |
|-------|---------|--------|-------|
| /dashboard | ✅ | ❌ | ❌ |
| /book | ✅ | ❌ | ❌ |
| /doctor | ❌ | ✅ | ✅ |
| /admin | ❌ | ❌ | ✅ |

---

## 🗃️ MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | All user accounts (patients, doctors, admins) |
| `doctors` | Doctor profiles with weekly schedules |
| `appointments` | Every booking with full lifecycle status |
| `departments` | Medical specialities (seeded on startup) |

---

## 📧 Email Notifications (Async)

| Trigger | Recipient | Content |
|---|---|---|
| Appointment booked | Patient | Confirmation with token number |
| Appointment booked | Doctor | New patient notification |
| Appointment cancelled | Patient | Cancellation details |
| Day before appointment | Patient | Reminder with token & time |

---

## 🛠️ Development Notes

- Email sending is `@Async` – won't block the booking response
- If MongoDB or mail fails to start, check your `application.properties`
- To disable email (for local dev), comment out `@Async` in EmailService or set a no-op mail config
- The DataSeeder only runs if collections are empty – safe to restart
