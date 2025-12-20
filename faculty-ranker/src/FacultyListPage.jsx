import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FacultyCard from "./FacultyCard";
import Pagination from "./Pagination";
import GoogleSignIn from "./GoogleSignIn";
import { useTheme, ThemeToggle } from "./ThemeContext";
import { useAuth } from "./AuthContext";
import { fuzzyMatch } from "./helpers/functions";

const PAGE_SIZE = 9;
const API_BASE = import.meta.env.VITE_ENVIRONMENT === 'PRODUCTION'
  ? import.meta.env.VITE_API_BASE_URL
  : "http://localhost:3000";
console.log(API_BASE);

export default function FacultyListPage() {
  const { colors } = useTheme();
  const { isLoggedIn, logout, login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const searchQuery = searchParams.get("q") || "";

  const [allFaculties, setAllFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE}/api/allFaculty`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json?.ok) return;
        
        const facultiesWithRatings = (json.data || []).map(faculty => {
          const ratings = faculty.ratings || {
            attendance: 0,
            leniency: 0,
            marking: 0
          };

          const overall = ratings.attendance && ratings.leniency && ratings.marking
            ? (ratings.attendance + ratings.leniency + ratings.marking) / 3
            : 0;
          
          return {
            ...faculty,
            ratings,
            overall
          };
        });
        
        setAllFaculties(facultiesWithRatings);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredFaculties = useMemo(() => {
    if (!searchQuery.trim()) return allFaculties;

    return allFaculties.filter((f) =>
      fuzzyMatch(
        searchQuery,
        `${f.name} ${f.department} ${f.designation} ${f.specialization ?? ""}`
      )
    );
  }, [searchQuery, allFaculties]);

  const total = filteredFaculties.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const paginatedFaculties = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredFaculties.slice(start, start + PAGE_SIZE);
  }, [filteredFaculties, page]);

  const setPage = (p) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", p);
      return next;
    });
  };

  const setSearchQuery = (q) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      q ? next.set("q", q) : next.delete("q");
      next.set("page", 1);
      return next;
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${colors.gradient} ${colors.text.primary} pb-20 transition-colors duration-500`}>
      {/* Auth & Theme Toggle */}
      <div className="absolute top-4 right-4 z-50 flex gap-3 items-center">
        <ThemeToggle />
        {isLoggedIn ? (
          <button
            onClick={logout}
            className={`${colors.button.primary} px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:scale-105`}
          >
            Logout
          </button>
        ) : (
          <GoogleSignIn onSuccess={login} />
        )}
      </div>

      {/* Header */}
      <div className="pt-10 text-center">
        <h1 className={`text-4xl font-bold mt-20 ${colors.text.primary}`}>VIT-AP Faculty Ranker</h1>
        <p className={`mt-4 text-lg ${colors.text.secondary}`}>Pick your faculty wisely</p>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <textarea
          rows={1}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          className={`w-full h-14 ${colors.bg.input} border ${colors.border} rounded-3xl px-6 py-3 text-lg resize-none transition-all duration-300 focus:outline-none focus:ring-2 ${colors.text.primary}`}
          placeholder="Search faculty..."
        />
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto mt-10 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className={`h-64 ${colors.bg.card} rounded-xl animate-pulse border ${colors.border}`} />
          ))}

        {!loading &&
          paginatedFaculties.map((f) => (
            <Link to={`/faculty/${f.emp_id}`} key={f.emp_id}>
              <FacultyCard faculty={f} isLoggedIn={isLoggedIn} isClickable />
            </Link>
          ))}

        {!loading && paginatedFaculties.length === 0 && (
          <div className={`col-span-full text-center ${colors.text.muted} py-16`}>
            No results for "{searchQuery}"
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        current={page}
        totalPages={totalPages}
        onPage={setPage}
      />
    </div>
  );
}