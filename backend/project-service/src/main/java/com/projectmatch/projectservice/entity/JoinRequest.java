package com.projectmatch.projectservice.entity;

import com.projectmatch.projectservice.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "join_requests",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "applicant_id"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private Long applicantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    private LocalDateTime requestedAt;

    private LocalDateTime reviewedAt;

    // ---- méthodes métier ----
    public void approve() {
        this.status = RequestStatus.APPROVED;
        this.reviewedAt = LocalDateTime.now();
    }

    public void reject() {
        this.status = RequestStatus.REJECTED;
        this.reviewedAt = LocalDateTime.now();
    }
}