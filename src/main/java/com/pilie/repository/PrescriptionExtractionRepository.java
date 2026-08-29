package com.pilie.repository;

import com.pilie.model.PrescriptionExtraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionExtractionRepository extends JpaRepository<PrescriptionExtraction, Long> {
    List<PrescriptionExtraction> findByUserEmailIgnoreCaseOrderByExtractedAtDesc(String userEmail);
    List<PrescriptionExtraction> findAllByOrderByExtractedAtDesc();
}
