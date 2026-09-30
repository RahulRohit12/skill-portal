package com.skillportal.enrollment;

import com.skillportal.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/enrollment")
@Tag(name = "Enrollment & Payments", description = "Public endpoints for student course enrollment checkout and Razorpay verification")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final RazorpayService razorpayService;

    public EnrollmentController(EnrollmentService enrollmentService, RazorpayService razorpayService) {
        this.enrollmentService = enrollmentService;
        this.razorpayService = razorpayService;
    }

    @GetMapping("/details/{token}")
    @Operation(summary = "Get enrollment and fee details for a student before payment")
    public ResponseEntity<ApiResponse<EnrollmentDto.StudentEnrollmentDetailResponse>> getDetails(@PathVariable String token) {
        EnrollmentDto.StudentEnrollmentDetailResponse details = enrollmentService.getEnrollmentDetails(token);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    @PostMapping("/create-order/{token}")
    @Operation(summary = "Create Razorpay order for this enrollment using server-stored amount")
    public ResponseEntity<ApiResponse<EnrollmentDto.RazorpayOrderCreateResponse>> createOrder(@PathVariable String token) {
        EnrollmentDto.RazorpayOrderCreateResponse order = enrollmentService.createRazorpayOrder(token);
        return ResponseEntity.ok(ApiResponse.success("Razorpay order created successfully", order));
    }

    @PostMapping("/verify-payment/{token}")
    @Operation(summary = "Verify Razorpay payment signature and activate student account")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPayment(
            @PathVariable String token,
            @RequestBody EnrollmentDto.PaymentVerificationRequest req) {
        Map<String, Object> result = enrollmentService.verifyPaymentAndActivate(token, req);
        return ResponseEntity.ok(ApiResponse.success("Payment verified and student account created successfully", result));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Razorpay Webhook receiver for background payment capture guarantee")
    public ResponseEntity<ApiResponse<String>> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        enrollmentService.processWebhook(payload, signature);
        return ResponseEntity.ok(ApiResponse.success("Webhook processed", "OK"));
    }

    /**
     * Test helper endpoint for developer test verification:
     * Generates a valid HMAC-SHA256 signature for test orders in TEST MODE.
     */
    @PostMapping("/test-signature")
    @Operation(summary = "Generate valid test HMAC signature for sandbox testing")
    public ResponseEntity<ApiResponse<Map<String, String>>> testSignature(@RequestBody Map<String, String> body) {
        String orderId = body.get("orderId");
        String paymentId = body.get("paymentId");
        String sig = razorpayService.generateTestSignature(orderId, paymentId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("signature", sig)));
    }

    @PostMapping("/update-credentials/{token}")
    @Operation(summary = "Allow student to edit Gmail and password after successful payment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCredentials(
            @PathVariable String token,
            @RequestBody EnrollmentDto.UpdateCredentialsRequest req) {
        Map<String, Object> result = enrollmentService.updateCredentials(token, req);
        return ResponseEntity.ok(ApiResponse.success("Login credentials updated successfully", result));
    }

    @PostMapping("/send-email/{token}")
    @Operation(summary = "Dispatch / resend official enrollment payment form to student's Gmail")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendEmail(@PathVariable String token) {
        Map<String, Object> result = enrollmentService.sendEnrollmentEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Enrollment payment form dispatched to student's Gmail", result));
    }

    @GetMapping("/share-message/{token}")
    @Operation(summary = "Get pre-formatted WhatsApp and SMS message links for student enrollment")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getShareMessage(@PathVariable String token) {
        Map<String, Object> result = enrollmentService.getShareMessage(token);
        return ResponseEntity.ok(ApiResponse.success("Share message generated", result));
    }
}
