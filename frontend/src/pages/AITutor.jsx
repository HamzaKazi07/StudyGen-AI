import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function AITutor() {
  // -----------------------------------------------------
  // State
  // -----------------------------------------------------

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! 👋 I'm your StudyGen AI Tutor. Ask me anything about your studies.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------------------------------
  // Chat scroll reference
  // -----------------------------------------------------

  const chatContainerRef = useRef(null);

  // -----------------------------------------------------
  // Automatically scroll chat to latest message
  // -----------------------------------------------------

  useEffect(() => {
    const container = chatContainerRef.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  // -----------------------------------------------------
  // Ask AI
  // -----------------------------------------------------

  const askTutor = async () => {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion || loading) {
    return;
  }

  setError("");
  setLoading(true);

  // ---------------------------------------------------
  // Add user message immediately
  // ---------------------------------------------------

  const userMessage = {
    role: "user",
    text: trimmedQuestion,
  };

  const updatedMessages = [
    ...messages,
    userMessage,
  ];

  setMessages(updatedMessages);
  setQuestion("");

  try {
    // -------------------------------------------------
    // Send previous conversation as history
    // -------------------------------------------------

    const history = messages
      .filter(
        (message) =>
          message.role === "user" ||
          message.role === "assistant"
      )
      .slice(-20)
      .map((message) => ({
        role: message.role,
        text: message.text,
      }));

    // -------------------------------------------------
    // Send request to backend
    // -------------------------------------------------

    const response = await fetch(
      `${API_URL}/api/tutor/ask`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },

        body: JSON.stringify({
          question: trimmedQuestion,
          history: history,
        }),
      }
    );

    // -------------------------------------------------
    // Handle HTTP errors
    // -------------------------------------------------

    if (!response.ok) {
      let errorMessage =
        "The StudyGen AI backend is unavailable.";

      try {
        const errorData = await response.json();

        errorMessage =
          errorData?.detail || errorMessage;
      } catch {
        // Ignore JSON parsing error
      }

      throw new Error(errorMessage);
    }

    // -------------------------------------------------
    // Make sure streaming is supported
    // -------------------------------------------------

    if (!response.body) {
      throw new Error(
        "The browser does not support streaming responses."
      );
    }

    // -------------------------------------------------
    // Create empty assistant message
    // -------------------------------------------------

    const assistantMessage = {
      role: "assistant",
      text: "",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      assistantMessage,
    ]);

    // -------------------------------------------------
    // Read streaming response
    // -------------------------------------------------

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    let buffer = "";
    let assistantText = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      // SSE events are separated by blank lines
      const events = buffer.split("\n\n");

      // Keep incomplete event for next chunk
      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.trim()) {
          continue;
        }

        const lines = event.split("\n");

        let eventType = "";
        let dataText = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line
              .substring(6)
              .trim();
          }

          if (line.startsWith("data:")) {
            dataText += line
              .substring(5)
              .trim();
          }
        }

        if (!dataText) {
          continue;
        }

        let data;

        try {
          data = JSON.parse(dataText);
        } catch {
          continue;
        }

        // ---------------------------------------------
        // AI text chunk
        // ---------------------------------------------

        if (eventType === "chunk") {
          const textChunk = data?.text || "";

          assistantText += textChunk;

          setMessages((currentMessages) => {
            const updated = [...currentMessages];

            const lastIndex =
              updated.length - 1;

            if (
              lastIndex >= 0 &&
              updated[lastIndex].role === "assistant"
            ) {
              updated[lastIndex] = {
                ...updated[lastIndex],
                text: assistantText,
              };
            }

            return updated;
          });
        }

        // ---------------------------------------------
        // Stream error
        // ---------------------------------------------

        if (eventType === "error") {
          throw new Error(
            data?.message ||
              "The AI service is temporarily unavailable."
          );
        }

        // ---------------------------------------------
        // Stream complete
        // ---------------------------------------------

        if (eventType === "done") {
          // Nothing required here.
          // The assistant message is already updated.
        }
      }
    }

    // -------------------------------------------------
    // Make sure we received an answer
    // -------------------------------------------------

    if (!assistantText.trim()) {
      throw new Error(
        "The AI service returned an empty response."
      );
    }

  } catch (err) {
    console.error(
      "AI Tutor Streaming Error:",
      err
    );

    // Remove empty assistant message if streaming failed
    setMessages((currentMessages) => {
      const lastMessage =
        currentMessages[currentMessages.length - 1];

      if (
        lastMessage?.role === "assistant" &&
        !lastMessage.text
      ) {
        return currentMessages.slice(0, -1);
      }

      return currentMessages;
    });

    setError(
      err.message ||
        "Sorry, something went wrong while contacting the StudyGen AI backend."
    );

  } finally {
    setLoading(false);
  }
};

  // -----------------------------------------------------
  // Enter key
  // -----------------------------------------------------

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askTutor();
    }
  };

  // -----------------------------------------------------
  // Clear chat
  // -----------------------------------------------------

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Hello! 👋 I'm your StudyGen AI Tutor. Ask me anything about your studies.",
      },
    ]);

    setError("");
  };

  // -----------------------------------------------------
  // JSX
  // -----------------------------------------------------

  return (
    /*
      IMPORTANT:
      This page occupies exactly the available viewport
      below the application header.

      The page itself NEVER scrolls.
      Only the chat message area scrolls.
    */
    <div
      className="
        h-[calc(100dvh-80px)]
        min-h-0
        overflow-hidden
        bg-[#020617]
        text-white
      "
    >
      {/* -------------------------------------------------
          MAIN CONTENT
      ------------------------------------------------- */}

      <main
        className="
          flex
          h-full
          min-h-0
          flex-col
          overflow-hidden
          px-6
          py-5
        "
      >
        {/* -------------------------------------------------
            PAGE HEADER
        ------------------------------------------------- */}

        <div
          className="
            mb-4
            flex
            shrink-0
            items-center
            justify-between
          "
        >
          <div>
            <p className="mb-1 text-sm font-medium text-violet-400">
              AI Study Assistant
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              AI Tutor
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Ask questions, understand difficult topics,
              and learn with your AI tutor.
            </p>
          </div>

          {/* Clear Chat */}

          <button
            onClick={clearChat}
            disabled={loading}
            className="
              shrink-0
              rounded-xl
              border
              border-slate-700
              bg-slate-950/50
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-300
              transition
              hover:border-slate-600
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            🗑 Clear Chat
          </button>
        </div>

        {/* -------------------------------------------------
            CHAT CARD

            IMPORTANT:
            min-h-0 + flex-1 + overflow-hidden prevents
            the whole page from getting a scrollbar.
        ------------------------------------------------- */}

        <div
          className="
            flex
            min-h-0
            flex-1
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-slate-800
            bg-[#070d20]
          "
        >
          {/* -------------------------------------------------
              TUTOR HEADER

              FIXED
              Does not scroll.
          ------------------------------------------------- */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-800
              px-6
              py-4
            "
          >
            <div className="flex items-center gap-4">

              {/* AI Avatar */}

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-600/20
                  text-xl
                "
              >
                🤖
              </div>

              {/* AI Information */}

              <div>
                <h2 className="font-semibold text-white">
                  StudyGen AI Tutor
                </h2>

                <div className="mt-0.5 flex items-center gap-2 text-xs">

                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-emerald-400
                    "
                  />

                  <span className="text-emerald-400">
                    {loading
                      ? "Thinking..."
                      : "Online"}
                  </span>

                </div>
              </div>
            </div>

            {/* AI Powered */}

            <span
              className="
                rounded-lg
                border
                border-violet-500/30
                bg-violet-500/10
                px-3
                py-1.5
                text-xs
                text-violet-300
              "
            >
              AI Powered
            </span>
          </div>

          {/* -------------------------------------------------
              CHAT MESSAGES

              ONLY THIS AREA SCROLLS.

              This is the ONLY overflow-y-auto in the
              entire AI Tutor component.
          ------------------------------------------------- */}

          <div
            ref={chatContainerRef}
            className="
              min-h-0
              flex-1
              overflow-x-hidden
              overflow-y-auto
              px-6
              py-6
              scrollbar-thin
              scrollbar-track-transparent
              scrollbar-thumb-slate-700
            "
          >
            <div
              className="
                mx-auto
                flex
                w-full
                max-w-5xl
                flex-col
                gap-6
              "
            >
              {/* -------------------------------------------------
                  MESSAGES
              ------------------------------------------------- */}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  {/* -------------------------------------------------
                      ASSISTANT MESSAGE
                  ------------------------------------------------- */}

                  {message.role === "assistant" ? (
                    <div className="flex max-w-[85%] gap-3">

                      {/* AI Avatar */}

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-violet-600/20
                        "
                      >
                        🤖
                      </div>

                      {/* Message */}

                      <div
                        className="
                          min-w-0
                          rounded-2xl
                          rounded-tl-md
                          border
                          border-slate-700
                          bg-slate-900/80
                          px-5
                          py-4
                          text-slate-200
                        "
                      >
                        <div
                          className="
                            prose
                            prose-invert
                            max-w-none
                            text-sm
                            leading-7
                            prose-headings:text-white
                            prose-p:text-slate-200
                            prose-li:text-slate-200
                            prose-strong:text-white
                            prose-code:text-violet-300
                          "
                        >
                          <ReactMarkdown>
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* -------------------------------------------------
                       USER MESSAGE
                    ------------------------------------------------- */

                    <div
                      className="
                        max-w-[75%]
                        rounded-2xl
                        rounded-tr-md
                        bg-violet-600
                        px-5
                        py-3.5
                        text-sm
                        leading-6
                        text-white
                        shadow-lg
                        shadow-violet-900/10
                      "
                    >
                      {message.text}
                    </div>
                  )}
                </div>
              ))}

              {/* -------------------------------------------------
                  LOADING INDICATOR
              ------------------------------------------------- */}

              {loading && (
                <div className="flex justify-start">

                  <div className="flex gap-3">

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-violet-600/20
                      "
                    >
                      🤖
                    </div>

                    <div
                      className="
                        rounded-2xl
                        rounded-tl-md
                        border
                        border-slate-700
                        bg-slate-900/80
                        px-5
                        py-4
                      "
                    >
                      <div className="flex items-center gap-1.5">

                        <span
                          className="
                            h-2
                            w-2
                            animate-bounce
                            rounded-full
                            bg-violet-400
                          "
                        />

                        <span
                          className="
                            h-2
                            w-2
                            animate-bounce
                            rounded-full
                            bg-violet-400
                          "
                          style={{
                            animationDelay: "0.15s",
                          }}
                        />

                        <span
                          className="
                            h-2
                            w-2
                            animate-bounce
                            rounded-full
                            bg-violet-400
                          "
                          style={{
                            animationDelay: "0.3s",
                          }}
                        />

                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* -------------------------------------------------
                  ERROR
              ------------------------------------------------- */}

              {error && (
                <div className="flex justify-start">

                  <div
                    className="
                      max-w-[85%]
                      rounded-2xl
                      border
                      border-red-500/20
                      bg-red-500/10
                      px-5
                      py-4
                      text-sm
                      text-red-300
                    "
                  >
                    {error}
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* -------------------------------------------------
              INPUT AREA

              FIXED AT BOTTOM.
              DOES NOT SCROLL.
          ------------------------------------------------- */}

          <div
            className="
              shrink-0
              border-t
              border-slate-800
              bg-[#070d20]
              px-5
              py-4
            "
          >
            <div className="mx-auto w-full max-w-5xl">

              <div
                className="
                  flex
                  items-end
                  gap-3
                  rounded-2xl
                  border
                  border-slate-700
                  bg-[#020617]
                  p-2
                  transition
                  focus-within:border-violet-500/70
                "
              >

                {/* Input */}

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  maxLength={4000}
                  rows={1}
                  placeholder="Ask your AI tutor anything..."
                  className="
                    max-h-32
                    min-h-[44px]
                    flex-1
                    resize-none
                    border-0
                    bg-transparent
                    px-3
                    py-2.5
                    text-sm
                    leading-6
                    text-white
                    outline-none
                    placeholder:text-slate-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

                {/* Ask AI Button */}

                <button
                  onClick={askTutor}
                  disabled={
                    loading ||
                    !question.trim()
                  }
                  className="
                    shrink-0
                    rounded-xl
                    bg-violet-600
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-violet-500
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {loading
                    ? "Thinking..."
                    : "Ask AI →"}
                </button>

              </div>

              {/* Disclaimer */}

              <p
                className="
                  mt-2
                  text-center
                  text-[11px]
                  text-slate-600
                "
              >
                StudyGen AI can make mistakes. Verify important information.
              </p>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default AITutor;