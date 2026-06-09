import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ── Mode Switch (mirrors the one in Header, used in the owner top bar) ───────
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

// ── Sidebar (inline so the file is self-contained) ──────────────────────────
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
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
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
      {/* Mobile top bar */}
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

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
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

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent }) {
  const accents = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Recent Booking Row ───────────────────────────────────────────────────────
function BookingRow({ venue, guest, date, amount, status }) {
  const statusStyles = {
    Confirmed: "bg-green-50 text-green-700",
    Pending: "bg-amber-50 text-amber-700",
    Cancelled: "bg-red-50 text-red-600",
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
        {guest[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{guest}</p>
        <p className="text-xs text-gray-400 truncate">{venue} · {date}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-900">{amount}</p>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function VenueOwner() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const handleModeChange = (value) => {
    if (value === "book") navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Page content — offset for sidebar */}
      <main className="lg:pl-64 pt-14 lg:pt-0">

        {/* ── Owner top bar with mode switch ── */}
        <div className="sticky top-14 lg:top-0 z-30 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400 hidden sm:block font-medium tracking-wide uppercase">Owner Portal</p>
          <div className="ml-auto">
            <ModeSwitch onChange={handleModeChange} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">{today}</p>
              <h1 className="text-2xl font-bold text-gray-900">Good morning, Alex 👋</h1>
              <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your venues today.</p>
            </div>
            <Link
              to="/venue-owner/venues/new"
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Venue
            </Link>
          </div>

          {/* ── Status banner ── */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Account pending approval.</span> Our team is reviewing your profile. You'll be notified once approved.
            </p>
          </div>

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Venues"
              value="3"
              sub="2 active · 1 draft"
              accent="blue"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
            />
            <StatCard
              label="Bookings"
              value="12"
              sub="3 this week"
              accent="purple"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            />
            <StatCard
              label="Total Earnings"
              value="₹48,500"
              sub="↑ 12% vs last month"
              accent="green"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              }
            />
            <StatCard
              label="Avg. Rating"
              value="4.8"
              sub="from 24 reviews"
              accent="amber"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
            />
          </div>

          {/* ── Two-column section ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Recent bookings */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
                <Link to="/venue-owner/bookings" className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium">
                  View all →
                </Link>
              </div>
              <BookingRow venue="The Garden Hall" guest="Rahul Menon" date="Jun 14" amount="₹8,000" status="Confirmed" />
              <BookingRow venue="Rooftop Lounge" guest="Priya Nair" date="Jun 17" amount="₹5,500" status="Pending" />
              <BookingRow venue="The Garden Hall" guest="Arjun Das" date="Jun 20" amount="₹8,000" status="Confirmed" />
              <BookingRow venue="Rooftop Lounge" guest="Sneha Pillai" date="Jun 22" amount="₹5,500" status="Cancelled" />
              <div className="mt-4 pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 text-center">Showing 4 most recent bookings</p>
              </div>
            </div>

            {/* Quick actions + venue list */}
            <div className="flex flex-col gap-4">

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Add a new venue", href: "/venue-owner/venues/new", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
                    { label: "View all bookings", href: "/venue-owner/bookings", color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
                    { label: "Check earnings", href: "/venue-owner/earnings", color: "text-green-600 bg-green-50 hover:bg-green-100" },
                    { label: "Edit profile", href: "/venue-owner/settings", color: "text-gray-600 bg-gray-50 hover:bg-gray-100" },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      to={a.href}
                      className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${a.color}`}
                    >
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* My venues mini list */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">My Venues</h2>
                  <Link to="/venue-owner/venues" className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium">
                    Manage →
                  </Link>
                </div>
                {[
                  { name: "The Garden Hall", type: "Event Hall", status: "Active" },
                  { name: "Rooftop Lounge", type: "Open Space", status: "Active" },
                  { name: "Conference Suite A", type: "Meeting Room", status: "Draft" },
                ].map((v) => (
                  <div key={v.name} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.type}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${v.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}