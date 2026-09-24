import { NavLink } from "react-router-dom";

import {
  Home,
  FileText,
  Sparkles,
  ClipboardCheck,
  Layers,
  ChartNoAxesCombined,
  Settings,
} from "lucide-react";

function Sidebar() {
  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: Home,
      end: true,
    },
    {
      to: "/documents",
      label: "Documents",
      icon: FileText,
    },
    {
      to: "/ai-tutor",
      label: "AI Tutor",
      icon: Sparkles,
    },
    {
      to: "/quizzes",
      label: "Quizzes",
      icon: ClipboardCheck,
    },
    {
      to: "/flashcards",
      label: "Flashcards",
      icon: Layers,
    },
    {
      to: "/progress",
      label: "Progress",
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950">

      {/* Logo */}
      <div className="flex h-20 items-center border-b border-slate-800 px-6">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold shadow-lg shadow-indigo-500/20">
            S
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              StudyGen
            </h1>

            <p className="text-xs text-slate-400">
              AI Study Assistant
            </p>
          </div>

        </div>
      </div>


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>

        <div className="space-y-1">

          {navItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >

                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                <span>
                  {item.label}
                </span>

              </NavLink>
            );
          })}

        </div>
      </nav>


      {/* Bottom Section */}
      <div className="border-t border-slate-800 p-4">

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`
          }
        >

          <Settings
            size={18}
            strokeWidth={1.8}
          />

          Settings

        </NavLink>


        {/* User Profile */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold">
            H
          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-medium text-white">
              Student
            </p>

            <p className="truncate text-xs text-slate-500">
              Free Plan
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;