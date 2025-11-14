"use client";

import { useMemo } from "react";
import { useSlideSubscription } from "@/lib/slide-sync";
import { quizSlides } from "../slides";

const AudienceSlidesPage = () => {
  const slides = useMemo(() => [...quizSlides], []);
  const index = useSlideSubscription(0);

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <div className="h-full w-full">{slides[index % slides.length].component}</div>
    </main>
  );
};

export default AudienceSlidesPage;
