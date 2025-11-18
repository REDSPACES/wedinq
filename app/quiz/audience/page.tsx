"use client";

import { useMemo } from "react";
import { useSlideSubscription } from "@/lib/slide-sync";
import { quizSlides } from "../slides";

const AudienceSlidesPage = () => {
  const slides = useMemo(() => [...quizSlides], []);
  const state = useSlideSubscription({ index: 0, phase: "title" });
  const slide = slides[state.index] ?? slides[0];

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <div className="h-full w-full">{slide.component}</div>
    </main>
  );
};

export default AudienceSlidesPage;
