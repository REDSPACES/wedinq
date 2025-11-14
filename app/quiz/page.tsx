import Link from "next/link";

const steps = [
  {
    title: "STEP 1",
    description:
      "クイズは全部で５問出題されます。各問題には４つの選択肢があります。",
  },
  {
    title: "STEP 2",
    description:
      "制限時間30秒以内に答えだと思う項目をスマートフォンから選んでください",
  },
  {
    title: "STEP 3",
    description: "勝者は、正答率と回答の速さで決まります！楽しんでね！",
  },
];

const QuizPage = () => (
  <main className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-amber-50 px-4 py-16">
    <section className="mx-auto max-w-4xl rounded-[32px] border border-amber-100 bg-white/80 px-8 py-12 shadow-xl shadow-rose-100">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-700">
          Wedinq Quiz
        </p>
        <h1 className="mt-4 text-4xl font-light leading-tight text-amber-900 md:text-5xl">
          クイズに参加する
        </h1>
        <p className="mt-3 text-3 text-amber-700">
          新郎新婦のことどのくらいわかるかな？
        </p>
      </header>

      <div className="mt-12 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-3xl border border-amber-100 bg-amber-50/70 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-800">
            参加フォーム
          </h2>
          <form className="space-y-4">
            <label className="block text-left text-sm font-medium text-amber-900">
              ニックネーム
              <input
                type="text"
                placeholder="例：College Roomie"
                className="mt-2 w-full rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-base text-amber-900 outline-none focus:border-amber-500"
              />
            </label>
            <Link
              href="/quiz/question"
              className="block w-full rounded-full bg-amber-900 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-amber-50 shadow-lg shadow-amber-900/20"
            >
              参加する
            </Link>
          </form>
        </div>
      </div>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-3xl border border-amber-100 bg-white/70 p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600">
              {step.title}
            </p>
            <p className="mt-3 text-base text-amber-900">{step.description}</p>
          </div>
        ))}
      </section>

      <footer className="mt-10 text-center text-sm text-amber-700">
        前方のスクリーンとアプリは連動しています。参加中は画面を閉じないように気をつけてください！
      </footer>
    </section>
  </main>
);

export default QuizPage;
