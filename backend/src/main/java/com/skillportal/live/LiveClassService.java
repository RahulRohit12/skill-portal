package com.skillportal.live;

import com.skillportal.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LiveClassService {

    private static final Logger log = LoggerFactory.getLogger(LiveClassService.class);
    private final LiveClassRepository liveClassRepository;

    public LiveClassService(LiveClassRepository liveClassRepository) {
        this.liveClassRepository = liveClassRepository;
    }

    public LiveClassDto.LiveClassResponse getActiveLiveClassForStudent(Long userId) {
        if (userId == null) {
            return null;
        }

        Long batchId = liveClassRepository.findStudentBatchId(userId);
        if (batchId == null) {
            log.debug("No batch associated with student user ID: {}", userId);
            return null;
        }

        return liveClassRepository.findActiveByBatchId(batchId).orElse(null);
    }

    public List<LiveClassDto.LiveClassResponse> getAllActiveLiveClasses() {
        return liveClassRepository.findAllActive();
    }

    @Transactional
    public LiveClassDto.LiveClassResponse startLiveClass(LiveClassDto.StartLiveClassRequest request, Long userId) {
        if (request.getBatchId() == null) {
            throw new IllegalArgumentException("Batch selection is required to start a live session.");
        }

        String link = request.getMeetingLink().trim();
        if (!link.startsWith("http://") && !link.startsWith("https://")) {
            link = "https://" + link;
            request.setMeetingLink(link);
        }

        // End any ongoing active class for this specific cohort/batch
        liveClassRepository.endActiveSessionsForBatch(request.getBatchId());

        Long id = liveClassRepository.startLiveClass(request, userId);
        if (id == null) {
            throw new RuntimeException("Failed to register live class session in database.");
        }

        log.info("Live class initiated: ID {}, Batch ID {}, Title: {}", id, request.getBatchId(), request.getTitle());
        return liveClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live class not found after creation: " + id));
    }

    @Transactional
    public void endLiveClass(Long id) {
        boolean ended = liveClassRepository.endLiveClass(id);
        if (ended) {
            log.info("Live class ID {} marked as ENDED.", id);
        } else {
            log.warn("Attempted to end live class ID {} but no active record found.", id);
        }
    }
}
