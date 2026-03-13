package com.hospital.repository;

import com.hospital.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDescTimeSlotAsc(String patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDescTimeSlotAsc(String doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatus(
        String doctorId, LocalDate date, Appointment.Status status);

    List<Appointment> findByDoctorIdAndAppointmentDate(String doctorId, LocalDate date);

    boolean existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
        String doctorId, LocalDate date, String timeSlot, Appointment.Status status);

    @Query("{ 'doctorId': ?0, 'appointmentDate': { $gte: ?1, $lte: ?2 } }")
    List<Appointment> findByDoctorIdAndDateRange(String doctorId, LocalDate from, LocalDate to);

    long countByDoctorIdAndAppointmentDateAndStatus(String doctorId, LocalDate date, Appointment.Status status);
}
