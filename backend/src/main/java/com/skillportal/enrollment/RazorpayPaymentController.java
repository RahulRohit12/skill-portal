package com.skillportal.enrollment;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "Razorpay Standard Checkout", description = "Standard Razorpay Web Checkout order creation and HMAC verification")
public class RazorpayPaymentController {

    private final RazorpayService razorpayService;

    public RazorpayPaymentController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    /**
     * STEP 1: BACKEND - Create Order
     * Request: { amount (paise), currency, receipt }
     * Return: { order_id, amount, currency, key_id }
     * Minimum amount: 100 paise
     */
    @PostMapping({"/api/create-order", "/api/v1/payment/create-order"})
    @Operation(summary = "Create Razorpay order for Standard Web Checkout")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> req) {
        if (!req.containsKey("amount") || req.get("amount") == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Missing required field: amount"
            ));
        }

        long amountInPaise;
        try {
            amountInPaise = ((Number) req.get("amount")).longValue();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Invalid amount format. Expected integer in paise."
            ));
        }

        // Validate amount >= 100 paise
        if (amountInPaise < 100) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Minimum amount must be at least 100 paise (₹1.00)."
            ));
        }

        String currency = req.getOrDefault("currency", "INR").toString();
        String receipt = req.getOrDefault("receipt", "rcpt_" + System.currentTimeMillis()).toString();
        String notesEmail = req.getOrDefault("email", "").toString();
        String notesName = req.getOrDefault("name", "").toString();

        try {
            RazorpayService.RazorpayOrderResult orderResult = razorpayService.createOrder(
                    amountInPaise,
                    receipt,
                    notesEmail,
                    notesName
            );

            Map<String, Object> resp = new HashMap<>();
            resp.put("order_id", orderResult.getOrderId());
            resp.put("amount", amountInPaise);
            resp.put("currency", currency);
            resp.put("key_id", razorpayService.getKeyId());
            resp.put("liveGateway", orderResult.isLiveGateway());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Razorpay order creation failed: " + e.getMessage()
            ));
        }
    }

    /**
     * STEP 3: BACKEND - Verify Signature
     * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
     * Compare generated signature with razorpay_signature
     */
    @PostMapping({"/api/verify-payment", "/api/v1/payment/verify-payment"})
    @Operation(summary = "Verify Razorpay payment signature using HMAC-SHA256")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> req) {
        String orderId = req.get("razorpay_order_id") != null ? req.get("razorpay_order_id") : req.get("order_id");
        String paymentId = req.get("razorpay_payment_id") != null ? req.get("razorpay_payment_id") : req.get("payment_id");
        String signature = req.get("razorpay_signature") != null ? req.get("razorpay_signature") : req.get("signature");

        // Missing fields check
        if (orderId == null || orderId.isBlank() ||
            paymentId == null || paymentId.isBlank() ||
            signature == null || signature.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required."
            ));
        }

        boolean isValid = razorpayService.verifySignature(orderId, paymentId, signature);

        // Signature mismatch: return 400, do NOT mark as paid
        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "failed",
                    "message", "Payment verification failed. Cryptographic signature does not match."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment verified successfully",
                "order_id", orderId,
                "payment_id", paymentId
        ));
    }
}
