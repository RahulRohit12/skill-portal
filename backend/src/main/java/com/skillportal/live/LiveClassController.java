package com.skillportal.live;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Live Classes", description = "Endpoints for real-time live lecture broadcasts and batch sessions")
public class LiveClassController {

    private final LiveClassService liveClassService;

    public LiveClassController(LiveClassService liveClassService) {
        this.liveClassService = liveClassService;
    }

    @GetMapping("/live-classes/active")
    @Operation(summary = "Get the active live class for the authenticated student's batch")
    public ResponseEntity<ApiResponse<LiveClassDto.LiveClassResponse>> getActiveLiveClassForStudent(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        LiveClassDto.LiveClassResponse activeClass = liveClassService.getActiveLiveClassForStudent(userId);
        return ResponseEntity.ok(ApiResponse.success(activeClass));
    }

    @GetMapping("/admin/live-classes/active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all active live classes currently running across batches")
    public ResponseEntity<ApiResponse<List<LiveClassDto.LiveClassResponse>>> getAllActiveLiveClasses() {
        List<LiveClassDto.LiveClassResponse> activeList = liveClassService.getAllActiveLiveClasses();
        return ResponseEntity.ok(ApiResponse.success(activeList));
    }

    @PostMapping("/admin/live-classes/start")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Start a new live lecture session for a specific batch")
    public ResponseEntity<ApiResponse<LiveClassDto.LiveClassResponse>> startLiveClass(
            @Valid @RequestBody LiveClassDto.StartLiveClassRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        LiveClassDto.LiveClassResponse created = liveClassService.startLiveClass(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Live class started successfully", created));
    }

    @PostMapping("/admin/live-classes/{id}/end")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "End an ongoing live class session")
    public ResponseEntity<ApiResponse<Void>> endLiveClass(@PathVariable Long id) {
        liveClassService.endLiveClass(id);
        return ResponseEntity.ok(ApiResponse.success("Live class ended", null));
    }
}
