package com.projectmatch.projectservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_tags")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProjectTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}