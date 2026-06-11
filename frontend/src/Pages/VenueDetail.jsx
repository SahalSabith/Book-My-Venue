import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userVenueDetail } from "../Redux/Slice/venueSlice";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

// ─── Helpers ────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}
function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}
function parseKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function formatDisplay(key) {
  if (!key) return "";
  const d = parseKey(key);
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}
function diffDays(a, b) {
  return Math.round((parseKey(b) - parseKey(a)) / 86400000) + 1;
}

// ─── Calendar ───────────────────────────────────────────────────────────────

function Calendar({ selected, dragStart, dragEnd, onMouseDown, onMouseEnter, onMouseUp, today }) {
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const prev = () => {
    setView(v => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const next = () => {
    setView(v => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const { year, month } = view;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  // Determine highlight range
  let rangeStart = null, rangeEnd = null;
  if (dragStart && dragEnd) {
    const a = parseKey(dragStart), b = parseKey(dragEnd);
    rangeStart = a <= b ? dragStart : dragEnd;
    rangeEnd = a <= b ? dragEnd : dragStart;
  } else if (selected.start && selected.end) {
    rangeStart = selected.start;
    rangeEnd = selected.end;
  } else if (selected.start) {
    rangeStart = selected.start;
    rangeEnd = selected.start;
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = today;

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prev}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={next}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-400 pb-1">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const key = dateKey(year, month, day);
          const isPast = key < todayKey;
          const isToday = key === todayKey;

          let isStart = false, isEnd = false, isInRange = false;
          if (rangeStart && rangeEnd) {
            isStart = key === rangeStart;
            isEnd = key === rangeEnd;
            isInRange = key > rangeStart && key < rangeEnd;
          }
          const isSelected = isStart || isEnd;

          let cellClass = "relative h-8 flex items-center justify-center text-sm cursor-pointer transition-colors rounded-lg ";
          if (isPast) {
            cellClass += "text-gray-300 cursor-not-allowed";
          } else if (isSelected) {
            cellClass += "bg-gray-900 text-white font-semibold z-10";
          } else if (isInRange) {
            cellClass += "bg-gray-100 text-gray-700 rounded-none";
          } else if (isToday) {
            cellClass += "text-gray-900 font-semibold ring-1 ring-gray-300";
          } else {
            cellClass += "text-gray-700 hover:bg-gray-100";
          }

          // Range edge rounding
          let extraStyle = {};
          if (isInRange) {
            if (isStart) extraStyle.borderRadius = "8px 0 0 8px";
            else if (isEnd) extraStyle.borderRadius = "0 8px 8px 0";
            else extraStyle.borderRadius = "0";
          }
          if (isStart && rangeEnd && rangeStart !== rangeEnd) {
            extraStyle.borderRadius = "8px 0 0 8px";
            cellClass = cellClass.replace("rounded-lg", "");
          }
          if (isEnd && rangeStart && rangeStart !== rangeEnd) {
            extraStyle.borderRadius = "0 8px 8px 0";
            cellClass = cellClass.replace("rounded-lg", "");
          }

          return (
            <div
              key={key}
              style={extraStyle}
              className={cellClass}
              onMouseDown={() => !isPast && onMouseDown(key)}
              onMouseEnter={() => !isPast && onMouseEnter(key)}
              onMouseUp={() => !isPast && onMouseUp(key)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Booking Modal ──────────────────────────────────────────────────────────

function BookingModal({ venue, onClose }) {
  const [selected, setSelected] = useState({ start: null, end: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [bookingType, setBookingType] = useState("day"); // "day" | "hour"
  const [hours, setHours] = useState(2);
  const [step, setStep] = useState(1); // 1=pick dates, 2=confirm

  const today = dateKey(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  const handleMouseDown = (key) => {
    setIsDragging(true);
    setDragStart(key);
    setDragEnd(key);
    setSelected({ start: null, end: null });
  };
  const handleMouseEnter = (key) => {
    if (isDragging) setDragEnd(key);
  };
  const handleMouseUp = (key) => {
    if (!isDragging) return;
    setIsDragging(false);
    const a = parseKey(dragStart), b = parseKey(key);
    const start = a <= b ? dragStart : key;
    const end = a <= b ? key : dragStart;
    setSelected({ start, end });
    setDragStart(null);
    setDragEnd(null);
  };

  const days = selected.start && selected.end ? diffDays(selected.start, selected.end) : 0;
  const totalPrice = bookingType === "day"
    ? days * (venue?.price_per_day || 0)
    : hours * (venue?.price_per_hour || 0);

  const canProceed = bookingType === "day" ? days > 0 : true;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Book this venue</h2>
            <p className="text-xs text-gray-400 mt-0.5">{venue?.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5">
          {step === 1 && (
            <>
              {/* Booking type */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
                {["day", "hour"].map(t => (
                  <button
                    key={t}
                    onClick={() => setBookingType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${bookingType === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                  >
                    {t === "day" ? "By the day" : "By the hour"}
                  </button>
                ))}
              </div>

              {bookingType === "day" ? (
                <>
                  {/* Drag hint */}
                  <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                    <span className="inline-block w-4 h-4 bg-gray-200 rounded text-center leading-4 text-[10px]">⟺</span>
                    Click and drag to select your dates
                  </p>
                  <Calendar
                    selected={selected}
                    dragStart={dragStart}
                    dragEnd={dragEnd}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onMouseUp={handleMouseUp}
                    today={today}
                  />
                  {selected.start && (
                    <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div className="text-xs text-gray-500">
                        <div className="font-medium text-gray-800">{formatDisplay(selected.start)}</div>
                        {selected.end && selected.end !== selected.start && (
                          <div className="mt-0.5 text-gray-400">→ {formatDisplay(selected.end)}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹{(days * venue?.price_per_day).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{days} day{days !== 1 ? "s" : ""} × ₹{venue?.price_per_day?.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-5">
                  <p className="text-xs text-gray-400">Pick a date and number of hours</p>
                  <Calendar
                    selected={selected}
                    dragStart={null}
                    dragEnd={null}
                    onMouseDown={(key) => setSelected({ start: key, end: key })}
                    onMouseEnter={() => {}}
                    onMouseUp={() => {}}
                    today={today}
                  />
                  {selected.start && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-2">Hours needed: <span className="text-gray-900 font-bold">{hours}h</span></label>
                      <input
                        type="range" min={1} max={12} step={1}
                        value={hours}
                        onChange={e => setHours(Number(e.target.value))}
                        className="w-full accent-gray-900"
                      />
                      <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => <span key={h}>{h}</span>)}
                      </div>
                      <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div className="text-xs text-gray-500">
                          <div className="font-medium text-gray-800">{formatDisplay(selected.start)}</div>
                          <div className="text-gray-400 mt-0.5">{hours} hour{hours !== 1 ? "s" : ""}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">₹{(hours * venue?.price_per_hour).toLocaleString()}</div>
                          <div className="text-xs text-gray-400">{hours}h × ₹{venue?.price_per_hour?.toLocaleString()}/hr</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">Booking summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Venue</span>
                    <span className="text-gray-900 font-medium">{venue?.name}</span>
                  </div>
                  {bookingType === "day" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Check-in</span>
                        <span className="text-gray-900">{formatDisplay(selected.start)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Check-out</span>
                        <span className="text-gray-900">{formatDisplay(selected.end)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="text-gray-900">{days} day{days !== 1 ? "s" : ""}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span className="text-gray-900">{formatDisplay(selected.start)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="text-gray-900">{hours} hour{hours !== 1 ? "s" : ""}</span>
                      </div>
                    </>
                  )}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-800">Total</span>
                    <span className="text-gray-900">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                By confirming, you agree to BookMyVenue's booking policy. The venue owner will review and confirm your request.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            disabled={!canProceed || (bookingType === "hour" && !selected.start)}
            onClick={() => {
              if (step === 1) setStep(2);
              else {
                // dispatch booking thunk here
                alert("Booking confirmed! (wire up your thunk here)");
                onClose();
              }
            }}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 1 ? (canProceed && (selected.start) ? `Continue · ₹${totalPrice.toLocaleString()}` : "Select dates to continue") : "Confirm booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function VenueDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { venue, loading, error } = useSelector(s => s.venue);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(userVenueDetail(id));
  }, [id, dispatch]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-[68px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading venue…</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !venue) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-[68px]">
          <div className="text-center">
            <p className="text-4xl mb-3">🏛</p>
            <p className="text-gray-500 text-sm">{error || "Venue not found."}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const {
    name, description, district, state, city, address_line,
    price_per_day, price_per_hour, max_capacity,
  } = venue;

  return (
    <>
      <Header />

      <main className="pt-[68px] min-h-screen bg-white">
        {/* ── Hero placeholder image strip ── */}
        <div className="bg-gray-100 h-64 sm:h-80 flex items-center justify-center overflow-hidden">
          <div className="text-center text-gray-300">
            <svg className="mx-auto mb-2" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
            <p className="text-sm">Venue photos coming soon</p>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* LEFT — details */}
            <div className="flex-1 min-w-0">
              {/* Name + location */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{name}</h1>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  {[address_line, city, district, state].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: "👥", label: "Max capacity", value: `${max_capacity} people` },
                  { icon: "📅", label: "Per day", value: `₹${price_per_day?.toLocaleString()}` },
                  { icon: "⏱", label: "Per hour", value: `₹${price_per_hour?.toLocaleString()}` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-lg mb-1">{icon}</div>
                    <div className="text-[11px] text-gray-400">{label}</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-2">About this venue</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{description || "No description provided."}</p>
              </div>

              {/* Location detail */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Location</h2>
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                  {address_line && <p className="text-gray-700">{address_line}</p>}
                  <p className="text-gray-500">{[city, district].filter(Boolean).join(", ")}</p>
                  <p className="text-gray-500">{state}</p>
                </div>
              </div>

              {/* Policies */}
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">Things to know</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  {[
                    ["Check-in from", "8:00 AM"],
                    ["Check-out by", "10:00 PM"],
                    ["Cancellation", "48h notice required"],
                    ["Catering", "Self-arranged"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-gray-700 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — sticky booking card */}
            <div className="lg:w-80 shrink-0">
              <div className="sticky top-[84px] bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">₹{price_per_day?.toLocaleString()}</span>
                    <span className="text-sm text-gray-400">/day</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    or ₹{price_per_hour?.toLocaleString()} per hour
                  </div>
                </div>

                <button
                  onClick={() => setBookingOpen(true)}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
                >
                  Check availability & book
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  No charge until confirmed
                </p>

                <hr className="border-gray-100 my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Capacity</span>
                    <span className="text-gray-700">{max_capacity} people</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Location</span>
                    <span className="text-gray-700">{city}, {district}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {bookingOpen && (
        <BookingModal venue={venue} onClose={() => setBookingOpen(false)} />
      )}
    </>
  );
}