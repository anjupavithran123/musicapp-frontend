import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function SearchBar({ type = "track", onResults }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results from Supabase
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery) {
        onResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("tracks")
          .select("*")
          .ilike("title", `%${debouncedQuery}%`) // case-insensitive search
          .not("audio_path", "is", null);

        if (error) throw error;
        onResults(data || []);
      } catch (err) {
        console.error("Search error:", err);
        onResults([]);
      }
    };

    fetchResults();
  }, [debouncedQuery, type]);

  return (
    <input
      type="text"
      placeholder="Search music..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full p-2 border rounded"
    />
  );
}
