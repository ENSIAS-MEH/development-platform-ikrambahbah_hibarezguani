package com.projectmatch.profile_service.service;

import com.projectmatch.profile_service.dto.*;
import com.projectmatch.profile_service.entity.*;
import com.projectmatch.profile_service.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;

    public UserProfile getByAuthUserId(Long authUserId) {
        return profileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found"));
    }

    @Transactional
    public UserProfile createProfile(InitProfileRequest request) {
        UserProfile profile = UserProfile.builder()
                .authUserId(request.getAuthUserId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();
        return profileRepository.save(profile);
    }

    @Transactional
    public UserProfile updateProfile(Long authUserId, UpdateProfileRequest request) {
        UserProfile profile = getByAuthUserId(authUserId);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setBio(request.getBio());
        profile.setAvatarUrl(request.getAvatarUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setWebsiteUrl(request.getWebsiteUrl());
        return profileRepository.save(profile);
    }

    @Transactional
    public Skill addSkill(Long authUserId, SkillRequest request) {
        UserProfile profile = getByAuthUserId(authUserId);
        Skill skill = Skill.builder()
                .name(request.getName())
                .level(request.getLevel())
                .userProfile(profile)
                .build();
        return skillRepository.save(skill);
    }

    @Transactional
    public void deleteSkill(Long skillId) {
        skillRepository.deleteById(skillId);
    }

    @Transactional
    public Experience addExperience(Long authUserId, ExperienceRequest request) {
        UserProfile profile = getByAuthUserId(authUserId);

        System.out.println("=== DEBUG EXPERIENCE ===");
        System.out.println("Title: " + request.getTitle());
        System.out.println("Company: " + request.getCompany());
        System.out.println("StartDate: " + request.getStartDate());
        System.out.println("EndDate: " + request.getEndDate());
        System.out.println("Current: " + request.isCurrent());

        Experience experience = Experience.builder()
                .title(request.getTitle())
                .company(request.getCompany())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.isCurrent() ? null : request.getEndDate())
                .current(request.isCurrent())
                .userProfile(profile)
                .build();

        return experienceRepository.save(experience);
    }
    @Transactional
    public void deleteExperience(Long experienceId) {
        experienceRepository.deleteById(experienceId);
    }

    @Transactional
    public Education addEducation(Long authUserId, EducationRequest request) {
        UserProfile profile = getByAuthUserId(authUserId);

        Education education = Education.builder()
                .institution(request.getInstitution())
                .degree(request.getDegree())
                .fieldOfStudy(request.getFieldOfStudy())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .userProfile(profile)
                .build();

        return educationRepository.save(education);
    }

    @Transactional
    public void deleteEducation(Long educationId) {
        educationRepository.deleteById(educationId);
    }
}