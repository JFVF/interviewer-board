package com.interviewboard.dto;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Set;

public class InterviewerDto {

    private Long id;
    private String name;
    private Set<String> skills;
    private boolean available;
    private int activeCandidateCount;

    public InterviewerDto() {
    }

    @JsonCreator(mode = JsonCreator.Mode.DISABLED)
    public InterviewerDto(Long id, String name, Set<String> skills, boolean available, int activeCandidateCount) {
        this.id = id;
        this.name = name;
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
