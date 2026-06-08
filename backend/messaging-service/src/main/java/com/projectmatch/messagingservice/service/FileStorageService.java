package com.projectmatch.messagingservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:./uploads/}")
    private String uploadDir;

    @Value("${file.base-url:http://localhost:8086/uploads/}")
    private String baseUrl;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Dossier uploads créé: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("❌ Erreur création dossier uploads: " + e.getMessage());
        }
    }

    public String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);

            // Nettoyer le nom du fichier
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";
            if (originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Sauvegarder le fichier
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("✅ Fichier sauvegardé: " + filePath.toAbsolutePath());

            // Retourner l'URL publique
            return baseUrl + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Impossible de sauvegarder le fichier: " + e.getMessage());
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            String fileName = extractFileNameFromUrl(fileUrl);
            if (fileName == null || fileName.isEmpty()) return;

            Path filePath = Paths.get(uploadDir).resolve(fileName);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                System.out.println("🗑️ Fichier supprimé: " + filePath.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("❌ Erreur suppression fichier: " + e.getMessage());
        }
    }

    public void deleteFiles(List<String> fileUrls) {
        if (fileUrls == null || fileUrls.isEmpty()) return;
        for (String url : fileUrls) {
            deleteFile(url);
        }
    }

    private String extractFileNameFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return null;
        String[] parts = fileUrl.split("/uploads/");
        return parts.length > 1 ? parts[1] : null;
    }
}