package com.pilie.service;

import com.pilie.model.Allergen;
import com.pilie.model.Medicine;
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

    /**
     * Normalized check: walks the medicine's linked Ingredient -> Allergen relations
     * built by the schema migration/seed step instead of regex-matching a free-text
     * ingredients string. Falls back to {@link #checkForAllergens(String)} when the
     * medicine has no normalized ingredient links yet (e.g. not migrated/seeded).
     */
    public List<Map<String, String>> checkForAllergensNormalized(Medicine medicine) {
        if (medicine == null) return new ArrayList<>();

        if (medicine.getIngredientSet() == null || medicine.getIngredientSet().isEmpty()) {
            return checkForAllergens(medicine.getIngredients());
        }

        List<Map<String, String>> foundAllergens = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (var ingredient : medicine.getIngredientSet()) {
            for (Allergen allergen : ingredient.getAllergens()) {
                String name = allergen.getName().toLowerCase();
                if (seen.add(name)) {
                    Map<String, String> allergenInfo = new HashMap<>();
                    allergenInfo.put("name", name);
                    allergenInfo.put("risk", allergen.getRiskLevel() != null ? allergen.getRiskLevel() : "unknown");
                    foundAllergens.add(allergenInfo);
                }
            }
        }
        return foundAllergens;
    }
}
