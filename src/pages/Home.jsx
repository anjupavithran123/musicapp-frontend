import React from "react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden aurora-bg">

      {/* Floating glow orbs */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-pink-500/40 rounded-full blur-[120px] animate-[floatSlow_12s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] bg-indigo-500/40 rounded-full blur-[120px] animate-[floatSlow_15s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* HERO */}
        <section className="flex flex-col items-center justify-center mt-28 text-center px-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/727/727218.png"
            alt="Music"
            className="w-52 h-52 mb-8 drop-shadow-2xl animate-bounce"
          />

          <h1 className="text-6xl md:text-7xl font-extrabold text-white glow-text mb-6">
            Feel the Music
          </h1>

          <p className="text-white/90 text-xl max-w-2xl mb-10">
            Dive into a world of sound. Stream, explore, and vibe with millions
            of tracks crafted for every mood.
          </p>

          <div className="flex gap-6">
            <a
              href="#features"
              className="px-10 py-4 bg-white text-purple-700 rounded-full font-bold shadow-xl hover:scale-110 transition"
            >
              Start Listening
            </a>

            <a
              href="/login"
              className="px-10 py-4 border border-white/40 text-white rounded-full hover:bg-white/20 transition"
            >
              Login
            </a>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="mt-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6"
        >
          {[
            {
              title: "Curated Playlists",
              desc: "Perfect playlists crafted for every vibe.",
              icon: "🎧"
            },
            {
              title: "Trending Hits",
              desc: "Stay ahead with global chartbusters.",
              icon: "🔥"
            },
            {
              title: "New Releases",
              desc: "Fresh music from your favorite artists.",
              icon: "🚀"
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 text-center text-white card-glow transition hover:scale-105"
            >
              <div className="text-6xl mb-4 animate-pulse">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 glow-text">
                {item.title}
              </h3>
              <p className="text-white/80">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* FOOTER */}
        <footer className="mt-32 bg-black/30 backdrop-blur-xl text-white py-8">
          <div className="text-center text-sm opacity-80">
            © 2025 MusicApp — Feel Every Beat 🎵
          </div>
        </footer>
      </div>
    </div>
  );
}
