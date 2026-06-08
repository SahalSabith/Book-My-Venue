import { useEffect, useRef, useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { IoLockClosedOutline, IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, verifyForgotPassword, changePassword } from "../Redux/Slice/authSlice";

function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [timer, setTimer] = useState(60);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const otpRefs = useRef([]);

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const resetToken = useSelector((state) => state.auth.resetToken);

  useEffect(() => {
    let interval;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // ── EMAIL STEP ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    setGlobalError("");
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }
    setErrors({});
    try {
      const res = await dispatch(forgotPassword({ email })).unwrap();
      setTimer(60);
      setStep("otp");
    } catch (error) {
      setGlobalError(
        typeof error === "string" ? error : error?.message || "Failed to send OTP. Try again."
      );
    }
  };

  // ── OTP STEP ────────────────────────────────────────────────
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrors({});
    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    setGlobalError("");
    const finalOtp = otp.join("");
    if (finalOtp.length < 5) {
      setErrors({ otp: "Please enter the complete 5-digit OTP" });
      return;
    }
    setErrors({});
    try {
      await dispatch(verifyForgotPassword({ email, otp: finalOtp })).unwrap();
      setStep("reset");
    } catch (error) {
      setGlobalError(
        typeof error === "string" ? error : error?.message || "Invalid OTP. Please try again."
      );
    }
  };

  const handleResendOtp = async () => {
    setGlobalError("");
    setOtp(["", "", "", "", ""]);
    setErrors({});
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setTimer(60);
    } catch (error) {
      setGlobalError("Failed to resend OTP. Try again.");
    }
  };

  // ── RESET STEP ──────────────────────────────────────────────
  const handleChangePassword = async () => {
    setGlobalError("");
    const newErrors = {};
    if (!password.trim()) newErrors.password = "New password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      await dispatch(changePassword({ newPassword: password, resetToken })).unwrap();
      setSuccessMsg("Password updated successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setGlobalError(
        typeof error === "string" ? error : error?.message || "Failed to update password."
      );
    }
  };

  return (
    <div className="h-screen bg-[#f8f8f8] flex items-center justify-center overflow-hidden">
      <div className="w-[70%] h-[82vh] bg-white rounded-2xl shadow-lg flex overflow-hidden max-lg:w-full max-lg:h-screen">

        {/* LEFT SIDE */}
        <div className="w-1/2 flex items-center justify-center max-lg:w-full overflow-y-auto py-8">
          <div className="w-[350px] max-sm:w-[85%]">

            {/* ── EMAIL STEP ── */}
            {step === "email" && (
              <>
                <Logo />
                <h1 className="text-[26px] font-bold mb-2">Forgot Password?</h1>
                <p className="text-sm text-gray-400 mb-8">
                  Enter your email and we'll send you a verification code.
                </p>

                {globalError && <ErrorBox message={globalError} />}

                <label className="text-xs font-bold">Email Address</label>
                <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.email ? "border border-red-400" : ""}`}>
                  <MdOutlineEmail className="text-gray-500 text-lg flex-shrink-0" />
                  <input
                    placeholder="client@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({});
                      setGlobalError("");
                    }}
                    className="bg-transparent outline-none flex-1 text-sm min-w-0"
                  />
                </div>
                <FieldError message={errors.email} />

                <button
                  onClick={handleSendOtp}
                  className="mt-6 h-[43px] bg-black text-white rounded-lg w-full text-sm"
                >
                  Send OTP
                </button>
                <BackToLogin />
              </>
            )}

            {/* ── OTP STEP ── */}
            {step === "otp" && (
              <div className="text-center">
                <Logo />
                <h1 className="text-3xl font-bold mt-2">Verify Email</h1>
                <p className="text-gray-400 text-sm mt-3 mb-8">
                  Enter the OTP sent to{" "}
                  <span className="text-black font-medium">{email}</span>
                </p>

                {globalError && <ErrorBox message={globalError} />}

                <div className="flex justify-center gap-3 mb-2">
                  {otp.map((value, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      value={value}
                      maxLength="1"
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className={`w-12 h-12 border rounded-lg text-center text-xl outline-none transition-colors focus:border-black ${errors.otp ? "border-red-400" : ""}`}
                    />
                  ))}
                </div>
                <FieldError message={errors.otp} />

                <p className="text-sm text-gray-500 mb-8 mt-3">
                  {timer > 0 ? (
                    <span>Resend OTP in <span className="text-black font-semibold">{timer}s</span></span>
                  ) : (
                    <button onClick={handleResendOtp} className="text-black font-semibold">
                      Resend OTP
                    </button>
                  )}
                </p>

                <button
                  onClick={handleVerifyOTP}
                  className="h-[43px] bg-black text-white rounded-lg w-full text-sm"
                >
                  Verify OTP
                </button>

                <button
                  onClick={() => { setStep("email"); setErrors({}); setGlobalError(""); }}
                  className="mt-4 text-sm text-gray-500"
                >
                  ← Change Email
                </button>

                <BackToLogin />
              </div>
            )}

            {/* ── RESET STEP ── */}
            {step === "reset" && (
              <>
                <Logo />
                <h1 className="text-[26px] font-bold mb-2">Create New Password</h1>
                <p className="text-sm text-gray-400 mb-8">
                  Choose a strong password for your account.
                </p>

                {globalError && <ErrorBox message={globalError} />}
                {successMsg && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                    <p className="text-green-600 text-sm">{successMsg}</p>
                  </div>
                )}

                <label className="text-xs font-bold">New Password</label>
                <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.password ? "border border-red-400" : ""}`}>
                  <IoLockClosedOutline className="text-gray-500 text-lg flex-shrink-0" />
                  <input
                    type="password"
                    placeholder="*******"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                    className="bg-transparent outline-none flex-1 text-sm min-w-0"
                  />
                </div>
                <FieldError message={errors.password} />

                <label className="text-xs font-bold">Confirm Password</label>
                <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.confirmPassword ? "border border-red-400" : ""}`}>
                  <IoLockClosedOutline className="text-gray-500 text-lg flex-shrink-0" />
                  <input
                    type="password"
                    placeholder="*******"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                    className="bg-transparent outline-none flex-1 text-sm min-w-0"
                  />
                </div>
                <FieldError message={errors.confirmPassword} />

                <button
                  onClick={handleChangePassword}
                  className="mt-6 h-[43px] bg-black text-white rounded-lg w-full text-sm"
                >
                  Update Password
                </button>
                <BackToLogin />
              </>
            )}

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 p-3 max-lg:hidden">
          <div className="h-full bg-[#050606] rounded-3xl text-white relative overflow-hidden flex items-center justify-center">
            <div className="w-[70%] relative z-10">
              <img src="/logo-red.png" className="w-48 mb-10" alt="logo" />
              <p className="text-lg mb-5">BookMyVenue</p>
              <h2 className="text-3xl font-bold mb-3">Recover your Account</h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-10">
                Securely reset your password and continue booking your favourite venues.
              </p>
              <div className="bg-white/15 backdrop-blur-md rounded-3xl p-8 w-[85%]">
                <h3 className="text-2xl font-semibold mb-5">Back in minutes</h3>
                <p className="text-sm text-gray-300">
                  Verify your email and create a new secure password.
                </p>
              </div>
            </div>
            <div className="absolute w-[400px] h-[400px] border border-white/20 rotate-45 right-[-200px] top-20" />
            <div className="absolute w-[250px] h-[250px] border border-white/10 rotate-45 left-[-150px] bottom-10" />
          </div>
        </div>

      </div>
    </div>
  );
}

// ── SHARED COMPONENTS ──────────────────────────────────────────

function Logo() {
  return (
    <div className="text-center mb-8">
      <img src="/logo.png" className="w-14 mx-auto" alt="logo" />
      <p className="text-[#a82b36] font-semibold text-sm">BookMyVenue</p>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1 mb-3">{message}</p>;
}

function ErrorBox({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );
}

function BackToLogin() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/login")}
      className="mt-4 h-[43px] w-full border rounded-lg flex justify-center items-center gap-2 text-sm hover:bg-gray-50 transition"
    >
      <IoArrowBack />
      Back to Login
    </button>
  );
}

export default ForgotPassword;