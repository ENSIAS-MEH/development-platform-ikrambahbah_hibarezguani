package com.projectmatch.profile_service.dto;

import com.projectmatch.profile_service.entity.*;
import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private Long authUserId;
    private String firstName;
    private String lastName;
    private String bio;
    private String avatarUrl;
    private String linkedinUrl;
    private String githubUrl;
    private String websiteUrl;
    private List<SkillDTO> skills;
    private List<ExperienceDTO> experiences;
    private List<EducationDTO> educations;

    // DTO pour Skill
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDTO {
        private Long id;
        private String name;
        private String level;

        public static SkillDTO fromEntity(Skill skill) {
            return SkillDTO.builder()
                    .id(skill.getId())
                    .name(skill.getName())
                    .level(skill.getLevel().toString())
                    .build();
        }
    }

    // DTO pour Experience
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExperienceDTO {
        private Long id;
        private String title;
        private String company;
        private String description;
        private String startDate;
        private String endDate;
        private boolean current;

        public static ExperienceDTO fromEntity(Experience experience) {
            return ExperienceDTO.builder()
                    .id(experience.getId())
                    .title(experience.getTitle())
                    .company(experience.getCompany())
                    .description(experience.getDescription())
                    .startDate(experience.getStartDate() != null ? experience.getStartDate().toString() : null)
                    .endDate(experience.getEndDate() != null ? experience.getEndDate().toString() : null)
                    .current(experience.isCurrent())
                    .build();
        }
    }

    // DTO pour Education
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EducationDTO {
        private Long id;
        private String institution;
        private String degree;
        private String fieldOfStudy;
        private String startDate;
        private String endDate;

        public static EducationDTO fromEntity(Education education) {
            return EducationDTO.builder()
                    .id(education.getId())
                    .institution(education.getInstitution())
                    .degree(education.getDegree())
                    .fieldOfStudy(education.getFieldOfStudy())
                    .startDate(education.getStartDate() != null ? education.getStartDate().toString() : null)
                    .endDate(education.getEndDate() != null ? education.getEndDate().toString() : null)
                    .build();
        }
    }

    public static ProfileResponse fromEntity(UserProfile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .authUserId(profile.getAuthUserId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .bio(profile.getBio())
                .avatarUrl(profile.getAvatarUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .websiteUrl(profile.getWebsiteUrl())
                .skills(profile.getSkills().stream().map(SkillDTO::fromEntity).collect(Collectors.toList()))
                .experiences(profile.getExperiences().stream().map(ExperienceDTO::fromEntity).collect(Collectors.toList()))
                .educations(profile.getEducations().stream().map(EducationDTO::fromEntity).collect(Collectors.toList()))
                .build();
    }
}