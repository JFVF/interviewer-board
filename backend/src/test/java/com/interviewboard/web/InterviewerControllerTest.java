package com.interviewboard.web;

import com.interviewboard.dto.InterviewerDto;
import com.interviewboard.service.InterviewerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InterviewerController.class)
class InterviewerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InterviewerService interviewerService;

    @Test
    void listReturnsInterviewersAsJson() throws Exception {
        InterviewerDto dto = new InterviewerDto(1L, "Ada Lovelace", Set.of("Java"), true, 0);
        when(interviewerService.findAll()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/interviewers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Ada Lovelace"))
                .andExpect(jsonPath("$[0].available").value(true));
    }

    // Regression test: an all-args DTO constructor that Jackson picks up as an implicit
    // creator will reject a request body that omits server-computed fields like
    // "available" (null can't bind to a primitive boolean). See InterviewerDto.
    @Test
    void createAcceptsBodyWithoutServerComputedFields() throws Exception {
        InterviewerDto saved = new InterviewerDto(1L, "Ada Lovelace", Set.of("Java", "React"), true, 0);
        when(interviewerService.create(any())).thenReturn(saved);

        mockMvc.perform(post("/api/interviewers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ada Lovelace\",\"skills\":[\"Java\",\"React\"]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Ada Lovelace"));
    }
}
