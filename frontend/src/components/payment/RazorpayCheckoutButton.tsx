import React, { useState } from 'react';
import { CreditCard, QrCode, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

interface RazorpayCheckoutButtonProps {
  amountInRupees?: number;
  amountInPaise?: number;
  currency?: string;
  receipt?: string;
  name?: string;
  description?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  onSuccess?: (paymentData: { paymentId: string; orderId: string; signature: string }) => void;
  onFailure?: (error: any) => void;
  className?: string;
  buttonText?: string;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amountInRupees,
  amountInPaise,
  currency = 'INR',
  receipt,
  name = 'Skillex Academy',
  description = 'Course Fee & Training',
  studentName = 'Student',
  studentEmail = '',
  studentPhone = '',
  onSuccess,
  onFailure,
  className = '',
  buttonText,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Compute amount in paise (minimum 100 paise)
  const finalAmountInPaise = amountInPaise || (amountInRupees ? Math.round(amountInRupees * 100) : 100);

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      // STEP 1: Call Backend to Create Order
      const orderRes = await api.post('/create-order', {
        amount: finalAmountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        name: studentName,
        email: studentEmail,
      });

      const orderData = orderRes.data;
      const orderId = orderData.order_id || orderData.orderId;
      const keyId = orderData.key_id || orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TiNXI1YOjgWmvp';

      if (!orderId) {
        throw new Error('Order creation failed: No order_id returned from backend.');
      }

      // Ensure Razorpay SDK is loaded
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please check your internet connection.');
      }

      // STEP 2: Configure and open Razorpay Standard Modal
      const options = {
        key: keyId,
        amount: finalAmountInPaise,
        currency,
        name,
        description,
        order_id: orderId,
        image: 'https://getmaterials.in/_next/image?url=%2Fimages%2Ficons%2Fstudent5.png&w=1920&q=75',
        prefill: {
          name: studentName,
          email: studentEmail,
          contact: studentPhone ? studentPhone.replace(/[^\d+]/g, '') : undefined,
          method: 'upi',
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI, QR Code, PhonePe, Google Pay, Paytm',
                instruments: [{ method: 'upi', flows: ['qr', 'intent', 'collect'] }],
              },
              cards: {
                name: 'Cards & Net Banking',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.upi', 'block.cards'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: '#00c2ff',
        },
        handler: async function (response: any) {
          // STEP 3: Verify Payment Signature with Backend
          try {
            setLoading(true);
            const verifyRes = await api.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.status === 'success' || verifyRes.status === 200) {
              setSuccess(true);
              if (onSuccess) {
                onSuccess({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                });
              }
            } else {
              throw new Error(verifyRes.data?.message || 'Signature verification failed.');
            }
          } catch (vErr: any) {
            const msg = vErr.response?.data?.message || vErr.message || 'Payment signature verification failed.';
            setError(msg);
            if (onFailure) onFailure(vErr);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment was cancelled. You can try again whenever you are ready.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setLoading(false);
        const errMsg = response.error?.description || 'Transaction declined by bank.';
        setError(`Payment failed: ${errMsg}`);
        if (onFailure) onFailure(response.error);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Payment checkout initiation failed', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to open payment gateway.';
      setError(errMsg);
      setLoading(false);
      if (onFailure) onFailure(err);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ||
          'w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]'
        }
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            <span>Connecting to Razorpay...</span>
          </>
        ) : (
          <>
            <QrCode className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span>
              {buttonText || `PAY ₹${(finalAmountInPaise / 100).toLocaleString('en-IN')} VIA UPI / GPAY / CARDS`}
            </span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Payment verified successfully! Account is active.</span>
        </div>
      )}
    </div>
  );
};

export default RazorpayCheckoutButton;
