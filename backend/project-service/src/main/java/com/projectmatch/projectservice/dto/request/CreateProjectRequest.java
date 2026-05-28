package com.projectmatch.projectservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 255)
    private String title;

    private String description;

    @Min(value = 2, message = "Minimum 2 membres")
    @Max(value = 50, message = "Maximum 50 membres")
    private Integer maxMembers = 10;

    private List<String> tags = new ArrayList<>();
}