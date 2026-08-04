import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import Animate from "../components/Animate";
import { useToast } from "../context/ToastContext";
import { v, validate } from "../utils/validators";

const MAX_SIZE_MB = 2;
const MAX_DIM = 500; // resized photo max width/height in px

export default function AddMember() {
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    planId: "",
    startDate: new Date().toISOString().split("T")[0],
    amount: "",
    mode: "cash",
    goal: "",
    emergencyContact: "",
    trainerId: "",
    joinSource: "",
    notes: "",
    agreeTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Photo states
  const [photo, setPhoto] = useState(null); // compressed base64 dataURL
  const libraryInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // OTP states
  const [otpPopup, setOtpPopup] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef(null);

  const navigate = useNavigate();
  const toast = useToast();

  const startCountdown = () => {
    setCountdown(120);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    },
    [],
  );

  useEffect(() => {
    api
      .get("/plans")
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]));
    api
      .get("/trainers")
      .then((res) => setTrainers(res.data || []))
      .catch(() => setTrainers([]));
  }, []);

  useEffect(() => {
    const selectedPlan = plans.find(
      (p) => String(p._id) === String(form.planId),
    );
    if (selectedPlan && !form.amount) {
      setForm((prev) => ({
        ...prev,
        amount: String(selectedPlan.price || ""),
      }));
    }
  }, [form.planId, plans]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;
    if (name === "phone" || name === "emergencyContact")
      val = value.replace(/\D/g, "").slice(0, 10);
    if (name === "email") setEmailVerified(false);
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : val,
    }));
  };

  // ---------- Photo: compress + resize (used by both library & camera) ----------
  const compressAndSetPhoto = (fileOrBlob) => {
    if (fileOrBlob.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image ${MAX_SIZE_MB}MB se chhoti honi chahiye`);
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height && width > MAX_DIM) {
          height = (height * MAX_DIM) / width;
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = (width * MAX_DIM) / height;
          height = MAX_DIM;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileOrBlob);
  };

  // ---------- Library picker ----------
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }
    compressAndSetPhoto(file);
    e.target.value = "";
  };

  const removePhoto = () => setPhoto(null);

  // ---------- Camera: live capture via getUserMedia ----------
  const openCamera = async () => {
    setCameraError("");
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError("Camera access denied ya available nahi hai.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError("");
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        compressAndSetPhoto(blob);
        closeCamera();
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleEmailVerify = async () => {
    if (!form.email) return;
    setOtpError("");
    setOtpLoading(true);
    try {
      await api.post("/otp/send", { email: form.email });
      setOtpPopup(true);
      setOtpValue("");
      startCountdown();
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Enter 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await api.post("/otp/verify", {
        email: form.email,
        otp: otpValue,
      });
      if (res.data.success) {
        setEmailVerified(true);
        setOtpPopup(false);
        clearInterval(timerRef.current);
        toast.success("Email verified! ✅");
      } else {
        setOtpError(res.data.message || "Invalid OTP");
      }
    } catch {
      setOtpError("Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setOtpError("");
    try {
      await api.post("/otp/send", { email: form.email });
      startCountdown();
      setOtpValue("");
      toast.success("New OTP sent! 📧");
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const validateForm = () =>
    validate([
      [form.name, v.name],
      [form.phone, v.phone],
      [form.email, v.emailOpt],
      [form.emergencyContact, v.phoneOpt],
      [form.planId, (val) => (!val ? "Please select a plan" : null)],
      [form.amount, v.amount],
      [
        form.agreeTerms,
        (val) => (!val ? "Please accept the terms and conditions" : null),
      ],
    ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await api.post("/members", {
        ...form,
        photo,
        amount: Number(form.amount),
      });
      toast.success("Member added successfully! 🎉");
      navigate("/members");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to add member";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanPrice = useMemo(() => {
    return (
      plans.find((p) => String(p._id) === String(form.planId))?.price || ""
    );
  }, [plans, form.planId]);

  const ic = "input-premium";
  const lc = "block text-sm font-medium mb-1.5";
  const ls = { color: "var(--text-muted)" };
  const paymentModes = ["cash", "upi", "card", "online"];
  const joinSources = [
    "Walk-in",
    "Instagram",
    "Facebook",
    "Google",
    "Referral",
    "Website",
    "Other",
  ];

  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="mb-8">
          <h1
            className="text-3xl mb-1"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              color: "var(--text-primary)",
            }}
          >
            Add Member
          </h1>
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Register a new gym member
          </p>
        </div>
      </Animate>

      <Animate variant="fadeUp" delay={100}>
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            className="h-0.5 w-12 rounded-full mb-7"
            style={{ background: "var(--brand-orange)" }}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Photo */}
            <div>
              <p
                className="text-xs font-semibold mb-4 uppercase tracking-widest"
                style={{ color: "var(--text-faint)" }}
              >
                Photo
              </p>
              <div className="flex items-center gap-5">
                <div
                  className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--bg-card-2)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt="Member"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => libraryInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: "rgba(255,90,54,0.12)",
                        color: "var(--brand-orange)",
                        border: "1px solid rgba(255,90,54,0.25)",
                      }}
                    >
                      🖼️ Choose from Library
                    </button>
                    <button
                      type="button"
                      onClick={openCamera}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: "rgba(45,212,196,0.12)",
                        color: "#2DD4C4",
                        border: "1px solid rgba(45,212,196,0.25)",
                      }}
                    >
                      📷 Take Photo
                    </button>
                  </div>
                  {photo && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-xs font-medium self-start"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Remove photo
                    </button>
                  )}
                </div>

                {/* Library picker - opens gallery/file browser */}
                <input
                  ref={libraryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Section: Personal Info */}
            <div>
              <p
                className="text-xs font-semibold mb-4 uppercase tracking-widest"
                style={{ color: "var(--text-faint)" }}
              >
                Personal Info
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lc} style={ls}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className={ic}
                  />
                </div>
                <div>
                  <label className={lc} style={ls}>
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="Phone number"
                    maxLength={10}
                    className={ic}
                  />
                </div>
                <div>
                  <label className={lc} style={ls}>
                    Email (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      className={ic}
                      style={emailVerified ? { borderColor: "#2DD4C4" } : {}}
                    />
                    {form.email && !emailVerified && (
                      <button
                        type="button"
                        onClick={handleEmailVerify}
                        disabled={otpLoading}
                        className="shrink-0 px-4 rounded-xl text-sm font-semibold"
                        style={{
                          background: "rgba(255,90,54,0.15)",
                          color: "var(--brand-orange)",
                          border: "1px solid rgba(255,90,54,0.3)",
                          opacity: otpLoading ? 0.6 : 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {otpLoading ? "Sending..." : "Verify"}
                      </button>
                    )}
                    {emailVerified && (
                      <span
                        className="shrink-0 flex items-center px-3 rounded-xl text-sm font-semibold"
                        style={{
                          background: "rgba(45,212,196,0.12)",
                          color: "#2DD4C4",
                          border: "1px solid rgba(45,212,196,0.2)",
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className={lc} style={ls}>
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleChange}
                    placeholder="Emergency contact number"
                    maxLength={10}
                    className={ic}
                  />
                </div>
                <div>
                  <label className={lc} style={ls}>
                    Fitness Goal
                  </label>
                  <input
                    type="text"
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    placeholder="Fitness goal"
                    className={ic}
                  />
                </div>
                <div>
                  <label className={lc} style={ls}>
                    Join Source
                  </label>
                  <select
                    name="joinSource"
                    value={form.joinSource}
                    onChange={handleChange}
                    className={ic}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Select source</option>
                    {joinSources.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Membership */}
            <div>
              <p
                className="text-xs font-semibold mb-4 uppercase tracking-widest"
                style={{ color: "var(--text-faint)" }}
              >
                Membership
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lc} style={ls}>
                    Plan
                  </label>
                  <select
                    name="planId"
                    value={form.planId}
                    onChange={handleChange}
                    required
                    className={ic}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Select a plan</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — ₹{p.price}
                      </option>
                    ))}
                  </select>
                  {selectedPlanPrice && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Suggested: ₹{selectedPlanPrice}
                    </p>
                  )}
                </div>
                <div>
                  <label className={lc} style={ls}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={ic}
                  />
                </div>
                <div>
                  <label className={lc} style={ls}>
                    Trainer (optional)
                  </label>
                  <select
                    name="trainerId"
                    value={form.trainerId}
                    onChange={handleChange}
                    className={ic}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Assign trainer</option>
                    {trainers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Payment */}
            <div>
              <p
                className="text-xs font-semibold mb-4 uppercase tracking-widest"
                style={{ color: "var(--text-faint)" }}
              >
                Payment
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lc} style={ls}>
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    placeholder="Amount paid"
                    className={ic}
                  />
                </div>
                <div>
                  <label className={lc} style={ls}>
                    Payment Mode
                  </label>
                  <select
                    name="mode"
                    value={form.mode}
                    onChange={handleChange}
                    className={ic}
                    style={{ cursor: "pointer" }}
                  >
                    {paymentModes.map((m) => (
                      <option key={m} value={m}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes - full width */}
            <div>
              <label className={lc} style={ls}>
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Notes"
                className={ic}
              />
            </div>

            {/* Terms */}
            <label
              className="flex items-start gap-3 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 shrink-0"
              />
              <span>
                I agree that the member has accepted the{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="underline font-semibold transition-colors"
                  style={{ color: "#2DD4C4" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--brand-teal)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#2DD4C4")
                  }
                >
                  gym terms and conditions
                </button>
                .
              </span>
            </label>

            {/* Terms Modal */}
            {showTerms && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-6"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                }}
                onClick={() => setShowTerms(false)}
              >
                <div
                  className="relative w-full max-w-2xl rounded-2xl flex flex-col"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                    maxHeight: "85vh",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-7 py-5 shrink-0"
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <div>
                      <div
                        className="h-0.5 w-8 rounded-full mb-3"
                        style={{ background: "var(--brand-orange)" }}
                      />
                      <h2
                        className="text-xl font-black"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--text-primary)",
                        }}
                      >
                        Terms & Conditions
                      </h2>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-faint)" }}
                      >
                        Gym Membership Agreement
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTerms(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: "rgba(255,107,107,0.1)",
                        color: "#ff6b6b",
                        border: "1px solid rgba(255,107,107,0.2)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,107,107,0.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,107,107,0.1)")
                      }
                    >
                      <span style={{ fontSize: "1rem", lineHeight: 1 }}>✕</span>
                      Close
                    </button>
                  </div>

                  {/* Body */}
                  <div
                    className="overflow-y-auto px-7 py-6 space-y-6 text-sm"
                    style={{ color: "var(--text-muted)", lineHeight: 1.75 }}
                  >
                    {[
                      {
                        n: "1",
                        title: "Membership Agreement",
                        text: "By enrolling in this gym membership, the member agrees to follow all gym rules, policies, and terms mentioned in this agreement. The membership is personal and non-transferable unless approved by the gym management.",
                      },
                      {
                        n: "2",
                        title: "Membership Details",
                        text: "The member is enrolled in the selected membership plan for the chosen duration. Access to gym facilities is allowed only during the gym's operating hours and according to the selected plan.",
                      },
                      {
                        n: "3",
                        title: "Payment Terms",
                        text: "The member agrees to pay the membership fee on time according to the selected plan. Payments may be collected monthly, quarterly, yearly, or as agreed with the gym. Late payments may result in temporary suspension of access until dues are cleared.",
                      },
                      {
                        n: "4",
                        title: "Refund and Cancellation Policy",
                        text: "Membership fees are generally non-refundable unless otherwise stated by the gym. If the member wishes to cancel the membership, written notice must be given as per gym policy. Any refund, if applicable, will be decided by management according to the cancellation terms.",
                      },
                      {
                        n: "5",
                        title: "Freeze / Pause Policy",
                        text: "Membership may be frozen only in approved cases such as medical issues, injury, travel, or other valid reasons accepted by the gym. Freeze requests must be submitted in advance and may require supporting documents.",
                      },
                      {
                        n: "6",
                        title: "Health and Medical Responsibility",
                        text: "The member confirms that they are physically fit to use gym facilities and take part in exercise activities. The member agrees to inform the gym staff of any medical condition, injury, pregnancy, or health concern that may affect safe exercise. The gym is not responsible for any injury resulting from undisclosed medical conditions.",
                      },
                      {
                        n: "7",
                        title: "Liability Waiver",
                        text: "The member understands that exercise and use of gym equipment involve physical risk. By signing this agreement, the member accepts full responsibility for any injury, loss, or damage arising from participation in gym activities, except where caused by proven negligence of the gym.",
                      },
                      {
                        n: "8",
                        title: "Gym Rules and Conduct",
                        text: "The member agrees to follow gym rules, maintain proper hygiene, wear suitable workout clothing, and treat staff and other members respectfully. Misuse of equipment, abusive behavior, theft, harassment, or damage to property may result in suspension or termination of membership.",
                      },
                      {
                        n: "9",
                        title: "Use of Facilities",
                        text: "The member must use all equipment safely and responsibly. The gym may restrict access to certain areas, classes, or equipment based on availability, safety, maintenance, or membership type.",
                      },
                      {
                        n: "10",
                        title: "Suspension and Termination",
                        text: "The gym reserves the right to suspend or terminate membership in case of non-payment, misconduct, rule violation, misuse of facilities, or false information provided by the member. Membership may also be terminated if the gym is forced to close due to legal, operational, or safety reasons.",
                      },
                      {
                        n: "11",
                        title: "Personal Data Consent",
                        text: "The member agrees that the gym may store and use personal information for membership management, communication, billing, attendance, and service purposes. The gym will take reasonable steps to protect member data.",
                      },
                      {
                        n: "12",
                        title: "Changes in Terms",
                        text: "The gym may update these terms and conditions from time to time. Any major changes will be communicated to members through notice, email, or app notification.",
                      },
                      {
                        n: "13",
                        title: "Governing Policy",
                        text: "Any dispute related to this membership will be handled as per the gym's internal policy and applicable local laws.",
                      },
                      {
                        n: "14",
                        title: "Declaration",
                        text: "I confirm that I have read, understood, and agreed to these gym membership terms and conditions.",
                      },
                    ].map((item) => (
                      <div key={item.n} className="flex gap-4">
                        <span
                          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5"
                          style={{
                            background: "rgba(255,90,54,0.12)",
                            color: "var(--brand-orange)",
                          }}
                        >
                          {item.n}
                        </span>
                        <div>
                          <p
                            className="font-semibold mb-1"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.title}
                          </p>
                          <p>{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div
                    className="px-7 py-5 shrink-0 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Please read all terms before accepting.
                    </p>
                    <button
                      onClick={() => setShowTerms(false)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: "rgba(255,107,107,0.1)",
                        color: "#ff6b6b",
                        border: "1px solid rgba(255,107,107,0.2)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,107,107,0.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,107,107,0.1)")
                      }
                    >
                      <span>✕</span> Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p
                className="text-sm px-3 py-2.5 rounded-lg"
                style={{
                  color: "#ff6b6b",
                  background: "rgba(255,107,107,0.08)",
                  border: "1px solid rgba(255,107,107,0.2)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center mt-2"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Adding..." : "Add Member →"}
            </button>
          </form>
        </div>
      </Animate>

      {/* Camera Modal - live preview via getUserMedia */}
      {showCamera && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Take Photo
            </h3>
            {cameraError ? (
              <p className="text-sm mb-4" style={{ color: "#ff6b6b" }}>
                {cameraError}
              </p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl mb-4"
                style={{ background: "#000" }}
              />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeCamera}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--bg-card-2)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 btn-primary justify-center"
                >
                  📸 Capture
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTP Popup */}
      {otpPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
          >
            <div
              className="h-0.5 w-10 rounded-full mb-5"
              style={{ background: "var(--brand-orange)" }}
            />
            <h2
              className="text-xl font-black mb-1"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              Verify Email
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              OTP sent to{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {form.email}
              </strong>
            </p>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                Enter OTP
              </label>
              <input
                type="text"
                value={otpValue}
                onChange={(e) =>
                  setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="6-digit code"
                maxLength={6}
                autoFocus
                className="input-premium"
              />
              <div className="flex items-center justify-between mt-2">
                <span
                  className="text-xs"
                  style={{
                    color: countdown === 0 ? "#FF5A36" : "var(--text-faint)",
                  }}
                >
                  {countdown > 0
                    ? `Expires in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
                    : "OTP expired"}
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || resendLoading}
                  className="text-xs font-semibold"
                  style={{
                    color:
                      countdown === 0
                        ? "var(--brand-orange)"
                        : "var(--text-faint)",
                    background: "none",
                    border: "none",
                    cursor: countdown === 0 ? "pointer" : "not-allowed",
                    opacity: resendLoading ? 0.6 : 1,
                  }}
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </div>

            {otpError && (
              <p
                className="text-sm px-3 py-2 rounded-lg mb-4"
                style={{
                  color: "#ff6b6b",
                  background: "rgba(255,107,107,0.08)",
                  border: "1px solid rgba(255,107,107,0.2)",
                }}
              >
                {otpError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOtpPopup(false);
                  clearInterval(timerRef.current);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--bg-card-2)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOtpVerify}
                disabled={otpLoading}
                className="flex-1 btn-primary justify-center"
                style={{ opacity: otpLoading ? 0.6 : 1 }}
              >
                {otpLoading ? "Verifying..." : "Verify →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
