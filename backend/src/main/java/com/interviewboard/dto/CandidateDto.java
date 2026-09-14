package com.interviewboard.dto;

import com.interviewboard.model.CandidateStatus;

import java.time.LocalDate;
import java.util.Set;

public class CandidateDto {

    private Long id;
    private String name;
    private String jobTitle;
    private LocalDate interviewDate;
    private CandidateStatus status;
    private Set<String> skills;
    private Set<Long> interviewerIds;

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

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public LocalDate getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(LocalDate interviewDate) {
        this.interviewDate = interviewDate;
    }

    public CandidateStatus getStatus() {
        return status;
    }

    public void setStatus(CandidateStatus status) {
        this.status = status;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public void setSkills(Set<String> skills) {
        this.skills = skills;
    }

    public Set<Long> getInterviewerIds() {
        return interviewerIds;
    }

    public void setInterviewerIds(Set<Long> interviewerIds) {
        this.interviewerIds = interviewerIds;
    }
}
