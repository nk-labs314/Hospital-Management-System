package com.hospital.dto;

import com.hospital.model.Appointment;
import com.hospital.model.User;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// ─── Auth DTOs ────────────────────────────────────────────────
public class AuthDTOs {

    @Data
    public static class RegisterRequest {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6) private String password;
        private String phone;
        private String dateOfBirth;
        private String gender;
        private String bloodGroup;
        private String address;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private String id;
        private String email;
        private String fullName;
        private String role;

        public AuthResponse(String token, String id, String email, String fullName, String role) {
            this.token = token;
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
        }
    }
}

// ─── Appointment DTOs ────────────────────────────────────────────────
class AppointmentDTOs {

    @Data
    public static class BookingRequest {
        @NotBlank private String doctorId;
        @NotNull  private LocalDate appointmentDate;
        @NotBlank private String timeSlot;
        @NotBlank private String reasonForVisit;
        private String symptoms;
    }

    @Data
    public static class AppointmentResponse {
        private String id;
        private String patientId;
        private String patientName;
        private String doctorId;
        private String doctorName;
        private String departmentName;
        private LocalDate appointmentDate;
        private String timeSlot;
        private String reasonForVisit;
        private String symptoms;
        private String notes;
        private String prescription;
        private Appointment.Status status;
        private Integer tokenNumber;
        private LocalDateTime createdAt;
    }

    @Data
    public static class SlotAvailabilityRequest {
        @NotBlank private String doctorId;
        @NotNull  private LocalDate date;
    }

    @Data
    public static class SlotAvailabilityResponse {
        private List<String> availableSlots;
        private List<String> bookedSlots;
        private List<String> suggestedAlternativeDates;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull private Appointment.Status status;
        private String notes;
        private String prescription;
        private String cancellationReason;
    }
}

// ─── Doctor DTOs ────────────────────────────────────────────────
class DoctorDTOs {

    @Data
    public static class DoctorResponse {
        private String id;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private String departmentId;
        private String departmentName;
        private String specialization;
        private String qualification;
        private int experienceYears;
        private double consultationFee;
        private String bio;
        private String profileImage;
        private Map<String, List<String>> weeklySchedule;
        private double rating;
        private int totalRatings;
    }

    @Data
    public static class DoctorDashboardStats {
        private long todayAppointments;
        private long pendingAppointments;
        private long completedTotal;
        private long cancelledTotal;
        private List<AppointmentDTOs.AppointmentResponse> todaySchedule;
    }
}

// ─── Patient DTOs ────────────────────────────────────────────────
class PatientDTOs {

    @Data
    public static class PatientProfile {
        private String id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String dateOfBirth;
        private String gender;
        private String bloodGroup;
        private String address;
    }

    @Data
    public static class MedicalRecord {
        private String appointmentId;
        private String doctorName;
        private String departmentName;
        private LocalDate visitDate;
        private String diagnosis;
        private String prescription;
        private String notes;
    }
}

// ─── Admin DTOs ────────────────────────────────────────────────
class AdminDTOs {

    @Data
    public static class DashboardStats {
        private long totalPatients;
        private long totalDoctors;
        private long totalAppointments;
        private long todayAppointments;
        private long pendingAppointments;
        private long confirmedAppointments;
        private long completedAppointments;
        private Map<String, Long> appointmentsByDepartment;
    }

    @Data
    public static class CreateDoctorRequest {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @Email @NotBlank private String email;
        @NotBlank private String password;
        private String phone;
        @NotBlank private String departmentId;
        @NotBlank private String specialization;
        @NotBlank private String qualification;
        private int experienceYears;
        private double consultationFee;
        private String bio;
        private Map<String, List<String>> weeklySchedule;
    }
}
