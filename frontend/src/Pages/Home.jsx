import { useState } from "react";
import { Link } from "react-router-dom";

const venues = [
  {
    id: 1,
    name: "The Grand Atrium",
    type: "Auditorium",
    location: "Thiruvananthapuram",
    price: "₹8,500/hr",
    capacity: "500 guests",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  },
  {
    id: 2,
    name: "Brew & Co. Café",
    type: "Café Space",
    location: "Kochi",
    price: "₹1,200/hr",
    capacity: "30 guests",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  },
  {
    id: 3,
    name: "Canvas Studio",
    type: "Creative Studio",
    location: "Kozhikode",
    price: "₹2,500/hr",
    capacity: "20 guests",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  },
  {
    id: 4,
    name: "Skyline Rooftop",
    type: "Open Space",
    location: "Kochi",
    price: "₹4,000/hr",
    capacity: "80 guests",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
  },
  {
    id: 5,
    name: "Heritage Banquet",
    type: "Banquet Hall",
    location: "Thrissur",
    price: "₹12,000/hr",
    capacity: "300 guests",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0e0d] font-sans">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0e0d]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#f5a623] flex items-center justify-center shadow-lg shadow-[#f5a623]/30">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" stroke="#0f0e0d" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M7 1v12M1 4l6 3 6-3" stroke="#0f0e0d" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-white font-bold text-base tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
              BookMy<span className="text-[#f5a623]">Venue</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            <a href="#venues" className="text-white/50 hover:text-white text-sm transition-colors">Browse</a>
            <a href="#how" className="text-white/50 hover:text-white text-sm transition-colors">How It Works</a>
            <a href="#contact" className="text-white/50 hover:text-white text-sm transition-colors">Contact</a>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold bg-[#f5a623] hover:bg-[#f0b84a] text-[#0f0e0d] rounded-lg transition-all shadow-md shadow-[#f5a623]/20"
            >
              Register
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 space-y-1.5">
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-64" : "max-h-0"}`}>
          <div className="px-4 py-3 border-t border-white/5 space-y-1">
            <a href="#venues" className="block py-2.5 px-3 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>Browse</a>
            <a href="#how" className="block py-2.5 px-3 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#contact" className="block py-2.5 px-3 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>Contact</a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 text-center py-2.5 text-sm text-white/70 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">Login</Link>
              <Link to="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-[#f5a623] text-[#0f0e0d] rounded-lg hover:bg-[#f0b84a] transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* BG image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0e0d] via-transparent to-[#0f0e0d]" />
        </div>

        {/* Amber glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#f5a623]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 border border-[#f5a623]/30 bg-[#f5a623]/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-[#f5a623] rounded-full animate-pulse" />
            <span className="text-[#f5a623] text-xs font-medium tracking-widest uppercase" style={{ fontFamily: "monospace" }}>
              250+ Venues · Kerala
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Book the perfect{" "}
            <span className="italic text-[#f5a623]">space</span>
            <br />
            for any occasion
          </h1>

          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Cafés, auditoriums, studios, banquet halls — discover and reserve stunning venues instantly.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search venues or locations..."
              className="flex-1 bg-white/8 border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#f5a623]/50 focus:bg-white/10 transition-all"
            />
            <button className="bg-[#f5a623] hover:bg-[#f0b84a] text-[#0f0e0d] font-semibold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#f5a623]/25 text-sm whitespace-nowrap">
              Search
            </button>
          </div>

          {/* Quick stats */}
          <div className="flex justify-center gap-10 mt-12">
            {[["250+", "Venues"], ["12K+", "Bookings"], ["4.8★", "Rating"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-xl font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>{v}</div>
                <div className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "monospace" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Venues ─────────────────────────────────────────── */}
      <section id="venues" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[#f5a623] text-xs font-medium tracking-widest uppercase mb-3" style={{ fontFamily: "monospace" }}>
              Featured Spaces
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>
              Popular venues
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {venues.map((v) => (
              <div
                key={v.id}
                className="group bg-white/4 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 hover:bg-white/6 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={v.image}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d]/60 to-transparent" />
                  <span className="absolute top-3 left-3 bg-[#0f0e0d]/70 backdrop-blur-sm text-white/70 text-xs px-2.5 py-1 rounded-full" style={{ fontFamily: "monospace" }}>
                    {v.type}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-base mb-1" style={{ fontFamily: "'Georgia', serif" }}>{v.name}</h3>
                  <div className="flex items-center gap-1 text-white/40 text-xs mb-3">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    {v.location}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/8 pt-3">
                    <div>
                      <span className="text-[#f5a623] font-bold text-base">{v.price}</span>
                      <span className="text-white/30 text-xs ml-2">{v.capacity}</span>
                    </div>
                    <button className="text-xs font-semibold text-[#0f0e0d] bg-[#f5a623] hover:bg-[#f0b84a] px-3.5 py-1.5 rounded-lg transition-colors">
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA card */}
            <div className="flex flex-col items-center justify-center bg-[#f5a623]/6 border border-[#f5a623]/20 rounded-2xl p-8 text-center min-h-[280px] hover:bg-[#f5a623]/10 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full border-2 border-[#f5a623]/40 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#f5a623]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-[#f5a623] font-semibold text-sm mb-1">See All Venues</p>
              <p className="text-white/30 text-xs">250+ spaces waiting</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section id="how" className="py-20 md:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#f5a623] text-xs font-medium tracking-widest uppercase mb-3" style={{ fontFamily: "monospace" }}>Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Georgia', serif" }}>Book in 3 steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { n: "01", title: "Search", desc: "Browse verified venues by type, location, and budget with smart filters." },
              { n: "02", title: "Pick a Slot", desc: "Check live availability and choose your date, time, and duration." },
              { n: "03", title: "Confirm & Go", desc: "Pay securely online and receive instant booking confirmation." },
            ].map((s) => (
              <div key={s.n} className="relative group p-6 rounded-2xl border border-white/8 bg-white/3 hover:border-white/15 transition-all">
                <div className="text-5xl font-bold text-white/5 mb-4 select-none" style={{ fontFamily: "'Georgia', serif" }}>{s.n}</div>
                <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: "'Georgia', serif" }}>{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Georgia', serif" }}>
            Ready to find your venue?
          </h2>
          <p className="text-white/40 text-sm mb-8">Join thousands of event planners who trust BookMyVenue.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-[#f5a623] hover:bg-[#f0b84a] text-[#0f0e0d] font-semibold rounded-xl transition-all shadow-lg shadow-[#f5a623]/20 text-sm"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 border border-white/10 hover:border-white/25 text-white/70 hover:text-white rounded-xl transition-all text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer id="contact" className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#f5a623] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" stroke="#0f0e0d" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M7 1v12M1 4l6 3 6-3" stroke="#0f0e0d" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-white/50 text-sm" style={{ fontFamily: "'Georgia', serif" }}>
              BookMy<span className="text-[#f5a623]">Venue</span>
            </span>
          </div>
          <p className="text-white/20 text-xs" style={{ fontFamily: "monospace" }}>
            © 2025 BookMyVenue · Made in Kerala
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}