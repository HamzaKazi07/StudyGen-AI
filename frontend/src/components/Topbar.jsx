import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

function Topbar() {
  const { user, loading, logout } = useAuth();
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    try {
      await logout();
    } catch (logoutError) {
      setError(logoutError.message || "Unable to sign out.");
    }
  };

  return (
    <header className="relative flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 backdrop-blur">

      {/* Search */}
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Search your workspace..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Upgrade */}
        <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-indigo-500">
          Upgrade
        </button>

        {/* Notification */}
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800">
          🔔
        </button>

        {/* Profile */}
        {user && (
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold">
            {user?.email?.charAt(0).toUpperCase() || "S"}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {user?.email}
            </p>
            <p className="text-xs text-slate-500">
              Signed in
            </p>
          </div>
        </div>
        )}
        {!user && !loading && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Browsing as a guest</span>
            <Link
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              to="/login"
            >
              Sign in
            </Link>
          </div>
        )}
        {user && (
        <button
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          type="button"
          onClick={handleLogout}
        >
          Sign out
        </button>
        )}

      </div>
      {error && (
        <p className="absolute right-8 top-full z-10 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}
    </header>
  )
}

export default Topbar