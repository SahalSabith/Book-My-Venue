import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerVenueOwner,logout } from "../Redux/Slice/authSlice";
import { jwtDecode } from "jwt-decode";

// ─── Mode Switch ─────────────────────────────────────────────────────────────

function ModeSwitch({ mode, onChange }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1 font-medium select-none">
      <button
        onClick={() => onChange("book")}
        className={`
          flex-1 px-5 py-2 rounded-full text-sm transition-all duration-200 whitespace-nowrap
          ${mode === "book"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"}
        `}
      >
        Book a Venue
      </button>
      <button
        onClick={() => onChange("rent")}
        className={`
          flex-1 px-5 py-2 rounded-full text-sm transition-all duration-200 whitespace-nowrap
          ${mode === "rent"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"}
        `}
      >
        List My Venue
      </button>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const profileRef = useRef(null);

  // Redux
  const token = useSelector((state) => state.auth.token);
  const isLoggedIn = Boolean(token);

  // Derive active mode from the current route so the switch always reflects reality
  const isOwnerPage = location.pathname.startsWith("/venue-owner");
  const mode = isOwnerPage ? "rent" : "book";

  // UI state
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ownerModal, setOwnerModal] = useState(false);
  const [readMore, setReadMore] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    business_name: "",
    business_email: "",
    business_phone: "",
    terms_and_condition: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Reset form when modal closes
  useEffect(() => {
    if (!ownerModal) {
      setFormData({
        business_name: "",
        business_email: "",
        business_phone: "",
        terms_and_condition: false,
      });
      setFormError("");
      setReadMore(false);
    }
  }, [ownerModal]);

  // ── Mode switch handler ──────────────────────────────────────────────────

  const handleModeChange = (value) => {
    if (value === "book") {
      navigate("/");
      return;
    }

    // "rent" — user must be logged in
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      const { role } = jwtDecode(token);
      if (role === "owner") {
        navigate("/venue-owner");
      } else {
        // Regular user — show the owner registration modal
        setOwnerModal(true);
      }
    } catch {
      navigate("/login");
    }
  };

  // ── Form helpers ────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOwnerSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.business_name.trim()) return setFormError("Business name is required.");
    if (!formData.business_email.trim()) return setFormError("Business email is required.");
    if (!formData.business_phone.trim()) return setFormError("Business phone is required.");
    if (!formData.terms_and_condition) return setFormError("You must accept the terms.");

    const payload = {
      business_name: formData.business_name.trim(),
      business_email: formData.business_email.trim(),
      business_phone: parseInt(formData.business_phone, 10),
      terms_and_condition: formData.terms_and_condition,
    };

    try {
      setIsSubmitting(true);
      await dispatch(registerVenueOwner(payload)).unwrap();
      setOwnerModal(false);
      navigate("/venue-owner");
    } catch (err) {
      setFormError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived user info ────────────────────────────────────────────────────

  let userInitials = "?";
  let userName = "Account";
  if (isLoggedIn) {
    try {
      const decoded = jwtDecode(token);
      userName = decoded.name || decoded.email?.split("@")[0] || "Account";
      userInitials = userName.slice(0, 2).toUpperCase();
    } catch { /* ignore */ }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div
          style={{ height: "68px" }}
          className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between gap-6"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 12 12">
                <rect x="1" y="1" width="4" height="4" fill="white" />
                <rect x="7" y="1" width="4" height="4" fill="white" opacity=".6" />
                <rect x="1" y="7" width="4" height="4" fill="white" opacity=".6" />
                <rect x="7" y="7" width="4" height="4" fill="white" opacity=".3" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">BookMyVenue</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-8 text-sm text-gray-500">
            <a href="/#venues" className="hover:text-gray-900 transition-colors">Browse</a>
            <a href="/#how" className="hover:text-gray-900 transition-colors">How It Works</a>
          </div>

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <ModeSwitch mode={mode} onChange={handleModeChange} />

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-2 text-sm hover:bg-gray-200 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                      {userInitials}
                    </div>
                    <span className="max-w-[80px] truncate">{userName}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-lg p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                      <p className="font-semibold px-3 py-2 text-sm text-gray-700">{userName}</p>
                      <hr className="my-1 border-gray-100" />
                      <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors" onClick={() => navigate("/bookings")}>My bookings</button>
                      <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors">Saved venues</button>
                      <hr className="my-1 border-gray-100" />
                      <button className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors" onClick={() => dispatch(logout())}>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4">
            <a href="/#venues" className="text-sm text-gray-600 hover:text-gray-900">Browse</a>
            <a href="/#how" className="text-sm text-gray-600 hover:text-gray-900">How It Works</a>

            {isLoggedIn ? (
              <>
                <div className="py-1">
                  <ModeSwitch mode={mode} onChange={handleModeChange} />
                </div>
                <hr className="border-gray-100" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                    {userInitials}
                  </div>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <button className="text-left text-sm text-gray-600 hover:text-gray-900" onClick={() => navigate("/bookings")}>My bookings</button>
                <button className="text-left text-sm text-gray-600 hover:text-gray-900">Saved venues</button>
                <button className="text-left text-sm text-red-500" onClick={() => dispatch(logout())}>Sign out</button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700">
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>


      {/* ═══════════════ OWNER REGISTRATION MODAL ═══════════════ */}

      {ownerModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOwnerModal(false); }}
        >
          <form
            onSubmit={handleOwnerSubmit}
            className="bg-white rounded-2xl w-full max-w-md p-7 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Register Your Business</h2>
              <button
                type="button"
                onClick={() => setOwnerModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                placeholder="Business Name"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
              />
              <input
                name="business_email"
                type="email"
                value={formData.business_email}
                onChange={handleInputChange}
                placeholder="Business Email"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
              />
              <input
                name="business_phone"
                type="tel"
                value={formData.business_phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, business_phone: val }));
                }}
                placeholder="Business Phone"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
              />
            </div>

            <div className="mt-4">
              <label className="flex gap-2.5 items-center text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="terms_and_condition"
                  checked={formData.terms_and_condition}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-gray-900"
                />
                <span>I accept the terms and conditions</span>
              </label>

              <button
                type="button"
                onClick={() => setReadMore((r) => !r)}
                className="text-blue-500 text-xs mt-2 hover:underline"
              >
                {readMore ? "Show less ↑" : "Read more ↓"}
              </button>

              {readMore && (
                <p className="text-gray-400 text-xs mt-2 leading-relaxed bg-gray-50 rounded-lg p-3">
                  Venue details must be accurate and up to date. All bookings and approvals
                  are managed through BookMyVenue. Misuse may result in account suspension.
                </p>
              )}
            </div>

            {formError && (
              <p className="text-red-500 text-sm mt-3 bg-red-50 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setOwnerModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}