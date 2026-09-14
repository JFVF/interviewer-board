package com.interviewboard.web;

import com.interviewboard.dto.InterviewerDto;
import com.interviewboard.service.InterviewerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/interviewers")
public class InterviewerController {

    private final InterviewerService interviewerService;

    public InterviewerController(InterviewerService interviewerService) {
        this.interviewerService = interviewerService;
    }

    @GetMapping
    public List<InterviewerDto> findAll() {
        return interviewerService.findAll();
    }

    @GetMapping("/{id}")
    public InterviewerDto findOne(@PathVariable Long id) {
        return interviewerService.findOne(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewerDto create(@Valid @RequestBody InterviewerDto dto) {
        return interviewerService.create(dto);
    }

    @PutMapping("/{id}")
    public InterviewerDto update(@PathVariable Long id, @Valid @RequestBody InterviewerDto dto) {
        return interviewerService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        interviewerService.delete(id);
    }

    @PostMapping("/import")
    public List<InterviewerDto> importCsv(@RequestParam("file") MultipartFile file) {
        return interviewerService.importCsv(file);
    }
}
