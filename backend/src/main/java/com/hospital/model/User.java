package com.hospital.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String firstName;
    private String lastName;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String phone;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;

    private Role role = Role.PATIENT;
    private boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Medical history references
    private List<String> appointmentIds;

    public enum Role {
        PATIENT, DOCTOR, ADMIN
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
