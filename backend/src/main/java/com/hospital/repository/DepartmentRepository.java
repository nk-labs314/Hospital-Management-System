package com.hospital.repository;

import com.hospital.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends MongoRepository<Department, String> {
    List<Department> findByActiveTrue();
    Optional<Department> findByCode(String code);
    boolean existsByCode(String code);
}
