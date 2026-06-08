import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail } from "react-icons/md";
import { IoLockClosedOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin } from "../Redux/Slice/authSlice";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1 mb-2">{message}</p>;
}

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleClick = () => {
    const btn = googleBtnRef.current?.querySelector("div[role='button']");
    if (btn) btn.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear that field's error as user types
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");
  };

  const handleLogin = async () => {
    setGlobalError("");

    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const response = await dispatch(loginUser(formData)).unwrap();
      console.log(response);
    } catch (error) {
      // error from unwrap() is the rejected value — usually a string or object
      if (typeof error === "string") {
        setGlobalError(error);
      } else if (error?.message) {
        setGlobalError(error.message);
      } else if (error?.detail) {
        setGlobalError(error.detail);
      } else {
        setGlobalError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen w-full bg-[#f8f8f8] flex items-center justify-center overflow-hidden">
      <div className="w-[70%] h-[82vh] bg-white rounded-2xl shadow-lg flex overflow-hidden max-lg:w-full max-lg:h-screen">

        {/* LEFT SIDE */}
        <div className="w-1/2 flex justify-center items-center max-lg:w-full overflow-y-auto py-6">
          <div className="w-[330px] max-sm:w-[85%]">

            {/* LOGO */}
            <div className="text-center mb-7">
              <img src="/logo.png" className="w-14 mx-auto mb-1" alt="logo" />
              <p className="text-[#a82b36] font-semibold text-sm">BookMyVenue</p>
            </div>

            <h1 className="text-[26px] font-bold mb-7">Sign in to BookMyVenue</h1>

            {/* Global / API error */}
            {globalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-600 text-sm">{globalError}</p>
              </div>
            )}

            {/* EMAIL */}
            <label className="text-xs font-bold">Email Address</label>
            <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.email ? "border border-red-400" : ""}`}>
              <MdOutlineEmail className="text-gray-500 text-lg flex-shrink-0" />
              <input
                placeholder="client@gmail.com"
                className="bg-transparent outline-none text-sm flex-1 min-w-0"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <FieldError message={errors.email} />

            {/* PASSWORD */}
            <label className="text-xs font-bold">Password</label>
            <div className={`mt-2 h-[43px] bg-[#f7f7f7] rounded-lg flex items-center px-3 gap-3 ${errors.password ? "border border-red-400" : ""}`}>
              <IoLockClosedOutline className="text-gray-500 text-lg flex-shrink-0" />
              <input
                type="password"
                placeholder="*******"
                className="bg-transparent outline-none text-sm flex-1 min-w-0"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <FieldError message={errors.password} />

            {/* LOGIN BUTTON */}
            <button
              onClick={handleLogin}
              className="mt-8 h-[43px] w-full bg-[#111] text-white rounded-lg text-sm font-medium"
            >
              Sign In
            </button>

            {/* LINKS */}
            <div className="flex justify-between mt-4 text-xs">
              <p className="text-gray-400">
                Don't have an account?
                <span
                  onClick={() => navigate("/register")}
                  className="text-black ml-1 cursor-pointer"
                >
                  Sign up
                </span>
              </p>
            </div>

            <p
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-gray-500 mt-1 cursor-pointer"
            >
              Forgot Password
            </p>

            {/* Hidden Google Button */}
            <div ref={googleBtnRef} style={{ display: "none" }}>
              <GoogleLogin
                onSuccess={(credentialResponse) => dispatch(googleLogin(credentialResponse))}
                onError={() => console.log("Google Login Failed")}
              />
            </div>

            <button
              onClick={handleGoogleClick}
              className="mt-8 h-[43px] border rounded-lg w-full flex justify-center items-center gap-3 text-sm"
            >
              <FcGoogle size={22} />
              Continue with Google
            </button>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 p-3 max-lg:hidden">
          <div className="h-full bg-[#050606] rounded-3xl text-white relative overflow-hidden flex items-center justify-center">
            <div className="w-[70%]">
              <img src="/logo-red.png" className="w-48 mb-10" alt="logo" />
              <p className="text-lg mb-5">BookMy Venue</p>
              <h2 className="text-3xl font-bold mb-3">Welcome to BookMyVenue</h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-10">
                BookMyVenue is your premier destination for discovering and booking incredible event venues. From wedding halls and corporate spaces to party lawns.
              </p>
              <div className="bg-white/15 backdrop-blur-md rounded-3xl p-8 w-[85%]">
                <h3 className="text-2xl font-semibold mb-5">Book your perfect venue in minutes</h3>
                <p className="text-sm text-gray-300">
                  Discover, compare, and book from a curated selection of top-rated venues.
                </p>
              </div>
            </div>
            <div className="absolute w-[400px] h-[400px] border border-white/20 rotate-45 right-[-200px] top-20" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;