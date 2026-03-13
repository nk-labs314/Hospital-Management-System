package com.hospital.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "departments")
public class Department {

    @Id
    private String id;

    private String name;           // e.g. "Cardiology"
    private String code;           // e.g. "CARDIO"
    private String description;
    private String icon;           // emoji or icon name for frontend
    private boolean active = true;

    // Pre-seeded departments
    public static final String[] DEFAULT_DEPARTMENTS = {
        "Cardiology", "Dermatology", "Dentistry", "Neurology",
        "Orthopedics", "Pediatrics", "Psychiatry", "Ophthalmology",
        "ENT", "General Medicine", "Gynecology", "Oncology"
    };
}
