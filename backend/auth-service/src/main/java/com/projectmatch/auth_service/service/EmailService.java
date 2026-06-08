package com.projectmatch.auth_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendResetPasswordEmail(String toEmail, String token) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ikrambahbah33@gmail.com"); // ← MAIL_FROM_ADDRESS
            message.setTo(toEmail);
            message.setSubject("Réinitialisation de votre mot de passe - ProjectMatch");
            message.setText(
                    "Bonjour,\n\n" +
                            "Cliquez sur ce lien pour réinitialiser votre mot de passe :\n" +
                            resetLink + "\n\n" +
                            "Ce lien expire dans 15 minutes.\n\n" +
                            "L'équipe Project Match"
            );

            mailSender.send(message);
            System.out.println("✅ Email envoyé à : " + toEmail);

        } catch (Exception e) {
            System.out.println("⚠️ Email non envoyé : " + e.getMessage());
        }
    }
}