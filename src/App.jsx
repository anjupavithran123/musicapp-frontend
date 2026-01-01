// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Music from "./pages/Music";
import AdminUpload from "./pages/AdminUpload";
import AdminLogin from "./pages/adminlogin";
import PodcastList from "./pages/AdminPodcastList";
import PodcastDetail from "./pages/Podcasts";
import AdminEpisodeUpload from "./pages/AdminEpisodeUpload";
import AdminPodcastCreate from "./pages/AdminPodcastCreate";
import AdminPodcastEdit from "./pages/AdminPodcastEdit";
import AdminPodcastEpisodesview from "./pages/AdminPodcastEpisodesview";
import MusicList from "./pages/AdminMusicList";
import UserPodcastEpisodesview from "./pages/Podcastepisod";
import MusicPlayer from "./pages/MusicPlayer";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";

// Components
import Playlists from "./components/playlist";
import PlaylistDetail from "./components/PlaylistDetail";
import Player from "./components/Player";
import Navbar from "./components/Navbar";

/* 🔐 Admin Route Wrapper */
function AdminRoute({ isAdmin, children }) {
  if (!isAdmin) return <Navigate to="/login" />;
  return children;
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch profile
  useEffect(() => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  const isAdmin = !!session && profile?.role === "admin";
  const isUser = !!session && profile?.role !== "admin";

  if (loading) return <p className="p-4">Loading...</p>;

  // Pages where Navbar should NOT appear
  const noNavbarPages = ["/login", "/register", "/adminlogin"];
  const showNavbar = !noNavbarPages.includes(location.pathname);

  // Hide player on MusicPlayer page
  const hidePlayer = location.pathname.startsWith("/player");

  return (
    <>
      {/* Navbar */}
      {showNavbar && <Navbar session={session} profile={profile} />}

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            !session ? <Login /> : isAdmin ? <Navigate to="/admin/upload" /> : <Navigate to="/" />
          }
        />
        <Route
          path="/register"
          element={!session ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/adminlogin"
          element={
            !session ? <AdminLogin /> : isAdmin ? <Navigate to="/admin/upload" /> : <Navigate to="/" />
          }
        />

        {/* Home for guests */}
        <Route
          path="/"
          element={!session ? <Home /> : isUser ? <Music /> : <Navigate to="/admin/music" />}
        />

        {/* User Routes */}
        <Route
          path="/favorites"
          element={isUser ? <Favorites user={session.user} /> : <Navigate to="/login" />}
        />
        <Route path="/podcasts" element={isUser ? <PodcastDetail /> : <Navigate to="/login" />} />
        <Route path="/playlists" element={isUser ? <Playlists userId={profile?.id} /> : <Navigate to="/login" />} />
        <Route path="/playlists/:id" element={isUser ? <PlaylistDetail userId={profile?.id} /> : <Navigate to="/login" />} />
        <Route path="/player/:id" element={<MusicPlayer />} />

        {/* Admin Routes */}
        <Route path="/admin/music" element={<AdminRoute isAdmin={isAdmin}><MusicList /></AdminRoute>} />
        <Route path="/admin/upload" element={<AdminRoute isAdmin={isAdmin}><AdminUpload session={session} profile={profile} /></AdminRoute>} />
        <Route path="/admin/podcasts" element={<AdminRoute isAdmin={isAdmin}><PodcastList /></AdminRoute>} />
        <Route path="/admin/podcasts/:id" element={<AdminRoute isAdmin={isAdmin}><PodcastDetail /></AdminRoute>} />
        <Route path="/admin/podcasts/edit/:id" element={<AdminPodcastEdit />} />
        <Route path="/admin/podcasts/:podcastId/episodes" element={<AdminPodcastEpisodesview />} />
        <Route path="/admin/podcasts/create" element={<AdminRoute isAdmin={isAdmin}><AdminPodcastCreate /></AdminRoute>} />
        <Route path="/admin/podcasts/episode-upload" element={<AdminRoute isAdmin={isAdmin}><AdminEpisodeUpload /></AdminRoute>} />
        <Route path="/podcasts/:podcastId/episodes" element={isUser ? <UserPodcastEpisodesview /> : <Navigate to="/login" />} />

        {/* Catch-all */}
        <Route
          path="*"
          element={session ? (isAdmin ? <Navigate to="/admin/upload" /> : <Navigate to="/" />) : <Navigate to="/login" />}
        />
      </Routes>

      {/* Global Player */}
      {isUser && !hidePlayer && <Player userId={profile?.id} />}
    </>
  );
}
