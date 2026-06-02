package com.projectmatch.training_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.projectmatch.training_service.entity.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String url;

    @Enumerated(EnumType.STRING)
    private ResourceType type;

    private Integer orderIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    @JsonIgnore
    private Training training;
}