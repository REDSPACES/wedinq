import type { ReactNode } from "react";
import type { SlidePhase } from "@/types/slides";

const borderColors = ["bg-pink-400", "bg-white", "bg-blue-400", "bg-green-500"];

const dotPatternStyle = {
  backgroundImage: "radial-gradient(#fbe36b 1.5px, transparent 1.5px)",
  backgroundSize: "22px 22px",
};

export type QuizSlide = {
  id: string;
  label: string;
  phase: SlidePhase;
  component: ReactNode;
};

const ImageSlide = ({ src, alt }: { src: string; alt?: string }) => (
  <div className="flex h-full w-full items-center justify-center rounded-[36px] bg-slate-100">
    <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl ring-4 ring-white">
      <img
        key={src}
        src={src}
        alt={alt ?? src}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full bg-white object-contain"
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

const SlideShell = ({ children }: { children: ReactNode }) => (
  <div className="flex h-full flex-col" style={dotPatternStyle}>
    <DiamondBorder />
    <div className="flex-1 bg-white/90 px-14 py-10" style={dotPatternStyle}>
      {children}
    </div>
    <DiamondBorder />
  </div>
);

const DiamondBorder = () => (
  <div className="flex w-full -translate-y-5 justify-center gap-1 overflow-hidden">
    {Array.from({ length: 20 }).map((_, idx) => (
      <div
        key={idx}
        className={`${
          borderColors[idx % borderColors.length]
        } h-16 w-16 -mx-4 rotate-45`}
      />
    ))}
  </div>
);

const TitleSlide = () => (
  <SlideShell>
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <div className="flex items-center gap-6">
        {["ク", "イ", "ズ"].map((char, index) => (
          <div
            key={char}
            className={`flex h-32 w-32 items-center justify-center rounded-full text-4xl font-bold text-white shadow-xl ${
              ["bg-pink-500", "bg-sky-400", "bg-green-500"][index]
            }`}
          >
            {char}
          </div>
        ))}
      </div>
      <p className="text-sm uppercase tracking-[0.6em] text-amber-700">
        Wedding
      </p>
      <h1 className="text-7xl font-bold text-pink-500">QUIZ</h1>
      <p className="text-2xl text-amber-800">
        新郎新婦についていくつわかるかな？
      </p>
    </div>
  </SlideShell>
);

const RegistrationSlide = () => (
  <SlideShell>
    <div className="grid h-full items-center gap-10 md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6 text-amber-800">
        <p className="inline-block rounded-full bg-pink-400 px-8 py-3 text-2xl font-semibold text-white">
          参加登録をお願いします
        </p>
        <p className="text-3xl leading-relaxed">
          お手元の席札からも読み込めます！
          <br />
          ニックネームを入れて
          <span className="text-pink-500">「クイズをはじめる」</span>
          をタップしてお待ちください！
        </p>
      </div>
      <div className="flex items-center justify-center">
        <div className="h-72 w-72 rounded-[32px] border-8 border-amber-900 bg-white p-4">
          <div className="h-full w-full bg-[linear-gradient(90deg,#000_50%,transparent_50%),linear-gradient(#000_50%,transparent_50%)] bg-[length:16px_16px]" />
        </div>
      </div>
    </div>
  </SlideShell>
);

const RuleSlide = () => (
  <SlideShell>
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center text-amber-900">
      <div className="flex items-center gap-6">
        {["ル", "ー", "ル"].map((char, index) => (
          <div
            key={`${char}-${index}`}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white shadow-xl ${
              ["bg-pink-500", "bg-sky-400", "bg-green-500"][index]
            }`}
          >
            {char}
          </div>
        ))}
      </div>
      <p className="max-w-4xl text-3xl leading-relaxed">
        これから5問のクイズを出題します。回答は4つの中からスマートフォン上で選んでください。シンキングタイムは30秒。正答率と速さで競います！
      </p>
    </div>
  </SlideShell>
);

const QuestionSlide = () => (
  <SlideShell>
    <div
      className="grid h-full gap-8 rounded-[36px] bg-[#ffe8f7] p-8 text-amber-900"
      style={{ boxShadow: "inset 0 0 0 4px #ff8bd1" }}
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex items-center gap-4 rounded-full bg-white px-6 py-3 text-amber-900 shadow">
          <span className="rounded-full bg-[#8c5135] px-4 py-2 text-xl font-bold text-white">
            Q1
          </span>
          <span className="text-2xl font-semibold">
            新郎新婦の初デートの場所はどこでしょうか？
          </span>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f3a033] text-3xl font-bold text-white">
          30
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {["A. ディズニーランド", "B. 熱海", "C. お台場"].map(
            (label, index) => (
              <div
                key={label}
                className={`rounded-full px-6 py-4 text-2xl font-semibold text-white shadow ${
                  ["bg-pink-500", "bg-sky-400", "bg-green-500"][index]
                }`}
              >
                {label}
              </div>
            )
          )}
        </div>
        <div className="flex items-center justify-center">
          <div className="h-56 w-72 rounded-[28px] bg-white shadow-lg" />
        </div>
      </div>
    </div>
  </SlideShell>
);

const AnswerSlide = () => (
  <SlideShell>
    <div
      className="grid h-full gap-8 rounded-[36px] bg-[#ffe8f7] p-8 text-amber-900"
      style={{ boxShadow: "inset 0 0 0 4px #ff8bd1" }}
    >
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-[#8c5135] px-6 py-3 text-2xl font-bold text-white">
          A1
        </span>
        <p className="text-4xl font-semibold">
          答えは <span className="text-sky-400">B</span> 熱海
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <p className="text-3xl leading-relaxed">
          しらす丼が美味しかったー！またいきたいね
        </p>
        <div className="flex items-center justify-between">
          <div className="h-40 w-52 rounded-[28px] bg-white shadow-lg" />
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-3xl text-white">
            ▶
          </div>
        </div>
      </div>
    </div>
  </SlideShell>
);

export const quizSlides: QuizSlide[] = [
  // こちらを参照してスライドを表示します。画像を差し替えるだけで OK。
  ...imageSlides,
];
