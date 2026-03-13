package com.hospital.service;

import com.hospital.model.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(appointment.getPatientEmail());
            helper.setSubject("✅ Appointment Confirmed – " + appointment.getDepartmentName());
            helper.setText(buildConfirmationHtml(appointment), true);

            mailSender.send(message);
            log.info("Confirmation email sent to {}", appointment.getPatientEmail());
        } catch (Exception e) {
            log.error("Failed to send confirmation email: {}", e.getMessage());
        }
    }

    @Async
    public void sendAppointmentCancellation(Appointment appointment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(appointment.getPatientEmail());
            helper.setSubject("❌ Appointment Cancelled – " + appointment.getDepartmentName());
            helper.setText(buildCancellationHtml(appointment), true);

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send cancellation email: {}", e.getMessage());
        }
    }

    @Async
    public void sendAppointmentReminder(Appointment appointment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(appointment.getPatientEmail());
            helper.setSubject("🔔 Reminder: Appointment Tomorrow – " + appointment.getDoctorName());
            helper.setText(buildReminderHtml(appointment), true);

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send reminder email: {}", e.getMessage());
        }
    }

    @Async
    public void sendDoctorNotification(Appointment appointment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(appointment.getDoctorEmail());
            helper.setSubject("📅 New Appointment Booked – " + appointment.getPatientName());
            helper.setText(buildDoctorNotificationHtml(appointment), true);

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send doctor notification: {}", e.getMessage());
        }
    }

    private String buildConfirmationHtml(Appointment apt) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background: #1a73e8; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0;">🏥 Hospital Management System</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #2e7d32;">✅ Appointment Confirmed!</h2>
                <p>Dear <strong>%s</strong>,</p>
                <p>Your appointment has been successfully booked. Here are your details:</p>
                <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="background: #f5f5f5;">
                    <td style="padding: 10px 16px; font-weight: bold;">Doctor</td>
                    <td style="padding: 10px 16px;">%s</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 16px; font-weight: bold;">Department</td>
                    <td style="padding: 10px 16px;">%s</td>
                  </tr>
                  <tr style="background: #f5f5f5;">
                    <td style="padding: 10px 16px; font-weight: bold;">Date</td>
                    <td style="padding: 10px 16px;">%s</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 16px; font-weight: bold;">Time</td>
                    <td style="padding: 10px 16px;">%s</td>
                  </tr>
                  <tr style="background: #f5f5f5;">
                    <td style="padding: 10px 16px; font-weight: bold;">Token No.</td>
                    <td style="padding: 10px 16px; font-size: 20px; font-weight: bold; color: #1a73e8;">%s</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 16px; font-weight: bold;">Reason</td>
                    <td style="padding: 10px 16px;">%s</td>
                  </tr>
                </table>
                <p style="color: #666; font-size: 14px;">Please arrive 15 minutes before your appointment time. Carry a valid ID and any previous medical records.</p>
              </div>
              <div style="background: #f5f5f5; padding: 16px; text-align: center; color: #888; font-size: 12px;">
                Hospital Management System — Caring for you, always.
              </div>
            </div>
            """.formatted(
                apt.getPatientName(), apt.getDoctorName(), apt.getDepartmentName(),
                apt.getAppointmentDate(), apt.getTimeSlot(),
                apt.getTokenNumber() != null ? "#" + apt.getTokenNumber() : "N/A",
                apt.getReasonForVisit()
        );
    }

    private String buildCancellationHtml(Appointment apt) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background: #c62828; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0;">🏥 Hospital Management System</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #c62828;">❌ Appointment Cancelled</h2>
                <p>Dear <strong>%s</strong>,</p>
                <p>Your appointment with <strong>%s</strong> on <strong>%s at %s</strong> has been cancelled.</p>
                %s
                <p>Please visit our portal to rebook an appointment at your convenience.</p>
              </div>
            </div>
            """.formatted(
                apt.getPatientName(), apt.getDoctorName(),
                apt.getAppointmentDate(), apt.getTimeSlot(),
                apt.getCancellationReason() != null
                    ? "<p><strong>Reason:</strong> " + apt.getCancellationReason() + "</p>" : ""
        );
    }

    private String buildReminderHtml(Appointment apt) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background: #f57c00; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0;">🔔 Appointment Reminder</h1>
              </div>
              <div style="padding: 32px;">
                <p>Dear <strong>%s</strong>,</p>
                <p>This is a reminder that you have an appointment <strong>tomorrow</strong>.</p>
                <p>📅 Date: <strong>%s</strong> | ⏰ Time: <strong>%s</strong></p>
                <p>👨‍⚕️ Doctor: <strong>%s</strong> — %s</p>
                <p>Token No: <strong>#%s</strong></p>
                <p style="color: #666; font-size: 14px;">Please arrive 15 minutes early with your ID and previous medical reports.</p>
              </div>
            </div>
            """.formatted(
                apt.getPatientName(), apt.getAppointmentDate(), apt.getTimeSlot(),
                apt.getDoctorName(), apt.getDepartmentName(),
                apt.getTokenNumber() != null ? apt.getTokenNumber() : "N/A"
        );
    }

    private String buildDoctorNotificationHtml(Appointment apt) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background: #1a73e8; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0;">📅 New Patient Appointment</h1>
              </div>
              <div style="padding: 32px;">
                <p>Dear <strong>%s</strong>,</p>
                <p>A new appointment has been booked:</p>
                <p>👤 Patient: <strong>%s</strong></p>
                <p>📅 Date: <strong>%s</strong> | ⏰ Time: <strong>%s</strong></p>
                <p>📋 Reason: %s</p>
                <p>Symptoms: %s</p>
              </div>
            </div>
            """.formatted(
                apt.getDoctorName(), apt.getPatientName(),
                apt.getAppointmentDate(), apt.getTimeSlot(),
                apt.getReasonForVisit(),
                apt.getSymptoms() != null ? apt.getSymptoms() : "Not specified"
        );
    }
}
