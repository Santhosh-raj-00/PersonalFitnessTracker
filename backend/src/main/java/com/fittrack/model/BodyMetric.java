package com.fittrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "body_metrics")
public class BodyMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate recordedDate = LocalDate.now();

    private Double weightKg;
    private Double bodyFatPercentage;
    private Double chestCm;
    private Double waistCm;
    private Double armsCm;
    private Double thighsCm;

    @Column(length = 500)
    private String notes;

    public BodyMetric() {}

    public BodyMetric(User user, LocalDate recordedDate, Double weightKg, Double bodyFatPercentage, Double chestCm, Double waistCm, Double armsCm, Double thighsCm, String notes) {
        this.user = user;
        this.recordedDate = recordedDate != null ? recordedDate : LocalDate.now();
        this.weightKg = weightKg;
        this.bodyFatPercentage = bodyFatPercentage;
        this.chestCm = chestCm;
        this.waistCm = waistCm;
        this.armsCm = armsCm;
        this.thighsCm = thighsCm;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Double getBodyFatPercentage() { return bodyFatPercentage; }
    public void setBodyFatPercentage(Double bodyFatPercentage) { this.bodyFatPercentage = bodyFatPercentage; }

    public Double getChestCm() { return chestCm; }
    public void setChestCm(Double chestCm) { this.chestCm = chestCm; }

    public Double getWaistCm() { return waistCm; }
    public void setWaistCm(Double waistCm) { this.waistCm = waistCm; }

    public Double getArmsCm() { return armsCm; }
    public void setArmsCm(Double armsCm) { this.armsCm = armsCm; }

    public Double getThighsCm() { return thighsCm; }
    public void setThighsCm(Double thighsCm) { this.thighsCm = thighsCm; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
