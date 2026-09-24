import { useState } from "react";

function Quizzes() {
  const [topic, setTopic] = useState("Artificial Intelligence");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);

  const topics = [
    "Artificial Intelligence",
    "Machine Learning",
    "Python",
    "Data Structures",
    "Database Management",
    "Computer Networks",
  ];

  const recentQuizzes = [
    {
      title: "Artificial Intelligence Basics",
      questions: 20,
      score: "18/20",
      percentage: 90,
      difficulty: "Easy",
      time: "Today",
    },
    {
      title: "Machine Learning Fundamentals",
      questions: 15,
      score: "12/15",
      percentage: 80,
      difficulty: "Medium",
      time: "Yesterday",
    },
    {
      title: "Python Programming",
      questions: 25,
      score: "21/25",
      percentage: 84,
      difficulty: "Hard",
      time: "2 days ago",
    },
  ];

  const generateQuiz = () => {
    alert(
      `Quiz generated!\n\nTopic: ${topic}\nDifficulty: ${difficulty}\nQuestions: ${questionCount}`
    );
  };

  return (
    <div className="space-y-8">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>
          <p className="mb-2 text-sm font-medium text-indigo-400">
            AI Learning Lab
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
            Quizzes
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Test your knowledge with AI-generated quizzes tailored to your
            study materials and learning level.
          </p>
        </div>

        <button
          onClick={generateQuiz}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:scale-[1.02] hover:from-indigo-500 hover:to-violet-500"
        >
          <span>✦</span>
          Generate Quiz
        </button>

      </section>


      {/* ===================================================== */}
      {/* STATISTICS */}
      {/* ===================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Card 1 */}
        <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-indigo-500/40 hover:bg-slate-900">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-slate-400">
                Quizzes Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                24
              </p>

              <p className="mt-2 text-xs font-medium text-emerald-400">
                ↑ 12% this month
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
              📝
            </div>

          </div>
        </div>


        {/* Card 2 */}
        <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-violet-500/40 hover:bg-slate-900">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-slate-400">
                Average Score
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                86%
              </p>

              <p className="mt-2 text-xs font-medium text-indigo-400">
                Excellent performance
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
              🎯
            </div>

          </div>
        </div>


        {/* Card 3 */}
        <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-cyan-500/40 hover:bg-slate-900">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-slate-400">
                Questions Answered
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                482
              </p>

              <p className="mt-2 text-xs font-medium text-cyan-400">
                Keep practicing
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
              🧠
            </div>

          </div>
        </div>


        {/* Card 4 */}
        <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-emerald-500/40 hover:bg-slate-900">
          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-slate-400">
                Best Score
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                96%
              </p>

              <p className="mt-2 text-xs font-medium text-emerald-400">
                Personal best
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
              🏆
            </div>

          </div>
        </div>

      </section>


      {/* ===================================================== */}
      {/* QUIZ GENERATOR */}
      {/* ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">

        {/* Header */}
        <div className="border-b border-slate-800 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/15 text-xl">
              ✨
            </div>

            <div>
              <h2 className="font-semibold text-white">
                AI Quiz Generator
              </h2>

              <p className="text-sm text-slate-400">
                Create a personalized quiz in seconds.
              </p>
            </div>

          </div>

        </div>


        {/* Generator */}
        <div className="grid gap-6 p-6 lg:grid-cols-3">

          {/* Topic */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Select Topic
            </label>

            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>


          {/* Difficulty */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Difficulty
            </label>

            <div className="grid grid-cols-3 gap-2">

              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    difficulty === level
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}

            </div>
          </div>


          {/* Number of Questions */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Number of Questions
            </label>

            <div className="grid grid-cols-4 gap-2">

              {[5, 10, 15, 20].map((number) => (
                <button
                  key={number}
                  onClick={() => setQuestionCount(number)}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    questionCount === number
                      ? "border-indigo-500 bg-indigo-600 text-white"
                      : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {number}
                </button>
              ))}

            </div>
          </div>

        </div>


        {/* Selected Configuration */}
        <div className="mx-6 mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                Quiz Configuration
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {topic} • {difficulty} • {questionCount} questions
              </p>
            </div>

            <button
              onClick={generateQuiz}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Start Quiz →
            </button>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* RECENT QUIZZES */}
      {/* ===================================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Recent Quizzes
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Review your previous attempts and performance.
            </p>
          </div>

          <button className="text-sm font-medium text-indigo-400 transition hover:text-indigo-300">
            View all →
          </button>

        </div>


        <div className="grid gap-4 lg:grid-cols-3">

          {recentQuizzes.map((quiz) => (

            <div
              key={quiz.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-slate-900"
            >

              {/* Quiz Header */}
              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
                  📝
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    quiz.difficulty === "Easy"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : quiz.difficulty === "Medium"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {quiz.difficulty}
                </span>

              </div>


              {/* Title */}
              <h3 className="mt-5 font-semibold text-white">
                {quiz.title}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {quiz.questions} questions • {quiz.time}
              </p>


              {/* Score */}
              <div className="mt-5 flex items-end justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    Score
                  </p>

                  <p className="mt-1 text-xl font-bold text-white">
                    {quiz.score}
                  </p>
                </div>

                <p className="text-sm font-semibold text-emerald-400">
                  {quiz.percentage}%
                </p>

              </div>


              {/* Progress */}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${quiz.percentage}%` }}
                />

              </div>


              {/* Button */}
              <button className="mt-5 w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white">
                Review Quiz
              </button>

            </div>

          ))}

        </div>

      </section>


      {/* ===================================================== */}
      {/* AI TIP */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600/10 via-violet-600/10 to-cyan-600/10 p-6">

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-2xl">
            💡
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Study smarter with AI
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Generate quizzes from your uploaded documents to practice
              exactly what you're studying.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Quizzes;