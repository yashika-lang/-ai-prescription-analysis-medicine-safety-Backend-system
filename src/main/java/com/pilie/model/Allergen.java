package com.pilie.model;

import jakarta.persistence.*;

@Entity
@Table(name = "allergen")
public class Allergen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String riskLevel;

    public Allergen() {}

    public Allergen(String name, String riskLevel) {
        this.name = name;
        this.riskLevel = riskLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
}
