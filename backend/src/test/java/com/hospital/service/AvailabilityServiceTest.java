package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    DoctorRepository doctorRepository;

    @Mock
    AppointmentRepository appointmentRepository;

    @InjectMocks
    AvailabilityService availabilityService;

    private final String doctorId = "doc-1";
    private final LocalDate targetDate = LocalDate.now().plusDays(1);

    private Doctor doctorWithSchedule(String day, List<String> slots) {
        Doctor doctor = new Doctor();
        doctor.setId(doctorId);
        doctor.setWeeklySchedule(Map.of(day, slots));
        doctor.setLeaveDates(List.of());
        return doctor;
    }

    @Test
    void leaveDayReturnsNoSlots() {
        Doctor doctor = doctorWithSchedule(targetDate.getDayOfWeek().name(), List.of("09:00", "09:30"));
        doctor.setLeaveDates(List.of(targetDate.toString()));

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));

        assertTrue(availabilityService.getAvailableSlots(doctorId, targetDate).isEmpty());
    }

    @Test
    void nonWorkingDayReturnsNoSlots() {
        LocalDate date = LocalDate.now();
        String otherDay = date.plusDays(2).getDayOfWeek().name();
        Doctor doctor = doctorWithSchedule(otherDay, List.of("09:00", "09:30"));

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));

        assertTrue(availabilityService.getAvailableSlots(doctorId, date).isEmpty());
    }

    @Test
    void bookedSlotIsRemovedFromAvailability() {
        Doctor doctor = doctorWithSchedule(targetDate.getDayOfWeek().name(), List.of("09:00", "09:30", "10:00"));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));

        Appointment booked = new Appointment();
        booked.setTimeSlot("09:30");
        booked.setStatus(Appointment.Status.CONFIRMED);

        when(appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, targetDate))
                .thenReturn(List.of(booked));

        List<String> slots = availabilityService.getAvailableSlots(doctorId, targetDate);

        assertEquals(List.of("09:00", "10:00"), slots);
        assertFalse(availabilityService.isSlotAvailable(doctorId, targetDate, "09:30"));
    }

    @Test
    void freeSlotIsAvailable() {
        Doctor doctor = doctorWithSchedule(targetDate.getDayOfWeek().name(), List.of("09:00", "09:30"));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, targetDate))
                .thenReturn(List.of());

        assertTrue(availabilityService.isSlotAvailable(doctorId, targetDate, "09:30"));
    }
}