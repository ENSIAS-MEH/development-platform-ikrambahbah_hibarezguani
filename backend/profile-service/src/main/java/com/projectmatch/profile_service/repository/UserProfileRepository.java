package com.projectmatch.profile_service.repository;

import com.projectmatch.profile_service.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    // Solution 1: Utiliser SET au lieu de List (mais on va modifier l'entité)
    Optional<UserProfile> findByAuthUserId(Long authUserId);

    // Solution 2: Requête séparée sans JOIN FETCH multiple
    @Query("SELECT u FROM UserProfile u WHERE u.authUserId = :authUserId")
    Optional<UserProfile> findByAuthUserIdBasic(@Param("authUserId") Long authUserId);
}