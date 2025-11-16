"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSlideBroadcast } from "@/lib/slide-sync";
import { quizSlides } from "../slides";

const ScreenSlidesPage = () => {
  const slides = useMemo(() => [...quizSlides], []);
  const [index, setIndex] = useState(0);
  const currentSlide = slides[index] ?? slides[0];
  useSlideBroadcast(index, currentSlide.phase);

  const goPrev = useCallback(() => setIndex((prev) => Math.max(prev - 1, 0)), []);
  const goNext = useCallback(
    () => setIndex((prev) => Math.min(prev + 1, slides.length - 1)),
    [slides.length],
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goPrev();
      } else if (event.key === "ArrowRight") {
        goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fddfe2] px-6 py-10">
      <div className="w-full max-w-6xl flex-1">
        <div className="aspect-video w-full rounded-[48px] bg-white shadow-2xl">
          {currentSlide.component}
        </div>
      </div>
      <div className="mt-6 flex w-full max-w-4xl items-center justify-between gap-4 text-amber-900">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="flex flex-1 items-center justify-center rounded-full bg-white/80 px-6 py-3 text-lg font-semibold shadow disabled:opacity-40"
        >
          ← Back
        </button>
        <div className="text-center text-lg font-semibold">{currentSlide.label}</div>
        <button
          type="button"
          onClick={goNext}
          disabled={index === slides.length - 1}
          className="flex flex-1 items-center justify-center rounded-full bg-white/80 px-6 py-3 text-lg font-semibold shadow disabled:opacity-40"
        >
          Next →
        </button>
      </div>
      <p className="mt-3 text-sm text-amber-800">左右キーでも切り替え可能です</p>
    </main>
  );
};

export default ScreenSlidesPage;
