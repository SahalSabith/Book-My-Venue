import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { listVenues } from "../Redux/Slice/venueSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const dispatch = useDispatch()
  const { venues } = useSelector((state) => state.venue)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const response = dispatch(listVenues())
      
    } catch (error) {
      
    }
  },[dispatch])

  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}
    >
      <Header />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-5">
              Kerala's venue marketplace
            </p>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Find the right space
              <br />
              for your next event
            </h1>

            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">
              Cafés, auditoriums, banquet halls, studios — browse and book instantly across Kerala.
            </p>

            <div className="flex gap-2 max-w-md">
              <input
                placeholder="City or venue name..."
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
              />
              <button className="bg-gray-900 text-white px-5 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Search
              </button>
            </div>

            <div className="flex gap-8 mt-10">
              {[["250+", "Venues"], ["12K+", "Bookings"], ["4.8", "Rating"]].map(
                ([num, label]) => (
                  <div key={label}>
                    <div className="font-bold text-lg">{num}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── VENUES ───────────────────────────────────────────── */}
      <section id="venues" className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Featured</p>
              <h2 className="text-2xl font-bold">Popular venues</h2>
            </div>
            <button className="text-gray-500 text-sm hover:text-gray-900 transition-colors">
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                onClick={() => navigate(`/venue/${v.id}`)}
              >

                <img
                  src={v.images[0]}
                  className="h-44 w-full object-cover"
                  alt={v.name}
                />

                <div className="p-4">

                  <span className="text-xs text-gray-400 font-medium">
                    Capacity: {v.max_capacity} people
                  </span>

                  <h3 className="font-semibold mt-1 text-gray-900">
                    {v.name}
                  </h3>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {v.district}
                  </p>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {v.description}
                  </p>

                  <div className="flex justify-between items-center mt-4">

                    <p className="font-bold text-gray-900">
                      ₹{v.price_per_hour}
                      <span className="text-xs text-gray-400 font-normal">
                        {" "}/hr
                      </span>
                    </p>

                    <button className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                      Book
                    </button>

                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how" className="py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10">Book in 3 steps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Search venues", "Pick a slot", "Confirm booking"].map((item, i) => (
              <div key={item} className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div className="mx-auto mb-4 bg-gray-900 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-900 text-center px-6">
        <h2 className="text-white text-2xl font-bold">Ready to get started?</h2>
        <p className="text-gray-400 mt-3 text-sm">Join thousands of event planners across Kerala.</p>
      </section>

      <Footer />
    </div>
  );
}