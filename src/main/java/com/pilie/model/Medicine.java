package com.pilie.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String ingredients;
    private String manufacturer;

    @Column(name = "`usage`", columnDefinition = "TEXT") // MySQL-safe column
    private String usage;

    @Column(name = "usage_hindi", columnDefinition = "TEXT") // 🔥 New column for Hindi
    private String usageHindi;

    // Normalized ingredient links (in addition to the legacy free-text "ingredients" field above,
    // which is kept so existing reads/writes keep working unchanged).
    @ManyToMany
    @JoinTable(
        name = "medicine_ingredient",
        joinColumns = @JoinColumn(name = "medicine_id"),
        inverseJoinColumns = @JoinColumn(name = "ingredient_id")
    )
    private Set<Ingredient> ingredientSet = new HashSet<>();

    // Constructor(s)
    public Medicine() {}

    public Medicine(Long id, String name, String ingredients, String manufacturer, String usage, String usageHindi) {
        this.id = id;
        this.name = name;
        this.ingredients = ingredients;
        this.manufacturer = manufacturer;
        this.usage = usage;
        this.usageHindi = usageHindi;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getUsage() { return usage; }
    public void setUsage(String usage) { this.usage = usage; }

    public String getUsageHindi() { return usageHindi; }
    public void setUsageHindi(String usageHindi) { this.usageHindi = usageHindi; }

    public Set<Ingredient> getIngredientSet() { return ingredientSet; }
    public void setIngredientSet(Set<Ingredient> ingredientSet) { this.ingredientSet = ingredientSet; }
}