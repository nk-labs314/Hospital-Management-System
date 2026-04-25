package com.hospital.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctors")
public class Doctor {

    @Id
    private String id;

    private String userId;          // Linked User account
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    private String departmentId;
    private String departmentName;
    private String specialization;
    private String qualification;   // e.g. MBBS, MD
    private int experienceYears;
    private double consultationFee;
    private String bio;
    private String profileImage;
    private String certificationImageName;

    @JsonIgnore
    private String certificationImageDataUrl;

    // Availability: Map<DayOfWeek, List<TimeSlot>>
    // e.g. { "MONDAY": ["09:00", "09:30", ...], "TUESDAY": [...] }
    private Map<String, List<String>> weeklySchedule;

    // Days off / leaves
    private List<String> leaveDates; // ISO date strings

    private int slotDurationMinutes = 30;
    private boolean active = true;
    private VerificationStatus verificationStatus = VerificationStatus.APPROVED;
    private LocalDateTime verificationReviewedAt;
    private String verificationReviewedByAdminId;
    private String verificationRejectionReason;
    private double rating = 0.0;
    private int totalRatings = 0;

    public enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    public String getFullName() {
        return "Dr. " + firstName + " " + lastName;
    }
}
