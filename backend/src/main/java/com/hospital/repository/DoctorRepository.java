package com.hospital.repository;

import com.hospital.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends MongoRepository<Doctor, String> {
    List<Doctor> findByDepartmentIdAndActiveTrue(String departmentId);
    List<Doctor> findByActiveTrue();
    Optional<Doctor> findByEmail(String email);
    Optional<Doctor> findByUserId(String userId);
}
