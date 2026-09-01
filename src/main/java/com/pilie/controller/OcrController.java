package com.pilie.controller;

import com.pilie.model.Ingredient;
import com.pilie.model.Medicine;
import com.pilie.model.PrescriptionExtraction;
import com.pilie.model.User;
import com.pilie.repository.AllergenRepository;
import com.pilie.repository.IngredientRepository;
import com.pilie.repository.MedicineRepository;
import com.pilie.repository.PrescriptionExtractionRepository;
import com.pilie.repository.UserRepository;
import com.pilie.service.AllergyChecker;
import com.pilie.service.DosageExtractor;
import com.pilie.service.HindiTranslator;
import com.pilie.service.IngredientInjector;
import com.pilie.service.TesseractOcrService;
import com.pilie.service.WikiUsageFetcher;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private AllergenRepository allergenRepository;

    @Autowired
    private PrescriptionExtractionRepository prescriptionExtractionRepository;

    @Autowired
    private WikiUsageFetcher wikiUsageFetcher;

    @Autowired
    private HindiTranslator hindiTranslator;

    @Autowired
    private AllergyChecker allergyChecker;

    @Autowired
    private IngredientInjector ingredientInjector;

    @Autowired
    private TesseractOcrService tesseractOcrService;

    // Helper method for safe Hindi translation with fallback to original text
    private String safeTranslate(String text) {
        try {
            String translated = hindiTranslator.translateToHindi(text);
            if (translated == null || translated.trim().isEmpty()) {
                return text;  // fallback to original if empty or null
            }
            return translated;
        } catch (Exception e) {
            // optionally log error here
            return text;  // fallback to original on error
        }
    }

    @Transactional
    @PostMapping("/analyze-prescription")
    public List<Map<String, Object>> analyzePrescription(
            @RequestParam String text,
            @RequestParam String email) {
        return processExtractedText(text, email);
    }

    /**
     * Real OCR entry point: accepts an uploaded prescription image, runs it through
     * Tesseract (Tess4J) to get raw text, then feeds that text through the exact same
     * extraction -> ingredient lookup -> allergy cross-check pipeline as the text-based
     * endpoint above, so there is only one place the safety logic lives.
     */
    @Transactional
    @PostMapping(value = "/upload-prescription", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadPrescription(
            @RequestParam("file") MultipartFile file,
            @RequestParam String email) {
        String extractedText;
        try {
            extractedText = tesseractOcrService.extractText(file);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "OCR processing failed: " + e.getMessage()));
        }

        if (extractedText == null || extractedText.isBlank()) {
            return ResponseEntity.unprocessableEntity()
                    .body(Map.of("error", "No readable text found in the uploaded image."));
        }

        List<Map<String, Object>> result = processExtractedText(extractedText, email);
        Map<String, Object> response = new HashMap<>();
        response.put("rawOcrText", extractedText);
        response.put("medicines", result);
        return ResponseEntity.ok(response);
    }

    private List<Map<String, Object>> processExtractedText(String text, String email) {
        List<Map<String, Object>> response = new ArrayList<>();

        // Fetch user by email
        User user = userRepository.findByEmail(email);

        // Extract medicines and dosages from OCR text
        List<Map<String, String>> extractedData = DosageExtractor.extractMultipleDosages(text);

        for (Map<String, String> medMap : extractedData) {
            String medName = medMap.getOrDefault("name", "Unknown");

            // Try to find medicine in DB or create new one. Multiple rows can share a
            // name (different manufacturers), so just take the first match.
            List<Medicine> existingMeds = medicineRepository.findByNameIgnoreCase(medName);
            Medicine medicine;
            if (!existingMeds.isEmpty()) {
                medicine = existingMeds.get(0);
            } else {
                medicine = new Medicine();
                medicine.setName(medName);
                // Ingredients from manual injector or fallback
                String ingredientsRaw = ingredientInjector.getManualIngredients(medName);
                medicine.setIngredients(ingredientsRaw);
                medicine.setManufacturer("N/A");

                // Get usage and translate to Hindi
                String usageEng = wikiUsageFetcher.fetchUsageFromWikipedia(medName);
                String usageHi = safeTranslate(usageEng);

                medicine.setUsage(usageEng);
                medicine.setUsageHindi(usageHi);

                linkNormalizedIngredients(medicine, ingredientsRaw);

                medicineRepository.save(medicine);
            }

            // Translate dosage details to Hindi safely
            String quantityHi = safeTranslate(medMap.getOrDefault("quantity", ""));
            String timingHi = safeTranslate(medMap.getOrDefault("timing", ""));
            String durationHi = safeTranslate(medMap.getOrDefault("duration", ""));

            // Detect allergens via the normalized Ingredient -> Allergen relations,
            // falling back to the legacy string match when nothing has been linked yet.
            List<Map<String, String>> allergensFound = allergyChecker.checkForAllergensNormalized(medicine);

            List<String> allergenNames = new ArrayList<>();
            for (Map<String, String> allergenInfo : allergensFound) {
                allergenNames.add(allergenInfo.get("name"));
            }

            // Check user allergy profile matching with detected allergens
            boolean userAllergyMatch = false;
            if (user != null && user.getAllergies() != null) {
                for (String allergen : allergenNames) {
                    if (user.getAllergies().stream().anyMatch(ua -> ua.equalsIgnoreCase(allergen))) {
                        userAllergyMatch = true;
                        break;
                    }
                }
            }

            // Create appropriate risk message
            String riskMessage;
            if (userAllergyMatch) {
                riskMessage = "⚠️ Severe Risk — This allergen is in your allergy profile!";
            } else if (!allergenNames.isEmpty()) {
                riskMessage = "⚠️ Many people are allergic to this ingredient. Not sure if you are? Talk to the chatbot!";
            } else {
                riskMessage = "✅ No major allergens found in this medicine.";
            }

            // Auto-save new allergens to user allergy profile (both legacy string list
            // and the normalized Allergen relation, kept in sync)
            if (user != null && !allergenNames.isEmpty()) {
                List<String> currentAllergies = user.getAllergies();
                if (currentAllergies == null) {
                    currentAllergies = new ArrayList<>();
                }
                Set<String> allergySet = new HashSet<>();
                for (String allergy : currentAllergies) {
                    allergySet.add(allergy.toLowerCase());
                }
                boolean modified = false;
                for (String allergen : allergenNames) {
                    String allergenLc = allergen.toLowerCase();
                    if (!allergySet.contains(allergenLc)) {
                        allergySet.add(allergenLc);
                        modified = true;
                    }
                }
                boolean allergenProfileChanged = false;
                for (String allergen : allergenNames) {
                    com.pilie.model.Allergen allergenEntity = allergenRepository.findByNameIgnoreCase(allergen)
                            .orElseGet(() -> allergenRepository.save(new com.pilie.model.Allergen(allergen.toLowerCase(), "unknown")));
                    if (user.getAllergenProfile().add(allergenEntity)) {
                        allergenProfileChanged = true;
                    }
                }

                if (modified) {
                    List<String> updatedAllergies = new ArrayList<>(allergySet);
                    user.setAllergies(updatedAllergies);
                }
                if (modified || allergenProfileChanged) {
                    userRepository.save(user);
                }
            }

            // Prepare response map WITHOUT nearby clinics (chatbot flow me handle karo)
            Map<String, Object> medInfo = new HashMap<>();
            medInfo.put("medicine", medName);
            medInfo.put("usage", medicine.getUsage());
            medInfo.put("usageHindi", medicine.getUsageHindi());
            medInfo.put("quantity", medMap.getOrDefault("quantity", "Not found"));
            medInfo.put("quantityHindi", quantityHi);
            medInfo.put("timing", medMap.getOrDefault("timing", "Not found"));
            medInfo.put("timingHindi", timingHi);
            medInfo.put("duration", medMap.getOrDefault("duration", "Not found"));
            medInfo.put("durationHindi", durationHi);
            medInfo.put("ingredients", medicine.getIngredients());
            medInfo.put("allergensDetected", allergenNames);
            medInfo.put("riskMessage", riskMessage);
            medInfo.put("userAllergyMatch", userAllergyMatch);
            medInfo.put("action", (userAllergyMatch || !allergenNames.isEmpty()) ? "chatbot" : "noaction");
            // nearbyClinics removed from here as per request

            response.add(medInfo);

            if (email != null && !email.isBlank()) {
                PrescriptionExtraction record = new PrescriptionExtraction();
                record.setUserEmail(email);
                record.setMedicineName(medName);
                record.setIngredients(medicine.getIngredients());
                record.setQuantity(medMap.getOrDefault("quantity", "Not found"));
                record.setTiming(medMap.getOrDefault("timing", "Not found"));
                record.setDuration(medMap.getOrDefault("duration", "Not found"));
                record.setRiskMessage(riskMessage);
                prescriptionExtractionRepository.save(record);
            }
        }

        return response;
    }

    private void linkNormalizedIngredients(Medicine medicine, String rawIngredients) {
        if (rawIngredients == null || rawIngredients.isBlank() || rawIngredients.equalsIgnoreCase("N/A")) {
            return;
        }
        for (String token : rawIngredients.split("[+,]")) {
            String name = token.trim();
            if (name.isEmpty()) continue;
            Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> ingredientRepository.save(new Ingredient(name)));
            medicine.getIngredientSet().add(ingredient);
        }
    }
}
