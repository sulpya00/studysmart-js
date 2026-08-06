import { useState } from "react";

export default function AuthScreen({ onAuthenticated }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function login(event) {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    const user = {
      name: form.name.trim() || email.split("@")[0] || "Student",
      email,
    };

    localStorage.setItem("studysmart-user", JSON.stringify(user));
    onAuthenticated(user);
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Study once. Revisit anytime.</p>
        <h1>Your study history stays connected.</h1>
        <p className="auth-hero__copy">
          Create summaries, flashcards, and practice questions, then ask Study Chat questions
          across every topic saved under your login email.
        </p>
        <div className="auth-feature-list">
          <span>01</span><p>Study topics saved in PostgreSQL</p>
          <span>02</span><p>Chat history restored after sign-in</p>
          <span>03</span><p>Gemini, Ollama, and local model selection</p>
        </div>
      </section>

      <section className="auth-card">
        <div className="brand brand--auth">
          <span className="brand__mark">S</span>
          <div>
            <strong>StudySmart</strong>
            <small>AI Study Assistant</small>
          </div>
        </div>

        <p className="eyebrow">Welcome</p>
        <h2>Sign in to continue</h2>
        <p className="muted-copy">
          Authentication is simplified for this project. Use the same email later to reopen its saved history.
        </p>

        <form onSubmit={login}>
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Enter any password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="primary-button" type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}
