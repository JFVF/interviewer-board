package com.interviewboard.service;

import com.interviewboard.dto.InterviewerDto;
import com.interviewboard.model.Candidate;
import com.interviewboard.model.CandidateStatus;
import com.interviewboard.model.Interviewer;
import com.interviewboard.model.InterviewerRole;
import com.interviewboard.repository.CandidateRepository;
import com.interviewboard.repository.InterviewerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterviewerServiceTest {

    @Mock
    private InterviewerRepository interviewerRepository;

    @Mock
    private CandidateRepository candidateRepository;

    private InterviewerService service;

    @BeforeEach
    void setUp() {
        service = new InterviewerService(interviewerRepository, candidateRepository);
    }

    private Interviewer interviewer(long id, String name, String... skills) {
        Interviewer interviewer = new Interviewer();
        interviewer.setId(id);
        interviewer.setName(name);
        interviewer.setSkills(Set.of(skills));
        return interviewer;
    }

    private Candidate candidateAssignedTo(CandidateStatus status, Interviewer... interviewers) {
        Candidate candidate = new Candidate();
        candidate.setStatus(status);
        candidate.setInterviewers(Set.of(interviewers));
        return candidate;
    }

    @Test
    void interviewerWithNoActiveCandidatesIsAvailable() {
        Interviewer ada = interviewer(1L, "Ada Lovelace", "Java");
        when(interviewerRepository.findAll()).thenReturn(List.of(ada));
        when(candidateRepository.findAll()).thenReturn(List.of());

        List<InterviewerDto> result = service.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isAvailable()).isTrue();
        assertThat(result.get(0).getActiveCandidateCount()).isZero();
    }

    @Test
    void interviewerIsBusyWhenAssignedToSchedulingOrScheduledCandidate() {
        Interviewer ada = interviewer(1L, "Ada Lovelace", "Java");
        Candidate scheduling = candidateAssignedTo(CandidateStatus.SCHEDULING, ada);
        Candidate scheduled = candidateAssignedTo(CandidateStatus.SCHEDULED, ada);

        when(interviewerRepository.findAll()).thenReturn(List.of(ada));
        when(candidateRepository.findAll()).thenReturn(List.of(scheduling, scheduled));

        InterviewerDto dto = service.findAll().get(0);

        assertThat(dto.isAvailable()).isFalse();
        assertThat(dto.getActiveCandidateCount()).isEqualTo(2);
    }

    @Test
    void doneAndRejectedCandidatesDoNotCountAsActive() {
        Interviewer ada = interviewer(1L, "Ada Lovelace", "Java");
        Candidate done = candidateAssignedTo(CandidateStatus.DONE, ada);
        Candidate rejected = candidateAssignedTo(CandidateStatus.REJECTED, ada);

        when(interviewerRepository.findAll()).thenReturn(List.of(ada));
        when(candidateRepository.findAll()).thenReturn(List.of(done, rejected));

        InterviewerDto dto = service.findAll().get(0);

        assertThat(dto.isAvailable()).isTrue();
        assertThat(dto.getActiveCandidateCount()).isZero();
    }

    @Test
    void updateStoresAndReturnsRole() {
        Interviewer ada = interviewer(1L, "Ada Lovelace", "Java");
        when(interviewerRepository.findById(1L)).thenReturn(Optional.of(ada));
        when(interviewerRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(candidateRepository.findAll()).thenReturn(List.of());

        InterviewerDto dto = new InterviewerDto();
        dto.setName("Ada Lovelace");
        dto.setRole(InterviewerRole.DEVOPS);
        dto.setSkills(Set.of("Java"));

        InterviewerDto result = service.update(1L, dto);

        assertThat(ada.getRole()).isEqualTo(InterviewerRole.DEVOPS);
        assertThat(result.getRole()).isEqualTo(InterviewerRole.DEVOPS);
    }

    @Test
    void deleteThrowsNotFoundWhenInterviewerDoesNotExist() {
        when(interviewerRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void importCsvParsesNameAndSemicolonSeparatedStack() {
        String csv = "name,stack\nGrace Hopper,Java;Selenium;Cucumber\nAlan Turing,\n";
        MockMultipartFile file = new MockMultipartFile("file", "interviewers.csv", "text/csv", csv.getBytes());

        when(interviewerRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(candidateRepository.findAll()).thenReturn(List.of());

        ArgumentCaptor<List<Interviewer>> captor = ArgumentCaptor.forClass(List.class);

        service.importCsv(file);

        org.mockito.Mockito.verify(interviewerRepository).saveAll(captor.capture());
        List<Interviewer> imported = captor.getValue();

        assertThat(imported).hasSize(2);
        assertThat(imported.get(0).getName()).isEqualTo("Grace Hopper");
        assertThat(imported.get(0).getSkills()).containsExactlyInAnyOrder("Java", "Selenium", "Cucumber");
        assertThat(imported.get(1).getName()).isEqualTo("Alan Turing");
        assertThat(imported.get(1).getSkills()).isEmpty();
    }

    @Test
    void importCsvParsesRoleColumnCaseInsensitively() {
        String csv = "name,role,stack\nGrace Hopper,devops,AWS\nAlan Turing,AT,Java\nAda Lovelace,,React\n";
        MockMultipartFile file = new MockMultipartFile("file", "interviewers.csv", "text/csv", csv.getBytes());

        when(interviewerRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(candidateRepository.findAll()).thenReturn(List.of());

        ArgumentCaptor<List<Interviewer>> captor = ArgumentCaptor.forClass(List.class);

        service.importCsv(file);

        org.mockito.Mockito.verify(interviewerRepository).saveAll(captor.capture());
        List<Interviewer> imported = captor.getValue();

        assertThat(imported).extracting(Interviewer::getRole)
                .containsExactly(InterviewerRole.DEVOPS, InterviewerRole.AT, null);
        assertThat(imported.get(0).getSkills()).containsExactly("AWS");
    }

    @Test
    void importCsvWithUnknownRoleIsRejected() {
        String csv = "name,role\nGrace Hopper,dev\nAlan Turing,manager\n";
        MockMultipartFile file = new MockMultipartFile("file", "interviewers.csv", "text/csv", csv.getBytes());

        assertThatThrownBy(() -> service.importCsv(file))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("manager")
                .hasMessageContaining("line 3");
    }

    @Test
    void importCsvWithoutNameColumnIsRejected() {
        String csv = "stack\nJava\n";
        MockMultipartFile file = new MockMultipartFile("file", "interviewers.csv", "text/csv", csv.getBytes());

        assertThatThrownBy(() -> service.importCsv(file))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("name");
    }
}
