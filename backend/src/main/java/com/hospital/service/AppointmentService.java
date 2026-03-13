package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.User;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AvailabilityService availabilityService;
    private final EmailService emailService;

    /**
     * Main booking method. Checks availability, assigns token, sends emails.
     */
    public Map<String, Object> bookAppointment(String patientId, String doctorId,
                                               LocalDate date, String timeSlot,
                                               String reason, String symptoms) {
        // Validate patient
        User patient = userRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Validate doctor
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check availability
        if (!availabilityService.isSlotAvailable(doctorId, date, timeSlot)) {
            // Return alternatives
            Map<String, Object> alternatives = availabilityService.suggestAlternatives(doctorId, date, timeSlot);
            alternatives.put("booked", false);
            alternatives.put("message", "The requested slot is not available. Here are alternatives:");
            return alternatives;
        }

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setPatientName(patient.getFullName());
        appointment.setPatientEmail(patient.getEmail());
        appointment.setPatientPhone(patient.getPhone());
        appointment.setDoctorId(doctorId);
        appointment.setDoctorName(doctor.getFullName());
        appointment.setDoctorEmail(doctor.getEmail());
        appointment.setDepartmentId(doctor.getDepartmentId());
        appointment.setDepartmentName(doctor.getDepartmentName());
        appointment.setAppointmentDate(date);
        appointment.setTimeSlot(timeSlot);
        appointment.setDurationMinutes(doctor.getSlotDurationMinutes());
        appointment.setReasonForVisit(reason);
        appointment.setSymptoms(symptoms);
        appointment.setStatus(Appointment.Status.CONFIRMED);
        appointment.setConfirmedAt(LocalDateTime.now());
        appointment.setTokenNumber(availabilityService.assignTokenNumber(doctorId, date));

        Appointment saved = appointmentRepository.save(appointment);

        // Send emails asynchronously
        emailService.sendAppointmentConfirmation(saved);
        emailService.sendDoctorNotification(saved);

        log.info("Appointment booked: {} with {} on {} at {}", patient.getEmail(), doctor.getFullName(), date, timeSlot);

        return Map.of(
            "booked", true,
            "appointment", saved,
            "message", "Appointment confirmed successfully!",
            "tokenNumber", saved.getTokenNumber()
        );
    }

    public List<Appointment> getPatientAppointments(String patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDescTimeSlotAsc(patientId);
    }

    public List<Appointment> getDoctorAppointments(String doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescTimeSlotAsc(doctorId);
    }

    public List<Appointment> getDoctorTodayAppointments(String doctorId) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, LocalDate.now());
    }

    public Appointment updateAppointmentStatus(String appointmentId, Appointment.Status status,
                                               String notes, String prescription,
                                               String cancellationReason, String requesterId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(status);
        appointment.setUpdatedAt(LocalDateTime.now());

        if (notes != null) appointment.setNotes(notes);
        if (prescription != null) appointment.setPrescription(prescription);

        if (status == Appointment.Status.CANCELLED) {
            appointment.setCancelledAt(LocalDateTime.now());
            appointment.setCancellationReason(cancellationReason);
            emailService.sendAppointmentCancellation(appointment);
        }

        return appointmentRepository.save(appointment);
    }

    public Appointment getAppointmentById(String id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    public Map<String, Object> getSlotAvailability(String doctorId, LocalDate date) {
        return Map.of(
            "doctorId", doctorId,
            "date", date,
            "availableSlots", availabilityService.getAvailableSlots(doctorId, date),
            "bookedSlots", availabilityService.getBookedSlots(doctorId, date),
            "nextAvailableDates", availabilityService.getNextAvailableDates(doctorId, date, 5)
        );
    }

    public Map<String, Object> getDoctorDashboardStats(String doctorId) {
        LocalDate today = LocalDate.now();
        List<Appointment> todayAppts = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, today);
        List<Appointment> allAppts = appointmentRepository.findByDoctorIdOrderByAppointmentDateDescTimeSlotAsc(doctorId);

        long pending = allAppts.stream().filter(a -> a.getStatus() == Appointment.Status.PENDING).count();
        long completed = allAppts.stream().filter(a -> a.getStatus() == Appointment.Status.COMPLETED).count();
        long cancelled = allAppts.stream().filter(a -> a.getStatus() == Appointment.Status.CANCELLED).count();

        return Map.of(
            "todayAppointments", todayAppts.size(),
            "pendingAppointments", pending,
            "completedTotal", completed,
            "cancelledTotal", cancelled,
            "todaySchedule", todayAppts
        );
    }

    public Map<String, Object> getAdminDashboardStats() {
        long totalAppts = appointmentRepository.count();
        long todayAppts = appointmentRepository.findByDoctorIdAndAppointmentDate("", LocalDate.now()).size();
        List<Appointment> all = appointmentRepository.findAll();

        long confirmed = all.stream().filter(a -> a.getStatus() == Appointment.Status.CONFIRMED).count();
        long completed = all.stream().filter(a -> a.getStatus() == Appointment.Status.COMPLETED).count();
        long pending   = all.stream().filter(a -> a.getStatus() == Appointment.Status.PENDING).count();

        // Count by department
        Map<String, Long> byDept = new java.util.HashMap<>();
        all.forEach(a -> byDept.merge(a.getDepartmentName(), 1L, Long::sum));

        return Map.of(
            "totalAppointments", totalAppts,
            "confirmedAppointments", confirmed,
            "completedAppointments", completed,
            "pendingAppointments", pending,
            "appointmentsByDepartment", byDept,
            "recentAppointments", all.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .toList()
        );
    }
}
