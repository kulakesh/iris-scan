import { useState, useEffect } from "react";

const NAV_LINKS = ["Today Results", "Live Draw", "Old Results", "Winner Check", "PDF Results", "More"];

const QUICK_ACTIONS = [
  { icon: "📅", label: "Today Results", desc: "View all today lottery results", color: "bg-emerald-50 text-emerald-600" },
  { icon: "📡", label: "Live Draw", desc: "Watch live draw in real-time", color: "bg-red-50 text-red-500" },
  { icon: "🕐", label: "Old Results", desc: "Search previous draw results", color: "bg-blue-50 text-blue-600" },
  { icon: "🎫", label: "Winner Check", desc: "Check winners list and prizes", color: "bg-purple-50 text-purple-600" },
  { icon: "⬇️", label: "Download PDF", desc: "Official result sheets & PDFs", color: "bg-orange-50 text-orange-500" },
  { icon: "🔔", label: "Notifications", desc: "Get result alerts instantly", color: "bg-teal-50 text-teal-600" },
];

const WINNERS = [
  { name: "Tshering Dorji", game: "XYZ Morning  07/05/2026", amount: "₹ 1,00,000", prize: "1st Prize", color: "bg-yellow-100 text-yellow-700" },
  { name: "Sonam Choden", game: "XYZ Day  07/05/2026", amount: "₹ 50,000", prize: "2nd Prize", color: "bg-gray-100 text-gray-600" },
  { name: "Jigme Wangchuk", game: "XYZ Evening  07/05/2026", amount: "₹ 10,000", prize: "3rd Prize", color: "bg-orange-100 text-orange-700" },
  { name: "Pema Dema", game: "XYZ Morning  07/05/2026", amount: "₹ 5,000", prize: "Consolation", color: "bg-green-100 text-green-700" },
];

function Countdown() {
  const [time, setTime] = useState({ h: 0, m: 24, s: 35 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2, "0");
  return (
    <div className="flex items-end gap-1">
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <div key={i} className="flex items-end gap-1">
          <div className="text-center">
            <div className="text-5xl font-black text-white tracking-widest">{val}</div>
            <div className="text-xs text-blue-200 mt-1 uppercase tracking-widest">
              {["Hours", "Minutes", "Seconds"][i]}
            </div>
          </div>
          {i < 2 && <span className="text-4xl font-black text-yellow-400 mb-4 mx-1">:</span>}
        </div>
      ))}
    </div>
  );
}

function ResultCard({ title, time, icon, results, coming }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 min-w-0">
      <div className="flex items-center justify-center gap-2 py-3 border-b border-gray-100 bg-gray-50">
        <span>{icon}</span>
        <span className="font-bold text-gray-700 text-sm">{title}</span>
        <span className="text-xs text-gray-400 ml-1">{time}</span>
      </div>
      <div className="p-5">
        {coming ? (
          <button className="w-full py-3 rounded-xl bg-purple-100 text-purple-700 font-semibold text-sm flex items-center justify-center gap-2 mt-2">
            🕐 Coming Soon
          </button>
        ) : (
          <div className="space-y-3 mb-4">
            {results.map(({ rank, label, num }) => (
              <div key={rank} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">{rank}</span>
                  <span className="text-sm text-gray-500">{label}</span>
                </div>
                <span className="text-xl font-black text-blue-600 tracking-wide">{num}</span>
              </div>
            ))}
          </div>
        )}
        {!coming && (
          <div className="flex gap-2 mt-2">
            <button className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">View Full Result</button>
            <button className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1">⬇ Download PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function XYZLotteries() {
  const [ticket, setTicket] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center shadow">
              <span className="text-white font-black text-sm">XYZ</span>
            </div>
            <div>
              <div className="font-black text-lg leading-tight">
                <span className="text-gray-900">XYZ </span>
                <span className="text-yellow-500">LOTTERIES</span>
              </div>
              <div className="text-[10px] text-gray-400 tracking-wide">Official. Trusted. Transparent.</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <button className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-bold text-sm border border-yellow-500">🏠 Home</button>
            {NAV_LINKS.map(l => (
              <button key={l} className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition">{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <button className="text-sm font-semibold text-gray-600">EN ▾</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #facc15 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 40%)" }} />
        <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 z-10">
            <p className="text-blue-300 font-semibold mb-2 tracking-widest text-sm uppercase">The Official Source for</p>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              XYZ <span className="text-yellow-400">LOTTERIES</span><br />RESULTS
            </h1>
            <div className="flex gap-6 mt-4">
              {["⚡ Fast", "🎯 Accurate", "🛡 Trusted"].map(t => (
                <span key={t} className="text-blue-200 font-semibold text-sm">{t}</span>
              ))}
            </div>
          </div>
          <div className="z-10 w-full md:w-96 bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎫</span>
              <span className="font-black text-gray-800 text-lg">CHECK YOUR TICKET</span>
            </div>
            <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 focus-within:border-yellow-400 transition">
              <input
                className="flex-1 outline-none text-gray-700 text-sm placeholder-gray-400"
                placeholder="Enter 6 Digit Ticket Number"
                maxLength={6}
                value={ticket}
                onChange={e => setTicket(e.target.value.replace(/\D/g, ""))}
              />
              <span className="text-gray-400 text-lg">⊡</span>
            </div>
            <button className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 transition rounded-xl font-black text-gray-900 text-base flex items-center justify-center gap-2 shadow">
              🔍 CHECK RESULT
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Example: 123456</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">QUICK ACTIONS</h2>
          <button className="text-blue-600 text-sm font-semibold hover:underline">View All →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {QUICK_ACTIONS.map(({ icon, label, desc, color }) => (
            <button key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center hover:shadow-md transition group">
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition`}>
                {icon}
              </div>
              <div className="font-bold text-gray-800 text-sm mb-1">{label}</div>
              <div className="text-xs text-gray-400 leading-snug">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Draw Banner */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded">▶ LIVE</span>
              <span className="text-blue-300 text-sm font-semibold">NEXT DRAW</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">XYZ EVENING</div>
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <span>🕐</span><span>Today 06:00 PM</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-blue-300 text-xs uppercase tracking-widest mb-3 text-center">Live Draw Starts In</div>
            <Countdown />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl border-2 border-white/20">🎱</div>
            <button className="flex items-center gap-2 bg-white text-gray-900 font-black px-5 py-2.5 rounded-xl shadow hover:bg-yellow-100 transition">
              ▶ WATCH LIVE
            </button>
          </div>
        </div>
      </div>

      {/* Today's Results */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <h2 className="text-xl font-black text-gray-800">TODAY'S RESULTS</h2>
            <span className="text-sm text-gray-400 font-medium">8 May 2026, Friday</span>
          </div>
          <button className="text-blue-600 text-sm font-semibold hover:underline">View All Results →</button>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <ResultCard
            title="XYZ MORNING" time="11:55 AM" icon="☀️"
            results={[
              { rank: 1, label: "1st Prize", num: "443987" },
              { rank: 2, label: "2nd Prize", num: "52619" },
              { rank: 3, label: "3rd Prize", num: "2671" },
            ]}
          />
          <ResultCard
            title="XYZ DAY" time="02:30 PM" icon="🌤"
            results={[
              { rank: 1, label: "1st Prize", num: "192746" },
              { rank: 2, label: "2nd Prize", num: "30918" },
              { rank: 3, label: "3rd Prize", num: "6742" },
            ]}
          />
          <ResultCard
            title="XYZ EVENING" time="06:00 PM" icon="🌙"
            coming
          />
        </div>
      </div>

      {/* Winners + App Banner */}
      <div className="max-w-7xl mx-auto px-4 pb-12 grid md:grid-cols-2 gap-6">
        {/* Latest Winners */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h3 className="font-black text-gray-800 text-lg">LATEST WINNERS</h3>
            </div>
            <button className="text-blue-600 text-sm font-semibold hover:underline">View All →</button>
          </div>
          <div className="space-y-3">
            {WINNERS.map(({ name, game, amount, prize, color }) => (
              <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                  {name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm truncate">{name}</div>
                  <div className="text-xs text-gray-400">{game}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-green-600 text-sm">{amount}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{prize}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App Banner */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="font-black text-2xl mb-1">XYZ Lotteries App</div>
            <div className="text-blue-200 text-sm mb-5">Check results anytime, anywhere</div>
            <ul className="space-y-2 mb-6">
              {["Instant result notifications", "Save your favorite numbers", "Download PDF results", "Works offline"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-blue-100">
                  <span className="text-green-400 font-bold">✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-black hover:bg-gray-900 transition rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-sm">
              <span>🤖</span> Google Play
            </button>
            <button className="flex-1 bg-white text-gray-900 hover:bg-gray-100 transition rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-sm">
              <span>🍎</span> App Store
            </button>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: "🛡", title: "Official & Trusted", desc: "Government authorized lottery results" },
            { icon: "🎯", title: "100% Accurate", desc: "Results published in real-time" },
            { icon: "🔒", title: "Secure & Safe", desc: "Your data is protected and secure" },
            { icon: "🔄", title: "Always Updated", desc: "Live updates for all draws" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">{icon}</div>
              <div>
                <div className="font-bold text-gray-800 text-sm">{title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">XYZ</span>
              </div>
              <div>
                <div className="font-black text-white text-sm">XYZ <span className="text-yellow-400">LOTTERIES</span></div>
                <div className="text-[10px] text-gray-500">Official. Trusted. Transparent.</div>
              </div>
            </div>
          </div>
          <div>
            <div className="font-bold text-white text-sm mb-3">QUICK LINKS</div>
            {["About Us", "Contact Us", "Terms & Conditions", "Privacy Policy", "Sitemap"].map(l => (
              <div key={l} className="text-sm text-gray-400 hover:text-white cursor-pointer mb-1.5 transition">{l}</div>
            ))}
          </div>
          <div>
            <div className="font-bold text-white text-sm mb-3">HELP & SUPPORT</div>
            {["FAQs", "How to Play", "Claim Prize", "Support Center"].map(l => (
              <div key={l} className="text-sm text-gray-400 hover:text-white cursor-pointer mb-1.5 transition">{l}</div>
            ))}
          </div>
          <div>
            <div className="font-bold text-white text-sm mb-3">CONNECT WITH US</div>
            <div className="flex gap-3">
              {["📘", "✈️", "💬", "▶️"].map((icon, i) => (
                <button key={i} className="w-9 h-9 bg-gray-800 hover:bg-blue-600 transition rounded-lg flex items-center justify-center text-base">
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© 2026 XYZ Lotteries. All rights reserved.</span>
          <span>Proudly serving the people. 🏳</span>
        </div>
      </footer>
    </div>
  );
}
