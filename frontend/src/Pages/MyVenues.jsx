import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ── Shared Sidebar (copied from VenueOwner for self-containment) ─────────────
const NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    href: "/venue-owner",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: "venues",
    label: "My Venues",
    href: "/venue-owner/venues",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "bookings",
    label: "Bookings",
    href: "/venue-owner/bookings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "earnings",
    label: "Earnings",
    href: "/venue-owner/earnings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    key: "settings",
    label: "Settings",
    href: "/venue-owner/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) =>
    href === "/venue-owner"
      ? location.pathname === "/venue-owner"
      : location.pathname.startsWith(href);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-14 flex items-center px-4 justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 12 12">
              <rect x="1" y="1" width="4" height="4" fill="white" />
              <rect x="7" y="1" width="4" height="4" fill="white" opacity=".6" />
              <rect x="1" y="7" width="4" height="4" fill="white" opacity=".6" />
              <rect x="7" y="7" width="4" height="4" fill="white" opacity=".3" />
            </svg>
          </div>
          <span className="font-bold text-sm text-gray-900">BookMyVenue</span>
        </Link>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
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
        </div>

        <div className="px-6 pt-5 pb-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Owner Portal</p>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to marketplace
          </Link>
          <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Indian States & Districts (abridged for UX) ──────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
];

// ── Field component ──────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${className}`}
      {...props}
    />
  );
}

function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      rows={3}
      className={`w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none ${className}`}
      {...props}
    />
  );
}

// ── Add Venue Modal ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  description: "",
  state: "",
  district: "",
  city: "",
  address_line: "",
  max_capacity: "",
  price_per_hour: "",
  price_per_day: "",
};

function AddVenueModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1 = basic info, 2 = location, 3 = pricing

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.state) e.state = "Select a state";
    if (!form.district.trim()) e.district = "District is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.address_line.trim()) e.address_line = "Address is required";
    if (!form.max_capacity || isNaN(form.max_capacity) || Number(form.max_capacity) < 1)
      e.max_capacity = "Enter a valid capacity";
    if (!form.price_per_hour || isNaN(form.price_per_hour) || Number(form.price_per_hour) < 1)
      e.price_per_hour = "Enter a valid hourly rate";
    if (!form.price_per_day || isNaN(form.price_per_day) || Number(form.price_per_day) < 1)
      e.price_per_day = "Enter a valid daily rate";
    return e;
  };

  const handleNext = () => {
    const e = validate();
    const step1Fields = ["name", "description"];
    const step2Fields = ["state", "district", "city", "address_line"];
    const relevantErrors =
      step === 1
        ? Object.fromEntries(Object.entries(e).filter(([k]) => step1Fields.includes(k)))
        : step === 2
        ? Object.fromEntries(Object.entries(e).filter(([k]) => step2Fields.includes(k)))
        : e;

    if (Object.keys(relevantErrors).length > 0) {
      setErrors(relevantErrors);
      return;
    }
    setErrors({});
    if (step < 3) setStep((s) => s + 1);
    else {
      onSave({
        ...form,
        max_capacity: Number(form.max_capacity),
        price_per_hour: Number(form.price_per_hour),
        price_per_day: Number(form.price_per_day),
        status: "Draft",
        id: Date.now(),
      });
    }
  };

  const steps = ["Basic Info", "Location", "Pricing"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Add a new venue</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 3 — {steps[step - 1]}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 pt-4 gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full transition-colors duration-300 ${i + 1 <= step ? "bg-gray-900" : "bg-gray-100"}`} />
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <>
              <Field label="Venue Name" error={errors.name}>
                <Input
                  placeholder="e.g. The Garden Hall"
                  value={form.name}
                  onChange={set("name")}
                />
              </Field>
              <Field label="Description" error={errors.description}>
                <Textarea
                  placeholder="Describe your venue — what makes it special, what events it suits..."
                  value={form.description}
                  onChange={set("description")}
                />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="State" error={errors.state}>
                <Select value={form.state} onChange={set("state")}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="District" error={errors.district}>
                  <Input
                    placeholder="e.g. Ernakulam"
                    value={form.district}
                    onChange={set("district")}
                  />
                </Field>
                <Field label="City / Town" error={errors.city}>
                  <Input
                    placeholder="e.g. Kochi"
                    value={form.city}
                    onChange={set("city")}
                  />
                </Field>
              </div>
              <Field label="Address Line" error={errors.address_line}>
                <Input
                  placeholder="Street, landmark, area..."
                  value={form.address_line}
                  onChange={set("address_line")}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Max Capacity (persons)" error={errors.max_capacity}>
                <Input
                  type="number"
                  placeholder="e.g. 200"
                  min="1"
                  value={form.max_capacity}
                  onChange={set("max_capacity")}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price per Hour (₹)" error={errors.price_per_hour}>
                  <Input
                    type="number"
                    placeholder="e.g. 2000"
                    min="1"
                    value={form.price_per_hour}
                    onChange={set("price_per_hour")}
                  />
                </Field>
                <Field label="Price per Day (₹)" error={errors.price_per_day}>
                  <Input
                    type="number"
                    placeholder="e.g. 15000"
                    min="1"
                    value={form.price_per_day}
                    onChange={set("price_per_day")}
                  />
                </Field>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mt-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Summary</p>
                <p className="text-sm font-medium text-gray-900">{form.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{form.city}, {form.state}</p>
                <p className="text-xs text-gray-400">{form.address_line}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          {step > 1 ? (
            <button
              onClick={() => { setErrors({}); setStep((s) => s - 1); }}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleNext}
            className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
          >
            {step < 3 ? "Continue →" : "Save Venue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Venue Card ───────────────────────────────────────────────────────────────
function VenueCard({ venue, onDelete }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/venue-owner/venues/${venue.id}`)}
    >
      {/* Placeholder image / icon block */}
      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {venue.city}, {venue.district}, {venue.state}
          </p>
        </div>
        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
          venue.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
        }`}>
          {venue.status}
        </span>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{venue.description}</p>

      <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span>Up to {venue.max_capacity}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          <span>₹{venue.price_per_hour.toLocaleString("en-IN")}/hr</span>
        </div>
        <div className="ml-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(venue.id); }}
            className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">No venues yet</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Add your first venue to start accepting bookings on BookMyVenue.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add your first venue
      </button>
    </div>
  );
}

// ── MyVenues Page ────────────────────────────────────────────────────────────
const DEMO_VENUES = [
  {
    id: 1,
    name: "The Garden Hall",
    description: "A lush, open-air event hall surrounded by greenery. Perfect for weddings, receptions, and large corporate gatherings.",
    state: "Kerala",
    district: "Ernakulam",
    city: "Kochi",
    address_line: "Near Marine Drive, MG Road",
    max_capacity: 300,
    price_per_hour: 8000,
    price_per_day: 55000,
    status: "Active",
  },
  {
    id: 2,
    name: "Rooftop Lounge",
    description: "A stunning rooftop space with panoramic city views. Ideal for cocktail parties, product launches, and intimate gatherings.",
    state: "Kerala",
    district: "Thiruvananthapuram",
    city: "Trivandrum",
    address_line: "5th Floor, Technopark Rd",
    max_capacity: 80,
    price_per_hour: 5500,
    price_per_day: 38000,
    status: "Active",
  },
  {
    id: 3,
    name: "Conference Suite A",
    description: "A fully equipped modern conference room with AV facilities, whiteboard walls, and ergonomic seating.",
    state: "Kerala",
    district: "Kozhikode",
    city: "Calicut",
    address_line: "Business Tower, Mavoor Rd",
    max_capacity: 30,
    price_per_hour: 2000,
    price_per_day: 14000,
    status: "Draft",
  },
];

export default function MyVenues() {
  const [venues, setVenues] = useState(DEMO_VENUES);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const handleSave = (venue) => {
    setVenues((v) => [...v, venue]);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setVenues((v) => v.filter((vn) => vn.id !== id));
  };

  const filtered = venues.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || v.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {showModal && (
        <AddVenueModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

      <main className="lg:pl-64 pt-14 lg:pt-0">
        {/* Top bar */}
        <div className="sticky top-14 lg:top-0 z-30 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400 hidden sm:block font-medium tracking-wide uppercase">Owner Portal</p>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Venues</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {venues.length} {venues.length === 1 ? "venue" : "venues"} ·{" "}
                {venues.filter((v) => v.status === "Active").length} active
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Venue
            </button>
          </div>

          {/* Filters */}
          {venues.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>
              <div className="flex gap-2">
                {["All", "Active", "Draft"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === f
                        ? "bg-gray-900 text-white"
                        : "bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid */}
          {venues.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">No venues match your search.</p>
              <button onClick={() => { setSearch(""); setFilter("All"); }} className="mt-2 text-sm text-gray-900 font-medium hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((venue) => (
                <VenueCard key={venue.id} venue={venue} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}