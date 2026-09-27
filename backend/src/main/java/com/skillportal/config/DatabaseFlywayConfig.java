package com.skillportal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class DatabaseFlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseFlywayConfig.class);

    private final Environment env;

    public DatabaseFlywayConfig(Environment env) {
        this.env = env;
    }

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            String dbUrl = env.getProperty("spring.datasource.url", "");
            log.info("Connecting to target database: {}", maskUrl(dbUrl));

            if (dbUrl.contains("localhost:3306")) {
                log.warn("CRITICAL: Database URL is defaulting to 'localhost:3306'. In cloud environments (Render), please ensure SPRING_DATASOURCE_URL is set in your environment variables.");
            }

            try {
                log.info("Running Flyway repair to clean any failed schema migration states...");
                flyway.repair();
            } catch (Exception e) {
                log.warn("Flyway repair notice: {}", e.getMessage());
            }

            log.info("Executing Flyway migrations...");
            try {
                flyway.migrate();
                log.info("Flyway database migrations applied successfully.");
            } catch (Exception e) {
                log.error("Flyway migration failed to connect or execute: {}", e.getMessage());
                throw e;
            }
        };
    }

    private String maskUrl(String url) {
        if (url == null || url.isBlank()) return "(empty)";
        // Mask passwords in query string or authority
        return url.replaceAll("password=[^&;]+", "password=****")
                  .replaceAll("(?<=://)[^:@]+:[^@]+@", "****:****@");
    }
}
