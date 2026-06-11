package com.pilie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.*;

@Service
public class AllergyChecker {

    // Common allergens with risk category, extendable to more fields
    private static final Map<String, String> COMMON_ALLERGENS = Map.ofEntries(
        Map.entry("penicillin", "severe"),
        Map.entry("sulfa", "severe"),
        Map.entry("lactose", "common"),
        Map.entry("gelatin", "common"),
        Map.entry("aspirin", "common"),
        Map.entry("ibuprofen", "common"),
        Map.entry("gluten", "common"),
        Map.entry("nuts", "common"),
        Map.entry("egg", "common"),
        Map.entry("dyes", "common"),
        Map.entry("color", "common")
    );

    // Check ingredients for allergens and return structured list
    public List<Map<String, String>> checkForAllergens(String ingredients) {
        List<Map<String, String>> foundAllergens = new ArrayList<>();

        if (ingredients == null || ingredients.trim().isEmpty()) return foundAllergens;

        for (Map.Entry<String, String> allergenEntry : COMMON_ALLERGENS.entrySet()) {
            String allergen = allergenEntry.getKey();
            String risk = allergenEntry.getValue();

            Pattern pattern = Pattern.compile("\\b" + Pattern.quote(allergen) + "\\b", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(ingredients);
            if (matcher.find()) {
                Map<String, String> allergenInfo = new HashMap<>();
                allergenInfo.put("name", allergen);
                allergenInfo.put("risk", risk);
                foundAllergens.add(allergenInfo);
            }
        }
        return foundAllergens;
    }
}
