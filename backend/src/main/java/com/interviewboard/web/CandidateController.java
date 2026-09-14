package com.interviewboard.web;

import com.interviewboard.dto.CandidateDto;
import com.interviewboard.model.CandidateStatus;
import com.interviewboard.service.CandidateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping
    public List<CandidateDto> findAll() {
        return candidateService.findAll();
    }

    @GetMapping("/{id}")
    public CandidateDto findOne(@PathVariable Long id) {
        return candidateService.findOne(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateDto create(@Valid @RequestBody CandidateDto dto) {
        return candidateService.create(dto);
    }

    @PutMapping("/{id}")
    public CandidateDto update(@PathVariable Long id, @Valid @RequestBody CandidateDto dto) {
        return candidateService.update(id, dto);
    }

    @PatchMapping("/{id}/status")
    public CandidateDto updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return candidateService.updateStatus(id, CandidateStatus.valueOf(body.get("status")));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        candidateService.delete(id);
    }
}
