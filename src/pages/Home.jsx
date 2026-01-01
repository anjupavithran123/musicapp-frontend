import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-100 to-purple-200">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center mt-20 text-center px-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/727/727218.png"
          alt="Music Icon"
          className="w-48 h-48 mb-6 animate-bounce"
        />
        <h1 className="text-5xl font-extrabold text-purple-700 mb-4">
          Welcome to MusicApp
        </h1>
        <p className="text-gray-700 text-lg max-w-xl mb-8">
          Stream your favorite songs anytime, anywhere. Discover new music,
          explore playlists, and enjoy your personal library.
        </p>
        <a
          href="#features"
          className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition font-semibold"
        >
          Explore
        </a>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="mt-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg hover:scale-105 transition">
          <img
            src="https://cdn-icons-png.flaticon.com/512/727/727240.png"
            alt="Playlist Icon"
            className="w-16 h-16 mb-4 mx-auto"
          />
          <h3 className="text-xl font-bold text-purple-700 mb-2 text-center">
            Curated Playlists
          </h3>
          <p className="text-gray-700 text-center">
            Handpicked playlists for every mood and genre. Find your perfect
            mix.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg hover:scale-105 transition">
          <img
            src="https://cdn-icons-png.flaticon.com/512/727/727245.png"
            alt="Trending Icon"
            className="w-16 h-16 mb-4 mx-auto"
          />
          <h3 className="text-xl font-bold text-purple-700 mb-2 text-center">
            Trending Music
          </h3>
          <p className="text-gray-700 text-center">
            Discover the latest hits and trending tracks from around the world.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg hover:scale-105 transition">
          <img
            src="https://cdn-icons-png.flaticon.com/512/727/727231.png"
            alt="New Release Icon"
            className="w-16 h-16 mb-4 mx-auto"
          />
          <h3 className="text-xl font-bold text-purple-700 mb-2 text-center">
            New Releases
          </h3>
          <p className="text-gray-700 text-center">
            Stay up-to-date with the latest releases from your favorite artists.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-purple-700 text-white py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <p>&copy; 2025 MusicApp. All rights reserved.</p>
         
        </div>
      </footer>
    </div>
  );
}
