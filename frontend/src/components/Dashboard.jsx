function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <section>
        <p className="text-sm font-medium text-indigo-400">
          Friday, August 8
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Welcome back, Student 👋
        </h1>

        <p className="mt-2 text-slate-400">
          Continue learning and let AI help you study smarter.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Study Time</p>
          <h2 className="mt-2 text-3xl font-bold">12.5h</h2>
          <p className="mt-2 text-sm text-emerald-400">
            ↑ 18% this week
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Quizzes Completed</p>
          <h2 className="mt-2 text-3xl font-bold">24</h2>
          <p className="mt-2 text-sm text-indigo-400">
            86% average score
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Study Streak</p>
          <h2 className="mt-2 text-3xl font-bold">7 days 🔥</h2>
          <p className="mt-2 text-sm text-slate-400">
            Keep it going!
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Topics Mastered</p>
          <h2 className="mt-2 text-3xl font-bold">18</h2>
          <p className="mt-2 text-sm text-emerald-400">
            +4 this week
          </p>
        </div>

      </section>

      {/* AI Quick Actions */}
      <section>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            AI Study Tools
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a tool to start studying.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          <button className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-500/10 to-slate-900 p-5 text-left transition hover:-translate-y-1 hover:border-indigo-500/50">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-xl">
              ✨
            </div>

            <h3 className="font-semibold">
              Generate Summary
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Turn your study material into concise AI summaries.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-indigo-400">
              Generate →
            </span>

          </button>

          <button className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-purple-500/10 to-slate-900 p-5 text-left transition hover:-translate-y-1 hover:border-purple-500/50">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-xl">
              🧠
            </div>

            <h3 className="font-semibold">
              Create Quiz
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Generate personalized MCQs from your documents.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-purple-400">
              Create quiz →
            </span>

          </button>

          <button className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-5 text-left transition hover:-translate-y-1 hover:border-cyan-500/50">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-xl">
              🃏
            </div>

            <h3 className="font-semibold">
              Make Flashcards
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Convert important concepts into smart flashcards.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-cyan-400">
              Create cards →
            </span>

          </button>

          <button className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-emerald-500/10 to-slate-900 p-5 text-left transition hover:-translate-y-1 hover:border-emerald-500/50">

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-xl">
              💬
            </div>

            <h3 className="font-semibold">
              Ask AI Tutor
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Ask questions and get help understanding difficult topics.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-emerald-400">
              Ask AI →
            </span>

          </button>

        </div>

      </section>

      {/* Recent Documents */}
      <section>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Recent Documents
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Continue studying your recent materials.
            </p>
          </div>

          <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
            View all →
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50">

          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-xl">
                📄
              </div>

              <div>
                <h3 className="font-medium">
                  Artificial Intelligence Notes
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  PDF • 24 pages • Updated today
                </p>
              </div>

            </div>

            <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700">
              Open
            </button>
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                📘
              </div>

              <div>
                <h3 className="font-medium">
                  Machine Learning Fundamentals
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  PDF • 42 pages • Updated yesterday
                </p>
              </div>

            </div>

            <button className="rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700">
              Open
            </button>
          </div>

        </div>

      </section>

    </div>
  )
}

export default Dashboard