package com.hospital.controller;

import com.hospital.model.Department;
import com.hospital.model.Doctor;
import com.hospital.model.User;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    AuthenticationManager authenticationManager;

    @Mock
    UserRepository userRepository;

    @Mock
    PasswordEncoder passwordEncoder;

    @Mock
    JwtUtils jwtUtils;

    @Mock
    DepartmentRepository departmentRepository;

    @Mock
    DoctorRepository doctorRepository;

    @InjectMocks
    AuthController authController;

    @Test
    void registerDoctorStoresCertificationImage() {
        when(userRepository.existsByEmail("doctor@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret123")).thenReturn("encoded-password");
        when(jwtUtils.generateToken("doctor@example.com", "DOCTOR")).thenReturn("jwt-token");
        when(departmentRepository.findById("dept-1")).thenReturn(Optional.of(department("dept-1", "Cardiology")));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("user-1");
            return user;
        });
        when(doctorRepository.save(any(Doctor.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> request = new java.util.HashMap<>();
        request.put("firstName", "Asha");
        request.put("lastName", "Verma");
        request.put("email", "doctor@example.com");
        request.put("password", "Secret123");
        request.put("phone", "9999999999");
        request.put("specialization", "Cardiology");
        request.put("qualification", "MBBS, MD");
        request.put("experienceYears", 7);
        request.put("departmentId", "dept-1");
        request.put("bio", "Test bio");
        request.put("certificationImageName", "degree.png");
        request.put("certificationImageDataUrl", "data:image/png;base64,ZmFrZQ==");

        ResponseEntity<?> response = authController.registerDoctor(request);

        assertEquals(200, response.getStatusCode().value());

        ArgumentCaptor<Doctor> doctorCaptor = ArgumentCaptor.forClass(Doctor.class);
        verify(doctorRepository).save(doctorCaptor.capture());

        Doctor savedDoctor = doctorCaptor.getValue();
        assertEquals("degree.png", savedDoctor.getCertificationImageName());
        assertEquals("data:image/png;base64,ZmFrZQ==", savedDoctor.getCertificationImageDataUrl());
        assertEquals("Cardiology", savedDoctor.getDepartmentName());
        assertEquals(Doctor.VerificationStatus.PENDING, savedDoctor.getVerificationStatus());
    }

    @Test
    void registerDoctorRejectsNonImageCertificationPayload() {
        when(userRepository.existsByEmail("doctor@example.com")).thenReturn(false);

        RuntimeException error = assertThrows(RuntimeException.class, () ->
            authController.registerDoctor(Map.of(
                "firstName", "Asha",
                "lastName", "Verma",
                "email", "doctor@example.com",
                "password", "Secret123",
                "certificationImageName", "degree.pdf",
                "certificationImageDataUrl", "data:application/pdf;base64,ZmFrZQ=="
            ))
        );

        assertEquals("Only image uploads are supported for doctor certifications", error.getMessage());
        verify(userRepository, never()).save(any(User.class));
        verify(doctorRepository, never()).save(any(Doctor.class));
    }

    private Department department(String id, String name) {
        Department department = new Department();
        department.setId(id);
        department.setName(name);
        return department;
    }
}
