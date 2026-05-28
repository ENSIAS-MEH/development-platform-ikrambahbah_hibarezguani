package com.projectmatch.auth_service.service;

import com.projectmatch.auth_service.dto.*;
import com.projectmatch.auth_service.model.*;
import com.projectmatch.auth_service.repository.AuthUserRepository;
import com.projectmatch.auth_service.repository.PasswordResetTokenRepository;
import com.projectmatch.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional   // ← AJOUTÉ ICI — toutes les méthodes ont une transaction
public class AuthService {

    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final AuthUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé !");
        }

        AuthUser user = AuthUser.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.valueOf(request.getRole() != null ? request.getRole() : "STUDENT"))
                .status(AccountStatus.ACTIVE)
                .build();

        repository.save(user);

        // ✅ Générer le token après la création
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(),user.getId());
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        AuthUser user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new RuntimeException("Compte suspendu ou supprimé");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(),user.getId());
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    public String forgotPassword(String email) {
        if (!repository.existsByEmail(email)) {
            return "Si cet email existe, un lien de réinitialisation a été envoyé.";
        }
        tokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .email(email)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();
        tokenRepository.save(resetToken);
        emailService.sendResetPasswordEmail(email, token);
        return "Si cet email existe, un lien de réinitialisation a été envoyé.";
    }

    public String resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token invalide ou expiré"));
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce lien a expiré. Faites une nouvelle demande.");
        }
        if (resetToken.isUsed()) {
            throw new RuntimeException("Ce lien a déjà été utilisé.");
        }
        AuthUser user = repository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(user);
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        return "Mot de passe réinitialisé avec succès !";
    }
    public Optional<AuthUser> findUserById(Long userId) {
        return repository.findById(userId);
    }
    public List<AuthUser> getAllStudents() {
        return repository.findByRole(UserRole.STUDENT);
    }

}