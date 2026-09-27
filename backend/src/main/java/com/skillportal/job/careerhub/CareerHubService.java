package com.skillportal.job.careerhub;

import com.skillportal.job.JobDeduplicationService;
import com.skillportal.job.JobRepository;
import com.skillportal.job.source.CompanyCareerJobSource;
import com.skillportal.job.source.DiscoveredJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class CareerHubService {

    private static final Logger log = LoggerFactory.getLogger(CareerHubService.class);

    private final CareerSourceRepository careerSourceRepository;
    private final CompanyCareerJobSource companyCareerJobSource;
    private final JobDeduplicationService deduplicationService;
    private final JobRepository jobRepository;

    public CareerHubService(
            CareerSourceRepository careerSourceRepository,
            CompanyCareerJobSource companyCareerJobSource,
            JobDeduplicationService deduplicationService,
            JobRepository jobRepository
    ) {
        this.careerSourceRepository = careerSourceRepository;
        this.companyCareerJobSource = companyCareerJobSource;
        this.deduplicationService = deduplicationService;
        this.jobRepository = jobRepository;
    }

    public List<CareerSource> getAllCareerSources() {
        return careerSourceRepository.findAllByOrderByMatchingJobsCountDesc();
    }

    @Transactional
    public CareerSource addCareerSource(String companyName, String careerUrl) {
        if (companyName == null || companyName.isBlank() || careerUrl == null || careerUrl.isBlank()) {
            throw new IllegalArgumentException("Company name and career URL are required");
        }
        String cleanCompany = companyName.trim();
        String cleanUrl = careerUrl.trim();

        return careerSourceRepository.findByCompanyNameIgnoreCase(cleanCompany)
                .map(existing -> {
                    existing.setCareerUrl(cleanUrl);
                    existing.setStatus("ACTIVE");
                    return careerSourceRepository.save(existing);
                })
                .orElseGet(() -> careerSourceRepository.save(new CareerSource(cleanCompany, cleanUrl)));
    }

    /**
     * Initial startup check: populate Career Sources if table is empty
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        try {
            if (careerSourceRepository.count() == 0) {
                log.info("Career Sources empty. Seeding initial tech enterprise career sources...");
                seedDefaultSources();
            }
            triggerBackgroundExtraction();
        } catch (Exception e) {
            log.warn("Career Hub initial setup note: {}", e.getMessage());
        }
    }

    /**
     * Background extractor scheduled every 45 minutes
     */
    @Scheduled(cron = "0 */45 * * * *")
    public void scheduledExtraction() {
        log.info("Triggering scheduled background Career Hub extraction...");
        triggerBackgroundExtraction();
    }

    /**
     * Completely decoupled asynchronous extraction: Student HTTP requests never wait on external site checks!
     */
    @Async
    public CompletableFuture<Integer> triggerBackgroundExtraction() {
        log.info("Starting background Career Hub job discovery & extraction...");
        int totalNewJobs = 0;

        List<CareerSource> sources = careerSourceRepository.findAll();
        List<DiscoveredJob> discovered = companyCareerJobSource.discoverJobs();

        for (CareerSource source : sources) {
            try {
                source.setStatus("CHECKING");
                careerSourceRepository.save(source);

                int sourceMatches = 0;
                int sourceNew = 0;

                for (DiscoveredJob dj : discovered) {
                    if (dj.getCompany() != null && dj.getCompany().toLowerCase().contains(source.getCompanyName().toLowerCase())) {
                        sourceMatches++;
                        boolean isNew = deduplicationService.processDiscoveredJob(dj);
                        if (isNew) {
                            sourceNew++;
                        }
                    }
                }

                source.setMatchingJobsCount(sourceMatches > 0 ? sourceMatches : source.getMatchingJobsCount());
                source.setNewJobsFound(sourceNew);
                source.setLastCheckedAt(Instant.now());
                source.setStatus("ACTIVE");
                careerSourceRepository.save(source);

                totalNewJobs += sourceNew;
            } catch (Exception e) {
                log.error("Error checking career source [{}]: {}", source.getCompanyName(), e.getMessage());
                source.setStatus("ACTIVE");
                source.setLastCheckedAt(Instant.now());
                careerSourceRepository.save(source);
            }
        }

        log.info("Background Career Hub extraction completed. {} new unique jobs recorded.", totalNewJobs);
        return CompletableFuture.completedFuture(totalNewJobs);
    }

    private void seedDefaultSources() {
        List<CareerSource> defaults = List.of(
                new CareerSource("Tata Consultancy Services", "https://www.tcs.com/careers/india/entry-level"),
                new CareerSource("Infosys", "https://career.infosys.com/joblist"),
                new CareerSource("Wipro", "https://careers.wipro.com/careers-home/jobs"),
                new CareerSource("Accenture", "https://www.accenture.com/in-en/careers/jobsearch?jk=Associate%20Software%20Engineer"),
                new CareerSource("Cognizant", "https://careers.cognizant.com/global/en/c/campus-graduates-jobs"),
                new CareerSource("Capgemini", "https://www.capgemini.com/in-en/careers/job-search/"),
                new CareerSource("Zoho Corporation", "https://www.zoho.com/careers/jobdetails/?job_id=4000000000001"),
                new CareerSource("Bosch Global Software Technologies", "https://www.bosch.in/careers/"),
                new CareerSource("Tech Mahindra", "https://careers.techmahindra.com/"),
                new CareerSource("IBM India", "https://www.ibm.com/in-en/careers"),
                new CareerSource("LTIMindtree", "https://careers.ltimindtree.com/"),
                new CareerSource("HCLTech", "https://www.hcltech.com/careers/first-careers"),
                new CareerSource("PhonePe", "https://www.phonepe.com/careers/job-openings/"),
                new CareerSource("Razorpay", "https://razorpay.com/jobs/"),
                new CareerSource("Postman", "https://www.postman.com/company/careers/")
        );
        careerSourceRepository.saveAll(defaults);
    }
}
