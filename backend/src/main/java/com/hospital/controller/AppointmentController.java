package com.hospital.controller;

import com.hospital.model.Appointment;
import com.hospital.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ── Check slot availability ──────────────────────────────────────
    @GetMapping("/slots")
    public ResponseEntity<?> getSlots(
            @RequestParam String doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getSlotAvailability(doctorId, date));
    }

    // ── Book appointment ──────────────────────────────────────────────
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, String> body,
                                              Authentication authentication) {
        String patientEmail = authentication.getName();
        // Get patient ID from email (resolved by service layer)
        return ResponseEntity.ok(appointmentService.bookAppointment(
            body.get("patientId"),
            body.get("doctorId"),
            LocalDate.parse(body.get("appointmentDate")),
            body.get("timeSlot"),
            body.get("reasonForVisit"),
            body.get("symptoms")
        ));
    }

    // ── Patient: my appointments ─────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<?> getMyAppointments(@RequestParam String patientId,
                                                Authentication authentication) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    // ── Patient: cancel appointment ──────────────────────────────────
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable String id,
                                                @RequestBody(required = false) Map<String, String> body,
                                                Authentication authentication) {
        String reason = body != null ? body.get("reason") : "Cancelled by patient";
        Appointment updated = appointmentService.updateAppointmentStatus(
            id, Appointment.Status.CANCELLED, null, null, reason, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    // ── Doctor: my schedule ──────────────────────────────────────────
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> getDoctorAppointments(@PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    // ── Doctor: today's schedule ─────────────────────────────────────
    @GetMapping("/doctor/{doctorId}/today")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> getDoctorTodaySchedule(@PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorTodayAppointments(doctorId));
    }

    // ── Doctor: update status, add notes / prescription ─────────────
    @PatchMapping("/{id}/update")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                           @RequestBody Map<String, String> body,
                                           Authentication authentication) {
        Appointment.Status status = Appointment.Status.valueOf(body.get("status"));
        Appointment updated = appointmentService.updateAppointmentStatus(
            id, status,
            body.get("notes"),
            body.get("prescription"),
            body.get("cancellationReason"),
            authentication.getName()
        );
        return ResponseEntity.ok(updated);
    }

    // ── Get single appointment ────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(@PathVariable String id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // ── Doctor dashboard stats ────────────────────────────────────────
    @GetMapping("/doctor/{doctorId}/stats")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> getDoctorStats(@PathVariable String doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorDashboardStats(doctorId));
    }
}
