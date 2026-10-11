import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, restoreError, authenticate } = useAuth();
  const isRegistration = location.pathname === "/register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return (
      <Navigate
        to={location.state?.from || "/"}
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authenticate(
        isRegistration ? "register" : "login",
        email,
        password,
      );
      navigate(location.state?.from || "/", { replace: true });
    } catch (authError) {
      setError(authError.message || "Unable to authenticate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold">StudyGen AI</h1>
        <p className="mt-2 text-sm text-slate-400">
          {isRegistration ? "Create your learning account" : "Sign in to continue"}
        </p>
        {location.state?.from?.pathname === "/documents" && (
          <p className="mt-4 text-sm text-indigo-200" role="status">
            Sign in to access your documents.
          </p>
        )}
        {loading && (
          <p className="mt-4 text-sm text-slate-300" role="status">
            Restoring your session...
          </p>
        )}
        {restoreError && (
          <p className="mt-4 rounded-lg border border-amber-900 bg-amber-950/40 p-3 text-sm text-amber-200" role="status">
            {restoreError}
          </p>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Email
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-indigo-500"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium">
            Password
            <input
              autoComplete={isRegistration ? "new-password" : "current-password"}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-indigo-500"
              type="password"
              minLength={isRegistration ? 12 : 1}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {isRegistration && (
              <span className="mt-1 block text-xs text-slate-500">
                Use at least 12 characters.
              </span>
            )}
          </label>

          {error && (
            <p className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          <button
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={submitting || loading}
          >
            {submitting
              ? "Please wait..."
              : isRegistration
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isRegistration ? "Already have an account?" : "New to StudyGen AI?"}{" "}
          <Link
            className="font-semibold text-indigo-300 hover:text-indigo-200"
            to={isRegistration ? "/login" : "/register"}
          >
            {isRegistration ? "Sign in" : "Create an account"}
          </Link>
        </p>
        {isRegistration && (
          <p className="mt-4 text-center text-xs text-slate-500">
            Email addresses are not verified, and password recovery is not available.
          </p>
        )}
      </section>
    </main>
  );
}

export default AuthPage;
