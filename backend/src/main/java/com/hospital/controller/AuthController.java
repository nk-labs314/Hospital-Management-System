package com.hospital.controller;

import com.hospital.dto.AuthDTOs;
import com.hospital.model.Doctor;
import com.hospital.model.User;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final int MAX_CERTIFICATION_IMAGE_DATA_URL_LENGTH = 3_000_000;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setBloodGroup(request.getBloodGroup());
        user.setAddress(request.getAddress());
        user.setRole(User.Role.PATIENT);

        User saved = userRepository.save(user);

        String token = jwtUtils.generateToken(saved.getEmail(), saved.getRole().name());
        return ResponseEntity.ok(new AuthDTOs.AuthResponse(
            token, saved.getId(), saved.getEmail(), saved.getFullName(), saved.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDTOs.LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String token = jwtUtils.generateToken(userDetails);

            return ResponseEntity.ok(new AuthDTOs.AuthResponse(
                token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .map(user -> ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole().name(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth() : "",
                "gender", user.getGender() != null ? user.getGender() : "",
                "bloodGroup", user.getBloodGroup() != null ? user.getBloodGroup() : "",
                "address", user.getAddress() != null ? user.getAddress() : ""
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updates,
                                           Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("firstName")) user.setFirstName(updates.get("firstName"));
        if (updates.containsKey("lastName"))  user.setLastName(updates.get("lastName"));
        if (updates.containsKey("phone"))     user.setPhone(updates.get("phone"));
        if (updates.containsKey("address"))   user.setAddress(updates.get("address"));
        if (updates.containsKey("bloodGroup")) user.setBloodGroup(updates.get("bloodGroup"));

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    // ── Doctor self-registration ──────────────────────────────────────────
    @PostMapping("/register-doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        if (email == null || userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered or invalid"));
        }

        String certificationImageDataUrl = parseCertificationImageDataUrl(request.get("certificationImageDataUrl"));
        String certificationImageName = normalizeOptionalString(request.get("certificationImageName"));

        // 1. Create User account with DOCTOR role
        User user = new User();
        user.setFirstName((String) request.get("firstName"));
        user.setLastName((String) request.get("lastName"));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode((String) request.get("password")));
        user.setPhone((String) request.get("phone"));
        user.setRole(User.Role.DOCTOR);
        User savedUser = userRepository.save(user);

        // 2. Create Doctor profile
        Doctor doctor = new Doctor();
        doctor.setUserId(savedUser.getId());
        doctor.setFirstName(savedUser.getFirstName());
        doctor.setLastName(savedUser.getLastName());
        doctor.setEmail(savedUser.getEmail());
        doctor.setPhone(savedUser.getPhone());
        doctor.setSpecialization((String) request.get("specialization"));
        doctor.setQualification((String) request.get("qualification"));
        doctor.setBio((String) request.get("bio"));
        doctor.setCertificationImageName(certificationImageName);
        doctor.setCertificationImageDataUrl(certificationImageDataUrl);

        Object exp = request.get("experienceYears");
        if (exp != null) doctor.setExperienceYears(Integer.parseInt(exp.toString()));

        String deptId = (String) request.get("departmentId");
        if (deptId != null && !deptId.isEmpty()) {
            doctor.setDepartmentId(deptId);
            departmentRepository.findById(deptId)
                .ifPresent(dept -> doctor.setDepartmentName(dept.getName()));
        }

        // Default Mon–Fri 9am–5pm schedule
        Map<String, List<String>> defaultSchedule = new HashMap<>();
        List<String> workingHours = generateDefaultSlots("09:00", "17:00", 30);
        for (String day : new String[]{"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"}) {
            defaultSchedule.put(day, workingHours);
        }
        doctor.setWeeklySchedule(defaultSchedule);
        doctor.setSlotDurationMinutes(30);
        doctor.setConsultationFee(500.0);
        doctor.setActive(true);
        doctor.setVerificationStatus(Doctor.VerificationStatus.PENDING);
        doctor.setVerificationReviewedAt(null);
        doctor.setVerificationReviewedByAdminId(null);
        doctor.setVerificationRejectionReason(null);

        doctorRepository.save(doctor);

        // 3. Issue JWT
        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        return ResponseEntity.ok(new AuthDTOs.AuthResponse(
            token, savedUser.getId(), savedUser.getEmail(),
            savedUser.getFullName(), savedUser.getRole().name()
        ));
    }

    private String parseCertificationImageDataUrl(Object rawValue) {
        String dataUrl = normalizeOptionalString(rawValue);
        if (dataUrl == null) {
            return null;
        }

        if (!dataUrl.startsWith("data:image/")) {
            throw new RuntimeException("Only image uploads are supported for doctor certifications");
        }

        if (dataUrl.length() > MAX_CERTIFICATION_IMAGE_DATA_URL_LENGTH) {
            throw new RuntimeException("Certification image must be 2 MB or smaller");
        }

        return dataUrl;
    }

    private String normalizeOptionalString(Object rawValue) {
        if (rawValue == null) {
            return null;
        }

        String value = rawValue.toString().trim();
        return value.isEmpty() ? null : value;
    }

    private List<String> generateDefaultSlots(String start, String end, int duration) {
        List<String> slots = new ArrayList<>();
        String[] sp = start.split(":");
        String[] ep = end.split(":");
        int s = Integer.parseInt(sp[0]) * 60 + Integer.parseInt(sp[1]);
        int e = Integer.parseInt(ep[0]) * 60 + Integer.parseInt(ep[1]);
        for (int m = s; m < e; m += duration) {
            slots.add(String.format("%02d:%02d", m / 60, m % 60));
        }
        return slots;
    }
}
