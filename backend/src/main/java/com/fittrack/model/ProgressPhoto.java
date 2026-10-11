package com.fittrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "progress_photos")
public class ProgressPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate recordedDate = LocalDate.now();

    @Column(nullable = false, length = 1000)
    private String photoUrl;

    private String tag; // FRONT, BACK, SIDE

    public ProgressPhoto() {}

    public ProgressPhoto(User user, LocalDate recordedDate, String photoUrl, String tag) {
        this.user = user;
        this.recordedDate = recordedDate != null ? recordedDate : LocalDate.now();
        this.photoUrl = photoUrl;
        this.tag = tag;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
}
