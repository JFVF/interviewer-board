package com.interviewboard;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.datasource.url=jdbc:sqlite::memory:")
class InterviewBoardApplicationTests {

	@Test
	void contextLoads() {
	}

}
