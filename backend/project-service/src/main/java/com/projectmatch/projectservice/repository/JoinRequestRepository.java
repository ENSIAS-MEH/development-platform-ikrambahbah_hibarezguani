package com.projectmatch.projectservice.repository;

import com.projectmatch.projectservice.entity.JoinRequest;
import com.projectmatch.projectservice.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {
    List<JoinRequest> findByProjectId(Long projectId);
    List<JoinRequest> findByProjectIdAndStatus(Long projectId, RequestStatus status);
    List<JoinRequest> findByApplicantId(Long applicantId);
    Optional<JoinRequest> findByProjectIdAndApplicantId(Long projectId, Long applicantId);
    boolean existsByProjectIdAndApplicantIdAndStatus(Long projectId, Long applicantId, RequestStatus status);
}