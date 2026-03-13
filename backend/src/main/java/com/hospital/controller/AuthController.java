package com.hospital.controller;

import com.hospital.dto.AuthDTOs;
import com.hospital.model.User;
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

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

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
}
