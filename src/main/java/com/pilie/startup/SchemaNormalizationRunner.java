package com.pilie.startup;

import com.pilie.model.Allergen;
import com.pilie.model.Ingredient;
import com.pilie.model.Medicine;
import com.pilie.model.User;
import com.pilie.repository.AllergenRepository;
import com.pilie.repository.IngredientRepository;
import com.pilie.repository.MedicineRepository;
import com.pilie.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * One-time (idempotent) normalization pass: backfills the new Ingredient/Allergen
 * tables and their relationships from the pre-existing free-text data
 * (Medicine.ingredients strings, User.allergies strings, and the allergen list that
 * used to live only as a hardcoded map in AllergyChecker), without touching or
 * deleting any of the legacy columns. Safe to run on every startup.
 */
@Component
public class SchemaNormalizationRunner implements ApplicationRunner {

    // Same list AllergyChecker used to hold in code only - now the source of truth is the DB.
    private static final Map<String, String> KNOWN_ALLERGENS = new LinkedHashMap<>();
    static {
        KNOWN_ALLERGENS.put("penicillin", "severe");
        KNOWN_ALLERGENS.put("sulfa", "severe");
        KNOWN_ALLERGENS.put("lactose", "common");
        KNOWN_ALLERGENS.put("gelatin", "common");
        KNOWN_ALLERGENS.put("aspirin", "common");
        KNOWN_ALLERGENS.put("ibuprofen", "common");
        KNOWN_ALLERGENS.put("gluten", "common");
        KNOWN_ALLERGENS.put("nuts", "common");
        KNOWN_ALLERGENS.put("egg", "common");
        KNOWN_ALLERGENS.put("dyes", "common");
        KNOWN_ALLERGENS.put("color", "common");
    }

    private final AllergenRepository allergenRepository;
    private final IngredientRepository ingredientRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    public SchemaNormalizationRunner(AllergenRepository allergenRepository,
                                      IngredientRepository ingredientRepository,
                                      MedicineRepository medicineRepository,
                                      UserRepository userRepository) {
        this.allergenRepository = allergenRepository;
        this.ingredientRepository = ingredientRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedKnownAllergensAndIngredients();
        migrateMedicineIngredients();
        migrateUserAllergies();
    }

    private Allergen findOrCreateAllergen(String name, String defaultRisk) {
        return allergenRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> allergenRepository.save(new Allergen(name.toLowerCase(), defaultRisk)));
    }

    private Ingredient findOrCreateIngredient(String name) {
        return ingredientRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> ingredientRepository.save(new Ingredient(name)));
    }

    private void seedKnownAllergensAndIngredients() {
        for (Map.Entry<String, String> entry : KNOWN_ALLERGENS.entrySet()) {
            Allergen allergen = findOrCreateAllergen(entry.getKey(), entry.getValue());
            // Each known allergen is also registered as an ingredient substance in its own right,
            // so ingredient-level matching (Medicine -> Ingredient -> Allergen) works even for
            // medicines whose ingredient text matches the allergen name directly (e.g. "Aspirin").
            Ingredient ingredient = findOrCreateIngredient(entry.getKey());
            if (ingredient.getAllergens().stream().noneMatch(a -> a.getId().equals(allergen.getId()))) {
                ingredient.getAllergens().add(allergen);
                ingredientRepository.save(ingredient);
            }
        }
    }

    private void migrateMedicineIngredients() {
        for (Medicine medicine : medicineRepository.findAll()) {
            if (!medicine.getIngredientSet().isEmpty()) {
                continue; // already migrated
            }
            String raw = medicine.getIngredients();
            if (raw == null || raw.isBlank() || raw.equalsIgnoreCase("N/A")) {
                continue;
            }
            boolean changed = false;
            for (String token : raw.split("[+,]")) {
                String name = token.trim();
                if (name.isEmpty()) continue;
                Ingredient ingredient = findOrCreateIngredient(name);
                if (medicine.getIngredientSet().add(ingredient)) {
                    changed = true;
                }
            }
            if (changed) {
                medicineRepository.save(medicine);
            }
        }
    }

    private void migrateUserAllergies() {
        for (User user : userRepository.findAll()) {
            if (user.getAllergies() == null || user.getAllergies().isEmpty()) {
                continue;
            }
            boolean changed = false;
            for (String allergyName : user.getAllergies()) {
                if (allergyName == null || allergyName.isBlank()) continue;
                Allergen allergen = findOrCreateAllergen(allergyName.trim(), "unknown");
                if (user.getAllergenProfile().add(allergen)) {
                    changed = true;
                }
            }
            if (changed) {
                userRepository.save(user);
            }
        }
    }
}
