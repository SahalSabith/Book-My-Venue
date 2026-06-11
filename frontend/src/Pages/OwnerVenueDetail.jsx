import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { venueDetail, updateVenue } from "../Redux/Slice/venueSlice";
import VenueOwnerSidebar from "../Components/VenueOwnerSidebar";

// ── Detail row ───────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, accent }) {
  const accents = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl p-4 ${accents[accent]}`}>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-75">{label}</p>
    </div>
  );
}

// ── Field component ──────────────────────────────────────────────────────────
function Field({ label, error, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (hasError) =>
  `w-full px-3 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:ring-2 focus:ring-offset-0 ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 bg-white focus:border-gray-400 focus:ring-gray-100"
  }`;

// ── Edit Drawer ──────────────────────────────────────────────────────────────
const FIELDS = [
  { key: "name",           label: "Venue Name",         type: "text",     required: true,  placeholder: "e.g. The Grand Ballroom" },
  { key: "description",   label: "Description",         type: "textarea", required: true,  placeholder: "Describe the venue, amenities, and what makes it unique…" },
  { key: "address_line",  label: "Address",             type: "text",     required: true,  placeholder: "Street address or landmark" },
  { key: "city",          label: "City",                type: "text",     required: true,  placeholder: "e.g. Kochi" },
  { key: "district",      label: "District",            type: "text",     required: true,  placeholder: "e.g. Ernakulam" },
  { key: "state",         label: "State",               type: "text",     required: true,  placeholder: "e.g. Kerala" },
  { key: "max_capacity",  label: "Max Capacity",        type: "number",   required: true,  placeholder: "e.g. 300", hint: "Maximum number of guests allowed." },
  { key: "price_per_hour", label: "Price per Hour (₹)", type: "number",   required: true,  placeholder: "e.g. 8000" },
  { key: "price_per_day",  label: "Price per Day (₹)",  type: "number",   required: true,  placeholder: "e.g. 55000" },
];

function validate(form) {
  const e = {};
  if (!form.name?.trim())         e.name         = "Venue name is required";
  if (!form.description?.trim())  e.description  = "Description is required";
  if (!form.address_line?.trim()) e.address_line = "Address is required";
  if (!form.city?.trim())         e.city         = "City is required";
  if (!form.district?.trim())     e.district     = "District is required";
  if (!form.state?.trim())        e.state        = "State is required";
  if (!form.max_capacity || isNaN(form.max_capacity) || Number(form.max_capacity) < 1)
    e.max_capacity = "Enter a valid capacity (≥ 1)";
  if (!form.price_per_hour || isNaN(form.price_per_hour) || Number(form.price_per_hour) < 1)
    e.price_per_hour = "Enter a valid hourly rate";
  if (!form.price_per_day || isNaN(form.price_per_day) || Number(form.price_per_day) < 1)
    e.price_per_day = "Enter a valid daily rate";
  return e;
}

function EditDrawer({ venue, open, onClose, onSave, saving }) {
  const [form, setForm]       = useState({});
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const drawerRef = useRef(null);

  // Initialise form when venue or open changes
  useEffect(() => {
    if (venue && open) {
      const initial = {};
      FIELDS.forEach(({ key }) => { initial[key] = String(venue[key] ?? ""); });
      setForm(initial);
      setErrors({});
      setTouched({});
    }
  }, [venue, open]);

  // Re-validate only touched fields on every form change
  useEffect(() => {
    if (!open || Object.keys(touched).length === 0) return;
    const allErrors = validate(form);
    const visibleErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([k]) => touched[k])
    );
    setErrors(visibleErrors);
  }, [form, touched, open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  // Compute changed fields: only keys whose trimmed value differs from the original
  const getChangedFields = () => {
    const changed = {};
    FIELDS.forEach(({ key, type }) => {
      const original = String(venue[key] ?? "").trim();
      const current  = (form[key] ?? "").trim();
      // Only include if actually different — empty strings are a valid change
      if (current !== original) {
        changed[key] = type === "number" ? Number(current) : current;
      }
    });
    return changed;
  };

  const changedFields  = venue ? getChangedFields() : {};
  const changedCount   = Object.keys(changedFields).length;
  const hasChanges     = changedCount > 0;

  const handleSubmit = () => {
    // Touch everything to reveal all errors
    const allTouched = {};
    FIELDS.forEach(({ key }) => { allTouched[key] = true; });
    setTouched(allTouched);

    const allErrors = validate(form);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    if (!hasChanges) { onClose(); return; }

    onSave(changedFields);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Edit venue"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Venue</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{venue?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {changedCount} unsaved change{changedCount !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">

            {/* Section: Basic info */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Basic Info</p>
              <div className="flex flex-col gap-4">
                {["name", "description"].map((key) => {
                  const f = FIELDS.find((x) => x.key === key);
                  return (
                    <Field key={key} label={f.label} error={errors[key]} required={f.required} hint={f.hint}>
                      {f.type === "textarea" ? (
                        <textarea
                          rows={4}
                          value={form[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          onBlur={() => handleBlur(key)}
                          placeholder={f.placeholder}
                          className={`${inputCls(!!errors[key])} resize-none`}
                        />
                      ) : (
                        <input
                          type={f.type}
                          value={form[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          onBlur={() => handleBlur(key)}
                          placeholder={f.placeholder}
                          className={inputCls(!!errors[key])}
                        />
                      )}
                    </Field>
                  );
                })}
              </div>
            </div>

            {/* Section: Location */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Location</p>
              <div className="flex flex-col gap-4">
                {["address_line", "city", "district", "state"].map((key) => {
                  const f = FIELDS.find((x) => x.key === key);
                  return (
                    <Field key={key} label={f.label} error={errors[key]} required={f.required}>
                      <input
                        type="text"
                        value={form[key] ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        onBlur={() => handleBlur(key)}
                        placeholder={f.placeholder}
                        className={inputCls(!!errors[key])}
                      />
                    </Field>
                  );
                })}
              </div>
            </div>

            {/* Section: Pricing & capacity */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pricing & Capacity</p>
              <div className="grid grid-cols-2 gap-4">
                {["price_per_hour", "price_per_day"].map((key) => {
                  const f = FIELDS.find((x) => x.key === key);
                  return (
                    <Field key={key} label={f.label} error={errors[key]} required={f.required}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={form[key] ?? ""}
                          onChange={(e) => handleChange(key, e.target.value)}
                          onBlur={() => handleBlur(key)}
                          placeholder={f.placeholder?.replace("e.g. ", "")}
                          className={`${inputCls(!!errors[key])} pl-7`}
                        />
                      </div>
                    </Field>
                  );
                })}
              </div>
              <div className="mt-4">
                {(() => {
                  const f = FIELDS.find((x) => x.key === "max_capacity");
                  return (
                    <Field label={f.label} error={errors.max_capacity} required hint={f.hint}>
                      <input
                        type="number"
                        min="1"
                        value={form.max_capacity ?? ""}
                        onChange={(e) => handleChange("max_capacity", e.target.value)}
                        onBlur={() => handleBlur("max_capacity")}
                        placeholder="e.g. 300"
                        className={inputCls(!!errors.max_capacity)}
                      />
                    </Field>
                  );
                })()}
              </div>
            </div>

            {/* Changed fields summary */}
            {hasChanges && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                <p className="text-xs font-semibold text-amber-700 mb-1.5">Fields being updated</p>
                <ul className="flex flex-wrap gap-1.5">
                  {Object.keys(changedFields).map((k) => (
                    <li key={k} className="text-[11px] font-medium bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full capitalize">
                      {k.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center gap-3 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !hasChanges}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              saving || !hasChanges
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.98]"
            }`}
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  const styles = {
    success: "bg-gray-900 text-white",
    error:   "bg-red-600 text-white",
  };

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-up ${styles[type]}`}>
      {type === "success" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
      {message}
    </div>
  );
}

// ── Mock booking data ────────────────────────────────────────────────────────
const MOCK_BOOKINGS = {
  1: [
    { id: "B001", guest: "Rahul Menon",  date: "Jun 14, 2026", amount: "₹8,000",  status: "Confirmed" },
    { id: "B002", guest: "Arjun Das",    date: "Jun 20, 2026", amount: "₹8,000",  status: "Confirmed" },
    { id: "B003", guest: "Deepa Kumar",  date: "Jun 25, 2026", amount: "₹55,000", status: "Pending"   },
  ],
  2: [
    { id: "B004", guest: "Priya Nair",   date: "Jun 17, 2026", amount: "₹5,500",  status: "Pending"   },
    { id: "B005", guest: "Sneha Pillai", date: "Jun 22, 2026", amount: "₹5,500",  status: "Cancelled" },
  ],
  3: [],
};

// ── VenueDetail Page ─────────────────────────────────────────────────────────
export default function VenueDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();

  const { ownerVenue, updateLoading, updateError } = useSelector((state) => state.venue);

  const bookings = MOCK_BOOKINGS[id] || [];

  const [status,   setStatus]   = useState("Draft");
  const [editOpen, setEditOpen] = useState(false);
  const [toast,    setToast]    = useState(null);

  const statusBadge = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Draft:  "bg-gray-100 text-gray-600 border-gray-200",
  };

  const bookingStatusStyles = {
    Confirmed: "bg-green-50 text-green-700",
    Pending:   "bg-amber-50 text-amber-700",
    Cancelled: "bg-red-50 text-red-600",
  };

  useEffect(() => {
    dispatch(venueDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (ownerVenue?.status) setStatus(ownerVenue.status);
  }, [ownerVenue?.status]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = editOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [editOpen]);

  const handleSave = async (changedFields) => {
    try {
      await dispatch(updateVenue({ id, fields : changedFields })).unwrap();
      dispatch(venueDetail(id));
      setEditOpen(false);
      setToast({ message: "Venue updated successfully.", type: "success" });
    } catch {
      setToast({ message: updateError || "Failed to save changes. Try again.", type: "error" });
    }
  };

  if (!ownerVenue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <VenueOwnerSidebar />
        <main className="lg:pl-64 pt-14 lg:pt-0">
          <div className="flex flex-col items-center justify-center h-[80vh] text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">Venue not found</p>
            <p className="text-sm text-gray-400 mb-6">This venue may have been deleted or doesn't exist.</p>
            <Link to="/venue-owner/venues" className="text-sm font-medium text-gray-900 underline underline-offset-2">
              Back to My Venues
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalEarnings = bookings
    .filter((b) => b.status === "Confirmed")
    .reduce((sum, b) => sum + parseInt(b.amount.replace(/[₹,]/g, ""), 10), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <VenueOwnerSidebar />

      <main className="lg:pl-64 pt-14 lg:pt-0">
        {/* Top bar */}
        <div className="sticky top-14 lg:top-0 z-30 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/venue-owner/venues")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 font-medium transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            My Venues
          </button>
          <span className="text-gray-200">/</span>
          <span className="text-sm text-gray-700 font-medium truncate">{ownerVenue.name}</span>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Hero block ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <img src={ownerVenue.images} className="h-44 w-full object-cover" alt={ownerVenue.name}/>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{ownerVenue.name}</h1>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge[status]}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {ownerVenue.address_line}, {ownerVenue.city}, {ownerVenue.district}, {ownerVenue.state}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 leading-relaxed">{ownerVenue.description}</p>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left: details */}
            <div className="lg:col-span-1 flex flex-col gap-5">
              <div className="grid grid-cols-3 gap-3">
                <StatPill label="Bookings" value={bookings.length}                                   accent="purple" />
                <StatPill label="Capacity" value={ownerVenue.max_capacity}                                accent="blue"   />
                <StatPill label="Earned"   value={`₹${(totalEarnings / 1000).toFixed(0)}k`}          accent="green"  />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-900">Venue Details</h2>
                  <button
                    onClick={() => setEditOpen(true)}
                    className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                </div>

                <DetailRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                  label="Location"
                  value={`${ownerVenue.city}, ${ownerVenue.district}`}
                />
                <DetailRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
                  label="Max Capacity"
                  value={`${ownerVenue.max_capacity} persons`}
                />
                <DetailRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
                  label="Price per Hour"
                  value={`₹${ownerVenue.price_per_hour.toLocaleString("en-IN")}`}
                />
                <DetailRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                  label="Price per Day"
                  value={`₹${ownerVenue.price_per_day.toLocaleString("en-IN")}`}
                />
              </div>
            </div>

            {/* Right: bookings */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Bookings for this venue</h2>
                <Link to="/venue-owner/bookings" className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium">
                  View all →
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">No bookings yet for this venue.</p>
                  {status === "Draft" && (
                    <p className="text-xs text-amber-500 mt-1">Set this venue to Active to start receiving bookings.</p>
                  )}
                </div>
              ) : (
                <div>
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                        {b.guest[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{b.guest}</p>
                        <p className="text-xs text-gray-400">{b.date} · {b.id}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{b.amount}</p>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${bookingStatusStyles[b.status]}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 text-center mt-4 pt-3 border-t border-gray-50">
                    {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Edit Drawer */}
      <EditDrawer
        venue={ownerVenue}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        saving={updateLoading}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-up { animation: fade-up 0.2s ease-out both; }
      `}</style>
    </div>
  );
}