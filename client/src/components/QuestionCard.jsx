import { useState } from "react";

export default function QuestionCard({ question, number }) {
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const isCorrect = checked && selected === question.correctAnswer;

  return (
    <article className="question-card">
      <div className="question-card__heading">
        <span>Question {number}</span>
        {checked && <strong className={isCorrect ? "answer-result answer-result--correct" : "answer-result answer-result--incorrect"}>{isCorrect ? "Correct" : "Review answer"}</strong>}
      </div>
      <h3>{question.prompt}</h3>
      <div className="option-list">
        {question.options.map((option) => {
          const classNames = ["option-button"];
          if (checked && option === question.correctAnswer) classNames.push("option-button--correct");
          if (checked && option === selected && option !== question.correctAnswer) classNames.push("option-button--incorrect");
          return (
            <button key={option} type="button" className={classNames.join(" ")} onClick={() => !checked && setSelected(option)} aria-pressed={selected === option}>
              <span className="option-marker" />
              {option}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <button className="secondary-button secondary-button--small" type="button" disabled={!selected} onClick={() => setChecked(true)}>Check answer</button>
      ) : (
        <div className="explanation-box">
          <strong>Answer: {question.correctAnswer}</strong>
          <p>{question.explanation}</p>
        </div>
      )}
    </article>
  );
}
