package com.hospital.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    // Patient info
    private String patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    // Doctor info
    private String doctorId;
    private String doctorName;
    private String doctorEmail;

    // Department
    private String departmentId;
    private String departmentName;

    // Slot
    private LocalDate appointmentDate;
    private String timeSlot;           // e.g. "09:30"
    private int durationMinutes = 30;

    // Details
    private String reasonForVisit;
    private String symptoms;
    private String notes;              // Doctor's notes (post-visit)
    private String prescription;       // Post-visit prescription

    // Status lifecycle
    private Status status = Status.PENDING;

    // Metadata
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;

    // Token number for same-day appointments
    private Integer tokenNumber;

    public enum Status {
        PENDING,        // Awaiting confirmation
        CONFIRMED,      // Slot booked & confirmed
        CANCELLED,      // Cancelled by patient or doctor
        COMPLETED,      // Visit done
        NO_SHOW         // Patient didn't show up
    }
}
