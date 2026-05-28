package com.projectmatch.profile_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InitProfileRequest {

    private Long authUserId;

    private String firstName;
    private String lastName;
}