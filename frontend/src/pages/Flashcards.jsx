import { useState } from "react";

function Flashcards() {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const cards = [
    {
      question: "What is Artificial Intelligence?",
      answer:
        "Artificial Intelligence is the branch of computer science that focuses on creating systems capable of performing tasks that normally require human intelligence.",
      topic: "Artificial Intelligence",
    },
    {
      question: "What is Machine Learning?",
      answer:
        "Machine Learning is a subset of AI that enables computers to learn patterns from data and make predictions or decisions without being explicitly programmed.",
      topic: "Machine Learning",
    },
    {
      question: "What is supervised learning?",
      answer:
        "Supervised learning is a machine learning approach where a model learns from labeled training data.",
      topic: "Machine Learning",
    },
    {
      question: "What is a database?",
      answer:
        "A database is an organized collection of data that can be stored, accessed, managed, and updated efficiently.",
      topic: "DBMS",
    },
  ];

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
    setShowAnswer(false);
  };

  const previousCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
    setShowAnswer(false);
  };

  const card = cards[currentCard];

  return (
    <div className="space-y-8">

      {/* Header */}
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>
          <p className="mb-2 text-sm font-medium text-cyan-400">
            Active Recall
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
            Flashcards
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Review important concepts using smart flashcards and strengthen
            your memory through active recall.
          </p>
        </div>

        <button
          onClick={() => alert("AI Flashcard Generator coming next!")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/10 transition hover:scale-[1.02]"
        >
          <span>✦</span>
          Generate Flashcards
        </button>

      </section>


      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">
            Total Cards
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            128
          </p>

          <p className="mt-2 text-xs text-cyan-400">
            Across 8 subjects
          </p>
        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">
            Cards Reviewed
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            86
          </p>

          <p className="mt-2 text-xs text-emerald-400">
            ↑ 14 this week
          </p>
        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">
            Mastered
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            64%
          </p>

          <p className="mt-2 text-xs text-indigo-400">
            Keep practicing
          </p>
        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">
            Study Streak
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            7 days 🔥
          </p>

          <p className="mt-2 text-xs text-amber-400">
            Personal best
          </p>
        </div>

      </section>


      {/* Flashcard Area */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50">

        {/* Card Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center">

          <div>
            <h2 className="font-semibold text-white">
              Study Session
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {card.topic}
            </p>
          </div>

          <div className="text-sm text-slate-400">
            Card{" "}
            <span className="font-semibold text-white">
              {currentCard + 1}
            </span>{" "}
            of {cards.length}
          </div>

        </div>


        {/* Flashcard */}
        <div className="p-6">

          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="mx-auto flex min-h-[360px] max-w-4xl cursor-pointer items-center justify-center rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 via-slate-950 to-violet-600/10 p-10 text-center transition hover:border-indigo-500/40"
          >

            <div className="max-w-2xl">

              {!showAnswer ? (
                <>
                  <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
                    ❓
                  </div>

                  <p className="mb-3 text-xs font-medium uppercase tracking-widest text-indigo-400">
                    Question
                  </p>

                  <h3 className="text-2xl font-bold leading-relaxed text-white lg:text-3xl">
                    {card.question}
                  </h3>

                  <p className="mt-8 text-sm text-slate-500">
                    Click the card to reveal the answer
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl">
                    💡
                  </div>

                  <p className="mb-3 text-xs font-medium uppercase tracking-widest text-emerald-400">
                    Answer
                  </p>

                  <p className="text-lg leading-8 text-slate-200 lg:text-xl">
                    {card.answer}
                  </p>

                  <p className="mt-8 text-sm text-slate-500">
                    Click the card to see the question again
                  </p>
                </>
              )}

            </div>

          </div>


          {/* Controls */}
          <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-3 sm:flex-row">

            <button
              onClick={previousCard}
              className="flex-1 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            >
              ← Previous
            </button>

            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              {showAnswer ? "Show Question" : "Show Answer"}
            </button>

            <button
              onClick={nextCard}
              className="flex-1 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            >
              Next →
            </button>

          </div>

        </div>

      </section>


      {/* Decks */}
      <section>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Your Flashcard Decks
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Organize your cards by subject.
          </p>
        </div>


        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[
            {
              title: "Artificial Intelligence",
              cards: 32,
              icon: "🤖",
            },
            {
              title: "Machine Learning",
              cards: 28,
              icon: "🧠",
            },
            {
              title: "Python Programming",
              cards: 40,
              icon: "🐍",
            },
            {
              title: "Database Management",
              cards: 28,
              icon: "🗄️",
            },
          ].map((deck) => (

            <div
              key={deck.title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-slate-900"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
                  {deck.icon}
                </div>

                <span className="text-xs text-slate-500">
                  {deck.cards} cards
                </span>

              </div>

              <h3 className="mt-5 font-semibold text-white">
                {deck.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Continue reviewing your cards.
              </p>

              <button className="mt-5 text-sm font-medium text-indigo-400 transition hover:text-indigo-300">
                Study deck →
              </button>

            </div>

          ))}

        </div>

      </section>


      {/* Study Tip */}
      <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-indigo-500/5 to-violet-500/5 p-6">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
            💡
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Active Recall Tip
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Try answering the question before revealing the answer. This
              helps strengthen your memory and improves long-term retention.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Flashcards;