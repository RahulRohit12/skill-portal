package com.skillportal.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseFlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseFlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try {
                log.info("Running Flyway repair to clean any failed schema migration states...");
                flyway.repair();
            } catch (Exception e) {
                log.warn("Flyway repair notice: {}", e.getMessage());
            }
            log.info("Executing Flyway migrations...");
            flyway.migrate();
        };
    }
}
