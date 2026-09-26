package com.skillportal.assignment;

import com.skillportal.exception.ForbiddenException;
import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public AssignmentService(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    public List<AssignmentDto.AssignmentSummary> getAllAssignments(Long userId) {
        return assignmentRepository.findAllAssignments(userId);
    }

    public AssignmentDto.AssignmentDetail getAssignmentById(Long id, Long userId) {
        return assignmentRepository.findAssignmentById(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
    }

    public AssignmentDto.SectionSummary getSectionById(Long sectionId, Long userId) {
        AssignmentDto.SectionSummary section = assignmentRepository.findSectionById(sectionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment section not found with id: " + sectionId));

        if (section.isLocked()) {
            throw new ForbiddenException("This section is locked. Please complete the prerequisite sections first.");
        }
        return section;
    }

    public AssignmentDto.SectionSummary createSection(Long assignmentId, AssignmentDto.CreateSectionRequest req) {
        return assignmentRepository.createSection(assignmentId, req.getTopicName(), req.getTitle(), req.getDescription());
    }

    public List<AssignmentDto.QuestionSummary> createQuestionsForSection(Long assignmentId, Long sectionId, List<AssignmentDto.CreateQuestionItem> questions) {
        return assignmentRepository.createQuestionsForSection(assignmentId, sectionId, questions);
    }
}
