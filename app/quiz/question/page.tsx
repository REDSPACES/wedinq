"use client";

import { useState } from "react";

const options = [
  { value: "A", color: "bg-[#ff70c9]" },
  { value: "B", color: "bg-[#44b3ff]" },
  { value: "C", color: "bg-[#16c172]" },
];

const QuizQuestionPage = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) {
      return;
    }

    alert(`回答: ${selected}`);
    setSubmitted(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f9dcd7,_#eeb6aa,_#e6a08f)] px-4 py-10">
      <div className="w-full max-w-sm rounded-[32px] bg-[#fdf5f2] p-8 shadow-[0_0_40px_rgba(215,149,129,0.35)]">
        <header className="flex items-start justify-between text-[#c18077]">
          <div>
            <p className="text-3xl font-semibold">第1問</p>
            <p className="mt-4 text-xl leading-relaxed tracking-wide">
              あああああああああ
              <br />
              あああああああああ
            </p>
          </div>
          <p className="text-2xl font-light tracking-widest">Quiz</p>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          {options.map((option) => {
            const isSelected = selected === option.value;
            const isInactiveAfterSubmit = submitted && !isSelected;
            const backgroundClasses = isInactiveAfterSubmit
              ? "bg-[#e6d7d5] text-[#b1776b]"
              : `${option.color} text-white`;

            return (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  if (!submitted) {
                    setSelected(option.value);
                  }
                }}
                disabled={submitted}
                className={`w-full rounded-full py-4 text-lg font-semibold shadow-lg transition ${backgroundClasses} ${
                  isSelected ? "ring-7 ring-[#ff6a6a]/70" : ""
                } ${submitted ? "cursor-not-allowed opacity-90" : ""}`}
              >
                {option.value}
              </button>
            );
          })}

          <p className="pt-6 text-center text-sm text-[#c18077]">
            1つ選んで送信ボタンを押してね
          </p>
          <button
            type="submit"
            disabled={!selected || submitted}
            className="mx-auto block w-full rounded-full border-2 border-[#d0bbb2] bg-white py-3 text-base font-semibold text-[#b1776b] shadow-inner transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            送信
          </button>
        </form>
      </div>
    </main>
  );
};

export default QuizQuestionPage;
