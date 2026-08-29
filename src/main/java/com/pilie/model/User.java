package com.pilie.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Name is required")
    private String name;

    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private Integer age;
    private String gender;
    private String illnesses;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_allergies", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "allergy")
    private List<String> allergies;

    // Normalized allergy profile (kept alongside the legacy free-text list above,
    // which existing endpoints continue to read/write unchanged).
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_allergen",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )
    private Set<Allergen> allergenProfile = new HashSet<>();

    // ✅ Constructors
    public User() {
        this.allergies = new ArrayList<>();
    }

    public User(String name, String email, List<String> allergies) {
        this.name = name;
        this.email = email;
        this.allergies = allergies != null ? allergies : new ArrayList<>();
    }

    // ✅ Getters and Setters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    // @JsonIgnore on the getter alone hides this property from BOTH serialization and
    // deserialization once Jackson merges the getter/setter into one property definition -
    // this forces the setter to stay writable so incoming register/login request bodies
    // still populate the password, while the getter keeps it out of every JSON response.
    @JsonProperty("password")
    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getIllnesses() {
        return illnesses;
    }

    public void setIllnesses(String illnesses) {
        this.illnesses = illnesses;
    }

    public List<String> getAllergies() {
        if (this.allergies == null) {
            this.allergies = new ArrayList<>();
        }
        return allergies;
    }

    public void setAllergies(List<String> allergies) {
        this.allergies = allergies != null ? allergies : new ArrayList<>();
    }

    public Set<Allergen> getAllergenProfile() {
        if (this.allergenProfile == null) {
            this.allergenProfile = new HashSet<>();
        }
        return allergenProfile;
    }

    public void setAllergenProfile(Set<Allergen> allergenProfile) {
        this.allergenProfile = allergenProfile != null ? allergenProfile : new HashSet<>();
    }
}