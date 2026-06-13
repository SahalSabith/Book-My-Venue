import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { listBookings } from "../Redux/Slice/bookingSlice";
import { userVenueDetail } from "../Redux/Slice/venueSlice";
import Header from "../Components/Header";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const STATUS_META = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-400",   bar: "bg-amber-400" },
  confirmed: { label: "Confirmed", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", bar: "bg-emerald-400" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600 border-red-200",             dot: "bg-red-400",     bar: "bg-red-400" },
  completed: { label: "Completed", cls: "bg-sky-100 text-sky-700 border-sky-200",             dot: "bg-sky-400",     bar: "bg-sky-400" },
};

const statusMeta = (s) =>
  STATUS_META[s?.toLowerCase()] ?? { label: s ?? "Unknown", cls: "bg-zinc-100 text-zinc-500 border-zinc-200", dot: "bg-zinc-300", bar: "bg-zinc-200" };

const FILTERS = ["All", "Pending", "Confirmed", "Cancelled", "Completed"];

// ─── Small components ─────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const { label, cls, dot } = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function InfoChip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-100 text-xs text-zinc-500 font-medium">
      <span>{icon}</span><span>{label}</span>
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
      <span className="text-xs text-zinc-800 font-semibold text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

// ─── Venue Drawer ─────────────────────────────────────────────────────────────

function VenueDrawer({ venueId, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // LOCAL loading/error state — keeps drawer state isolated from the page
  const [drawerLoading, setDrawerLoading] = useState(true);
  const [drawerError, setDrawerError] = useState(null);
  const [venueData, setVenueData] = useState(null);

  useEffect(() => {
    if (!venueId) return;
    setDrawerLoading(true);
    setDrawerError(null);
    setVenueData(null);

    dispatch(userVenueDetail(venueId))
      .unwrap()
      .then((data) => {
        // slice returns action.payload.venue → unwrap gives us { venue: {...} }
        setVenueData(data.venue ?? data);
        setDrawerLoading(false);
      })
      .catch((err) => {
        setDrawerError(typeof err === "string" ? err : "Failed to load venue.");
        setDrawerLoading(false);
      });
  }, [venueId, dispatch]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
          <div>
            <p className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">Venue #{venueId}</p>
            <h2 className="text-base font-bold text-zinc-900 mt-0.5">
              {drawerLoading ? "Loading…" : (venueData?.name ?? "Venue details")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {venueData && (
              <button
                onClick={() => navigate(`/venue/${venueId}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-700 transition-colors"
              >
                Open page
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 text-zinc-400 transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {drawerLoading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-7 h-7 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-400">Fetching venue…</p>
            </div>
          )}

          {!drawerLoading && drawerError && (
            <div className="m-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              {drawerError}
            </div>
          )}

          {!drawerLoading && !drawerError && venueData && (
            <>
              {venueData.images ? (
                <div className="h-44 bg-zinc-100 overflow-hidden shrink-0">
                  <img src={venueData.images} alt={venueData.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <span className="text-4xl">🏛</span>
                </div>
              )}

              <div className="p-5 space-y-5">

                {/* Name + location */}
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">{venueData.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    {[venueData.address_line, venueData.city, venueData.district, venueData.state].filter(Boolean).join(", ")}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: "👥", label: "Capacity", value: `${venueData.max_capacity} pax` },
                    { icon: "📅", label: "Per day",  value: `₹${venueData.price_per_day?.toLocaleString()}` },
                    { icon: "⏱", label: "Per hour", value: `₹${venueData.price_per_hour?.toLocaleString()}` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-zinc-50 rounded-xl p-3 text-center">
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">{label}</div>
                      <div className="text-xs font-bold text-zinc-900 mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {venueData.description && (
                  <div>
                    <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mb-1.5">About</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{venueData.description}</p>
                  </div>
                )}

                {/* Location */}
                <div>
                  <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mb-1.5">Location</p>
                  <div className="bg-zinc-50 rounded-xl p-4 text-sm space-y-1">
                    {venueData.address_line && <p className="text-zinc-700">{venueData.address_line}</p>}
                    <p className="text-zinc-500">{[venueData.city, venueData.district].filter(Boolean).join(", ")}</p>
                    {venueData.state && <p className="text-zinc-500">{venueData.state}</p>}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mb-1.5">Pricing</p>
                  <div className="bg-zinc-50 rounded-xl divide-y divide-zinc-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-zinc-500">Per day</span>
                      <span className="text-sm font-bold text-zinc-900">₹{venueData.price_per_day?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-zinc-500">Per hour</span>
                      <span className="text-sm font-bold text-zinc-900">₹{venueData.price_per_hour?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-zinc-500">Max capacity</span>
                      <span className="text-sm font-bold text-zinc-900">{venueData.max_capacity?.toLocaleString()} people</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate(`/venue/${venueId}`)}
                  className="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  View full page
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, expanded, onToggleExpand, onViewVenue }) {
  const isDay = booking.booking_type?.toLowerCase() === "day";
  const { bar } = statusMeta(booking.booking_status);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">

      <div className={`h-1 w-full ${bar}`} />

      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase mb-1">
            Booking #{booking.id}
          </p>
          <h3 className="text-base font-semibold text-zinc-900 leading-snug truncate">
            {booking.purpose_of_event || "Event"}
          </h3>
        </div>
        <StatusBadge status={booking.booking_status} />
      </div>

      {isDay ? (
        <div className="mx-5 mb-3 flex items-center gap-2 bg-zinc-50 rounded-xl px-4 py-3">
          <div className="text-center min-w-0 flex-1">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">From</p>
            <p className="text-sm font-semibold text-zinc-800">{fmt(booking.from_date)}</p>
          </div>
          <div className="flex flex-col items-center gap-0.5 px-1">
            <div className="w-5 h-px bg-zinc-300" />
            <span className="text-[9px] text-zinc-300 font-bold tracking-widest">TO</span>
            <div className="w-5 h-px bg-zinc-300" />
          </div>
          <div className="text-center min-w-0 flex-1">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">To</p>
            <p className="text-sm font-semibold text-zinc-800">{fmt(booking.to_date)}</p>
          </div>
        </div>
      ) : (
        <div className="mx-5 mb-3 bg-zinc-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Day</p>
            <p className="text-sm font-semibold text-zinc-800">{fmt(booking.from_date)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">Time</p>
            <p className="text-sm font-semibold text-zinc-800">
              {fmtTime(booking.starting_time)} – {fmtTime(booking.ending_time)}
            </p>
          </div>
        </div>
      )}

      <div className="px-5 pb-4 flex flex-wrap gap-2">
        <InfoChip icon="👥" label={`${booking.no_of_guests} guests`} />
        <InfoChip icon={isDay ? "📅" : "⏱"} label={isDay ? "Daily" : "Hourly"} />
      </div>

      {expanded && (
        <div className="mx-5 mb-4 rounded-xl border border-zinc-100 overflow-hidden divide-y divide-zinc-100">
          <DetailRow label="Booking type" value={booking.booking_type} />
          <DetailRow label="Guests" value={`${booking.no_of_guests} people`} />
          {isDay ? (
            <>
              <DetailRow label="From" value={fmt(booking.from_date)} />
              <DetailRow label="To" value={fmt(booking.to_date)} />
            </>
          ) : (
            <>
              <DetailRow label="Day" value={fmt(booking.from_date)} />
              <DetailRow label="Start time" value={fmtTime(booking.starting_time)} />
              <DetailRow label="End time" value={fmtTime(booking.ending_time)} />
            </>
          )}
          <DetailRow label="Purpose" value={booking.purpose_of_event} />
          <DetailRow label="Booked on" value={fmt(booking.created_at)} />
        </div>
      )}

      <div className="mt-auto border-t border-zinc-100 grid grid-cols-2 divide-x divide-zinc-100">
        <button
          onClick={() => onToggleExpand(booking.id)}
          className="flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? "Hide details" : "Details"}
        </button>

        <button
          onClick={() => onViewVenue(booking.venue_id)}
          className="flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-semibold text-zinc-900 bg-zinc-50 hover:bg-zinc-900 hover:text-white transition-all duration-150 group"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          View Venue
          <svg
            className="w-3 h-3 -ml-0.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden animate-pulse flex flex-col">
      <div className="h-1 bg-zinc-100" />
      <div className="p-5 pb-4 flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-zinc-100 rounded" />
          <div className="h-4 w-36 bg-zinc-100 rounded" />
        </div>
        <div className="h-6 w-20 bg-zinc-100 rounded-full" />
      </div>
      <div className="mx-5 mb-3 h-16 bg-zinc-50 rounded-xl" />
      <div className="px-5 pb-4 flex gap-2">
        <div className="h-7 w-24 bg-zinc-100 rounded-lg" />
        <div className="h-7 w-16 bg-zinc-100 rounded-lg" />
      </div>
      <div className="mt-auto border-t border-zinc-100 grid grid-cols-2 divide-x divide-zinc-100">
        <div className="h-12 bg-zinc-50" />
        <div className="h-12 bg-zinc-100" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4 text-3xl">📅</div>
      <h3 className="text-base font-semibold text-zinc-700 mb-1">
        {filter === "All" ? "No bookings yet" : `No ${filter.toLowerCase()} bookings`}
      </h3>
      <p className="text-sm text-zinc-400 max-w-xs">
        {filter === "All"
          ? "Once you book a venue, it'll show up here."
          : `You don't have any ${filter.toLowerCase()} bookings right now.`}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const dispatch = useDispatch();

  // Only read bookings from Redux — NOT venue loading state
  const { bookings = [], loading, error } = useSelector((state) => state.bookings);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [venueDrawerId, setVenueDrawerId] = useState(null);

  useEffect(() => { dispatch(listBookings()); }, [dispatch]);

  const handleToggleExpand = useCallback((bookingId) => {
    const id = String(bookingId);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleViewVenue = useCallback((venueId) => {
    setVenueDrawerId(venueId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setVenueDrawerId(null);
  }, []);

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === "All" || b.booking_status?.toLowerCase() === filter.toLowerCase();
    const matchSearch =
      !search ||
      b.purpose_of_event?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.venue_id).includes(search) ||
      String(b.id).includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event or venue…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all border
                  ${filter === f
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-800"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" />
            </svg>
            <span>{typeof error === "string" ? error : "Failed to load bookings."}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                expanded={expandedId === String(b.id)}
                onToggleExpand={handleToggleExpand}
                onViewVenue={handleViewVenue}
              />
            ))}
          </div>
        )}
      </main>

      {venueDrawerId !== null && (
        <VenueDrawer venueId={venueDrawerId} onClose={handleCloseDrawer} />
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </div>
  );
}