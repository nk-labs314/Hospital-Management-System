package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    // Run every day at 8 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.info("Sending reminders for appointments on {}", tomorrow);

        List<Appointment> tomorrowAppts = appointmentRepository
            .findAll().stream()
            .filter(a -> tomorrow.equals(a.getAppointmentDate()))
            .filter(a -> a.getStatus() == Appointment.Status.CONFIRMED)
            .toList();

        tomorrowAppts.forEach(apt -> {
            emailService.sendAppointmentReminder(apt);
            log.info("Reminder sent to {} for appointment at {}", apt.getPatientEmail(), apt.getTimeSlot());
        });

        log.info("Sent {} reminder emails", tomorrowAppts.size());
    }
}
