package com.pilie.controller;

import com.pilie.model.User;
import com.pilie.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 🟢 Register new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("age", savedUser.getAge());
        response.put("gender", savedUser.getGender());
        response.put("illnesses", savedUser.getIllnesses());

        return ResponseEntity.ok(response);
    }

    // 🟢 Get all users (for testing)
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Get allergy profile for a user
    @GetMapping("/allergies")
    public List<String> getAllergies(@RequestParam String email) {
        User user = userRepository.findByEmail(email);
        return user != null ? user.getAllergies() : List.of();
    }

    // ✅ Add allergy to user's profile
@PostMapping("/add-allergies")
public String addAllergies(@RequestParam String email, @RequestBody List<String> allergens) {
    User user = userRepository.findByEmail(email);
    if (user == null) return "❌ User not found";

    // ✅ Safe check: Initialize allergy list if null
    if (user.getAllergies() == null) {
        user.setAllergies(new ArrayList<>());
    }

    // ✅ Merge logic
    Set<String> allergySet = new HashSet<>(user.getAllergies());
    boolean modified = false;

    for (String allergen : allergens) {
        if (allergySet.add(allergen)) {
            modified = true;
        }
    }

    if (modified) {
        user.setAllergies(new ArrayList<>(allergySet));
        userRepository.save(user);
        return "✅ Allergies added: " + allergens;
    } else {
        return "⚠️ No new allergies added.";
    }
}

    // ✅ Add a single allergy to user's profile
    @PostMapping("/add-allergy")
    public String addAllergy(@RequestParam String email, @RequestParam String allergy) {
        User user = userRepository.findByEmail(email);
        if (user == null) return "❌ User not found";

        if (user.getAllergies() == null) {
            user.setAllergies(new ArrayList<>());
        }

        List<String> allergies = user.getAllergies();
        if (!allergies.contains(allergy)) {
            allergies.add(allergy);
            user.setAllergies(allergies);
            userRepository.save(user);
            return "✅ Allergy added to profile: " + allergy;
        }

        return "⚠️ Allergy already exists in profile.";
    }

    // 🔐 Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ User not found");
        }

        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Invalid password");
        }

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("name", user.getName());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }
}