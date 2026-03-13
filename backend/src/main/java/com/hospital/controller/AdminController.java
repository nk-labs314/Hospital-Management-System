package com.hospital.controller;

import com.hospital.model.Doctor;
import com.hospital.model.User;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentService appointmentService;
    private final PasswordEncoder passwordEncoder;

    // ── Dashboard Stats ─────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalPatients = userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.Role.PATIENT).count();
        long totalDoctors = doctorRepository.count();

        Map<String, Object> apptStats = appointmentService.getAdminDashboardStats();

        return ResponseEntity.ok(Map.of(
            "totalPatients", totalPatients,
            "totalDoctors", totalDoctors,
            "totalDepartments", departmentRepository.count(),
            "appointmentStats", apptStats
        ));
    }

    // ── Manage Users ────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients() {
        List<User> patients = userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.Role.PATIENT).toList();
        return ResponseEntity.ok(patients);
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(!user.isActive());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("active", user.isActive()));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Manage Doctors ──────────────────────────────────────────────
    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> createDoctor(@RequestBody Map<String, Object> body) {
        // Create user account
        User user = new User();
        user.setFirstName((String) body.get("firstName"));
        user.setLastName((String) body.get("lastName"));
        user.setEmail((String) body.get("email"));
        user.setPassword(passwordEncoder.encode((String) body.get("password")));
        user.setPhone((String) body.get("phone"));
        user.setRole(User.Role.DOCTOR);
        User savedUser = userRepository.save(user);

        // Create doctor profile
        Doctor doctor = new Doctor();
        doctor.setUserId(savedUser.getId());
        doctor.setFirstName(savedUser.getFirstName());
        doctor.setLastName(savedUser.getLastName());
        doctor.setEmail(savedUser.getEmail());
        doctor.setPhone(savedUser.getPhone());
        doctor.setDepartmentId((String) body.get("departmentId"));
        doctor.setSpecialization((String) body.get("specialization"));
        doctor.setQualification((String) body.get("qualification"));
        doctor.setExperienceYears(body.get("experienceYears") != null
            ? Integer.parseInt(body.get("experienceYears").toString()) : 0);
        doctor.setConsultationFee(body.get("consultationFee") != null
            ? Double.parseDouble(body.get("consultationFee").toString()) : 0.0);
        doctor.setBio((String) body.get("bio"));

        // Resolve department name
        departmentRepository.findById((String) body.get("departmentId"))
            .ifPresent(dept -> doctor.setDepartmentName(dept.getName()));

        Doctor saved = doctorRepository.save(doctor);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deactivateDoctor(@PathVariable String id) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setActive(false);
            doctorRepository.save(doctor);
            return ResponseEntity.ok(Map.of("message", "Doctor deactivated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Manage Appointments ──────────────────────────────────────────
    @GetMapping("/appointments")
    public ResponseEntity<?> getAllAppointments() {
        return ResponseEntity.ok(appointmentRepository.findAll());
    }

    // ── Manage Departments ──────────────────────────────────────────
    @GetMapping("/departments")
    public ResponseEntity<?> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }
}
