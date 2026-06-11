package com.pilie.repository;

import com.pilie.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    // Yahan tu custom query methods bhi add kar sakti hai future me

    Optional<Medicine> findByNameIgnoreCase(String name);
}