import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* 🔹 LOAD USER + PROFILE */
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          // 🔥 instant UI cleanup on logout
          setUser(null);
          setProfile(null);
        } else {
          load();
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  /* 🚀 FAST LOGOUT */
  const handleLogout = async () => {
    // 1️⃣ Navigate immediately (no waiting)
    navigate("/", { replace: true });

    // 2️⃣ Clear UI instantly
    setUser(null);
    setProfile(null);
    setOpen(false);

    // 3️⃣ Supabase logout in background
    await supabase.auth.signOut();
  };

  const linkClass = (path) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all
     ${
       location.pathname === path
         ? "bg-white/20 text-white"
         : "text-purple-100 hover:bg-white/10 hover:text-white"
     }`;

  return (
    <nav
      className="
        sticky top-0 z-50
        bg-gradient-to-r from-purple-700 via-purple-900 to-indigo-800
        shadow-lg shadow-purple-900/30
      "
    >
      <div className="max-w-screen-2xl mx-auto h-18 px-8 grid grid-cols-3 items-center">
        {/* 🔹 LOGO */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-wide text-white flex items-center gap-2"
        >
          <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            🎵
          </span>
          MusicApp
        </Link>

        {/* 🔹 CENTER MENU */}
        <div className="hidden md:flex justify-center gap-3">
          {profile?.role === "user" && (
            <>
              <Link to="/" className={linkClass("/")}>
                Music
              </Link>
              <Link to="/podcasts" className={linkClass("/podcasts")}>
                Podcasts
              </Link>
              <Link to="/favorites" className={linkClass("/favorites")}>
                Favorites
              </Link>
              <Link to="/playlists" className={linkClass("/playlists")}>
                Playlists
              </Link>
            </>
          )}

          {profile?.role === "admin" && (
            <>
              <Link to="/admin/music" className={linkClass("/admin/music")}>
                Music List
              </Link>
              <Link to="/admin/podcasts" className={linkClass("/admin/podcasts")}>
                Podcasts
              </Link>
              <Link to="/admin/upload" className={linkClass("/admin/upload")}>
                Upload
              </Link>
            </>
          )}
        </div>

        {/* 🔹 RIGHT ACTIONS */}
        <div className="hidden md:flex justify-end items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-purple-100 hover:text-white font-medium"
              >
                Login
              </Link>
              <Link
                to="/adminlogin"
                className="bg-white text-purple-700 px-5 py-2 rounded-lg font-semibold hover:bg-purple-100 transition"
              >
                Admin
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="text-red-300 hover:text-red-200 font-semibold"
            >
              Logout
            </button>
          )}
        </div>

        {/* 🔹 MOBILE MENU BUTTON */}
        <button
          className="md:hidden justify-self-end text-white text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* 🔹 MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-gradient-to-b from-purple-700 to-indigo-700 px-6 py-4 space-y-2 text-white">
          {profile?.role === "user" && (
            <>
              <Link to="/" className="block py-2">
                Music
              </Link>
              <Link to="/podcasts" className="block py-2">
                Podcasts
              </Link>
              <Link to="/favorites" className="block py-2">
                Favorites
              </Link>
              <Link to="/playlists" className="block py-2">
                Playlists
              </Link>
            </>
          )}

          {profile?.role === "admin" && (
            <>
              <Link to="/admin/music" className="block py-2">
                Music List
              </Link>
              <Link to="/admin/podcasts" className="block py-2">
                Podcasts
              </Link>
              <Link to="/admin/upload" className="block py-2">
                Upload
              </Link>
            </>
          )}

          <div className="border-t border-white/20 pt-3">
            {!user ? (
              <>
                <Link to="/login" className="block py-2">
                  Login
                </Link>
                <Link to="/register" className="block py-2">
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="block py-2 text-red-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
