import { useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";

// ── Sidebar (same as other pages) ───────────────────────────────────────────
const NAV_ITEMS = [
  {
    key: "overview", label: "Overview", href: "/venue-owner",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>),
  },
  {
    key: "venues", label: "My Venues", href: "/venue-owner/venues",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>),
  },
  {
    key: "bookings", label: "Bookings", href: "/venue-owner/bookings",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
  },
  {
    key: "earnings", label: "Earnings", href: "/venue-owner/earnings",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>),
  },
  {
    key: "settings", label: "Settings", href: "/venue-owner/settings",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>),
  },
];

function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href) =>
    href === "/venue-owner" ? location.pathname === "/venue-owner" : location.pathname.startsWith(href);

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
        <button onClick={() => setMobileOpen((o) => !o)} className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle sidebar">
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMobileOpen(false)} />}
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
            <Link key={item.key} to={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${isActive(item.href) ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to marketplace
          </Link>
          <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

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

// ── Mock booking data for the venue ─────────────────────────────────────────
const MOCK_BOOKINGS = {
  1: [
    { id: "B001", guest: "Rahul Menon", date: "Jun 14, 2026", amount: "₹8,000", status: "Confirmed" },
    { id: "B002", guest: "Arjun Das", date: "Jun 20, 2026", amount: "₹8,000", status: "Confirmed" },
    { id: "B003", guest: "Deepa Kumar", date: "Jun 25, 2026", amount: "₹55,000", status: "Pending" },
  ],
  2: [
    { id: "B004", guest: "Priya Nair", date: "Jun 17, 2026", amount: "₹5,500", status: "Pending" },
    { id: "B005", guest: "Sneha Pillai", date: "Jun 22, 2026", amount: "₹5,500", status: "Cancelled" },
  ],
  3: [],
};

// ── Mock venues (match MyVenues.jsx) ────────────────────────────────────────
const VENUES = {
  1: {
    id: 1, name: "The Garden Hall", description: "A lush, open-air event hall surrounded by greenery. Perfect for weddings, receptions, and large corporate gatherings. Features state-of-the-art sound equipment, a dedicated catering area, and ample parking for 150 vehicles.",
    state: "Kerala", district: "Ernakulam", city: "Kochi", address_line: "Near Marine Drive, MG Road",
    max_capacity: 300, price_per_hour: 8000, price_per_day: 55000, status: "Active",
  },
  2: {
    id: 2, name: "Rooftop Lounge", description: "A stunning rooftop space with panoramic city views. Ideal for cocktail parties, product launches, and intimate gatherings. Equipped with ambient lighting, a small bar counter, and open-sky seating.",
    state: "Kerala", district: "Thiruvananthapuram", city: "Trivandrum", address_line: "5th Floor, Technopark Rd",
    max_capacity: 80, price_per_hour: 5500, price_per_day: 38000, status: "Active",
  },
  3: {
    id: 3, name: "Conference Suite A", description: "A fully equipped modern conference room with AV facilities, whiteboard walls, and ergonomic seating. High-speed Wi-Fi, projector, and video conferencing setup included.",
    state: "Kerala", district: "Kozhikode", city: "Calicut", address_line: "Business Tower, Mavoor Rd",
    max_capacity: 30, price_per_hour: 2000, price_per_day: 14000, status: "Draft",
  },
};

// ── VenueDetail Page ─────────────────────────────────────────────────────────
export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const venue = VENUES[id];
  const bookings = MOCK_BOOKINGS[id] || [];

  const [status, setStatus] = useState(venue?.status || "Draft");

  const statusBadge = {
    Active: "bg-green-50 text-green-700 border-green-200",
    Draft: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const bookingStatusStyles = {
    Confirmed: "bg-green-50 text-green-700",
    Pending: "bg-amber-50 text-amber-700",
    Cancelled: "bg-red-50 text-red-600",
  };

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
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
    .reduce((sum, b) => sum + parseInt(b.amount.replace(/[₹,]/g, "")), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

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
          <span className="text-sm text-gray-700 font-medium truncate">{venue.name}</span>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Hero block ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            {/* Cover */}
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge[status]}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {venue.address_line}, {venue.city}, {venue.district}, {venue.state}
                  </p>
                </div>

                {/* Status toggle */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setStatus((s) => s === "Active" ? "Draft" : "Active")}
                    className={`text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${
                      status === "Active"
                        ? "border-red-200 text-red-500 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {status === "Active" ? "Set to Draft" : "Set to Active"}
                  </button>
                  <button className="text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 leading-relaxed">{venue.description}</p>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left: details */}
            <div className="lg:col-span-1 flex flex-col gap-5">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatPill label="Bookings" value={bookings.length} accent="purple" />
                <StatPill label="Capacity" value={venue.max_capacity} accent="blue" />
                <StatPill
                  label="Earned"
                  value={`₹${(totalEarnings / 1000).toFixed(0)}k`}
                  accent="green"
                />
              </div>

              {/* Venue info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-2">Venue Details</h2>

                <DetailRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                  label="Location"
                  value={`${venue.city}, ${venue.district}`}
                />
                <DetailRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
                  label="Max Capacity"
                  value={`${venue.max_capacity} persons`}
                />
                <DetailRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
                  label="Price per Hour"
                  value={`₹${venue.price_per_hour.toLocaleString("en-IN")}`}
                />
                <DetailRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                  label="Price per Day"
                  value={`₹${venue.price_per_day.toLocaleString("en-IN")}`}
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
    </div>
  );
}