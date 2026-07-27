import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const suggestions = [
  "Who is expiring soon?",
  "Give me a summary of my gym",
  "Who has pending payments?",
  "Who hasn't visited in a while?",
];

export default function AskAI() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const ask = async (q) => {
    const finalQuestion = q || question;
    if (!finalQuestion.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: finalQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: finalQuestion });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask();
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">🤖</span>
        <h2
          className="font-semibold text-lg"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          Ask AI
        </h2>
      </div>
      <p className="text-xs mb-5" style={{ color: "var(--text-faint)" }}>
        Ask anything about your gym — revenue, renewals, attendance, dues.
      </p>

      {/* Suggestions — show only before first question */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="text-xs px-3 py-1.5 rounded-full transition"
              style={{
                background: "rgba(45,212,196,0.1)",
                color: "var(--brand-teal)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat history */}
      {messages.length > 0 && (
        <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] text-sm px-4 py-2.5 rounded-xl"
                style={
                  m.role === "user"
                    ? { background: "var(--brand-orange)", color: "#fff" }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--text-muted)",
                      }
                }
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="text-sm px-4 py-2.5 rounded-xl flex items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text-faint)",
                }}
              >
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Who is due for renewal?"
          className="input-premium flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="btn-primary px-5"
          style={{ opacity: loading || !question.trim() ? 0.5 : 1 }}
        >
          Ask
        </button>
      </form>
    </div>
  );
}
