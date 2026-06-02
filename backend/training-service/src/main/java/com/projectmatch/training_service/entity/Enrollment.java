package com.projectmatch.training_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    private Training training;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    private Integer progress; // 0-100

    private Boolean completed;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
        progress = 0;
        completed = false;
    }
}