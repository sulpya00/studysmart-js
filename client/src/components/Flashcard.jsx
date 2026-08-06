import { useState } from "react";

export default function Flashcard({ card, number }) {
  const [flipped, setFlipped] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("new");

  return (
    <article className={`flashcard ${flipped ? "flashcard--flipped" : ""}`}>
      <button
        type="button"
        className="flashcard__face"
        onClick={() => setFlipped((current) => !current)}
        aria-label={`Flashcard ${number}. Click to show ${flipped ? "question" : "answer"}.`}
      >
        <span className="flashcard__label">{flipped ? "Answer" : `Card ${number}`}</span>
        <strong>{flipped ? card.back : card.front}</strong>
        <span className="flashcard__hint">Click to flip</span>
      </button>
      <div className="flashcard__actions" aria-label={`Review status for card ${number}`}>
        <button type="button" className={reviewStatus === "review" ? "status-button status-button--active" : "status-button"} onClick={() => setReviewStatus("review")}>Needs review</button>
        <button type="button" className={reviewStatus === "known" ? "status-button status-button--known" : "status-button"} onClick={() => setReviewStatus("known")}>Known</button>
      </div>
    </article>
  );
}
