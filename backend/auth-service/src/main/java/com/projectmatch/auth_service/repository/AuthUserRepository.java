package com.projectmatch.auth_service.repository;
import com.projectmatch.auth_service.model.AuthUser;
import com.projectmatch.auth_service.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {
    Optional<AuthUser> findByEmail(String email);
    boolean existsByEmail(String email);
    List<AuthUser> findByRole(UserRole role);
}