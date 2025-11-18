const floralBackground =
  "radial-gradient(circle at 10% 20%, rgba(243, 216, 214, 0.55), transparent 35%), radial-gradient(circle at 90% 15%, rgba(231, 194, 189, 0.6), transparent 36%), radial-gradient(circle at 20% 80%, rgba(230, 200, 150, 0.38), transparent 34%), radial-gradient(circle at 85% 75%, rgba(210, 177, 153, 0.32), transparent 34%)";

const archBackground =
  "radial-gradient(120% 65% at 50% 0%, rgba(255, 248, 244, 0.9), #fff6f1 72%, #f1e7dd 73%)";

export default function Home() {
  return (
    <div className="flex min-h-screen justify-center bg-[#fdf7f5] text-[#5d463e]">
      <main className="flex w-full max-w-[520px] flex-col gap-14 px-5 pb-16 pt-8">
        <section
          className="relative overflow-hidden rounded-[32px] bg-[#fff7f3] px-7 pb-14 pt-16 text-center shadow-[0_16px_40px_rgba(0,0,0,0.04)]"
          style={{ backgroundImage: floralBackground }}
        >
          <div className="absolute left-0 top-0 h-24 w-full" aria-hidden />
          <p className="text-[40px] font-semibold leading-[1.1] text-[#5a433d]" style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}>
            Happy
            <br />
            Wedding
          </p>
          <p className="mt-4 text-lg font-semibold text-[#6a5149]" style={{ fontFamily: '"Shippori Mincho", "Noto Serif JP", "Hiragino Mincho ProN", serif' }}>
            Akito &amp; Marina
          </p>
          <p className="text-sm text-[#8a7a75]">20 May 2026</p>
          <div className="mt-6 flex justify-center">
            <div className="flex flex-col items-center gap-1 text-[#777]">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden>
                <path d="M3 3l13 13L29 3" stroke="#8b8b8b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden>
                <path d="M3 3l13 13L29 3" stroke="#8b8b8b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div
            className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rotate-[-14deg] rounded-full opacity-80 blur-[1px]"
            style={{ backgroundImage: floralBackground }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-10 bottom-3 h-40 w-40 rotate-[12deg] rounded-full opacity-80 blur-[1px]"
            style={{ backgroundImage: floralBackground }}
            aria-hidden
          />
        </section>

        <section
          className="relative overflow-hidden rounded-[32px] border-[3px] border-[#c8bda9] bg-[#fffaf5] px-6 pb-10 pt-14 shadow-[0_16px_40px_rgba(0,0,0,0.04)]"
          style={{ backgroundImage: archBackground }}
        >
          <div className="absolute inset-x-6 top-6 flex items-center justify-between text-[#c8bda9]" aria-hidden>
            <span className="h-[2px] w-12 rounded-full bg-[#c8bda9]" />
            <svg width="52" height="20" viewBox="0 0 52 20" fill="none">
              <path
                d="M2 10.5c14-12 34-12 48 0"
                stroke="#c8bda9"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="h-[2px] w-12 rounded-full bg-[#c8bda9]" />
          </div>
          <h2
            className="text-center text-3xl font-semibold tracking-[0.04em] text-[#5a443c]"
            style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
          >
            Message
          </h2>
          <div className="mt-5 flex justify-center">
            <div className="h-[2px] w-20 rounded-full bg-[#e1c5b5]" />
          </div>
          <div className="mt-6 overflow-hidden rounded-[22px] border border-[#e9dfd5] bg-white">
            <div className="h-[220px] w-full bg-gradient-to-b from-[#f3f0eb] via-[#f8f5f0] to-[#eae4db]" />
          </div>
          <p
            className="mt-6 whitespace-pre-line text-center text-lg leading-9 text-[#5d463e]"
            style={{ fontFamily: '"Shippori Mincho", "Noto Serif JP", "Hiragino Mincho ProN", serif' }}
          >
            本日はご多用中にもかかわらず{"\n"}
            お越しくださり誠にありがとうございます{"\n"}
            皆様にあたたかく見守られ{"\n"}
            今日の日を迎えられることを嬉しく思います{"\n"}
            短い時間ではございますが{"\n"}
            結婚披露宴をご用意いたしましたので{"\n"}
            どうぞ楽しいひと時をお過ごしください
          </p>
        </section>

        <section className="rounded-[28px] border border-dashed border-[#e2b6b6] bg-[#fff9f6] px-6 pb-10 pt-8 text-center shadow-[0_14px_36px_rgba(0,0,0,0.04)]">
          <h3
            className="text-3xl font-semibold text-[#5a433d]"
            style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
          >
            Quiz
          </h3>
          <p
            className="mt-6 text-[19px] leading-9 text-[#5f4b44]"
            style={{ fontFamily: '"Shippori Mincho", "Noto Serif JP", "Hiragino Mincho ProN", serif' }}
          >
            皆様にお楽しみいただけるように{"\n"}
            クイズ企画をご用意しました！{"\n"}
            指示がございましたら{"\n"}
            始めるをタップしてください。
          </p>
          <button
            className="mt-8 w-full max-w-[320px] rounded-full bg-[linear-gradient(135deg,#ffd8d2,#f6a3a0_40%,#f07c7c)] px-8 py-4 text-xl font-semibold text-[#3c2b29] shadow-[0_12px_0_rgba(222,111,111,0.4),0_12px_24px_rgba(0,0,0,0.12)] transition-transform duration-150 active:translate-y-[3px] active:shadow-[0_4px_0_rgba(222,111,111,0.4),0_8px_16px_rgba(0,0,0,0.12)]"
            style={{ fontFamily: '"Shippori Mincho", "Noto Serif JP", "Hiragino Mincho ProN", serif' }}
          >
            はじめる
          </button>
        </section>
      </main>
    </div>
  );
}
