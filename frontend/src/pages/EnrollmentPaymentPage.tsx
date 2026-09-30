import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Building,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Check,
  QrCode,
  Smartphone,
  Building2,
  Edit3,
  Copy,
  Key,
} from 'lucide-react';
import api from '../api/client';
import { StudentEnrollmentDetailResponse, RazorpayOrderCreateResponse } from '../types';

export const EnrollmentPaymentPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<StudentEnrollmentDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Password set by student during enrollment
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Payment states
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);
  const [paymentFailedMsg, setPaymentFailedMsg] = useState<string | null>(null);
  const [showSandboxModal, setShowSandboxModal] = useState<boolean>(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<RazorpayOrderCreateResponse | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Credential editing states on post-payment success screen
  const [isEditingCredentials, setIsEditingCredentials] = useState<boolean>(false);
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editConfirmPassword, setEditConfirmPassword] = useState<string>('');
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);
  const [updatingCredentials, setUpdatingCredentials] = useState<boolean>(false);
  const [credentialUpdateSuccess, setCredentialUpdateSuccess] = useState<string | null>(null);
  const [credentialUpdateError, setCredentialUpdateError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid enrollment token.');
      setLoading(false);
      return;
    }

    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/enrollment/details/${token}`);
        const data = res.data?.data || null;
        setDetails(data);
        if (data?.email) {
          setEditEmail(data.email);
        }
      } catch (err: any) {
        console.error('Failed to load enrollment details', err);
        setError(err.response?.data?.message || 'Enrollment link is invalid, expired, or already used.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [token]);

  // Load Razorpay Standard Checkout SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!token || !details) return;
    setPaymentFailedMsg(null);

    // Validate password if student typed anything
    if (password && password.length < 6) {
      setPaymentFailedMsg('Password must be at least 6 characters long.');
      return;
    }

    setProcessingPayment(true);
    try {
      // 1. Request backend to create Razorpay Order (using exact server-side amount)
      const orderRes = await api.post(`/enrollment/create-order/${token}`);
      const orderData: RazorpayOrderCreateResponse = orderRes.data?.data;

      if (!orderData || !orderData.orderId) {
        throw new Error('Failed to initialize Razorpay payment order.');
      }

      // Check if backend has real live Razorpay credentials configured
      if (!orderData.liveGateway) {
        // Test simulation mode: open Sandbox test dialog (prevents passing fake order_id to checkout.js)
        setSandboxOrderData(orderData);
        setShowSandboxModal(true);
        setProcessingPayment(false);
        return;
      }

      // 2. Load script for live payment
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentFailedMsg('Unable to load Razorpay payment SDK. Please verify your connection.');
        setProcessingPayment(false);
        return;
      }

      // 3. Configure Razorpay Standard Checkout with registered live order ID
      const prefillData: any = {
        name: orderData.studentName,
        email: orderData.studentEmail,
        method: selectedMethod,
      };
      if (orderData.studentPhone && orderData.studentPhone.trim().length >= 10) {
        prefillData.contact = orderData.studentPhone.replace(/[^\d+]/g, '');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Skillex Academy',
        description: `Enrollment: ${orderData.courseTitle}`,
        image: 'https://getmaterials.in/_next/image?url=%2Fimages%2Ficons%2Fstudent5.png&w=1920&q=75',
        order_id: orderData.orderId,
        prefill: prefillData,
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI, QR Code, PhonePe, Google Pay, Paytm',
                instruments: [
                  { method: 'upi', flows: ['qr', 'intent', 'collect'] }
                ]
              },
              cards: {
                name: 'Cards & Net Banking',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' }
                ]
              }
            },
            sequence: selectedMethod === 'card'
              ? ['block.cards', 'block.upi']
              : ['block.upi', 'block.cards'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        theme: {
          color: '#00c2ff',
        },
        handler: async function (response: any) {
          // Razorpay returns { razorpay_payment_id, razorpay_order_id, razorpay_signature }
          await submitVerification(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            setPaymentFailedMsg('Payment was cancelled or abandoned. Student account was NOT created. You may try again when ready.');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setProcessingPayment(false);
        setPaymentFailedMsg(`Payment failed: ${response.error?.description || 'Transaction declined by bank.'}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Payment checkout initiation failed', err);
      setPaymentFailedMsg(err.response?.data?.message || err.message || 'Failed to open payment gateway.');
      setProcessingPayment(false);
    }
  };

  // Sandbox simulation runner for test credentials
  const handleTestModePaymentFallback = async () => {
    try {
      const orderRes = await api.post(`/enrollment/create-order/${token}`);
      const orderData: RazorpayOrderCreateResponse = orderRes.data?.data;
      await handleTestModePayment(orderData);
    } catch (err: any) {
      setPaymentFailedMsg(err.response?.data?.message || 'Failed to start sandbox test payment.');
      setProcessingPayment(false);
    }
  };

  const handleTestModePayment = async (orderData: RazorpayOrderCreateResponse) => {
    try {
      const testPaymentId = 'pay_test_' + Math.random().toString(36).substring(2, 12);
      // Fetch cryptographically valid signature for the test order
      const sigRes = await api.post('/enrollment/test-signature', {
        orderId: orderData.orderId,
        paymentId: testPaymentId,
      });
      const signature = sigRes.data?.data?.signature || 'sig_test_valid';

      await submitVerification(testPaymentId, orderData.orderId, signature);
    } catch (e: any) {
      setPaymentFailedMsg('Test payment failed: ' + (e.message || 'Signature error'));
      setProcessingPayment(false);
    }
  };

  // Submit Razorpay payload to backend for strict server-side signature verification
  const submitVerification = async (paymentId: string, orderId: string, signature: string) => {
    setProcessingPayment(false);
    setVerifying(true);
    setPaymentFailedMsg(null);

    try {
      const payload = {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        password: password.trim() || undefined,
      };

      const res = await api.post(`/enrollment/verify-payment/${token}`, payload);
      const successData = res.data?.data || { success: true };
      setPaymentSuccess(successData);
      if (successData.email) {
        setEditEmail(successData.email);
      }
    } catch (err: any) {
      console.error('Payment verification failed', err);
      setPaymentFailedMsg(
        err.response?.data?.message ||
        'Cryptographic verification failed. Your card/account was NOT charged, and student access was NOT granted.'
      );
    } finally {
      setVerifying(false);
    }
  };

  // Student edits their Gmail & Password after successful payment
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialUpdateError(null);
    setCredentialUpdateSuccess(null);

    const emailToUpdate = editEmail.trim().toLowerCase();
    if (!emailToUpdate || !emailToUpdate.includes('@') || !emailToUpdate.includes('.')) {
      setCredentialUpdateError('Please enter a valid Gmail / email address.');
      return;
    }

    if (editPassword) {
      if (editPassword.trim().length < 6) {
        setCredentialUpdateError('Password must be at least 6 characters long.');
        return;
      }
      if (editPassword !== editConfirmPassword) {
        setCredentialUpdateError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setUpdatingCredentials(true);
    try {
      const res = await api.post(`/enrollment/update-credentials/${token}`, {
        email: emailToUpdate,
        password: editPassword.trim() || undefined,
      });

      const updatedEmail = res.data?.data?.email || emailToUpdate;
      if (details) {
        setDetails({ ...details, email: updatedEmail });
      }
      if (paymentSuccess) {
        setPaymentSuccess({ ...paymentSuccess, email: updatedEmail });
      }
      if (editPassword.trim()) {
        setPassword(editPassword.trim());
      }
      setCredentialUpdateSuccess('Gmail & password updated successfully! You can now log in with these credentials.');
      setIsEditingCredentials(false);
      setEditPassword('');
      setEditConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update credentials. Please try again.';
      setCredentialUpdateError(msg);
    } finally {
      setUpdatingCredentials(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0a0d14]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0077b6] via-[#0096c7] to-[#00c2ff] flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-white leading-none">
                SKILL<span className="text-[#00c2ff]">X</span> ACADEMY
              </span>
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest mt-0.5">
                Official Student Enrollment
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-semibold">256-Bit Bank Grade SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">Securing enrollment details from academy database...</p>
          </div>
        ) : error ? (
          <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-white">Enrollment Link Error</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : details?.paid || paymentSuccess ? (
          /* ======================================================== */
          /* PAYMENT SUCCESS & ACTIVATION COMPLETE                    */
          /* ======================================================== */
          <div className="w-full max-w-lg p-8 rounded-3xl bg-gradient-to-b from-[#0d1624] to-[#090e18] border border-emerald-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                Payment Verified • Account Active
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-2">
                Welcome to Skillex Academy!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Your course fee payment has been confirmed by Razorpay. Your student account and portal privileges have been activated.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold text-white">{details?.fullName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Student ID Code:</span>
                <span className="font-mono font-bold text-cyan-400">{details?.studentIdNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Enrolled Batch:</span>
                <span className="font-semibold text-white">{details?.batchName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Assigned Track:</span>
                <span className="font-semibold text-white">{details?.courseTitle}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400 font-extrabold pt-1">
                <span>Amount Paid:</span>
                <span>₹{details?.amountInRupees?.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            {/* Student Login Credentials & Edit Section */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-left text-xs space-y-3.5 shadow-lg shadow-cyan-500/5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xs">Student Portal Credentials</h3>
                    <p className="text-[10px] text-slate-400">Use this Gmail & Password to access your portal</p>
                  </div>
                </div>
                {!isEditingCredentials && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingCredentials(true);
                      setEditEmail(details?.email || paymentSuccess?.email || '');
                      setEditPassword('');
                      setEditConfirmPassword('');
                      setCredentialUpdateError(null);
                      setCredentialUpdateSuccess(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Gmail & Password</span>
                  </button>
                )}
              </div>

              {credentialUpdateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{credentialUpdateSuccess}</span>
                </div>
              )}

              {!isEditingCredentials ? (
                /* READ-ONLY DISPLAY OF CREDENTIALS */
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Login Gmail / Email
                      </span>
                      <span className="font-mono font-bold text-white text-xs">
                        {details?.email || paymentSuccess?.email || editEmail}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const emailToCopy = details?.email || paymentSuccess?.email || editEmail;
                        navigator.clipboard.writeText(emailToCopy);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy Gmail"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Portal Password
                      </span>
                      <span className="font-mono font-bold text-white text-xs">
                        {password ? password : '•••••••• (Set by you / academy default)'}
                      </span>
                    </div>
                    {password && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(password);
                          setCopiedPassword(true);
                          setTimeout(() => setCopiedPassword(false), 2000);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copy Password"
                      >
                        {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* INLINE EDIT FORM FOR GMAIL & PASSWORD */
                <form onSubmit={handleUpdateCredentials} className="space-y-3 pt-1">
                  {credentialUpdateError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{credentialUpdateError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Gmail / Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        New Password (min 6 chars)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type={showEditPassword ? 'text' : 'password'}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="p-1 text-slate-400 hover:text-white absolute right-2.5 top-2"
                        >
                          {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type={showEditPassword ? 'text' : 'password'}
                          value={editConfirmPassword}
                          onChange={(e) => setEditConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={updatingCredentials}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {updatingCredentials ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Credentials</span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={updatingCredentials}
                      onClick={() => {
                        setIsEditingCredentials(false);
                        setEditEmail(details?.email || paymentSuccess?.email || '');
                        setEditPassword('');
                        setEditConfirmPassword('');
                        setCredentialUpdateError(null);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  navigate('/login', {
                    state: {
                      email: details?.email || paymentSuccess?.email || editEmail,
                      password: password || editPassword || undefined,
                    },
                  })
                }
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Student Portal Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* PENDING PAYMENT ENROLLMENT FORM                          */
          /* ======================================================== */
          <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Left Column: Student & Curriculum Verification (3 Cols) */}
            <div className="lg:col-span-3 space-y-5">
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Learner Enrollment Verification
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Please verify your registration details below before completing payment.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider shrink-0">
                    Payment Pending
                  </span>
                </div>

                {paymentFailedMsg && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3 animate-shake">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{paymentFailedMsg}</span>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Full Name</span>
                    </span>
                    <p className="font-extrabold text-white text-sm">{details?.fullName}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Email Address</span>
                    </span>
                    <p className="font-extrabold text-white text-sm truncate">{details?.email}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Assigned Batch</span>
                    </span>
                    <p className="font-extrabold text-white text-sm">{details?.batchName}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Course Track</span>
                    </span>
                    <p className="font-extrabold text-white text-sm truncate">{details?.courseTitle}</p>
                  </div>

                  {details?.college && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-cyan-400" />
                        <span>College / University</span>
                      </span>
                      <p className="font-extrabold text-white text-xs">{details?.college}</p>
                    </div>
                  )}
                </div>

                {/* Password Setting */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Set Your Portal Password (Optional)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    You can set your secret login password now. If left blank, you can use the default password provided by your academy administrator.
                  </p>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-white absolute right-3 top-2.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Fee Summary & Razorpay Pay Now (2 Cols) */}
            <div className="lg:col-span-2 space-y-5">
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-white">Payment Summary</h3>
                  <span className="text-[11px] text-cyan-400 font-mono">INR ({details?.currency})</span>
                </div>

                {/* Gateway Status Badge */}
                {details?.liveGateway ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Live Gateway Active (UPI, Cards, NetBanking)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Test Sandbox Mode (Add Live Keys in Render for Real Payments)</span>
                  </div>
                )}

                {/* Line Items */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Curriculum Tuition Fee:</span>
                    <span className="font-semibold text-slate-200">
                      ₹{details?.amountInRupees?.toLocaleString('en-IN')}.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>LMS & Coding Practice Lab Access:</span>
                    <span className="text-emerald-400 font-bold">Included Free</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Taxes & Processing Fee:</span>
                    <span className="font-semibold text-slate-200">₹0.00</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="font-black text-sm text-white">Total Amount Due:</span>
                    <span className="text-2xl font-black text-emerald-400 tracking-tight">
                      ₹{details?.amountInRupees?.toLocaleString('en-IN')}.00
                    </span>
                  </div>
                </div>

                {/* Preferred Payment Method Selector */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Select Payment Option
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400">
                      ⚡ Instant Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('upi')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        selectedMethod === 'upi'
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">UPI & QR</span>
                      <span className="text-[9px] text-cyan-300 font-semibold">GPay • PhonePe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        selectedMethod === 'card'
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">Cards</span>
                      <span className="text-[9px] text-slate-400 font-semibold">Visa • RuPay • MC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('netbanking')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        selectedMethod === 'netbanking'
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold leading-tight">NetBanking</span>
                      <span className="text-[9px] text-slate-400 font-semibold">50+ Banks</span>
                    </button>
                  </div>
                </div>

                {/* Pay Now Button */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handlePayNow}
                    disabled={processingPayment || verifying}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {verifying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Bank Signature...</span>
                      </>
                    ) : processingPayment ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to Razorpay...</span>
                      </>
                    ) : selectedMethod === 'upi' ? (
                      <>
                        <QrCode className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                        <span>PAY ₹{details?.amountInRupees?.toLocaleString('en-IN')} VIA UPI / QR / GPAY</span>
                      </>
                    ) : selectedMethod === 'card' ? (
                      <>
                        <CreditCard className="w-5 h-5 fill-slate-950" />
                        <span>PAY ₹{details?.amountInRupees?.toLocaleString('en-IN')} VIA CARD</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5 text-slate-950" />
                        <span>PAY ₹{details?.amountInRupees?.toLocaleString('en-IN')} VIA NETBANKING</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-500 leading-relaxed">
                    By clicking Pay Now, you will open Razorpay's secure checkout. Student portal activation occurs only after signature verification.
                  </p>
                </div>

                {/* Supported Payment Badges */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block text-center uppercase tracking-wider">
                    Supported Payment Methods
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> UPI QR Scan
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
                      PhonePe
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
                      Google Pay
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300">
                      Paytm UPI
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      BHIM / CRED
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      RuPay / Visa / MC
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      Net Banking (50+ Banks)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sandbox Test Modal */}
        {showSandboxModal && sandboxOrderData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 shadow-2xl space-y-5 text-left relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                  Test Sandbox Mode
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Razorpay Simulation & Activation
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your server is running in local test mode because live Razorpay credentials are not yet added to Render.
                </p>
              </div>

              {/* Order Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Student:</span>
                  <span className="font-bold text-white">{sandboxOrderData.studentName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Course Track:</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">{sandboxOrderData.courseTitle}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-extrabold pt-1 border-t border-slate-800">
                  <span>Amount to Verify:</span>
                  <span className="text-sm">₹{(sandboxOrderData.amount / 100).toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
                <p className="font-semibold text-white">To enable REAL student payments into your bank account:</p>
                <p className="text-slate-400">
                  Add <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">RAZORPAY_KEY_ID</code> and <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">RAZORPAY_KEY_SECRET</code> from your Razorpay Dashboard into your Render Environment Variables.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => {
                    setShowSandboxModal(false);
                    handleTestModePayment(sandboxOrderData);
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs tracking-wide transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Verified Payment & Activate Student</span>
                </button>

                <button
                  onClick={() => {
                    setShowSandboxModal(false);
                    setProcessingPayment(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090b10] py-4 text-center text-xs text-slate-500">
        <p>© 2026 Skillex Academy. All payments processed securely via Razorpay Payment Gateway.</p>
      </footer>
    </div>
  );
};
export default EnrollmentPaymentPage;
