import { useState } from "react";

function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [quizReminders, setQuizReminders] = useState(false);
  const [language, setLanguage] = useState("English");
  const [aiStyle, setAiStyle] = useState("Balanced");

  return (
    <div className="mx-auto max-w-6xl space-y-8">

      {/* Header */}
      <section>
        <p className="text-sm font-medium text-indigo-400">
          Preferences
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Settings
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your profile, AI preferences, notifications and account.
        </p>
      </section>

      {/* Profile */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60">

        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white">
            Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information.
          </p>
        </div>

        <div className="p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white">
              H
            </div>

            <div className="grid flex-1 gap-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Display Name
                </label>

                <input
                  type="text"
                  defaultValue="Student"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                />
              </div>

            </div>

          </div>

          <button className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Save Profile
          </button>

        </div>

      </section>

      {/* AI Preferences */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60">

        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white">
            AI Preferences
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Customize how StudyGen AI helps you learn.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Preferred Language
            </label>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
              <option>Gujarati</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              AI Explanation Style
            </label>

            <select
              value={aiStyle}
              onChange={(e) => setAiStyle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option>Simple</option>
              <option>Balanced</option>
              <option>Detailed</option>
            </select>
          </div>

        </div>

      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60">

        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white">
            Notifications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose which study notifications you want to receive.
          </p>
        </div>

        <div className="divide-y divide-slate-800">

          <SettingToggle
            title="Email Notifications"
            description="Receive important account and study updates."
            enabled={emailNotifications}
            onChange={() =>
              setEmailNotifications(!emailNotifications)
            }
          />

          <SettingToggle
            title="Study Reminders"
            description="Remind me when it is time to continue studying."
            enabled={studyReminders}
            onChange={() =>
              setStudyReminders(!studyReminders)
            }
          />

          <SettingToggle
            title="Quiz Reminders"
            description="Receive reminders to practice quizzes."
            enabled={quizReminders}
            onChange={() =>
              setQuizReminders(!quizReminders)
            }
          />

        </div>

      </section>

      {/* Account */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Account
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your password and account security.
            </p>
          </div>

          <button className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:text-white">
            Change Password
          </button>

        </div>

      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <h2 className="font-semibold text-red-400">
              Danger Zone
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Permanently delete your account and stored study data.
            </p>
          </div>

          <button className="rounded-xl border border-red-500/30 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10">
            Delete Account
          </button>

        </div>

      </section>

    </div>
  );
}


/* Reusable Toggle Component */

function SettingToggle({ title, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-6 p-6">

      <div>
        <h3 className="text-sm font-medium text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? "bg-indigo-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>

    </div>
  );
}

export default Settings;