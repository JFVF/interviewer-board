package com.interviewboard.service;

import com.interviewboard.dto.CandidateDto;
import com.interviewboard.model.Candidate;
import com.interviewboard.model.CandidateStatus;
import com.interviewboard.model.Interviewer;
import com.interviewboard.repository.CandidateRepository;
import com.interviewboard.repository.InterviewerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CandidateServiceTest {

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private InterviewerRepository interviewerRepository;

    private CandidateService service;

    @BeforeEach
    void setUp() {
        service = new CandidateService(candidateRepository, interviewerRepository);
    }

    private Interviewer interviewer(long id, String name) {
        Interviewer interviewer = new Interviewer();
        interviewer.setId(id);
        interviewer.setName(name);
        return interviewer;
    }

    @Test
    void createAssignsRequestedInterviewersAndDefaultsStatus() {
        Interviewer ada = interviewer(1L, "Ada Lovelace");
        when(interviewerRepository.findById(1L)).thenReturn(Optional.of(ada));
        when(candidateRepository.save(any())).thenAnswer(invocation -> {
            Candidate c = invocation.getArgument(0);
            c.setId(10L);
            return c;
        });

        CandidateDto request = new CandidateDto();
        request.setName("Grace Hopper");
        request.setJobTitle("Backend Engineer");
        request.setInterviewDate(LocalDate.of(2026, 9, 20));
        request.setSkills(Set.of("Java"));
        request.setInterviewerIds(Set.of(1L));

        CandidateDto result = service.create(request);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getStatus()).isEqualTo(CandidateStatus.SCHEDULING);
        assertThat(result.getInterviewerIds()).containsExactly(1L);
    }

    @Test
    void createRejectsUnknownInterviewerId() {
        when(interviewerRepository.findById(99L)).thenReturn(Optional.empty());

        CandidateDto request = new CandidateDto();
        request.setName("Grace Hopper");
        request.setInterviewerIds(Set.of(99L));

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Interviewer not found");
    }

    @Test
    void updateStatusPersistsNewStatus() {
        Candidate existing = new Candidate();
        existing.setId(5L);
        existing.setName("Grace Hopper");
        existing.setStatus(CandidateStatus.SCHEDULING);

        when(candidateRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(candidateRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        CandidateDto result = service.updateStatus(5L, CandidateStatus.DONE);

        assertThat(result.getStatus()).isEqualTo(CandidateStatus.DONE);
    }

    @Test
    void deleteThrowsNotFoundWhenCandidateDoesNotExist() {
        when(candidateRepository.existsById(42L)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(42L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");
    }
}
