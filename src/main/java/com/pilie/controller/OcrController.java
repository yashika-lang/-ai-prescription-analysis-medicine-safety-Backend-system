package com.pilie.controller;

import com.pilie.model.Medicine;
import com.pilie.model.User;
import com.pilie.repository.MedicineRepository;
import com.pilie.repository.UserRepository;
import com.pilie.service.AllergyChecker;
import com.pilie.service.DosageExtractor;
import com.pilie.service.HindiTranslator;
import com.pilie.service.WikiUsageFetcher;
import com.pilie.service.IngredientInjector;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WikiUsageFetcher wikiUsageFetcher;

    @Autowired
    private HindiTranslator hindiTranslator;

    @Autowired
    private AllergyChecker allergyChecker;

    @Autowired
    private IngredientInjector ingredientInjector;

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

        List<Map<String, Object>> response = new ArrayList<>();

        // Fetch user by email
        User user = userRepository.findByEmail(email);

        // Extract medicines and dosages from OCR text
        List<Map<String, String>> extractedData = DosageExtractor.extractMultipleDosages(text);

        for (Map<String, String> medMap : extractedData) {
            String medName = medMap.getOrDefault("name", "Unknown");

            // Try to find medicine in DB or create new one
            Optional<Medicine> existingMedOpt = medicineRepository.findByNameIgnoreCase(medName);
            Medicine medicine;
            if (existingMedOpt.isPresent()) {
                medicine = existingMedOpt.get();
            } else {
                medicine = new Medicine();
                medicine.setName(medName);
                // Ingredients from manual injector or fallback
                medicine.setIngredients(ingredientInjector.getManualIngredients(medName));
                medicine.setManufacturer("N/A");

                // Get usage and translate to Hindi
                String usageEng = wikiUsageFetcher.fetchUsageFromWikipedia(medName);
                String usageHi = safeTranslate(usageEng);

                medicine.setUsage(usageEng);
                medicine.setUsageHindi(usageHi);

                medicineRepository.save(medicine);
            }

            // Translate dosage details to Hindi safely
            String quantityHi = safeTranslate(medMap.getOrDefault("quantity", ""));
            String timingHi = safeTranslate(medMap.getOrDefault("timing", ""));
            String durationHi = safeTranslate(medMap.getOrDefault("duration", ""));

            // Detect allergens in ingredients
            List<Map<String, String>> allergensFound = allergyChecker.checkForAllergens(medicine.getIngredients());

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

            // Auto-save new allergens to user allergy profile
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
                if (modified) {
                    List<String> updatedAllergies = new ArrayList<>(allergySet);
                    user.setAllergies(updatedAllergies);
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
        }

        return response;
    }

}
