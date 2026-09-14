package com.interviewboard.service;

import com.interviewboard.dto.InterviewerDto;
import com.interviewboard.model.Candidate;
import com.interviewboard.model.CandidateStatus;
import com.interviewboard.model.Interviewer;
import com.interviewboard.repository.CandidateRepository;
import com.interviewboard.repository.InterviewerRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class InterviewerService {

    private static final Set<CandidateStatus> ACTIVE_STATUSES =
            Set.of(CandidateStatus.SCHEDULING, CandidateStatus.SCHEDULED);

    private final InterviewerRepository interviewerRepository;
    private final CandidateRepository candidateRepository;

    public InterviewerService(InterviewerRepository interviewerRepository,
                               CandidateRepository candidateRepository) {
        this.interviewerRepository = interviewerRepository;
        this.candidateRepository = candidateRepository;
    }

    public List<InterviewerDto> findAll() {
        List<Candidate> candidates = candidateRepository.findAll();
        return interviewerRepository.findAll().stream()
                .map(interviewer -> toDto(interviewer, candidates))
                .collect(Collectors.toList());
    }

    public InterviewerDto findOne(Long id) {
        Interviewer interviewer = getOrThrow(id);
        return toDto(interviewer, candidateRepository.findAll());
    }

    public InterviewerDto create(InterviewerDto dto) {
        Interviewer interviewer = new Interviewer();
        applyDto(interviewer, dto);
        interviewer = interviewerRepository.save(interviewer);
        return toDto(interviewer, candidateRepository.findAll());
    }

    public InterviewerDto update(Long id, InterviewerDto dto) {
        Interviewer interviewer = getOrThrow(id);
        applyDto(interviewer, dto);
        interviewer = interviewerRepository.save(interviewer);
        return toDto(interviewer, candidateRepository.findAll());
    }

    public void delete(Long id) {
        if (!interviewerRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Interviewer not found: " + id);
        }
        interviewerRepository.deleteById(id);
    }

    public List<InterviewerDto> importCsv(org.springframework.web.multipart.MultipartFile file) {
        List<Interviewer> imported = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null) {
                return List.of();
            }
            String[] columns = header.split(",");
            int nameIdx = indexOf(columns, "name");
            int stackIdx = indexOf(columns, "stack");
            if (nameIdx < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV must have a 'name' column");
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                String[] fields = line.split(",", -1);
                String name = fields[nameIdx].trim();
                if (name.isEmpty()) {
                    continue;
                }
                Interviewer interviewer = new Interviewer();
                interviewer.setName(name);
                if (stackIdx >= 0 && stackIdx < fields.length) {
                    Set<String> skills = new LinkedHashSet<>();
                    for (String skill : fields[stackIdx].split(";")) {
                        String trimmed = skill.trim();
                        if (!trimmed.isEmpty()) {
                            skills.add(trimmed);
                        }
                    }
                    interviewer.setSkills(skills);
                }
                imported.add(interviewer);
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read CSV file", e);
        }

        List<Interviewer> saved = interviewerRepository.saveAll(imported);
        List<Candidate> candidates = candidateRepository.findAll();
        return saved.stream().map(i -> toDto(i, candidates)).collect(Collectors.toList());
    }

    private int indexOf(String[] columns, String name) {
        for (int i = 0; i < columns.length; i++) {
            if (columns[i].trim().equalsIgnoreCase(name)) {
                return i;
            }
        }
        return -1;
    }

    private Interviewer getOrThrow(Long id) {
        return interviewerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interviewer not found: " + id));
    }

    private void applyDto(Interviewer interviewer, InterviewerDto dto) {
        interviewer.setName(dto.getName());
        interviewer.setSkills(dto.getSkills() != null ? new LinkedHashSet<>(dto.getSkills()) : new LinkedHashSet<>());
    }

    private InterviewerDto toDto(Interviewer interviewer, List<Candidate> candidates) {
        long activeCandidateCount = candidates.stream()
                .filter(c -> ACTIVE_STATUSES.contains(c.getStatus()))
                .filter(c -> c.getInterviewers().stream()
                        .anyMatch(i -> i.getId().equals(interviewer.getId())))
                .count();
        return new InterviewerDto(interviewer.getId(), interviewer.getName(),
                new LinkedHashSet<>(interviewer.getSkills()), activeCandidateCount == 0, (int) activeCandidateCount);
    }
}
