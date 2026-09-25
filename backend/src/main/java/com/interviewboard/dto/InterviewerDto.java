package com.interviewboard.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.interviewboard.model.InterviewerRole;

import java.util.Set;

public class InterviewerDto {

    private Long id;
    private String name;
    private InterviewerRole role;
    private Set<String> skills;
    private boolean available;
    private int activeCandidateCount;

    public InterviewerDto() {
    }

    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    public InterviewerDto(Long id, String name, InterviewerRole role, Set<String> skills, boolean available, int activeCandidateCount) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.skills = skills;
        this.available = available;
        this.activeCandidateCount = activeCandidateCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public InterviewerRole getRole() {
        return role;
    }

    public void setRole(InterviewerRole role) {
        this.role = role;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public void setSkills(Set<String> skills) {
        this.skills = skills;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getActiveCandidateCount() {
        return activeCandidateCount;
    }

    public void setActiveCandidateCount(int activeCandidateCount) {
        this.activeCandidateCount = activeCandidateCount;
    }
}
