package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.User;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    AppointmentRepository appointmentRepository;

    @Mock
    DoctorRepository doctorRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    AvailabilityService availabilityService;

    @Mock
    EmailService emailService;

    @InjectMocks
    AppointmentService appointmentService;

    @Test
    void rejectsCancellationWithinThirtyMinutesOfAppointment() {
        Appointment appointment = appointmentAt(LocalDate.now(), LocalTime.now().plusMinutes(25));
        when(appointmentRepository.findById("apt-1")).thenReturn(Optional.of(appointment));

        RuntimeException error = assertThrows(RuntimeException.class, () ->
            appointmentService.updateAppointmentStatus(
                "apt-1",
                Appointment.Status.CANCELLED,
                null,
                null,
                "Need to cancel",
                "patient-1"
            )
        );

        assertEquals(
            "Appointments can only be cancelled more than 30 minutes before the scheduled time",
            error.getMessage()
        );
        verify(appointmentRepository, never()).save(any());
        verify(emailService, never()).sendAppointmentCancellation(any());
    }

    @Test
    void allowsCancellationMoreThanThirtyMinutesBeforeAppointment() {
        Appointment appointment = appointmentAt(LocalDate.now(), LocalTime.now().plusMinutes(45));
        when(appointmentRepository.findById("apt-2")).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Appointment updated = appointmentService.updateAppointmentStatus(
            "apt-2",
            Appointment.Status.CANCELLED,
            null,
            null,
            "Need to cancel",
            "patient-1"
        );

        assertEquals(Appointment.Status.CANCELLED, updated.getStatus());
        assertEquals("Need to cancel", updated.getCancellationReason());
        verify(appointmentRepository).save(appointment);
        verify(emailService).sendAppointmentCancellation(appointment);
    }

    @Test
    void rejectsBookingForDoctorPendingVerification() {
        User patient = new User();
        patient.setId("patient-1");
        patient.setFirstName("Test");
        patient.setLastName("Patient");
        patient.setEmail("patient@example.com");

        Doctor doctor = new Doctor();
        doctor.setId("doctor-1");
        doctor.setFirstName("Asha");
        doctor.setLastName("Verma");
        doctor.setVerificationStatus(Doctor.VerificationStatus.PENDING);
        doctor.setActive(true);
        doctor.setWeeklySchedule(Map.of(LocalDate.now().plusDays(1).getDayOfWeek().name(), List.of("09:00")));

        when(userRepository.findById("patient-1")).thenReturn(Optional.of(patient));
        when(doctorRepository.findById("doctor-1")).thenReturn(Optional.of(doctor));

        RuntimeException error = assertThrows(RuntimeException.class, () ->
            appointmentService.bookAppointment(
                "patient-1",
                "doctor-1",
                LocalDate.now().plusDays(1),
                "09:00",
                "Checkup",
                "Cough"
            )
        );

        assertEquals("Doctor is pending admin approval and cannot accept appointments yet", error.getMessage());
        verify(appointmentRepository, never()).save(any());
    }

    private Appointment appointmentAt(LocalDate date, LocalTime time) {
        Appointment appointment = new Appointment();
        appointment.setId("apt");
        appointment.setAppointmentDate(date);
        appointment.setTimeSlot(time.withSecond(0).withNano(0).toString());
        appointment.setStatus(Appointment.Status.CONFIRMED);
        return appointment;
    }
}
