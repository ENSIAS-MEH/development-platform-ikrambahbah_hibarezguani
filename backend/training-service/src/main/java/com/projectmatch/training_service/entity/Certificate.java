package com.projectmatch.training_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String certificateNumber;

    @OneToOne
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    private String downloadUrl;

    @PrePersist
    protected void onCreate() {
        certificateNumber = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        issuedAt = LocalDateTime.now();
    }
}