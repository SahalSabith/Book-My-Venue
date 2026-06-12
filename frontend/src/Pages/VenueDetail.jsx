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

const EVENT_PURPOSES = [
  "Wedding",
  "Birthday party",
  "Corporate meeting",
  "Product launch",
  "Photo / video shoot",
  "Workshop / seminar",
  "Social gathering",
  "Other",
];

// Generate time options in 30-min increments: "06:00 AM" ... "11:30 PM"
function generateTimeSlots() {
  const slots = [];
  for (let h = 6; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push({ label, value });
    }
  }
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function diffHours(start, end) {
  const diff = (timeToMinutes(end) - timeToMinutes(start)) / 60;
  return diff > 0 ? diff : 0;
}

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
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">‹</button>
        <span className="text-sm font-semibold text-gray-800">{MONTHS[month]} {year}</span>
        <button onClick={next} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">›</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-gray-400 pb-1">{d}</div>
        ))}
      </div>

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
  const [bookingType, setBookingType] = useState("day");

  // Hourly time
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");

  // Guest count
  const [guests, setGuests] = useState(1);

  // Event purpose
  const [purpose, setPurpose] = useState("");
  const [otherPurpose, setOtherPurpose] = useState("");

  const [step, setStep] = useState(1);

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
  const hoursDiff = diffHours(startTime, endTime);

  const totalPrice = bookingType === "day"
    ? days * (venue?.price_per_day || 0)
    : hoursDiff * (venue?.price_per_hour || 0);

  // Valid end times must be after start time
  const validEndTimes = TIME_SLOTS.filter(
    t => timeToMinutes(t.value) > timeToMinutes(startTime)
  );

  // Fix endTime if it becomes invalid after startTime change
  const handleStartTimeChange = (val) => {
    setStartTime(val);
    if (timeToMinutes(endTime) <= timeToMinutes(val)) {
      const next = TIME_SLOTS.find(t => timeToMinutes(t.value) > timeToMinutes(val));
      if (next) setEndTime(next.value);
    }
  };

  const effectivePurpose = purpose === "Other" ? otherPurpose : purpose;

  const canProceed =
    (bookingType === "day" ? days > 0 : selected.start && hoursDiff > 0) &&
    guests >= 1 &&
    effectivePurpose.trim() !== "";

  // Build booking payload
  const buildPayload = () => {
    const base = {
      venue_id: venue?.id,
      guests,
      purpose: effectivePurpose,
    };
    if (bookingType === "day") {
      return {
        ...base,
        booking_type: "day",
        start_date: selected.start,
        end_date: selected.end,
      };
    } else {
      return {
        ...base,
        booking_type: "hour",
        date: selected.start,
        start_time: startTime,
        end_time: endTime,
      };
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Book this venue</h2>
            <p className="text-xs text-gray-400 mt-0.5">{venue?.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          {step === 1 && (
            <>
              {/* Booking type toggle */}
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

              {/* ── Date picker ── */}
              {bookingType === "day" ? (
                <>
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
                <div className="space-y-4">
                  <p className="text-xs text-gray-400">Pick a date and set your time slot</p>
                  <Calendar
                    selected={selected}
                    dragStart={null}
                    dragEnd={null}
                    onMouseDown={(key) => setSelected({ start: key, end: key })}
                    onMouseEnter={() => {}}
                    onMouseUp={() => {}}
                    today={today}
                  />

                  {/* Time slot picker */}
                  {selected.start && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1.5">Start time</label>
                          <select
                            value={startTime}
                            onChange={e => handleStartTimeChange(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none"
                          >
                            {TIME_SLOTS.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 block mb-1.5">End time</label>
                          <select
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none"
                          >
                            {validEndTimes.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {hoursDiff > 0 && (
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                          <div className="text-xs text-gray-500">
                            <div className="font-medium text-gray-800">{formatDisplay(selected.start)}</div>
                            <div className="text-gray-400 mt-0.5">
                              {TIME_SLOTS.find(t => t.value === startTime)?.label} → {TIME_SLOTS.find(t => t.value === endTime)?.label}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">₹{(hoursDiff * venue?.price_per_hour).toLocaleString()}</div>
                            <div className="text-xs text-gray-400">{hoursDiff}h × ₹{venue?.price_per_hour?.toLocaleString()}/hr</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Guest count ── */}
              <div className="mt-5">
                <label className="text-xs font-medium text-gray-600 block mb-2">
                  Number of guests
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-light"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={venue?.max_capacity || 9999}
                    value={guests}
                    onChange={e => {
                      const v = parseInt(e.target.value) || 1;
                      setGuests(Math.min(Math.max(1, v), venue?.max_capacity || 9999));
                    }}
                    className="w-16 text-center border border-gray-200 rounded-xl py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <button
                    onClick={() => setGuests(g => Math.min(g + 1, venue?.max_capacity || 9999))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-light"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-400">max {venue?.max_capacity?.toLocaleString()} people</span>
                </div>
              </div>

              {/* ── Event purpose ── */}
              <div className="mt-5">
                <label className="text-xs font-medium text-gray-600 block mb-2">
                  Purpose of event
                </label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_PURPOSES.map(p => (
                    <button
                      key={p}
                      onClick={() => { setPurpose(p); if (p !== "Other") setOtherPurpose(""); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        purpose === p
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {purpose === "Other" && (
                  <input
                    type="text"
                    placeholder="Describe your event…"
                    value={otherPurpose}
                    onChange={e => setOtherPurpose(e.target.value)}
                    className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-300"
                    autoFocus
                  />
                )}
              </div>
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
                        <span className="text-gray-500">From</span>
                        <span className="text-gray-900">{formatDisplay(selected.start)}</span>
                      </div>
                      {selected.end && selected.end !== selected.start && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">To</span>
                          <span className="text-gray-900">{formatDisplay(selected.end)}</span>
                        </div>
                      )}
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
                        <span className="text-gray-500">Time</span>
                        <span className="text-gray-900">
                          {TIME_SLOTS.find(t => t.value === startTime)?.label} – {TIME_SLOTS.find(t => t.value === endTime)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span className="text-gray-900">{hoursDiff} hour{hoursDiff !== 1 ? "s" : ""}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Guests</span>
                    <span className="text-gray-900">{guests} {guests === 1 ? "person" : "people"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Purpose</span>
                    <span className="text-gray-900 text-right max-w-[60%]">{effectivePurpose}</span>
                  </div>

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
        <div className="px-6 pb-6 pt-2 flex gap-3 shrink-0 border-t border-gray-50">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            disabled={!canProceed}
            onClick={() => {
              if (step === 1) setStep(2);
              else {
                const payload = buildPayload();
                console.log("Booking payload:", payload);
                // dispatch(createBooking(payload));  ← wire up your thunk here
                alert("Booking confirmed!\n\n" + JSON.stringify(payload, null, 2));
                onClose();
              }
            }}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 1
              ? (canProceed ? `Continue · ₹${totalPrice.toLocaleString()}` : "Complete all fields to continue")
              : "Confirm booking"}
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
        {/* ── Hero image strip ── */}
        <div className="bg-gray-100 h-64 sm:h-80 flex items-center justify-center overflow-hidden">
          <div className="text-center text-gray-300">
            <img src={venue.images} className="h-44 w-full object-cover" alt={venue.name} />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* LEFT — details */}
            <div className="flex-1 min-w-0">
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

              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-2">About this venue</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{description || "No description provided."}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Location</h2>
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                  {address_line && <p className="text-gray-700">{address_line}</p>}
                  <p className="text-gray-500">{[city, district].filter(Boolean).join(", ")}</p>
                  <p className="text-gray-500">{state}</p>
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">Things to know</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  {[
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