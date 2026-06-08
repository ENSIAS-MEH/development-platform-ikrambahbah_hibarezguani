package com.projectmatch.profile_service.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String bio;
    private String avatarUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String websiteUrl;
}