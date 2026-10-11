import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AuthPage from "./pages/AuthPage";
import Documents from "./pages/Documents";
import AITutor from "./pages/AITutor";
import Quizzes from "./pages/Quizzes";
import Flashcards from "./pages/Flashcards";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";

function ProtectedLayout() {
  const { user, loading, restoreError, restoreSession } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Restoring your session...
      </main>
    );
  }

  if (restoreError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-slate-300">
        <p role="alert">{restoreError}</p>
        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
          type="button"
          onClick={restoreSession}
        >
          Retry
        </button>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar />
      <div className="ml-64 flex h-screen min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Topbar />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai-tutor" element={<AITutor />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/documents" element={<Documents />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
