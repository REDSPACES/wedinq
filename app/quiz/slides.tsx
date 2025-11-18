import Image from "next/image";
import type { ReactNode } from "react";
import type { SlidePhase } from "@/types/slides";

export type QuizSlide = {
  id: string;
  label: string;
  phase: SlidePhase;
  component: ReactNode;
};

const ImageSlide = ({ src, alt }: { src: string; alt?: string }) => (
  <div className="flex h-full w-full items-center justify-center rounded-[36px] bg-slate-100">
    <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl ring-4 ring-white">
      <Image
        key={src}
        src={src}
        alt={alt ?? src}
        fill
        sizes="(max-width: 1280px) 100vw, 1200px"
        className="absolute inset-0 h-full w-full bg-white object-contain"
        priority
      />
    </div>
  </div>
);

// JPG を差し替える場合は /public/slide 以下に置き、src を書き換えてください。
const imageSlides: QuizSlide[] = [
  {
    id: "img-title",
    label: "タイトル",
    phase: "title",
    component: <ImageSlide src="/slide/title.jpg" alt="タイトル" />,
  },
  {
    id: "img-registration",
    label: "参加登録",
    phase: "registration",
    component: <ImageSlide src="/slide/registration.jpg" alt="参加登録" />,
  },
  {
    id: "img-rules",
    label: "ルール",
    phase: "rules",
    component: <ImageSlide src="/slide/rules.jpg" alt="ルール" />,
  },
  {
    id: "img-question-1",
    label: "Q1",
    phase: "question",
    component: <ImageSlide src="/slide/question-1.jpg" alt="Q1" />,
  },
  {
    id: "img-answer-1",
    label: "A1",
    phase: "answer",
    component: <ImageSlide src="/slide/answer-1.jpg" alt="A1" />,
  },
];

export const quizSlides: QuizSlide[] = [...imageSlides];
