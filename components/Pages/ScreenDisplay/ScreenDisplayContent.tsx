"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  RANKING_DISPLAY_COUNT,
  TIME_LIMIT_SECONDS,
  TIMER_INTERVAL_MS,
  TOTAL_QUESTIONS,
} from "../../../lib/constants/quiz";
import { useQuizAnswers } from "../../../lib/hooks/use-quiz-answers";
import { useQuizSession } from "../../../lib/hooks/use-quiz-session";
import { CURRENT_SESSION_ID } from "../../../lib/utils/session-manager";
import { getSlideImagePath } from "../../../lib/utils/quiz-images";
import type { GuestAnswer, RankingEntry, ScreenDisplayState } from "../../../types/quiz";

export default function ScreenDisplayContent() {
  const [state, setState] = useState<ScreenDisplayState>("standby");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [showResults, setShowResults] = useState(false);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [imageError, setImageError] = useState(false);
  const [questionStartTimes, setQuestionStartTimes] = useState<Map<number, number>>(new Map());

  // Firebaseからセッション情報と回答を取得
  const { session, loading: sessionLoading } = useQuizSession(CURRENT_SESSION_ID);
  const { allAnswers } = useQuizAnswers(CURRENT_SESSION_ID);

  const currentQuestion = session?.currentQuestion || 1;

  // セッション状態の変更を監視
  useEffect(() => {
    if (!session) return;

    if (session.status === "waiting") {
      setState("standby");
      setShowResults(false);
    } else if (session.status === "playing") {
      setState("question_display");
      setTimeLeft(TIME_LIMIT_SECONDS);
      setShowResults(false);

      // 問題開始時刻を記録
      setQuestionStartTimes((prev) => {
        if (!prev.has(currentQuestion)) {
          const newMap = new Map(prev);
          newMap.set(currentQuestion, Date.now());
          return newMap;
        }
        return prev;
      });
    } else if (session.status === "finished") {
      setState("finished");
      setShowResults(true);
      calculateFinalRankings();
    }
  }, [session]);

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

  // ランキング計算
  const calculateFinalRankings = useCallback(() => {
    // ゲストごとに集計
    const guestStats = new Map<
      string,
      { nickname: string; correctCount: number; totalTime: number }
    >();

    for (const answer of allAnswers) {
      if (!answer.isCorrect) continue;

      const existing = guestStats.get(answer.guestId);
      const questionStartTime = questionStartTimes.get(answer.questionNumber) || answer.answeredAt;
      const responseTime = answer.answeredAt - questionStartTime;

      if (existing) {
        existing.correctCount++;
        existing.totalTime += responseTime;
      } else {
        guestStats.set(answer.guestId, {
          nickname: answer.nickname,
          correctCount: 1,
          totalTime: responseTime,
        });
      }
    }

    // ランキング作成
    const rankingList = Array.from(guestStats.entries())
      .map(([, stats]) => ({
        rank: 0,
        nickname: stats.nickname,
        correctCount: stats.correctCount,
        averageResponseTime: stats.totalTime / stats.correctCount / 1000,
      }))
      .sort((a, b) => {
        if (a.correctCount !== b.correctCount) {
          return b.correctCount - a.correctCount;
        }
        return a.averageResponseTime - b.averageResponseTime;
      })
      .slice(0, RANKING_DISPLAY_COUNT)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    setRankings(rankingList);
  }, [allAnswers, questionStartTimes]);

  // 結果表示トグル
  const handleToggleResults = useCallback(() => {
    setShowResults((prev) => !prev);
    if (!showResults) {
      calculateFinalRankings();
    }
  }, [showResults, calculateFinalRankings]);

  // 画像読み込みエラーハンドラー
  const handleImageError = useCallback(() => {
    setImageError(true);
    console.error(`Failed to load image for question ${currentQuestion}`);
  }, [currentQuestion]);

  if (sessionLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
          <p className="text-white">読み込み中...</p>
        </div>
      </div>
    );
  }

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
                  <span className="text-4xl font-bold text-pink-900">第 {currentQuestion} 問</span>
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
            </div>
          )}

          {/* 結果表示画面 (結果を表示ボタンが押されたとき) */}
          {showResults && rankings.length > 0 && state !== "standby" && (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
