package com.pilie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.*;

@Service
public class DosageExtractor {

    // Extract dosage info from a single sentence
    public static Map<String, String> extractDosageInfo(String text) {
        Map<String, String> med = new HashMap<>();

        // Medicine name (capture multiple words before dosage keywords)
        Matcher nameMatcher = Pattern.compile(
            "^([A-Za-z0-9\\s\\-]+?)(?=\\s*\\d+\\s*(tablet|tab|capsule|cap|ml|mg|pills|drops|units?))",
            Pattern.CASE_INSENSITIVE).matcher(text);
        if (nameMatcher.find()) {
            med.put("name", nameMatcher.group(1).trim());
        } else {
            med.put("name", "Unknown");
        }

        // Quantity: allow decimals, multiple units
        Matcher quantityMatcher = Pattern.compile(
            "([\\d\\.]+)\\s*(tablet|tab|capsule|cap|ml|mg|pills|drops|units?)",
            Pattern.CASE_INSENSITIVE).matcher(text);
        if (quantityMatcher.find()) {
            med.put("quantity", quantityMatcher.group());
        } else {
            med.put("quantity", "Not found");
        }

        // Timing (including "once daily", "twice daily", "in morning", etc.)
        Matcher timingMatcher = Pattern.compile(
            "(after|before|at|in|once|twice)\\s+(breakfast|lunch|dinner|night|bedtime|morning|daily|weekly)",
            Pattern.CASE_INSENSITIVE).matcher(text);
        if (timingMatcher.find()) {
            med.put("timing", timingMatcher.group());
        } else {
            med.put("timing", "Not found");
        }

        // Duration (include month(s), "until finished", etc.)
        Matcher durationMatcher = Pattern.compile(
            "for\\s+(\\d+)\\s+(day|days|week|weeks|month|months)|until finished",
            Pattern.CASE_INSENSITIVE).matcher(text);
        if (durationMatcher.find()) {
            med.put("duration", durationMatcher.group());
        } else {
            med.put("duration", "Not found");
        }

        return med;
    }

    // Extract from multiple lines / full OCR text
    public static List<Map<String, String>> extractMultipleDosages(String text) {
        List<Map<String, String>> result = new ArrayList<>();
        // Split by newline (or you can enhance for other delimiters)
        String[] lines = text.split("\\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            result.add(extractDosageInfo(line));
        }
        return result;
    }
}
