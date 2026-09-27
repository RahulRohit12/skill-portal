package com.skillportal.notification;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class NotificationRepository {

    private final JdbcTemplate jdbcTemplate;

    public NotificationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<NotificationDto.NotificationItem> findByUserId(Long userId) {
        String sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            NotificationDto.NotificationItem item = new NotificationDto.NotificationItem();
            item.setId(rs.getLong("id"));
            item.setTitle(rs.getString("title"));
            item.setMessage(rs.getString("message"));
            item.setType(rs.getString("type"));
            item.setLinkUrl(rs.getString("link_url"));
            item.setRead(rs.getBoolean("is_read"));
            java.sql.Timestamp ts = rs.getTimestamp("created_at");
            item.setCreatedAt(ts != null ? ts.toInstant().toString() : java.time.Instant.now().toString());
            return item;
        }, userId);
    }

    public int countUnread(Long userId) {
        String sql = "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = FALSE";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }

    public void markAsRead(Long id, Long userId) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?";
        jdbcTemplate.update(sql, id, userId);
    }

    public void markAllAsRead(Long userId) {
        String sql = "UPDATE notifications SET is_read = TRUE WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }

    public void createNotification(Long userId, String title, String message, String type, String linkUrl) {
        String sql = "INSERT INTO notifications (user_id, title, message, type, link_url, is_read) VALUES (?, ?, ?, ?, ?, FALSE)";
        jdbcTemplate.update(sql, userId, title, message, type, linkUrl);
    }
}
