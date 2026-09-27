package com.skillportal.common;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "Public liveness and database keep-alive endpoint")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    @Operation(summary = "System liveness probe and connection warmer")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "skill-portal-backend");
        status.put("timestamp", Instant.now().toString());
        status.put("uptimeSeconds", ManagementFactory.getRuntimeMXBean().getUptime() / 1000);

        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            status.put("database", "CONNECTED");
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            status.put("database", "DEGRADED: " + e.getMessage());
            status.put("status", "DEGRADED");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(status);
        }
    }
}
