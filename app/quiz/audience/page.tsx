"use client";

import { useEffect, useMemo, useState } from "react";
import { quizSlides } from "../slides";

const AUTO_INTERVAL_MS = 10000;

const AudienceSlidesPage = () => {
  const slides = useMemo(() => [...quizSlides], []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <div className="h-full w-full">{slides[index].component}</div>
    </main>
  );
};

export default AudienceSlidesPage;
