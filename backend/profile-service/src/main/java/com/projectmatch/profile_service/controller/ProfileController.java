package com.projectmatch.profile_service.controller;

import com.projectmatch.profile_service.dto.*;
import com.projectmatch.profile_service.entity.*;
import com.projectmatch.profile_service.security.JwtUtil;
import com.projectmatch.profile_service.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(HttpServletRequest request) {
        try {
            Long userId = extractUserId(request);
            UserProfile profile = profileService.getByAuthUserId(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Profile not found");
        }
    }

    @PostMapping("/me")
    public ResponseEntity<UserProfile> createMyProfile(
            @RequestBody InitProfileRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        request.setAuthUserId(userId);
        return ResponseEntity.ok(profileService.createProfile(request));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateMyProfile(
            @RequestBody UpdateProfileRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    @PostMapping("/me/skills")
    public ResponseEntity<Skill> addMySkill(
            @RequestBody SkillRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ResponseEntity.ok(profileService.addSkill(userId, request));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long skillId) {
        profileService.deleteSkill(skillId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/experiences")
    public ResponseEntity<Experience> addExperience(
            @RequestBody ExperienceRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ResponseEntity.ok(profileService.addExperience(userId, request));
    }

    @DeleteMapping("/me/experiences/{experienceId}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long experienceId) {
        profileService.deleteExperience(experienceId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/educations")
    public ResponseEntity<Education> addEducation(
            @RequestBody EducationRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ResponseEntity.ok(profileService.addEducation(userId, request));
    }

    @DeleteMapping("/me/educations/{educationId}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long educationId) {
        profileService.deleteEducation(educationId);
        return ResponseEntity.ok().build();
    }

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("No token provided");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable Long userId) {
        try {
            UserProfile profile = profileService.getByAuthUserId(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Profile not found for user: " + userId);
        }
    }
}