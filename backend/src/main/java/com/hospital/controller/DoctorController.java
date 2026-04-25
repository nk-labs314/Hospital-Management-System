package com.hospital.controller;

import com.hospital.model.Department;
import com.hospital.model.Doctor;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findByActiveTrue());
    }

    @GetMapping("/{id}/doctors")
    public ResponseEntity<List<Doctor>> getDoctorsByDepartment(@PathVariable String id) {
        return ResponseEntity.ok(
            doctorRepository.findByDepartmentIdAndActiveTrueAndVerificationStatus(
                id, Doctor.VerificationStatus.APPROVED
            )
        );
    }
}

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
class DoctorController {

    private final DoctorRepository doctorRepository;

    // Public: list all doctors
    @GetMapping("/public")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(
            doctorRepository.findByActiveTrueAndVerificationStatus(Doctor.VerificationStatus.APPROVED)
        );
    }

    // Public: doctor profile
    @GetMapping("/public/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable String id) {
        return doctorRepository.findByIdAndActiveTrueAndVerificationStatus(id, Doctor.VerificationStatus.APPROVED)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Public: doctors by department
    @GetMapping("/public/department/{deptId}")
    public ResponseEntity<List<Doctor>> getDoctorsByDepartment(@PathVariable String deptId) {
        return ResponseEntity.ok(
            doctorRepository.findByDepartmentIdAndActiveTrueAndVerificationStatus(
                deptId, Doctor.VerificationStatus.APPROVED
            )
        );
    }

    // Doctor: get own profile (linked by userId)
    @GetMapping("/dashboard/profile")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> getDoctorProfile(@RequestParam String userId) {
        return doctorRepository.findByUserId(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Doctor: update own schedule
    @PutMapping("/dashboard/{id}/schedule")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> updateSchedule(@PathVariable String id,
                                            @RequestBody Map<String, List<String>> schedule) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setWeeklySchedule(schedule);
            doctorRepository.save(doctor);
            return ResponseEntity.ok(Map.of("message", "Schedule updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Doctor: mark leave dates
    @PutMapping("/dashboard/{id}/leave")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<?> updateLeave(@PathVariable String id,
                                         @RequestBody Map<String, List<String>> body) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setLeaveDates(body.get("leaveDates"));
            doctorRepository.save(doctor);
            return ResponseEntity.ok(Map.of("message", "Leave dates updated"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
