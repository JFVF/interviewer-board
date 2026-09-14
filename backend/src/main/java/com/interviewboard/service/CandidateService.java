package com.interviewboard.service;

import com.interviewboard.dto.CandidateDto;
import com.interviewboard.model.Candidate;
import com.interviewboard.model.CandidateStatus;
import com.interviewboard.model.Interviewer;
import com.interviewboard.repository.CandidateRepository;
import com.interviewboard.repository.InterviewerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final InterviewerRepository interviewerRepository;

    public CandidateService(CandidateRepository candidateRepository, InterviewerRepository interviewerRepository) {
        this.candidateRepository = candidateRepository;
        this.interviewerRepository = interviewerRepository;
    }

    public List<CandidateDto> findAll() {
        return candidateRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public CandidateDto findOne(Long id) {
        return toDto(getOrThrow(id));
    }

    public CandidateDto create(CandidateDto dto) {
        Candidate candidate = new Candidate();
        applyDto(candidate, dto);
        candidate = candidateRepository.save(candidate);
        return toDto(candidate);
    }

    public CandidateDto update(Long id, CandidateDto dto) {
        Candidate candidate = getOrThrow(id);
        applyDto(candidate, dto);
        candidate = candidateRepository.save(candidate);
        return toDto(candidate);
    }

    public CandidateDto updateStatus(Long id, CandidateStatus status) {
        Candidate candidate = getOrThrow(id);
        candidate.setStatus(status);
        candidate = candidateRepository.save(candidate);
        return toDto(candidate);
    }

    public void delete(Long id) {
        if (!candidateRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found: " + id);
        }
        candidateRepository.deleteById(id);
    }

    private Candidate getOrThrow(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found: " + id));
    }

    private void applyDto(Candidate candidate, CandidateDto dto) {
        candidate.setName(dto.getName());
        candidate.setJobTitle(dto.getJobTitle());
        candidate.setInterviewDate(dto.getInterviewDate());
        if (dto.getStatus() != null) {
            candidate.setStatus(dto.getStatus());
        }
        candidate.setSkills(dto.getSkills() != null ? new LinkedHashSet<>(dto.getSkills()) : new LinkedHashSet<>());

        Set<Interviewer> interviewers = new LinkedHashSet<>();
        if (dto.getInterviewerIds() != null) {
            for (Long interviewerId : dto.getInterviewerIds()) {
                Interviewer interviewer = interviewerRepository.findById(interviewerId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.BAD_REQUEST, "Interviewer not found: " + interviewerId));
                interviewers.add(interviewer);
            }
        }
        candidate.setInterviewers(interviewers);
    }

    private CandidateDto toDto(Candidate candidate) {
        CandidateDto dto = new CandidateDto();
        dto.setId(candidate.getId());
        dto.setName(candidate.getName());
        dto.setJobTitle(candidate.getJobTitle());
        dto.setInterviewDate(candidate.getInterviewDate());
        dto.setStatus(candidate.getStatus());
        dto.setSkills(new LinkedHashSet<>(candidate.getSkills()));
        dto.setInterviewerIds(candidate.getInterviewers().stream()
                .map(Interviewer::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new)));
        return dto;
    }
}
