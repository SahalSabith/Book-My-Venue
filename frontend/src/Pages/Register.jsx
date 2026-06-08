import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail, MdOutlinePerson, MdPhone } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { registerUser, resendOTP, verifyOTP, googleLogin } from "../Redux/Slice/authSlice";
import { useNavigate } from "react-router-dom";

const API_FIELD_MAP = {
  Name: "name",
  Email: "email",
  Password: "password",
  ConfirmPassword: "confirm_password",
  PhoneNo: "phone_number",
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1 mb-2">{message}</p>;
}

function Register() {
  const [otpPage, setOtpPage] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const otpRefs = useRef([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear that field's error as user types
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");
  };

  const validateClient = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Phone number is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "Confirm Password is required";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords don't match";
    }
    return newErrors;
  };

  const signUp = async () => {
    setGlobalError("");

    // 1. Client-side validation first
    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return; // Stop — don't call API
    }

    setErrors({});

    try {
      const response = await dispatch(
        registerUser({ ...formData, phone_number: Number(formData.phone_number) })
      );

      // Handle rejected action (API returned error object)
      if (response?.error || response?.payload?.error) {
        const apiError = response?.payload?.error || {};
        const mapped = {};
        Object.entries(apiError).forEach(([key, msg]) => {
          const fieldKey = API_FIELD_MAP[key];
          if (fieldKey) {
            mapped[fieldKey] = msg;
          }
        });

        if (Object.keys(mapped).length > 0) {
          setErrors(mapped);
        } else {
          setGlobalError("Something went wrong. Please try again.");
        }
        return;
      }

      setOtpPage(true);
    } catch (error) {
      setGlobalError(error?.message || "Something went wrong. Please try again.");
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    dispatch(verifyOTP({ email: formData.email, otp: otp.join("") }));
  };

  const handleResendOtp = () => {
    dispatch(resendOTP({ email: formData.email }));
  };

  const handleGoogleClick = () => {
    const btn = googleBtnRef.current?.querySelector("div[role='button']");
    if (btn) btn.click();
  };

  return (
    <div className="h-screen bg-[#f8f8f8] flex items-center justify-center overflow-hidden">
      <div className="w-[75%] min-h-[85vh] max-h-[95vh] bg-white rounded-2xl shadow-lg flex overflow-hidden max-lg:w-full max-lg:h-screen">

        {/* LEFT SIDE */}
        <div className="w-1/2 flex justify-center items-center max-lg:w-full overflow-y-auto py-6">
          <div className="w-[380px] max-sm:w-[85%]">

            {!otpPage ? (
              <>
                {/* LOGO */}
                <div className="text-center mb-5">
                  <img src="/logo.png" className="w-12 mx-auto" alt="logo" />
                  <p className="text-[#a82b36] font-semibold text-sm">BookMyVenue</p>
                </div>

                <h1 className="text-[25px] font-bold mb-5">Create your Account</h1>

                {/* Global error */}
                {globalError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                    <p className="text-red-600 text-sm">{globalError}</p>
                  </div>
                )}

                {/* FULL NAME */}
                <label className="text-xs font-bold">Full Name</label>
                <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.name ? "border border-red-400" : ""}`}>
                  <MdOutlinePerson className="text-gray-500 text-lg flex-shrink-0" />
                  <input
                    placeholder="John Doe"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-transparent outline-none flex-1 text-sm min-w-0"
                  />
                </div>
                <FieldError message={errors.name} />

                {/* EMAIL */}
                <label className="text-xs font-bold">Email</label>
                <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.email ? "border border-red-400" : ""}`}>
                  <MdOutlineEmail className="text-gray-500 text-lg flex-shrink-0" />
                  <input
                    placeholder="client@gmail.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-transparent outline-none flex-1 text-sm min-w-0"
                  />
                </div>
                <FieldError message={errors.email} />

                {/* PHONE */}
                <label className="text-xs font-bold">Phone Number</label>
                <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.phone_number ? "border border-red-400" : ""}`}>
                  <MdPhone className="text-gray-500 text-lg flex-shrink-0" />
                  <input
                    placeholder="+91 9876543210"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="bg-transparent outline-none flex-1 text-sm min-w-0"
                  />
                </div>
                <FieldError message={errors.phone_number} />

                {/* PASSWORD */}
                <label className="text-xs font-bold">Password</label>
                <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.password ? "border border-red-400" : ""}`}>
                  <IoLockClosedOutline className="text-gray-500 text-lg flex-shrink-0" />
                  <input
                    placeholder="*******"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-transparent outline-none flex-1 text-sm min-w-0"
                  />
                </div>
                <FieldError message={errors.password} />

                {/* CONFIRM PASSWORD */}
                <label className="text-xs font-bold">Confirm Password</label>
                <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.confirm_password ? "border border-red-400" : ""}`}>
                  <IoLockClosedOutline className="text-gray-500 text-lg flex-shrink-0" />
                  <input
                    placeholder="*******"
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="bg-transparent outline-none flex-1 text-sm min-w-0"
                  />
                </div>
                <FieldError message={errors.confirm_password} />

                {/* SIGN UP BUTTON */}
                <button
                  onClick={() => signUp()}
                  className="mt-4 h-[43px] bg-black text-white rounded-lg w-full text-sm"
                >
                  Sign Up
                </button>

                {/* Hidden Google Button */}
                <div ref={googleBtnRef} style={{ display: "none" }}>
                  <GoogleLogin
                    onSuccess={(credentialResponse) => dispatch(googleLogin(credentialResponse))}
                    onError={() => console.log("Google Login Failed")}
                    useOneTap={false}
                    context="signup"
                    ux_mode="popup"
                  />
                </div>

                <button
                  onClick={handleGoogleClick}
                  className="mt-5 h-[43px] border rounded-lg w-full flex justify-center items-center gap-3 text-sm"
                >
                  <FcGoogle size={22} />
                  Continue with Google
                </button>

                <p className="text-xs mt-4 text-gray-500 text-center">
                  Already have an account?
                  <span onClick={() => navigate("/login")} className="text-black ml-1 cursor-pointer">
                    Login
                  </span>
                </p>
              </>
            ) : (
              <>
                {/* OTP PAGE */}
                <div className="text-center">
                  <img src="/logo.png" className="w-14 mx-auto" alt="logo" />
                  <h1 className="text-3xl font-bold mt-8">Verify Email</h1>
                  <p className="text-gray-400 text-sm mt-3 mb-10">
                    Enter the OTP sent to{" "}
                    <span className="text-black font-medium">{formData.email}</span>
                  </p>

                  <div className="flex gap-3 justify-center mb-6">
                    {otp.map((value, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        value={value}
                        maxLength="1"
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-12 h-12 border rounded-lg text-center text-xl outline-none focus:border-black transition-colors"
                      />
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mb-8">
                    Didn't receive it?{" "}
                    <button onClick={handleResendOtp} className="text-black font-semibold">
                      Resend OTP
                    </button>
                  </p>

                  <button
                    onClick={handleVerifyOtp}
                    className="h-[43px] bg-black text-white rounded-lg w-full text-sm"
                  >
                    Verify OTP
                  </button>

                  <p onClick={() => setOtpPage(false)} className="text-sm mt-5 cursor-pointer text-gray-500">
                    ← Back
                  </p>
                </div>
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
              <h2 className="text-3xl font-bold mb-3">Create your BookMyVenue account</h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-10">
                Join thousands of happy planners and discover premium venues for every occasion.
              </p>
              <div className="bg-white/15 backdrop-blur-md rounded-3xl p-8 w-[85%]">
                <h3 className="text-2xl font-semibold mb-5">Start booking today</h3>
                <p className="text-sm text-gray-300">
                  Find, compare and reserve your perfect venue within minutes.
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

export default Register;