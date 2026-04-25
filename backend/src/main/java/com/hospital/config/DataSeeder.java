package com.hospital.config;

import com.hospital.model.Department;
import com.hospital.model.Doctor;
import com.hospital.model.User;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedDepartments();
        seedAdminUser();
        seedDoctors();
    }

    private void seedDepartments() {
        if (departmentRepository.count() > 0) return;

        List<Department> departments = List.of(
            dept("Cardiology", "CARDIO", "Heart & cardiovascular system", "❤️"),
            dept("Dentistry", "DENT", "Oral health & dental care", "🦷"),
            dept("Dermatology", "DERM", "Skin, hair & nail conditions", "🧴"),
            dept("Neurology", "NEURO", "Brain & nervous system", "🧠"),
            dept("Orthopedics", "ORTHO", "Bones, joints & musculoskeletal", "🦴"),
            dept("Pediatrics", "PEDS", "Children's health & development", "👶"),
            dept("Psychiatry", "PSYCH", "Mental health & wellness", "🧘"),
            dept("Ophthalmology", "OPHTH", "Eyes & vision care", "👁️"),
            dept("ENT", "ENT", "Ear, nose & throat", "👂"),
            dept("General Medicine", "GM", "Primary care & general health", "🏥"),
            dept("Gynecology", "GYN", "Women's reproductive health", "🌸"),
            dept("Oncology", "ONCO", "Cancer diagnosis & treatment", "🎗️")
        );
        departmentRepository.saveAll(departments);
        log.info("Seeded {} departments", departments.size());
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail("admin@hospital.com")) return;

        User admin = new User();
        admin.setFirstName("System");
        admin.setLastName("Admin");
        admin.setEmail("admin@hospital.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(User.Role.ADMIN);
        admin.setPhone("9999999999");
        userRepository.save(admin);
        log.info("Admin user created: admin@hospital.com / Admin@123");
    }

    private void seedDoctors() {
        if (doctorRepository.count() > 0) return;

        Department cardio = departmentRepository.findByCode("CARDIO").orElse(null);
        Department dent = departmentRepository.findByCode("DENT").orElse(null);
        Department neuro = departmentRepository.findByCode("NEURO").orElse(null);
        Department ortho = departmentRepository.findByCode("ORTHO").orElse(null);
        Department peds = departmentRepository.findByCode("PEDS").orElse(null);

        // Default weekly schedule: Mon–Sat, 9am–5pm, 30-min slots
        Map<String, List<String>> defaultSchedule = Map.of(
            "MONDAY",    generateSlots("09:00", "17:00", 30),
            "TUESDAY",   generateSlots("09:00", "17:00", 30),
            "WEDNESDAY", generateSlots("09:00", "17:00", 30),
            "THURSDAY",  generateSlots("09:00", "17:00", 30),
            "FRIDAY",    generateSlots("09:00", "17:00", 30),
            "SATURDAY",  generateSlots("09:00", "13:00", 30)
        );

        Map<String, List<String>> afternoonSchedule = Map.of(
            "MONDAY",    generateSlots("14:00", "20:00", 30),
            "TUESDAY",   generateSlots("14:00", "20:00", 30),
            "WEDNESDAY", generateSlots("14:00", "20:00", 30),
            "THURSDAY",  generateSlots("14:00", "20:00", 30),
            "FRIDAY",    generateSlots("14:00", "20:00", 30)
        );

        if (cardio != null) {
            saveDoctor("Rajesh", "Sharma", "dr.sharma@hospital.com", cardio, "Interventional Cardiology", "MD, DM Cardiology", 15, 800.0, defaultSchedule);
            saveDoctor("Priya", "Mehta", "dr.mehta@hospital.com", cardio, "Echocardiography", "MBBS, MD", 10, 600.0, afternoonSchedule);
        }
        if (dent != null) {
            saveDoctor("Anita", "Gupta", "dr.gupta@hospital.com", dent, "Orthodontics", "BDS, MDS", 8, 500.0, defaultSchedule);
            saveDoctor("Vikram", "Joshi", "dr.joshi@hospital.com", dent, "Oral Surgery", "BDS, MDS", 12, 700.0, afternoonSchedule);
        }
        if (neuro != null) {
            saveDoctor("Sunita", "Patel", "dr.patel@hospital.com", neuro, "Neurosurgery", "MD, MCh", 20, 1000.0, defaultSchedule);
        }
        if (ortho != null) {
            saveDoctor("Arjun", "Singh", "dr.singh@hospital.com", ortho, "Joint Replacement", "MS Ortho", 14, 700.0, defaultSchedule);
        }
        if (peds != null) {
            saveDoctor("Kavita", "Rao", "dr.rao@hospital.com", peds, "Neonatology", "MD Pediatrics", 9, 500.0, defaultSchedule);
        }

        log.info("Seeded sample doctors");
    }

    private void saveDoctor(String first, String last, String email,
                            Department dept, String spec, String qual,
                            int exp, double fee, Map<String, List<String>> schedule) {
        // Create linked user account
        User user = new User();
        user.setFirstName(first);
        user.setLastName(last);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Doctor@123"));
        user.setRole(User.Role.DOCTOR);
        user = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUserId(user.getId());
        doctor.setFirstName(first);
        doctor.setLastName(last);
        doctor.setEmail(email);
        doctor.setDepartmentId(dept.getId());
        doctor.setDepartmentName(dept.getName());
        doctor.setSpecialization(spec);
        doctor.setQualification(qual);
        doctor.setExperienceYears(exp);
        doctor.setConsultationFee(fee);
        doctor.setWeeklySchedule(schedule);
        doctor.setBio("Experienced specialist with " + exp + " years in " + spec);
        doctor.setVerificationStatus(Doctor.VerificationStatus.APPROVED);
        doctor.setVerificationReviewedAt(LocalDateTime.now());
        doctorRepository.save(doctor);
    }

    private Department dept(String name, String code, String desc, String icon) {
        Department d = new Department();
        d.setName(name);
        d.setCode(code);
        d.setDescription(desc);
        d.setIcon(icon);
        return d;
    }

    private List<String> generateSlots(String start, String end, int durationMinutes) {
        List<String> slots = new java.util.ArrayList<>();
        int[] startParts = parseTime(start);
        int[] endParts = parseTime(end);
        int startMin = startParts[0] * 60 + startParts[1];
        int endMin = endParts[0] * 60 + endParts[1];
        for (int m = startMin; m < endMin; m += durationMinutes) {
            slots.add(String.format("%02d:%02d", m / 60, m % 60));
        }
        return slots;
    }

    private int[] parseTime(String t) {
        String[] p = t.split(":");
        return new int[]{Integer.parseInt(p[0]), Integer.parseInt(p[1])};
    }
}
