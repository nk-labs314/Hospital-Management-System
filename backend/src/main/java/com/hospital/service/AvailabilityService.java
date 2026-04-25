package com.hospital.service;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    /**
     * Returns all available (unbooked) slots for a doctor on a given date.
     */
    public List<String> getAvailableSlots(String doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check if doctor is on leave
        if (doctor.getLeaveDates() != null && doctor.getLeaveDates().contains(date.toString())) {
            return Collections.emptyList();
        }

        // Get doctor's schedule for this day of week
        String dayName = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase();
        Map<String, List<String>> weeklySchedule = doctor.getWeeklySchedule();
        if (weeklySchedule == null || !weeklySchedule.containsKey(dayName)) {
            return Collections.emptyList(); // Doctor doesn't work this day
        }

        List<String> allSlots = weeklySchedule.get(dayName);

        // Get already-booked slots for this date
        Set<String> bookedSlots = appointmentRepository
                .findByDoctorIdAndAppointmentDate(doctorId, date)
                .stream()
                .filter(a -> a.getStatus() != Appointment.Status.CANCELLED)
                .map(Appointment::getTimeSlot)
                .collect(Collectors.toSet());

        // Filter out past slots if date is today
        List<String> available = allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .filter(slot -> !isPastSlot(slot, date))
                .collect(Collectors.toList());

        log.debug("Doctor {} on {}: {} total slots, {} booked, {} available",
                doctorId, date, allSlots.size(), bookedSlots.size(), available.size());

        return available;
    }

    /**
     * Checks if a specific slot is available.
     */
    public boolean isSlotAvailable(String doctorId, LocalDate date, String timeSlot) {
        List<String> available = getAvailableSlots(doctorId, date);
        return available.contains(timeSlot);
    }

    /**
     * Suggests alternative slots when requested slot is not available.
     * Strategy: same day first, then next 7 days.
     */
    public Map<String, Object> suggestAlternatives(String doctorId, LocalDate requestedDate, String requestedSlot) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("requestedSlot", requestedSlot);
        result.put("requestedDate", requestedDate);
        result.put("available", false);

        // Same-day alternatives (slots within ±2 hours)
        List<String> sameDayAlts = getSameDayAlternatives(doctorId, requestedDate, requestedSlot);
        result.put("sameDayAlternatives", sameDayAlts);

        // Next available dates (up to 5)
        List<Map<String, Object>> nextDates = getNextAvailableDates(doctorId, requestedDate, 5);
        result.put("nextAvailableDates", nextDates);

        return result;
    }

    /**
     * Gets nearby slots on the same day.
     */
    private List<String> getSameDayAlternatives(String doctorId, LocalDate date, String preferredSlot) {
        List<String> available = getAvailableSlots(doctorId, date);
        if (available.isEmpty())
            return Collections.emptyList();

        // Sort by proximity to preferred slot
        int preferredMinutes = toMinutes(preferredSlot);
        return available.stream()
                .sorted(Comparator.comparingInt(s -> Math.abs(toMinutes(s) - preferredMinutes)))
                .limit(3)
                .collect(Collectors.toList());
    }

    /**
     * Returns next N dates with available slots.
     */
    public List<Map<String, Object>> getNextAvailableDates(String doctorId, LocalDate fromDate, int limit) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate date = fromDate.plusDays(1);
        LocalDate maxDate = fromDate.plusDays(90);

        while (date.isBefore(maxDate) && result.size() < limit) {
            List<String> slots = getAvailableSlots(doctorId, date);
            if (!slots.isEmpty()) {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("date", date.toString());
                entry.put("dayOfWeek", date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH));
                entry.put("availableSlotCount", slots.size());
                entry.put("firstSlot", slots.get(0));
                result.add(entry);
            }
            date = date.plusDays(1);
        }
        return result;
    }

    /**
     * Get booked slots for display.
     */
    public List<String> getBookedSlots(String doctorId, LocalDate date) {
        return appointmentRepository
                .findByDoctorIdAndAppointmentDate(doctorId, date)
                .stream()
                .filter(a -> a.getStatus() != Appointment.Status.CANCELLED)
                .map(Appointment::getTimeSlot)
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Assign token number for a date.
     */
    public int assignTokenNumber(String doctorId, LocalDate date) {
        long existing = appointmentRepository
                .countByDoctorIdAndAppointmentDateAndStatus(doctorId, date, Appointment.Status.CONFIRMED);
        return (int) existing + 1;
    }

    private boolean isPastSlot(String slot, LocalDate date) {
        if (!date.equals(LocalDate.now()))
            return false;
        java.time.LocalTime now = java.time.LocalTime.now();
        java.time.LocalTime slotTime = java.time.LocalTime.parse(slot);
        return slotTime.isBefore(now);
    }

    private int toMinutes(String slot) {
        String[] parts = slot.split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }
}
