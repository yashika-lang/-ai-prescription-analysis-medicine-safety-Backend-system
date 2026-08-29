package com.pilie.controller;

import com.pilie.service.MedicineRagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    @Autowired
    private MedicineRagService medicineRagService;

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of("configured", medicineRagService.isConfigured());
    }

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestParam String email, @RequestParam String question) {
        try {
            MedicineRagService.RagAnswer answer = medicineRagService.ask(email, question);
            return ResponseEntity.ok(Map.of(
                    "answer", answer.answer,
                    "sources", answer.sources
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (MedicineRagService.RagProviderException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", e.getMessage()));
        }
    }
}
