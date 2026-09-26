package com.skillportal.dashboard;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    private static class CacheEntry<T> {
        final T data;
        final long expiresAt;
        CacheEntry(T data, long ttlMillis) {
            this.data = data;
            this.expiresAt = System.currentTimeMillis() + ttlMillis;
        }
        boolean isValid() {
            return System.currentTimeMillis() < expiresAt;
        }
    }

    private final Map<Long, CacheEntry<DashboardDto.PersonalizedStudentDashboard>> studentDashboardCache = new ConcurrentHashMap<>();
    private final Map<Long, CacheEntry<DashboardDto.DashboardOverview>> overviewCache = new ConcurrentHashMap<>();

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public DashboardDto.DashboardOverview getStudentDashboard(Long userId) {
        CacheEntry<DashboardDto.DashboardOverview> cached = overviewCache.get(userId);
        if (cached != null && cached.isValid()) {
            return cached.data;
        }
        DashboardDto.DashboardOverview overview = new DashboardDto.DashboardOverview();
        overview.setMetrics(dashboardRepository.getMetrics(userId));
        overview.setResumeLearning(dashboardRepository.getResumeLearning(userId));
        overview.setStreak(dashboardRepository.getStreakInfo(userId));
        overview.setHeatmap(dashboardRepository.getActivityHeatmap(userId));
        overview.setLeaderboard(dashboardRepository.getLeaderboard(userId));
        overview.setRecentActivity(dashboardRepository.getRecentActivity(userId));
        overview.setUpcomingAssignments(dashboardRepository.getUpcomingAssignments());
        overview.setUpcomingTests(dashboardRepository.getUpcomingTests());
        overviewCache.put(userId, new CacheEntry<>(overview, 30_000));
        return overview;
    }

    public DashboardDto.PersonalizedStudentDashboard getPersonalizedStudentDashboard(Long userId) {
        CacheEntry<DashboardDto.PersonalizedStudentDashboard> cached = studentDashboardCache.get(userId);
        if (cached != null && cached.isValid()) {
            return cached.data;
        }
        DashboardDto.PersonalizedStudentDashboard dashboard = dashboardRepository.getPersonalizedDashboard(userId);
        studentDashboardCache.put(userId, new CacheEntry<>(dashboard, 30_000));
        return dashboard;
    }

    public void clearCache(Long userId) {
        if (userId != null) {
            studentDashboardCache.remove(userId);
            overviewCache.remove(userId);
        } else {
            studentDashboardCache.clear();
            overviewCache.clear();
        }
    }
}
