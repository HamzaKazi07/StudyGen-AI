function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 backdrop-blur">

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
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold">
            H
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Student
            </p>
            <p className="text-xs text-slate-500">
              Free Plan
            </p>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Topbar