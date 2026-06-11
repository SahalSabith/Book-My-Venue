import { useState, useEffect,useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createVenue, getVenues, deleteVenue,uploadVenueImage } from "../Redux/Slice/venueSlice";
import VenueOwnerSidebar from "../Components/VenueOwnerSidebar";

// ── Mode Switch ──────────────────────────────────────────────────────────────
function ModeSwitch({ onChange }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1 font-medium select-none">
      <button
        onClick={() => onChange("book")}
        className="flex-1 px-4 py-1.5 rounded-full text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 whitespace-nowrap"
      >
        Book a Venue
      </button>
      <button
        onClick={() => onChange("rent")}
        className="flex-1 px-4 py-1.5 rounded-full text-sm bg-white text-gray-900 shadow-sm transition-all duration-200 whitespace-nowrap"
      >
        List My Venue
      </button>
    </div>
  );
}

// ── Indian States ────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
];

// ── Field / Input / Select / Textarea helpers ────────────────────────────────
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

function SelectInput({ children, className = "", ...props }) {
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
  name: "", description: "", state: "", district: "",
  city: "", address_line: "", max_capacity: "", price_per_hour: "", price_per_day: "",
};

function AddVenueModal({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [step, setStep]     = useState(1);
  const [images, setImages] = useState([]); // File[]
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const totalSize = images.reduce((sum, f) => sum + f.size, 0);

  const handleImageAdd = (e) => {
    const incoming = Array.from(e.target.files || []);
    e.target.value = "";
    const combined = [...images, ...incoming];
    const newTotal = combined.reduce((sum, f) => sum + f.size, 0);
    if (newTotal > MAX_TOTAL_BYTES) {
      setImageError("Total size exceeds 20 MB. Remove some images first.");
      return;
    }
    setImageError("");
    setImages(combined);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name         = "Name is required";
    if (!form.description.trim())  e.description  = "Description is required";
    if (!form.state)               e.state        = "Select a state";
    if (!form.district.trim())     e.district     = "District is required";
    if (!form.city.trim())         e.city         = "City is required";
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
    const step3Fields = ["max_capacity", "price_per_hour", "price_per_day"];
    const relevantErrors =
      step === 1 ? Object.fromEntries(Object.entries(e).filter(([k]) => step1Fields.includes(k)))
      : step === 2 ? Object.fromEntries(Object.entries(e).filter(([k]) => step2Fields.includes(k)))
      : step === 3 ? Object.fromEntries(Object.entries(e).filter(([k]) => step3Fields.includes(k)))
      : {};

    if (Object.keys(relevantErrors).length > 0) { setErrors(relevantErrors); return; }
    setErrors({});
    if (step < 4) { setStep((s) => s + 1); return; }

    // Step 4: create venue → upload images with returned ID
    dispatch(createVenue({
      ...form,
      max_capacity:   Number(form.max_capacity),
      price_per_hour: Number(form.price_per_hour),
      price_per_day:  Number(form.price_per_day),
    })).then((action) => {
      const venueId = action.payload?.id; // adjust to your payload shape
      if (venueId && images.length > 0) {
        const fd = new FormData();
        images.forEach((img) => fd.append("venue_images", img));
        dispatch(uploadVenueImage({ venueId, formData: fd })).finally(() => {
          dispatch(getVenues());
          onClose();
        });
      } else {
        dispatch(getVenues());
        onClose();
      }
    });
  };

  const steps = ["Basic Info", "Location", "Pricing", "Photos"];
  const usedMB  = (totalSize / (1024 * 1024)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Add a new venue</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 4 — {steps[step - 1]}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Step bar */}
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
                <Input placeholder="e.g. The Garden Hall" value={form.name} onChange={set("name")} />
              </Field>
              <Field label="Description" error={errors.description}>
                <Textarea placeholder="Describe your venue — what makes it special, what events it suits..." value={form.description} onChange={set("description")} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="State" error={errors.state}>
                <SelectInput value={form.state} onChange={set("state")}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="District" error={errors.district}>
                  <Input placeholder="e.g. Ernakulam" value={form.district} onChange={set("district")} />
                </Field>
                <Field label="City / Town" error={errors.city}>
                  <Input placeholder="e.g. Kochi" value={form.city} onChange={set("city")} />
                </Field>
              </div>
              <Field label="Address Line" error={errors.address_line}>
                <Input placeholder="Street, landmark, area..." value={form.address_line} onChange={set("address_line")} />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Max Capacity (persons)" error={errors.max_capacity}>
                <Input type="number" placeholder="e.g. 200" min="1" value={form.max_capacity} onChange={set("max_capacity")} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price per Hour (₹)" error={errors.price_per_hour}>
                  <Input type="number" placeholder="e.g. 2000" min="1" value={form.price_per_hour} onChange={set("price_per_hour")} />
                </Field>
                <Field label="Price per Day (₹)" error={errors.price_per_day}>
                  <Input type="number" placeholder="e.g. 15000" min="1" value={form.price_per_day} onChange={set("price_per_day")} />
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

          {step === 4 && (
            <>
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dt = e.dataTransfer;
                  handleImageAdd({ target: { files: dt.files }, preventDefault: () => {} });
                }}
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 px-4 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p className="text-sm font-medium text-gray-700">Click or drag photos here</p>
                <p className="text-xs text-gray-400">JPEG, PNG, WEBP · 20 MB total max</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageAdd}
              />

              {/* Error */}
              {imageError && (
                <p className="text-xs text-red-500">{imageError}</p>
              )}

              {/* Usage bar */}
              {images.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{images.length} photo{images.length !== 1 ? "s" : ""}</span>
                    <span>{usedMB} / 20 MB</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((totalSize / MAX_TOTAL_BYTES) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={url} onLoad={() => URL.revokeObjectURL(url)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded-md">
                            Cover
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {images.length === 0 && (
                <p className="text-xs text-gray-400 text-center">
                  No photos yet — you can also skip and add them later.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          {step > 1 ? (
            <button onClick={() => { setErrors({}); setStep((s) => s - 1); }} className="text-sm text-gray-500 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              ← Back
            </button>
          ) : (
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          )}
          <button onClick={handleNext} className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
            {step < 4 ? "Continue →" : images.length > 0 ? "Save Venue & Upload Photos" : "Save Venue"}
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
      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <img src={venue.images[0]} className="h-44 w-full object-cover" alt={venue.name}/>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{venue.city}, {venue.district}, {venue.state}</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{venue.description}</p>

      <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span>Up to {venue.max_capacity}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
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
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add your first venue
      </button>
    </div>
  );
}

// ── MyVenues Page ────────────────────────────────────────────────────────────
export default function MyVenues() {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const { ownerVenues }      = useSelector((state) => state.venue);

  const [showModal, setShowModal] = useState(false);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("All");

  useEffect(() => {
    dispatch(getVenues());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteVenue(id)).then(() => dispatch(getVenues()));
  };

  const handleModeChange = (value) => {
    if (value === "book") navigate("/");
  };

  const filtered = ownerVenues.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || v.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <VenueOwnerSidebar />

      {showModal && <AddVenueModal onClose={() => setShowModal(false)} />}

      <main className="lg:pl-64 pt-14 lg:pt-0">
        {/* Top bar */}
        <div className="sticky top-14 lg:top-0 z-30 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400 hidden sm:block font-medium tracking-wide uppercase">Owner Portal</p>
          <div className="ml-auto">
            <ModeSwitch onChange={handleModeChange} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Venues</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {ownerVenues.length} {ownerVenues.length === 1 ? "venue" : "venues"}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Venue
            </button>
          </div>

          {/* Filters */}
          {ownerVenues.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
          {ownerVenues.length === 0 ? (
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