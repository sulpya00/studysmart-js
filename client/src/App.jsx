import { useCallback, useEffect, useMemo, useState } from "react";
import AuthScreen from "./components/AuthScreen.jsx";
import Flashcard from "./components/Flashcard.jsx";
import QuestionCard from "./components/QuestionCard.jsx";

const EMPTY_PACK = {
  topicId: "",
  summary: "",
  keyPoints: [],
  flashcards: [],
  questions: [],
  provider: "",
  model: "",
};

const EMPTY_FORM = {
  title: "",
  subject: "",
  content: "",
  flashcardCount: 6,
  questionCount: 5,
};

const DEFAULT_MODELS = [
  {
    id: "mock:paragraph-aware-demo",
    provider: "mock",
    model: "paragraph-aware-demo",
    label: "Local demo — no external AI",
    available: true,
  },
];

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("studysmart-user")) || null;
  } catch {
    return null;
  }
}

function modelId(model) {
  return model.id || `${model.provider}:${model.model}`;
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with HTTP ${response.status}.`);
  }
  return data;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function App() {
  const [user, setUser] = useState(getSavedUser);
  const [activeView, setActiveView] = useState("summary");
  const [form, setForm] = useState(EMPTY_FORM);
  const [studyPack, setStudyPack] = useState(EMPTY_PACK);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStatus, setChatStatus] = useState("idle");
  const [models, setModels] = useState(DEFAULT_MODELS);
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODELS[0].id);
  const [modelStatus, setModelStatus] = useState("loading");
  const [historyTopics, setHistoryTopics] = useState([]);
  const [historyStatus, setHistoryStatus] = useState("idle");
  const [historyError, setHistoryError] = useState("");
  const [topicStatus, setTopicStatus] = useState("idle");

  useEffect(() => {
    let active = true;

    fetch("/api/ai/models")
      .then(readJson)
      .then((data) => {
        if (!active) return;
        const availableModels = Array.isArray(data.models) && data.models.length
          ? data.models.map((item) => ({ ...item, id: modelId(item) }))
          : DEFAULT_MODELS;

        setModels(availableModels);
        setSelectedModelId(
          data.defaultModel && availableModels.some((item) => item.id === data.defaultModel)
            ? data.defaultModel
            : availableModels[0].id,
        );
        setModelStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setModels(DEFAULT_MODELS);
        setSelectedModelId(DEFAULT_MODELS[0].id);
        setModelStatus("fallback");
      });

    return () => {
      active = false;
    };
  }, []);

  const loadHistory = useCallback(async () => {
    if (!user?.email) return;
    setHistoryStatus("loading");
    setHistoryError("");

    try {
      const data = await fetch(
        `/api/history/topics?userEmail=${encodeURIComponent(user.email)}`,
      ).then(readJson);
      setHistoryTopics(Array.isArray(data.topics) ? data.topics : []);
      setHistoryStatus("ready");
    } catch (requestError) {
      setHistoryError(requestError.message);
      setHistoryStatus("error");
    }
  }, [user?.email]);

  const loadChatHistory = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await fetch(
        `/api/history/chat?userEmail=${encodeURIComponent(user.email)}`,
      ).then(readJson);
      setChatMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (requestError) {
      setChatMessages([
        {
          role: "assistant",
          content: `Chat history could not be loaded: ${requestError.message}`,
        },
      ]);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user) return;
    loadHistory();
    loadChatHistory();
  }, [user, loadHistory, loadChatHistory]);

  const selectedModel = useMemo(
    () => models.find((item) => item.id === selectedModelId) || models[0] || DEFAULT_MODELS[0],
    [models, selectedModelId],
  );

  const wordCount = useMemo(
    () => form.content.trim().split(/\s+/).filter(Boolean).length,
    [form.content],
  );

  const hasStudyPack = Boolean(studyPack.summary);
  const canUseChat = hasStudyPack || historyTopics.length > 0;

  if (!user) return <AuthScreen onAuthenticated={setUser} />;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: ["flashcardCount", "questionCount"].includes(name) ? Number(value) : value,
    }));
  }

  function getAiSelection() {
    return {
      aiProvider: selectedModel.provider,
      aiModel: selectedModel.model,
    };
  }

  function startNewTopic() {
    setForm(EMPTY_FORM);
    setStudyPack(EMPTY_PACK);
    setStatus("idle");
    setError("");
    setActiveView("summary");
  }

  async function createStudyPack(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setStudyPack(EMPTY_PACK);
    setActiveView("summary");

    try {
      const data = await fetch("/api/ai/study-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userEmail: user.email,
          userName: user.name,
          ...getAiSelection(),
        }),
      }).then(readJson);

      setStudyPack(data);
      setStatus("success");
      await loadHistory();
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  async function openHistoryTopic(topicId) {
    setTopicStatus("loading");
    setError("");

    try {
      const data = await fetch(
        `/api/history/topics/${encodeURIComponent(topicId)}?userEmail=${encodeURIComponent(user.email)}`,
      ).then(readJson);
      const topic = data.topic;

      setForm((current) => ({
        ...current,
        title: topic.title,
        subject: topic.subject || "",
        content: topic.content,
        flashcardCount: topic.flashcards?.length || current.flashcardCount,
        questionCount: topic.questions?.length || current.questionCount,
      }));
      setStudyPack({
        topicId: topic.id,
        summary: topic.summary,
        keyPoints: topic.keyPoints || [],
        flashcards: topic.flashcards || [],
        questions: topic.questions || [],
        provider: "saved",
        model: "history",
      });
      setStatus("success");
      setActiveView("summary");
      setTopicStatus("ready");
    } catch (requestError) {
      setHistoryError(requestError.message);
      setTopicStatus("error");
    }
  }

  async function removeHistoryTopic(topicId) {
    const topic = historyTopics.find((item) => item.id === topicId);
    const confirmed = window.confirm(`Delete “${topic?.title || "this study topic"}” from history?`);
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/history/topics/${encodeURIComponent(topicId)}?userEmail=${encodeURIComponent(user.email)}`,
        { method: "DELETE" },
      );
      if (!response.ok) await readJson(response);

      if (studyPack.topicId === topicId) startNewTopic();
      await loadHistory();
    } catch (requestError) {
      setHistoryError(requestError.message);
    }
  }

  async function sendChatMessage(event) {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatStatus === "loading") return;

    const userMessage = { role: "user", content: message };
    setChatMessages((current) => [...current, userMessage]);
    setChatInput("");
    setChatStatus("loading");

    try {
      const data = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
          currentTopicId: studyPack.topicId || null,
          message,
          ...getAiSelection(),
        }),
      }).then(readJson);

      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
          sourceTopics: data.sourceTopics || [],
        },
      ]);
      setChatStatus("success");
    } catch (requestError) {
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `I could not answer that request: ${requestError.message}`,
        },
      ]);
      setChatStatus("error");
    }
  }

  function logout() {
    localStorage.removeItem("studysmart-user");
    setUser(null);
    setForm(EMPTY_FORM);
    setStudyPack(EMPTY_PACK);
    setChatMessages([]);
    setHistoryTopics([]);
  }

  const navigation = [
    { id: "summary", label: "Summary", count: hasStudyPack ? 1 : null, disabled: false },
    {
      id: "flashcards",
      label: "Flashcards",
      count: hasStudyPack ? studyPack.flashcards.length : null,
      disabled: !hasStudyPack,
    },
    {
      id: "questions",
      label: "Questions",
      count: hasStudyPack ? studyPack.questions.length : null,
      disabled: !hasStudyPack,
    },
    { id: "chat", label: "Study Chat", count: null, disabled: !canUseChat },
    {
      id: "history",
      label: "History",
      count: historyStatus === "ready" ? historyTopics.length : null,
      disabled: false,
    },
  ];

  const pageCopy = {
    summary: {
      eyebrow: "Start here",
      title: "Create your study summary",
      description: "Add your notes once. StudySmart saves the topic, summarizes it, and automatically creates flashcards and practice questions.",
    },
    flashcards: {
      eyebrow: form.subject || "Study materials",
      title: "Flashcards",
      description: `Review the generated flashcards for ${form.title || "your saved topic"}.`,
    },
    questions: {
      eyebrow: form.subject || "Study materials",
      title: "Questions",
      description: `Check your understanding of ${form.title || "your saved topic"}.`,
    },
    chat: {
      eyebrow: "All saved topics",
      title: "Study Chat",
      description: "Ask about the current topic or any topic in your saved history. StudySmart searches previous summaries and relevant notes before answering.",
    },
    history: {
      eyebrow: "Saved in PostgreSQL",
      title: "Study history",
      description: "Reopen previous notes, summaries, flashcards, and questions using the same login email.",
    },
  }[activeView];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">S</span>
          <div>
            <strong>StudySmart</strong>
            <small>AI Study Assistant</small>
          </div>
        </div>

        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${activeView === item.id ? "nav-link--active" : ""}`}
              onClick={() => !item.disabled && setActiveView(item.id)}
              disabled={item.disabled}
            >
              <span>{item.label}</span>
              {item.count !== null && <small>{item.count}</small>}
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="user-chip">
            <span>{user.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <button className="logout-button" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="page-header">
          <div>
            <p className="eyebrow">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.title}</h1>
            <p>{pageCopy.description}</p>
          </div>

          <label className="model-selector">
            <span>AI model</span>
            <select
              value={selectedModelId}
              onChange={(event) => setSelectedModelId(event.target.value)}
              disabled={modelStatus === "loading" || status === "loading" || chatStatus === "loading"}
            >
              {models.map((item) => (
                <option key={item.id} value={item.id} disabled={item.available === false}>
                  {item.label || `${item.provider} — ${item.model}`}
                  {item.available === false ? " (unavailable)" : ""}
                </option>
              ))}
            </select>
            {modelStatus === "fallback" && (
              <small>Model discovery failed. The local demo model is available.</small>
            )}
          </label>
        </header>

        {activeView === "summary" && (
          <section className="content-grid">
            <form className="panel editor-panel" onSubmit={createStudyPack}>
              <div className="editor-actions">
                <span>{studyPack.topicId ? "Opened from saved history" : "New study topic"}</span>
                <button className="text-link-button" type="button" onClick={startNewTopic}>
                  Clear for new topic
                </button>
              </div>

              <div className="form-row">
                <label>
                  Title
                  <input
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    maxLength="120"
                    placeholder="Enter a title"
                    required
                  />
                </label>
                <label>
                  Subject
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={updateField}
                    maxLength="80"
                    placeholder="Enter a subject"
                  />
                </label>
              </div>

              <label>
                Study notes
                <textarea
                  name="content"
                  value={form.content}
                  onChange={updateField}
                  rows="14"
                  minLength="40"
                  maxLength="20000"
                  placeholder="Paste or type your study notes here"
                  required
                />
              </label>

              <div className="generation-options">
                <span>{wordCount} words</span>
                <label>
                  Flashcards
                  <select name="flashcardCount" value={form.flashcardCount} onChange={updateField}>
                    {[5, 6, 8, 10, 12, 15].map((count) => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Questions
                  <select name="questionCount" value={form.questionCount} onChange={updateField}>
                    {[3, 5, 6, 8, 10].map((count) => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </label>
              </div>

              <button className="primary-button" type="submit" disabled={status === "loading"}>
                {status === "loading"
                  ? "Creating and saving study pack…"
                  : hasStudyPack
                    ? "Create a new saved version"
                    : "Create and save study pack"}
              </button>

              {historyError && (
                <p className="error-message" role="alert">
                  Database history is unavailable: {historyError}
                </p>
              )}
              {error && <p className="error-message" role="alert">{error}</p>}
            </form>

            <section className="panel results-panel" aria-live="polite">
              {(status === "loading" || topicStatus === "loading") && <LoadingState />}
              {!hasStudyPack && status !== "loading" && topicStatus !== "loading" && <EmptySummaryState />}
              {hasStudyPack && status !== "loading" && topicStatus !== "loading" && (
                <div className="summary-result">
                  <div className="results-header">
                    <div>
                      <p className="eyebrow">Saved summary</p>
                      <h2>{form.title}</h2>
                    </div>
                    <span className="provider-badge">
                      {studyPack.provider === "saved"
                        ? "Saved history"
                        : `${studyPack.provider || selectedModel.provider} · ${studyPack.model || selectedModel.model}`}
                    </span>
                  </div>
                  <p className="summary-text">{studyPack.summary}</p>
                  <h3>Key points</h3>
                  <ul className="key-point-list">
                    {studyPack.keyPoints.map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}
                  </ul>
                  <div className="study-pack-ready">
                    <strong>This topic is saved and available to Study Chat.</strong>
                    <div>
                      <button type="button" onClick={() => setActiveView("flashcards")}>
                        {studyPack.flashcards.length} flashcards
                      </button>
                      <button type="button" onClick={() => setActiveView("questions")}>
                        {studyPack.questions.length} questions
                      </button>
                      <button type="button" onClick={() => setActiveView("chat")}>Ask Study Chat</button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </section>
        )}

        {activeView === "flashcards" && (
          <section className="panel feature-panel">
            <div className="feature-panel__heading">
              <div>
                <p className="eyebrow">Generated from the summary and notes</p>
                <h2>{form.title} flashcards</h2>
              </div>
              <span>{studyPack.flashcards.length} cards</span>
            </div>
            <div className="flashcard-grid">
              {studyPack.flashcards.map((card, index) => (
                <Flashcard key={`${card.front}-${index}`} card={card} number={index + 1} />
              ))}
            </div>
          </section>
        )}

        {activeView === "questions" && (
          <section className="feature-layout">
            <div className="feature-intro panel">
              <p className="eyebrow">Practice set</p>
              <h2>Check your understanding</h2>
              <p>
                Choose an answer, check it, and review the explanation. These questions are
                restored whenever you reopen this topic from History.
              </p>
            </div>
            <div className="question-list">
              {studyPack.questions.map((question, index) => (
                <QuestionCard
                  key={`${question.prompt}-${index}`}
                  question={question}
                  number={index + 1}
                />
              ))}
            </div>
          </section>
        )}

        {activeView === "chat" && (
          <section className="panel chat-panel">
            <div className="chat-context-note">
              <strong>History-aware chat</strong>
              <span>
                {historyTopics.length} saved {historyTopics.length === 1 ? "topic" : "topics"} available
                {form.title ? `; currently viewing “${form.title}”.` : "."}
              </span>
            </div>
            <div className="chat-messages" aria-live="polite">
              {chatMessages.length === 0 && (
                <div className="chat-empty-state">
                  Ask a question about any topic you previously saved.
                </div>
              )}
              {chatMessages.map((message, index) => (
                <div
                  key={message.id || `${message.role}-${index}`}
                  className={`chat-message chat-message--${message.role}`}
                >
                  <span>{message.role === "assistant" ? "StudySmart" : "You"}</span>
                  <p>{message.content}</p>
                  {message.sourceTopics?.length > 0 && (
                    <small className="chat-sources">
                      Topics checked: {message.sourceTopics.map((topic) => topic.title).join(", ")}
                    </small>
                  )}
                </div>
              ))}
              {chatStatus === "loading" && (
                <div className="chat-message chat-message--assistant">
                  <span>StudySmart</span>
                  <p className="typing-indicator">Searching saved topics and thinking…</p>
                </div>
              )}
            </div>
            <form className="chat-form" onSubmit={sendChatMessage}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about any saved study topic…"
                maxLength="1000"
              />
              <button
                className="primary-button"
                type="submit"
                disabled={!chatInput.trim() || chatStatus === "loading"}
              >
                Send
              </button>
            </form>
          </section>
        )}

        {activeView === "history" && (
          <section className="panel history-panel">
            <div className="history-toolbar">
              <div>
                <p className="eyebrow">Your saved material</p>
                <h2>{historyTopics.length} study {historyTopics.length === 1 ? "topic" : "topics"}</h2>
              </div>
              <button className="primary-button" type="button" onClick={startNewTopic}>
                New topic
              </button>
            </div>

            {historyStatus === "loading" && <LoadingHistoryState />}
            {historyError && <p className="error-message" role="alert">{historyError}</p>}
            {historyStatus !== "loading" && historyTopics.length === 0 && (
              <div className="history-empty">
                <strong>No saved topics yet</strong>
                <p>Create a study pack and it will appear here automatically.</p>
              </div>
            )}
            <div className="history-grid">
              {historyTopics.map((topic) => (
                <article className="history-card" key={topic.id}>
                  <div className="history-card__meta">
                    <span>{topic.subject || "General"}</span>
                    <time>{formatDate(topic.createdAt)}</time>
                  </div>
                  <h3>{topic.title}</h3>
                  <p>{topic.summary || "Saved notes are available for this topic."}</p>
                  <div className="history-card__actions">
                    <button className="primary-button" type="button" onClick={() => openHistoryTopic(topic.id)}>
                      Open topic
                    </button>
                    <button className="secondary-button" type="button" onClick={() => removeHistoryTopic(topic.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="empty-state">
      <div className="loader" />
      <strong>Building and saving the study pack</strong>
      <p>
        StudySmart is writing the summary, generating flashcards and questions, and saving
        everything to PostgreSQL.
      </p>
    </div>
  );
}

function EmptySummaryState() {
  return (
    <div className="empty-state">
      <strong>Your saved summary will appear here</strong>
      <p>
        The notes, summary, flashcards, and practice questions will remain available after
        refreshing or signing back in with the same email.
      </p>
    </div>
  );
}

function LoadingHistoryState() {
  return (
    <div className="history-empty">
      <div className="loader" />
      <strong>Loading saved topics</strong>
    </div>
  );
}
