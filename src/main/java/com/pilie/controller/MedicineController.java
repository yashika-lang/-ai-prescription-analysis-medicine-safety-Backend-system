package com.pilie.controller;

import com.pilie.model.Medicine;
import com.pilie.repository.MedicineRepository;
import com.pilie.service.WikiUsageFetcher;
import com.pilie.service.HindiTranslator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/medicine")
public class MedicineController {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private WikiUsageFetcher wikiUsageFetcher;

    @Autowired
    private HindiTranslator hindiTranslator; // ✅ Added here

    // 🟢 Add single medicine
    @PostMapping("/add")
    public Medicine addMedicine(@RequestBody Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    // 🟢 Get all medicines
    @GetMapping("/all")
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    // ✅ BULK UPLOAD FROM CSV via Multipart file with auto-fetch (Eng + Hindi)
    @PostMapping("/upload-csv")
    public String uploadMedicines(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return "❌ File is empty.";
        }

        try (
            BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())
        ) {
            List<Medicine> medicines = new ArrayList<>();
            int skippedCount = 0;

            for (CSVRecord csvRecord : csvParser) {
                String name = csvRecord.get("name").trim();
                String manufacturer = csvRecord.get("manufacturer").trim();

                // Check for duplicates
                boolean exists = medicineRepository.findAll()
                    .stream()
                    .anyMatch(m -> m.getName().equalsIgnoreCase(name) &&
                                   m.getManufacturer().equalsIgnoreCase(manufacturer));

                if (exists) {
                    skippedCount++;
                    continue; // skip this duplicate
                }

                Medicine medicine = new Medicine();
                medicine.setName(name);
                medicine.setIngredients(csvRecord.get("ingredients"));
                medicine.setManufacturer(manufacturer);

                // 🌐 Auto-fetch English usage
                String usage = csvRecord.isMapped("usage") && !csvRecord.get("usage").isEmpty()
                        ? csvRecord.get("usage")
                        : wikiUsageFetcher.fetchUsageFromWikipedia(name);
                medicine.setUsage(usage);

                // 🌐 Auto-translate to Hindi using injected translator
                String hindiUsage = hindiTranslator.translateToHindi(usage);
                medicine.setUsageHindi(hindiUsage);

                medicines.add(medicine);
            }

            medicineRepository.saveAll(medicines);
            return "✅ Uploaded: " + medicines.size() + " medicines\n" +
                   "⚠️ Skipped: " + skippedCount + " duplicates.";
        } catch (Exception e) {
            e.printStackTrace();
            return "❌ Failed to upload CSV: " + e.getMessage();
        }
    }
}