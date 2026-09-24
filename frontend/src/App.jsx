import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Documents from "./pages/Documents";
import AITutor from "./pages/AITutor";
import Quizzes from "./pages/Quizzes";
import Flashcards from "./pages/Flashcards";
import Progress from "./pages/Progress";

function App() {
  return (
    <BrowserRouter>

      {/* Full Screen Application */}
      <div className="flex h-screen overflow-hidden bg-slate-950 text-white">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Application Area */}
        <div className="ml-64 flex h-screen min-w-0 flex-1 flex-col">

          {/* Topbar */}
          <div className="shrink-0">
            <Topbar />
          </div>

          {/* Scrollable Page Content */}
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">

            <Routes>

              {/* Dashboard */}
              <Route
                path="/"
                element={<Dashboard />}
              />

              {/* Documents */}
              <Route
                path="/documents"
                element={<Documents />}
              />

              {/* AI Tutor */}
              <Route
                path="/ai-tutor"
                element={<AITutor />}
              />

              {/* Quizzes */}
              <Route
                path="/quizzes"
                element={<Quizzes />}
              />

              {/* Flashcards */}
              <Route
                path="/flashcards"
                element={<Flashcards />}
              />

              {/* Progress */}
              <Route
                path="/progress"
                element={<Progress />}
              />

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;