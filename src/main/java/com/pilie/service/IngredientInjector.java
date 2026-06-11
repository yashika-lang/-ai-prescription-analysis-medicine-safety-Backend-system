package com.pilie.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class IngredientInjector {

    private static final Map<String, String> predefinedIngredients = new HashMap<>();

    static {
        predefinedIngredients.put("aspirin", "Aspirin");
        predefinedIngredients.put("dolo", "Paracetamol");
        predefinedIngredients.put("combiflam", "Ibuprofen+Paracetamol");
        predefinedIngredients.put("amoxicillin", "Amoxicillin+Penicillin");
        predefinedIngredients.put("crocin", "Paracetamol+Starch");
        // 👉 Add more medicines here as needed
    }

    public String getManualIngredients(String medName) {
        if (medName == null) return "N/A";
        return predefinedIngredients.getOrDefault(medName.trim().toLowerCase(), "N/A");
    }
}