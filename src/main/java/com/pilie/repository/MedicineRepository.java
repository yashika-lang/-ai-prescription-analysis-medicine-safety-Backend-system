package com.pilie.repository;

import com.pilie.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    // Yahan tu custom query methods bhi add kar sakti hai future me

    // Multiple medicines can legitimately share a name (different manufacturers -
    // see MedicineController's CSV upload, which dedupes by name+manufacturer, not
    // name alone), so this intentionally returns a list rather than a single Optional.
    List<Medicine> findByNameIgnoreCase(String name);
}