"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ScreenDisplayState, RankingEntry } from "../../types/quiz";

export default function ScreenPage() {
  const [state, setState] = useState<ScreenDisplayState>("standby");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);

  // タイマーのカウントダウン
  useEffect(() => {
    if (state === "question_display" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, timeLeft]);

  // 次へ進む
  const handleNext = () => {
    if (state === "standby") {
      setState("question_display");
      setCurrentQuestion(1);
      setTimeLeft(30);
    } else if (state === "question_display") {
      setState("result_display");
      // モックランキングデータ
      setRankings([
        { rank: 1, nickname: "太郎さん", correctCount: 5, averageResponseTime: 2.3 },
        { rank: 2, nickname: "花子さん", correctCount: 5, averageResponseTime: 3.1 },
        { rank: 3, nickname: "次郎さん", correctCount: 4, averageResponseTime: 2.8 },
      ]);
    } else if (state === "result_display") {
      if (currentQuestion < 5) {
        setState("question_display");
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
      } else {
        setState("finished");
      }
    } else if (state === "finished") {
      // リセット
      setState("standby");
      setCurrentQuestion(1);
      setTimeLeft(30);
      setRankings([]);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      {/* 16:9 アスペクト比のコンテナ */}
      <div className="relative h-full w-full max-h-screen max-w-[177.78vh]">
        <div className="relative h-full w-full bg-gradient-to-br from-pink-50 via-white to-pink-50">
          {/* 待機画面 */}
          {state === "standby" && (
            <div className="flex h-full flex-col items-center justify-center p-16">
              <h1
                className="mb-12 text-7xl font-bold text-pink-900"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Wedding Quiz
              </h1>
              <div className="mb-8 rounded-3xl bg-white p-12 shadow-2xl">
                <div className="mb-6 text-center text-3xl font-semibold text-gray-700">
                  スマートフォンでこちらのQRコードを
                  <br />
                  読み取ってください
                </div>
                {/* QRコードプレースホルダー */}
                <div className="mx-auto h-96 w-96 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 shadow-inner">
                  <div className="flex h-full w-full items-center justify-center border-4 border-dashed border-gray-400">
                    <span className="text-2xl text-gray-500">QR Code</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-16 py-6 text-3xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                クイズを開始
              </button>
            </div>
          )}

          {/* 問題表示画面 */}
          {state === "question_display" && (
            <div className="relative h-full w-full">
              {/* カウントダウンタイマー（右上） */}
              <div className="absolute right-12 top-12 z-10">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl">
                  <span className="text-5xl font-bold text-white">{timeLeft}</span>
                </div>
              </div>

              {/* 問題番号 */}
              <div className="absolute left-12 top-12 z-10">
                <div className="rounded-2xl bg-white/90 px-8 py-4 shadow-lg backdrop-blur-sm">
                  <span className="text-4xl font-bold text-pink-900">第 {currentQuestion} 問</span>
                </div>
              </div>

              {/* 問題画像エリア */}
              <div className="flex h-full items-center justify-center p-24">
                <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src={`/quiz-slides/question-${currentQuestion}.jpg`}
                    alt={`第${currentQuestion}問`}
                    fill
                    className="object-contain"
                    priority
                    onError={(e) => {
                      // 画像が見つからない場合はプレースホルダーを表示
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = "flex";
                      }
                    }}
                  />
                  {/* 画像が存在しない場合のプレースホルダー */}
                  <div className="hidden h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <span className="text-4xl text-gray-500">問題画像（JPGスライド）</span>
                      <p className="mt-4 text-xl text-gray-400">
                        /public/quiz-slides/question-{currentQuestion}.jpg
                        <br />
                        上記のパスに画像を配置してください
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 次へボタン */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute bottom-12 right-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-12 py-5 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105"
              >
                結果を表示 →
              </button>
            </div>
          )}

          {/* 結果表示画面 */}
          {state === "result_display" && (
            <div className="flex h-full flex-col items-center justify-center p-16">
              <h2
                className="mb-12 text-6xl font-bold text-pink-900"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                第 {currentQuestion} 問 結果発表
              </h2>

              {/* TOP3ランキング */}
              <div className="mb-12 w-full max-w-5xl space-y-6">
                {rankings.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between rounded-2xl p-8 shadow-lg ${
                      entry.rank === 1
                        ? "bg-gradient-to-r from-yellow-300 to-yellow-400"
                        : entry.rank === 2
                          ? "bg-gradient-to-r from-gray-300 to-gray-400"
                          : "bg-gradient-to-r from-orange-300 to-orange-400"
                    }`}
                  >
                    <div className="flex items-center gap-8">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                        <span className="text-4xl font-bold text-gray-800">{entry.rank}</span>
                      </div>
                      <span className="text-4xl font-bold text-gray-900">{entry.nickname}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        正解数: {entry.correctCount}
                      </div>
                      <div className="text-xl text-gray-700">
                        平均回答時間: {entry.averageResponseTime.toFixed(1)}秒
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-16 py-6 text-3xl font-bold text-white shadow-lg transition-all hover:scale-105"
              >
                {currentQuestion < 5 ? "次の問題へ →" : "最終結果を表示 →"}
              </button>
            </div>
          )}

          {/* 終了画面 */}
          {state === "finished" && (
            <div className="flex h-full flex-col items-center justify-center p-16">
              <h1
                className="mb-12 text-8xl font-bold text-pink-900"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                ご参加ありがとうございました
              </h1>
              <p className="mb-16 text-4xl text-gray-700">
                クイズはこれで終了です
                <br />
                素敵な時間をお過ごしください
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full bg-gradient-to-r from-gray-500 to-gray-600 px-12 py-5 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105"
              >
                最初に戻る
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
