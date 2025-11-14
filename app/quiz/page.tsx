import Link from "next/link";

const steps = [
  {
    title: "STEP 1",
    description: "席札のQRコードを読み取ってセッションIDを入力。",
  },
  {
    title: "STEP 2",
    description: "ニックネームを登録してクイズの準備をします。",
  },
  {
    title: "STEP 3",
    description: "設問はスクリーンと同期。回答が完了したら結果発表を待ちましょう。",
  },
];

const quickLinks = [
  { title: "ゲスト画面へ", href: "/demo/guest?step=intro" },
  { title: "スクリーン画面へ", href: "/demo/screen?slide=standby" },
];

const QuizPage = () => (
  <main className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-amber-50 px-4 py-16">
    <section className="mx-auto max-w-4xl rounded-[32px] border border-amber-100 bg-white/80 px-8 py-12 shadow-xl shadow-rose-100">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-700">Wedinq Quiz</p>
        <h1 className="mt-4 text-4xl font-light leading-tight text-amber-900 md:text-5xl">クイズに参加する</h1>
        <p className="mt-4 text-lg text-amber-800">
          お手元の席札QRコードからアクセスしたら、セッションIDとニックネームを入力してクイズに参加しましょう。
        </p>
      </header>

      <div className="mt-12 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-3xl border border-amber-100 bg-amber-50/70 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-800">参加フォーム</h2>
          <form className="space-y-4">
            <label className="block text-left text-sm font-medium text-amber-900">
              セッションID
              <input
                type="text"
                placeholder="例：ABC123"
                className="mt-2 w-full rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-base text-amber-900 outline-none focus:border-amber-500"
              />
            </label>
            <label className="block text-left text-sm font-medium text-amber-900">
              ニックネーム
              <input
                type="text"
                placeholder="例：College Roomie"
                className="mt-2 w-full rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-base text-amber-900 outline-none focus:border-amber-500"
              />
            </label>
            <button
              type="button"
              className="w-full rounded-full bg-amber-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-50 shadow-lg shadow-amber-900/20"
            >
              参加する
            </button>
          </form>
        </div>

        <div className="space-y-4 rounded-3xl border border-amber-100 bg-white/70 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-800">クイックリンク</h2>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="flex items-center justify-between rounded-2xl border border-amber-100 px-5 py-4 text-amber-900 transition hover:bg-amber-50"
              >
                <span>{link.title}</span>
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
          <p className="text-sm text-amber-700">
            実際の本番環境では司会者がスクリーンを操作し、ゲスト画面は自動で遷移します。
          </p>
        </div>
      </div>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-3xl border border-amber-100 bg-white/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600">{step.title}</p>
            <p className="mt-3 text-base text-amber-900">{step.description}</p>
          </div>
        ))}
      </section>

      <footer className="mt-10 text-center text-sm text-amber-700">
        会場のWi-Fiが混雑している場合は事前にネットワーク環境をご確認ください。
      </footer>
    </section>
  </main>
);

export default QuizPage;
