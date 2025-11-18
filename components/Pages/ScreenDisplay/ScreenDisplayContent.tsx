"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { ScreenDisplayState, RankingEntry } from "../../../types/quiz";
import {
  TOTAL_QUESTIONS,
  TIME_LIMIT_SECONDS,
  TIMER_INTERVAL_MS,
} from "../../../lib/constants/quiz";
import { getSlideImagePath } from "../../../lib/utils/quiz-images";

export default function ScreenDisplayContent() {
  const [state, setState] = useState<ScreenDisplayState>("standby");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [imageError, setImageError] = useState(false);

  // タイマーのカウントダウン
  useEffect(() => {
    if (state !== "question_display" || timeLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, TIMER_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [state, timeLeft]);

  // モックランキングデータを生成（実際の実装ではSupabaseから取得）
  const generateMockRankings = useCallback((): RankingEntry[] => {
    return [
      { rank: 1, nickname: "太郎さん", correctCount: currentQuestion, averageResponseTime: 2.3 },
      { rank: 2, nickname: "花子さん", correctCount: currentQuestion, averageResponseTime: 3.1 },
      { rank: 3, nickname: "次郎さん", correctCount: currentQuestion - 1, averageResponseTime: 2.8 },
    ];
  }, [currentQuestion]);

  // 次へ進む
  const handleNext = useCallback(() => {
    setImageError(false);

    if (state === "standby") {
      setState("question_display");
      setCurrentQuestion(1);
      setTimeLeft(TIME_LIMIT_SECONDS);
    } else if (state === "question_display") {
      setState("result_display");
      setRankings(generateMockRankings());
    } else if (state === "result_display") {
      if (currentQuestion < TOTAL_QUESTIONS) {
        setState("question_display");
        setCurrentQuestion((prev) => prev + 1);
        setTimeLeft(TIME_LIMIT_SECONDS);
      } else {
        setState("finished");
      }
    } else if (state === "finished") {
      // リセット
      setState("standby");
      setCurrentQuestion(1);
      setTimeLeft(TIME_LIMIT_SECONDS);
      setRankings([]);
    }
  }, [state, currentQuestion, generateMockRankings]);

  // 画像読み込みエラーハンドラー
  const handleImageError = useCallback(() => {
    setImageError(true);
    console.error(`Failed to load image for question ${currentQuestion}`);
  }, [currentQuestion]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      {/* 16:9 アスペクト比のコンテナ */}
      <div className="relative h-full w-full max-h-screen max-w-[177.78vh]">
        <div className="relative h-full w-full bg-gradient-to-br from-pink-50 via-white to-pink-50">
          {/* 待機画面 */}
          {state === "standby" && (
            <div className="relative h-full w-full">
              <Image
                src={getSlideImagePath("qr")}
                alt="QRコード"
                fill
                className="object-cover"
                priority
                onError={handleImageError}
              />
              {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50 p-16">
                  <h1
                    className="mb-12 text-7xl font-bold text-pink-900"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    Wedding Quiz
                  </h1>
                  <div className="mb-8 rounded-3xl bg-white p-12 shadow-2xl">
                    <div className="mb-6 text-center text-3xl font-semibold text-gray-700">
                      スマートフォンでQRコードを
                      <br />
                      読み取ってください
                    </div>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="absolute bottom-12 right-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-16 py-6 text-3xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
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

              {/* 問題番号（左上） */}
              <div className="absolute left-12 top-12 z-10">
                <div className="rounded-2xl bg-white/90 px-8 py-4 shadow-lg backdrop-blur-sm">
                  <span className="text-4xl font-bold text-pink-900">
                    第 {currentQuestion} 問
                  </span>
                </div>
              </div>

              {/* 問題画像 */}
              <Image
                src={getSlideImagePath("question", currentQuestion)}
                alt={`第${currentQuestion}問`}
                fill
                className="object-contain"
                priority
                onError={handleImageError}
              />

              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <span className="text-4xl text-gray-500">問題画像の読み込みに失敗しました</span>
                    <p className="mt-4 text-xl text-gray-400">
                      {getSlideImagePath("question", currentQuestion)}
                    </p>
                  </div>
                </div>
              )}

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
            <div className="relative h-full w-full">
              <Image
                src={getSlideImagePath("resultname")}
                alt="結果発表"
                fill
                className="object-cover"
                priority
                onError={handleImageError}
              />

              {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50 p-16">
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
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="absolute bottom-12 right-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-16 py-6 text-3xl font-bold text-white shadow-lg transition-all hover:scale-105"
              >
                {currentQuestion < TOTAL_QUESTIONS ? "次の問題へ →" : "最終結果を表示 →"}
              </button>
            </div>
          )}

          {/* 終了画面 */}
          {state === "finished" && (
            <div className="relative h-full w-full">
              <Image
                src={getSlideImagePath("end")}
                alt="終了"
                fill
                className="object-cover"
                priority
                onError={handleImageError}
              />

              {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50 p-16">
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
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="absolute bottom-12 right-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 px-12 py-5 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105"
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
