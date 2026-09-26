package com.skillportal.course;

import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

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

    private final Map<Long, CacheEntry<List<CourseDto.CourseSummary>>> coursesCache = new ConcurrentHashMap<>();
    private final Map<Long, CacheEntry<CourseDto.CourseDetail>> courseDetailCache = new ConcurrentHashMap<>();

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<CourseDto.CourseSummary> getAllCourses(Long userId) {
        Long key = userId != null ? userId : 0L;
        CacheEntry<List<CourseDto.CourseSummary>> cached = coursesCache.get(key);
        if (cached != null && cached.isValid()) {
            return cached.data;
        }
        List<CourseDto.CourseSummary> list = courseRepository.findAllPublished(userId);
        coursesCache.put(key, new CacheEntry<>(list, 60_000));
        return list;
    }

    public CourseDto.CourseDetail getCourseById(Long id) {
        CacheEntry<CourseDto.CourseDetail> cached = courseDetailCache.get(id);
        if (cached != null && cached.isValid()) {
            return cached.data;
        }
        CourseDto.CourseDetail detail = courseRepository.findCourseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        courseDetailCache.put(id, new CacheEntry<>(detail, 60_000));
        return detail;
    }

    public List<CourseDto.SubjectDetail> getSubjectsByCourse(Long courseId) {
        return courseRepository.findSubjectsByCourseId(courseId);
    }

    public List<CourseDto.ModuleDetail> getModulesBySubject(Long subjectId) {
        return courseRepository.findModulesBySubjectId(subjectId);
    }

    public CourseDto.TopicDetail getTopicById(Long topicId, Long userId) {
        return courseRepository.findTopicById(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + topicId));
    }

    @Transactional
    public Long createCourse(CourseDto.CreateCourseRequest request) {
        coursesCache.clear();
        return courseRepository.createCourse(request);
    }

    @Transactional
    public Long createSubject(Long courseId, String title, String description, int orderIndex) {
        coursesCache.clear();
        courseDetailCache.clear();
        return courseRepository.createSubject(courseId, title, description, orderIndex);
    }

    @Transactional
    public Long createModule(Long subjectId, String title, String description, int orderIndex) {
        courseDetailCache.clear();
        return courseRepository.createModule(subjectId, title, description, orderIndex);
    }

    @Transactional
    public Long createTopic(Long moduleId, String title, String description, int orderIndex) {
        courseDetailCache.clear();
        return courseRepository.createTopic(moduleId, title, description, orderIndex);
    }
}
