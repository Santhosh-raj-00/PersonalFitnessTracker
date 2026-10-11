package com.fittrack.model;

import com.fittrack.model.enums.SessionStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    private Long routineDayId;
    private String routineName;
    private String sessionName;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Column(length = 2000)
    private String notes;

    private Double totalVolumeKg = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "workoutSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("setOrder ASC")
    private List<WorkoutSet> sets = new ArrayList<>();

    public WorkoutSession() {}

    public WorkoutSession(User user, String sessionName, String routineName, Long routineDayId) {
        this.user = user;
        this.sessionName = sessionName;
        this.routineName = routineName;
        this.routineDayId = routineDayId;
        this.startTime = LocalDateTime.now();
        this.status = SessionStatus.IN_PROGRESS;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Long getRoutineDayId() { return routineDayId; }
    public void setRoutineDayId(Long routineDayId) { this.routineDayId = routineDayId; }

    public String getRoutineName() { return routineName; }
    public void setRoutineName(String routineName) { this.routineName = routineName; }

    public String getSessionName() { return sessionName; }
    public void setSessionName(String sessionName) { this.sessionName = sessionName; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Double getTotalVolumeKg() { return totalVolumeKg; }
    public void setTotalVolumeKg(Double totalVolumeKg) { this.totalVolumeKg = totalVolumeKg; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public List<WorkoutSet> getSets() { return sets; }
    public void setSets(List<WorkoutSet> sets) { this.sets = sets; }
}
