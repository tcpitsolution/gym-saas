import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import Animate from "../components/Animate";

const suggestions = [
  { icon: "📊", text: "Give me a summary of my gym" },
  { icon: "⏰", text: "Who is expiring soon?" },
  { icon: "💰", text: "Who has pending payments?" },
  { icon: "🏃", text: "Who hasn't visited in a while?" },
  { icon: "📈", text: "How is my revenue this month?" },
  { icon: "⚠️", text: "Show me overdue penalties" },
  { icon: "💪", text: "Tips to retain more members" },
  { icon: "🥗", text: "Best diet plan for weight loss" },
  { icon: "🏋️", text: "Beginner workout plan for gym" },
  { icon: "📅", text: "How to reduce member churn?" },
];

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /^### (.*$)/gm,
      "<h3 style='font-size:0.95rem;font-weight:600;margin:8px 0 4px'>$1</h3>",
    )
    .replace(
      /^## (.*$)/gm,
      "<h2 style='font-size:1rem;font-weight:700;margin:10px 0 4px'>$1</h2>",
    )
    .replace(
      /^- (.*$)/gm,
      "<li style='margin-left:16px;list-style:disc'>$1</li>",
    )
    .replace(/(<li.*<\/li>)/gs, "<ul style='margin:4px 0'>$1</ul>")
    .replace(/\n/g, "<br/>");
}

export default function AskAIPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    loadConversations();
    const cId = searchParams.get("c");
    if (cId) openConversation(cId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.get("/ai/conversations");
      setConversations(res.data);
    } catch {
      // history list is non-critical
    }
  };

  const openConversation = async (id) => {
    if (id === conversationId) return;
    setHistoryLoading(true);
    setHistoryOpen(false);
    try {
      const res = await api.get(`/ai/conversations/${id}`);
      setMessages(res.data.messages.map((m) => ({ role: m.role, text: m.text })));
      setConversationId(id);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (id === conversationId) clearChat();
    } catch {
      // ignore
    }
  };

  const ask = async (q) => {
    const finalQuestion = q || question;
    if (!finalQuestion.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: finalQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: finalQuestion, conversationId });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
      if (res.data.conversationId) setConversationId(res.data.conversationId);
      loadConversations();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask();
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const HistorySidebar = () => (
    <div
      className="flex flex-col h-full"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "1rem",
        padding: "0.75rem",
      }}
    >
      <button
        onClick={clearChat}
        className="w-full flex items-center gap-2 text-xs font-medium px-3 py-2.5 rounded-lg mb-3 transition"
        style={{ background: "rgba(255,90,54,0.15)", color: "var(--brand-orange)" }}
      >
        <span>+</span> New chat
      </button>

      <p className="text-xs font-medium px-1 mb-1.5" style={{ color: "var(--text-faint)" }}>
        Recent
      </p>

      <div className="flex-1 overflow-y-auto space-y-1">
        {conversations.length === 0 && (
          <p className="text-xs text-center py-6 px-2" style={{ color: "var(--text-faint)" }}>
            No past chats yet
          </p>
        )}
        {conversations.map((c) => (
          <button
            key={c._id}
            onClick={() => openConversation(c._id)}
            className="w-full flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg text-left group transition"
            style={{
              background: c._id === conversationId ? "var(--bg-card-2)" : "transparent",
              color: c._id === conversationId ? "var(--text-primary)" : "var(--text-muted)",
            }}
          >
            <span className="truncate flex-1">{c.title}</span>
            <span
              onClick={(e) => deleteConversation(c._id, e)}
              className="opacity-0 group-hover:opacity-100 transition shrink-0"
              style={{ color: "var(--text-faint)" }}
            >
              ✕
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Layout title="Ask AI">
      <Animate variant="fadeUp" delay={0}>
        {/* Mobile history drawer overlay */}
        {historyOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setHistoryOpen(false)}
            />
            <div
              className="relative z-10 w-72 h-full p-3 animate-fade-left"
              style={{ background: "var(--bg-base)" }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Chat History
                </p>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-1 rounded-lg text-sm"
                  style={{ color: "var(--text-faint)" }}
                >
                  ✕
                </button>
              </div>
              <div style={{ height: "calc(100% - 40px)" }}>
                <HistorySidebar />
              </div>
            </div>
          </div>
        )}

        <div
          className="flex gap-4 max-w-5xl mx-auto"
          style={{ height: "calc(100vh - 120px)", minHeight: 0 }}
        >
          {/* Desktop sidebar — hidden below lg */}
          <div className="hidden lg:flex w-60 shrink-0">
            <div className="w-full">
              <HistorySidebar />
            </div>
          </div>

          {/* Main chat column */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* History toggle — mobile only */}
                <button
                  className="lg:hidden flex flex-col gap-1 p-1.5 rounded-lg transition"
                  style={{ background: "var(--bg-card-2)", border: "1px solid var(--border-subtle)" }}
                  onClick={() => setHistoryOpen(true)}
                  aria-label="Open chat history"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block w-4 h-0.5 rounded-full"
                      style={{ background: "var(--text-primary)" }}
                    />
                  ))}
                </button>

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "rgba(255,90,54,0.15)" }}
                >
                  🤖
                </div>
                <div>
                  <h1 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                    FlexOps AI
                  </h1>
                  <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                    Ask anything — gym data, fitness tips, business advice
                  </p>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs px-3 py-1.5 rounded-lg transition"
                  style={{ color: "var(--text-faint)", background: "var(--bg-card-2)" }}
                >
                  Clear chat
                </button>
              )}
            </div>

            {/* Chat area */}
            <div
              className="flex-1 rounded-2xl p-4 overflow-y-auto mb-4"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {historyLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                    Loading conversation...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="text-4xl mb-3">🏋️</div>
                  <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    What can I help you with?
                  </p>
                  <p className="text-xs mb-6 text-center" style={{ color: "var(--text-faint)" }}>
                    Ask about your gym data, member insights, fitness tips, or business advice
                  </p>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                    {suggestions.map((s) => (
                      <button
                        key={s.text}
                        onClick={() => ask(s.text)}
                        className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl text-left transition"
                        style={{
                          background: "var(--bg-card-2)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-subtle)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--brand-orange)";
                          e.currentTarget.style.color = "var(--text-primary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border-subtle)";
                          e.currentTarget.style.color = "var(--text-muted)";
                        }}
                      >
                        <span>{s.icon}</span>
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {m.role === "ai" && (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 shrink-0 mt-0.5"
                          style={{ background: "rgba(255,90,54,0.15)" }}
                        >
                          🤖
                        </div>
                      )}
                      <div
                        className="max-w-[80%] text-sm px-4 py-3 rounded-2xl"
                        style={
                          m.role === "user"
                            ? { background: "var(--brand-orange)", color: "#fff", borderBottomRightRadius: 4 }
                            : { background: "var(--bg-card-2)", color: "var(--text-muted)", borderBottomLeftRadius: 4, lineHeight: 1.6 }
                        }
                      >
                        {m.role === "ai" ? (
                          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
                        ) : (
                          m.text
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 shrink-0"
                        style={{ background: "rgba(255,90,54,0.15)" }}
                      >
                        🤖
                      </div>
                      <div
                        className="text-sm px-4 py-3 rounded-2xl flex items-center gap-2"
                        style={{ background: "var(--bg-card-2)", color: "var(--text-faint)", borderBottomLeftRadius: 4 }}
                      >
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full animate-bounce"
                              style={{ background: "var(--brand-orange)", animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about members, revenue, fitness tips..."
                className="input-premium flex-1"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="btn-primary px-5"
                style={{ opacity: loading || !question.trim() ? 0.5 : 1 }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </Animate>
    </Layout>
  );
}
