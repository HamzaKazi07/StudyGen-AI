function Progress() {
  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.2 },
    { day: "Wed", hours: 1.8 },
    { day: "Thu", hours: 4.1 },
    { day: "Fri", hours: 3.5 },
    { day: "Sat", hours: 2.7 },
    { day: "Sun", hours: 4.4 },
  ];

  const subjects = [
    {
      name: "Artificial Intelligence",
      progress: 86,
      score: "92%",
      color: "bg-indigo-500",
    },
    {
      name: "Machine Learning",
      progress: 74,
      score: "84%",
      color: "bg-cyan-500",
    },
    {
      name: "Python Programming",
      progress: 68,
      score: "79%",
      color: "bg-emerald-500",
    },
    {
      name: "Database Management",
      progress: 58,
      score: "71%",
      color: "bg-violet-500",
    },
  ];

  const activities = [
    {
      icon: "🧠",
      title: "Completed Machine Learning Quiz",
      detail: "Score: 86%",
      time: "Today, 10:42 AM",
    },
    {
      icon: "📚",
      title: "Reviewed AI Flashcards",
      detail: "18 cards reviewed",
      time: "Yesterday, 8:20 PM",
    },
    {
      icon: "📄",
      title: "Studied Artificial Intelligence Notes",
      detail: "32 minutes",
      time: "Yesterday, 6:45 PM",
    },
    {
      icon: "🎯",
      title: "Completed Python Quiz",
      detail: "Score: 91%",
      time: "2 days ago",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <section>
        <p className="mb-2 text-sm font-medium text-indigo-400">
          Learning Analytics
        </p>

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
              Your Progress
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Track your learning performance, study habits, and academic
              progress in one place.
            </p>
          </div>

          <button className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:text-white">
            This Week ▾
          </button>
        </div>
      </section>


      {/* Main Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Overall Progress */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Overall Progress
            </p>

            <span className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs text-indigo-400">
              +8%
            </span>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold text-white">
              78%
            </span>

            <span className="mb-1 text-sm text-slate-500">
              completed
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[78%] rounded-full bg-indigo-500" />
          </div>
        </div>


        {/* Study Time */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">
            Study Time
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            12.5h
          </p>

          <p className="mt-2 text-sm text-emerald-400">
            ↑ 18% from last week
          </p>
        </div>


        {/* Average Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">
            Average Score
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            86%
          </p>

          <p className="mt-2 text-sm text-cyan-400">
            Excellent performance
          </p>
        </div>


        {/* Streak */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">
            Current Streak
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            7 days 🔥
          </p>

          <p className="mt-2 text-sm text-amber-400">
            Best: 12 days
          </p>
        </div>

      </section>


      {/* Study Activity + Streak */}
      <section className="grid gap-6 xl:grid-cols-3">

        {/* Weekly Activity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 xl:col-span-2">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Study Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Hours studied this week
              </p>
            </div>

            <span className="text-sm font-medium text-emerald-400">
              22.2h total
            </span>
          </div>


          {/* Chart */}
          <div className="mt-8 flex h-64 items-end justify-between gap-3">

            {weeklyData.map((item) => {

              const height = `${(item.hours / 5) * 100}%`;

              return (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                >

                  <span className="text-xs text-slate-500">
                    {item.hours}h
                  </span>

                  <div className="flex h-full w-full max-w-12 items-end">

                    <div
                      style={{ height }}
                      className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-400 transition hover:from-indigo-500 hover:to-cyan-400"
                    />

                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    {item.day}
                  </span>

                </div>
              );
            })}

          </div>

        </div>


        {/* Streak Card */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-500/10 via-slate-900/70 to-violet-500/10 p-6">

          <p className="text-sm font-medium text-indigo-400">
            Consistency
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Keep your streak alive 🔥
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            You have studied for 7 consecutive days. Just 5 more days to
            beat your personal best.
          </p>


          {/* Calendar */}
          <div className="mt-7 grid grid-cols-7 gap-2">

            {[
              "M",
              "T",
              "W",
              "T",
              "F",
              "S",
              "S",
            ].map((day, index) => (
              <div
                key={index}
                className="text-center text-xs text-slate-500"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: 14 }).map((_, index) => (
              <div
                key={index}
                className={`h-8 rounded-lg ${
                  index < 7
                    ? "bg-indigo-500"
                    : "bg-slate-800"
                }`}
              />
            ))}

          </div>


          <div className="mt-7 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-xs text-slate-500">
              Personal Best
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              12 days
            </p>
          </div>

        </div>

      </section>


      {/* Subject Progress */}
      <section>

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            Subject Performance
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            See how you're performing across different subjects.
          </p>
        </div>


        <div className="grid gap-4 lg:grid-cols-2">

          {subjects.map((subject) => (
            <div
              key={subject.name}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700"
            >

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="font-medium text-white">
                    {subject.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Average score: {subject.score}
                  </p>
                </div>

                <span className="text-lg font-bold text-white">
                  {subject.progress}%
                </span>

              </div>


              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className={`h-full rounded-full ${subject.color}`}
                  style={{
                    width: `${subject.progress}%`,
                  }}
                />

              </div>


              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{subject.progress}% mastered</span>
              </div>

            </div>
          ))}

        </div>

      </section>


      {/* Strong + Weak Topics */}
      <section className="grid gap-6 lg:grid-cols-2">

        {/* Strong Topics */}
        <div className="rounded-2xl border border-emerald-500/10 bg-slate-900/60 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              💪
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Strong Topics
              </h2>

              <p className="text-xs text-slate-500">
                Topics you're performing well in
              </p>
            </div>

          </div>


          <div className="mt-6 space-y-4">

            {[
              ["Neural Networks", "94%"],
              ["Python Functions", "92%"],
              ["Database Queries", "89%"],
              ["Search Algorithms", "87%"],
            ].map(([topic, score]) => (

              <div
                key={topic}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >

                <span className="text-sm text-slate-300">
                  {topic}
                </span>

                <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  {score}
                </span>

              </div>

            ))}

          </div>

        </div>


        {/* Weak Topics */}
        <div className="rounded-2xl border border-amber-500/10 bg-slate-900/60 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              🎯
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Topics to Improve
              </h2>

              <p className="text-xs text-slate-500">
                AI recommends reviewing these topics
              </p>
            </div>

          </div>


          <div className="mt-6 space-y-4">

            {[
              ["Bayesian Networks", "58%"],
              ["SQL Joins", "62%"],
              ["Reinforcement Learning", "64%"],
              ["Normalization", "67%"],
            ].map(([topic, score]) => (

              <div
                key={topic}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >

                <span className="text-sm text-slate-300">
                  {topic}
                </span>

                <span className="rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                  {score}
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* Recent Activity */}
      <section>

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Your latest learning activities.
          </p>
        </div>


        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">

          {activities.map((activity, index) => (

            <div
              key={activity.title}
              className={`flex items-center gap-4 p-5 ${
                index !== activities.length - 1
                  ? "border-b border-slate-800"
                  : ""
              }`}
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg">
                {activity.icon}
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-medium text-white">
                  {activity.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {activity.detail}
                </p>

              </div>

              <span className="hidden text-xs text-slate-500 sm:block">
                {activity.time}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* AI Recommendation */}
      <section className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600/10 via-violet-600/5 to-cyan-500/10">

        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">

          <div className="flex gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
              ✨
            </div>

            <div>

              <p className="text-sm font-medium text-indigo-400">
                AI Recommendation
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Focus on Bayesian Networks next
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Your recent quiz results show that Bayesian Networks is one
                of your weaker topics. A focused 30-minute review could
                significantly improve your score.
              </p>

            </div>

          </div>


          <button className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Start Review →
          </button>

        </div>

      </section>

    </div>
  );
}

export default Progress;