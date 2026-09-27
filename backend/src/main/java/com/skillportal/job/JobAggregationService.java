package com.skillportal.job;

import com.skillportal.job.source.DiscoveredJob;
import com.skillportal.job.source.JobSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JobAggregationService {

    private static final Logger log = LoggerFactory.getLogger(JobAggregationService.class);

    private final List<JobSource> jobSources;
    private final JobDeduplicationService deduplicationService;
    private final JobRepository jobRepository;

    private Instant lastAggregationTime = null;
    private final Map<String, Integer> lastSourceStats = new HashMap<>();

    public JobAggregationService(
            List<JobSource> jobSources,
            JobDeduplicationService deduplicationService,
            JobRepository jobRepository
    ) {
        this.jobSources = jobSources;
        this.deduplicationService = deduplicationService;
        this.jobRepository = jobRepository;
    }

    /**
     * Startup check: Always discover from all sources on launch to populate fresh listings
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        try {
            log.info("Starting Multi-Source Job Discovery on Application Startup across {} sources...", jobSources.size());
            aggregateAllSources();
        } catch (Exception e) {
            log.error("Job discovery on startup encountered an error: {}", e.getMessage(), e);
        }
    }

    /**
     * Automated sync: Runs every 30 minutes to balance freshness and low CPU/memory overhead
     */
    @Scheduled(cron = "0 */30 * * * *")
    public void scheduledSync() {
        log.info("Triggered 30-minute automated Multi-Source Job Discovery sync...");
        aggregateAllSources();
    }

    /**
     * Coordinates all registered JobSource providers, deduplicates, and saves
     *
     * @return count of newly inserted jobs across all sources
     */
    public synchronized int aggregateAllSources() {
        int totalNewInserted = 0;
        lastSourceStats.clear();

        for (JobSource source : jobSources) {
            String sourceName = source.getSourceName();
            try {
                log.info("Running job discovery for source: [{}]", sourceName);
                List<DiscoveredJob> discovered = source.discoverJobs();
                int sourceNewCount = 0;

                for (DiscoveredJob dj : discovered) {
                    boolean isNew = deduplicationService.processDiscoveredJob(dj);
                    if (isNew) {
                        sourceNewCount++;
                    }
                }

                lastSourceStats.put(sourceName, discovered.size());
                totalNewInserted += sourceNewCount;
                log.info("Source [{}] completed: {} discovered, {} new unique records saved.",
                        sourceName, discovered.size(), sourceNewCount);
            } catch (Exception e) {
                // Fault tolerance: If one source fails, log and continue with the others!
                log.error("Job Source [{}] failed during discovery: {}", sourceName, e.getMessage(), e);
                lastSourceStats.put(sourceName, -1);
            }
        }

        this.lastAggregationTime = Instant.now();
        log.info("Multi-source job aggregation completed. Total new unique jobs stored: {}. Total in DB: {}",
                totalNewInserted, jobRepository.count());

        return totalNewInserted;
    }

    public Instant getLastAggregationTime() {
        return lastAggregationTime;
    }

    public Map<String, Integer> getLastSourceStats() {
        return lastSourceStats;
    }
}
