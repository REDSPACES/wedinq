"use client";

import { useCallback, useEffect, useState } from "react";
import { CHOICE_LABELS, RANKING_DISPLAY_COUNT, TOTAL_QUESTIONS } from "../../../lib/constants/quiz";
import { getCorrectAnswer } from "../../../lib/constants/quiz-questions";
import {
  createQuizSession,
  updateSessionStatus,
} from "../../../lib/firebase/quiz-service";
import { useGuestCount } from "../../../lib/hooks/use-guest-count";
import { useQuizAnswers } from "../../../lib/hooks/use-quiz-answers";
import { useQuizSession } from "../../../lib/hooks/use-quiz-session";
import { CURRENT_SESSION_ID } from "../../../lib/utils/session-manager";
import type { GuestAnswer, RankingEntry, SessionStatus } from "../../../types/quiz";

export default function ControlPanelContent() {
  // Firebaseからセッション情報を取得
  const { session, loading: sessionLoading } = useQuizSession(CURRENT_SESSION_ID);
  const { allAnswers, currentAnswers } = useQuizAnswers(
    CURRENT_SESSION_ID,
    session?.currentQuestion,
  );
  const { guestCount } = useGuestCount(CURRENT_SESSION_ID);

  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [questionStartTimes, setQuestionStartTimes] = useState<Map<number, number>>(new Map());

  // セッション状態をローカルステートに反映
  const sessionStatus: SessionStatus = session?.status || "waiting";
  const currentQuestion = session?.currentQuestion || 1;

  // セッション初期化
  useEffect(() => {
    const initSession = async () => {
      if (!sessionLoading && !session) {
        try {
          await createQuizSession(CURRENT_SESSION_ID);
          console.log("Quiz session initialized:", CURRENT_SESSION_ID);
        } catch (error) {
          console.error("Failed to initialize session:", error);
        }
      }
    };

    initSession();
  }, [session, sessionLoading]);

  // 問題開始時刻を記録
  useEffect(() => {
    if (sessionStatus === "playing") {
      setQuestionStartTimes((prev) => {
        if (!prev.has(currentQuestion)) {
          const newMap = new Map(prev);
          newMap.set(currentQuestion, Date.now());
          return newMap;
        }
        return prev;
      });
    }
  }, [sessionStatus, currentQuestion]);

  // セッション開始
  const handleStart = useCallback(async () => {
    try {
      await updateSessionStatus(CURRENT_SESSION_ID, "playing", 1);
      setRankings([]);
      setQuestionStartTimes(new Map());
      console.log("Quiz session started");
    } catch (error) {
      console.error("Failed to start quiz session:", error);
      alert("クイズの開始に失敗しました。もう一度お試しください。");
    }
  }, []);

  // 最終ランキング計算（全問題の回答から計算）
  const calculateFinalRankings = useCallback(
    (allAnswersData: GuestAnswer[]): RankingEntry[] => {
      // ゲストごとに集計
      const guestStats = new Map<
        string,
        { nickname: string; correctCount: number; totalTime: number }
      >();

      for (const answer of allAnswersData) {
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

      // ランキング作成（正解数 > 平均回答時間の順）
      const rankingList = Array.from(guestStats.entries())
        .map(([, stats]) => ({
          rank: 0,
          nickname: stats.nickname,
          correctCount: stats.correctCount,
          averageResponseTime: stats.totalTime / stats.correctCount / 1000, // 秒に変換
        }))
        .sort((a, b) => {
          // 正解数が多い方が上位
          if (a.correctCount !== b.correctCount) {
            return b.correctCount - a.correctCount;
          }
          // 正解数が同じ場合は平均回答時間が短い方が上位
          return a.averageResponseTime - b.averageResponseTime;
        })
        .slice(0, RANKING_DISPLAY_COUNT)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      return rankingList;
    },
    [questionStartTimes],
  );

  // 現在の問題ランキング計算
  const calculateCurrentRankings = useCallback(
    (answersData: GuestAnswer[]): RankingEntry[] => {
      const questionStartTime = questionStartTimes.get(currentQuestion) || Date.now();

      return answersData
        .filter((a) => a.isCorrect)
        .sort((a, b) => a.answeredAt - b.answeredAt)
        .slice(0, RANKING_DISPLAY_COUNT)
        .map((a, index) => ({
          rank: index + 1,
          nickname: a.nickname,
          correctCount: allAnswers.filter((ans) => ans.guestId === a.guestId && ans.isCorrect)
            .length,
          averageResponseTime: (a.answeredAt - questionStartTime) / 1000,
        }));
    },
    [questionStartTimes, currentQuestion, allAnswers],
  );

  // 次の問題へ
  const handleNextQuestion = useCallback(async () => {
    try {
      if (currentQuestion < TOTAL_QUESTIONS) {
        await updateSessionStatus(CURRENT_SESSION_ID, "playing", currentQuestion + 1);
        setRankings([]);
        console.log(`Moving to question ${currentQuestion + 1}`);
      } else {
        // 最終結果を計算
        const finalRankings = calculateFinalRankings(allAnswers);
        setRankings(finalRankings);
        await updateSessionStatus(CURRENT_SESSION_ID, "finished");
        console.log("Quiz session finished", { finalRankings });
      }
    } catch (error) {
      console.error("Failed to proceed to next question:", error);
      alert("次の問題への移動に失敗しました。");
    }
  }, [currentQuestion, allAnswers, calculateFinalRankings]);

  // セッションリセット
  const handleReset = useCallback(async () => {
    try {
      await updateSessionStatus(CURRENT_SESSION_ID, "waiting", 1);
      setRankings([]);
      setQuestionStartTimes(new Map());
      console.log("Quiz session reset");
    } catch (error) {
      console.error("Failed to reset quiz session:", error);
      alert("セッションのリセットに失敗しました。");
    }
  }, []);

  // 現在の問題の結果を表示
  const handleShowResults = useCallback(() => {
    try {
      const currentRankings = calculateCurrentRankings(currentAnswers);
      setRankings(currentRankings);
      console.log("Current question results:", currentRankings);
    } catch (error) {
      console.error("Failed to show results:", error);
      alert("結果の表示に失敗しました。");
    }
  }, [currentAnswers, calculateCurrentRankings]);

  // 経過時間を計算
  const getElapsedTime = useCallback(
    (answeredAt: number): string => {
      const questionStartTime = questionStartTimes.get(currentQuestion) || Date.now();
      const elapsed = (answeredAt - questionStartTime) / 1000;
      return elapsed.toFixed(1);
    },
    [questionStartTimes, currentQuestion],
  );

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
          <p className="text-white">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white">クイズコントロールパネル</h1>
          <p className="mt-2 text-xl text-pink-100">Wedding Quiz Operator Dashboard</p>
          <p className="mt-1 text-sm text-pink-200">Session ID: {CURRENT_SESSION_ID}</p>
        </div>

        {/* メインコントロールエリア */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {/* セッション状態 */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">セッション状態</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <span className="font-semibold text-gray-700">状態:</span>
                <span
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    sessionStatus === "waiting"
                      ? "bg-yellow-200 text-yellow-800"
                      : sessionStatus === "playing"
                        ? "bg-green-200 text-green-800"
                        : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {sessionStatus === "waiting"
                    ? "待機中"
                    : sessionStatus === "playing"
                      ? "進行中"
                      : "終了"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <span className="font-semibold text-gray-700">現在の問題:</span>
                <span className="text-2xl font-bold text-pink-600">
                  {currentQuestion} / {TOTAL_QUESTIONS}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <span className="font-semibold text-gray-700">参加者数:</span>
                <span className="text-2xl font-bold text-blue-600">{guestCount} 名</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <span className="font-semibold text-gray-700">回答数:</span>
                <span className="text-2xl font-bold text-green-600">
                  {currentAnswers.length} 件
                </span>
              </div>
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">操作</h2>
            <div className="space-y-4">
              {sessionStatus === "waiting" && (
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  クイズを開始
                </button>
              )}

              {sessionStatus === "playing" && (
                <>
                  <button
                    type="button"
                    onClick={handleShowResults}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105"
                  >
                    結果を表示
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-6 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                  >
                    {currentQuestion < TOTAL_QUESTIONS ? "次の問題へ →" : "最終結果を表示"}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-xl font-bold text-gray-700 shadow-md transition-all hover:bg-gray-50"
              >
                セッションをリセット
              </button>
            </div>

            {/* 注意事項 */}
            <div className="mt-6 rounded-lg bg-amber-50 p-4">
              <h3 className="mb-2 font-bold text-amber-800">操作ガイド</h3>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>1. 「クイズを開始」で第1問を表示</li>
                <li>2. 「結果を表示」で現在のランキングを確認</li>
                <li>3. 「次の問題へ」で次の問題に進む</li>
                <li>4. 第{TOTAL_QUESTIONS}問終了後、最終結果が表示されます</li>
              </ul>
            </div>
          </div>
        </div>

        {/* リアルタイム回答モニター */}
        {sessionStatus === "playing" && (
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              リアルタイム回答モニター（第{currentQuestion}問）
            </h2>
            <div className="space-y-3">
              {currentAnswers.length === 0 ? (
                <p className="text-center text-gray-500">回答待ち...</p>
              ) : (
                currentAnswers.map((answer) => (
                  <div
                    key={`${answer.guestId}_${answer.questionNumber}`}
                    className={`flex items-center justify-between rounded-lg p-4 ${
                      answer.isCorrect
                        ? "border-2 border-green-300 bg-green-50"
                        : "border-2 border-red-300 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          answer.isCorrect
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {answer.isCorrect ? "正解" : "不正解"}
                      </span>
                      <span className="text-lg font-semibold text-gray-800">{answer.nickname}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        選択: {CHOICE_LABELS[answer.choice]}
                      </div>
                      <div className="text-xs text-gray-500">{getElapsedTime(answer.answeredAt)}秒</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ランキング表示 */}
        {rankings.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-pink-50 p-8 shadow-xl">
            <h2 className="mb-6 text-3xl font-bold text-gray-800">
              {sessionStatus === "finished" ? "最終ランキング TOP3" : "現在のランキング TOP3"}
            </h2>
            <div className="space-y-4">
              {rankings.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between rounded-xl p-6 shadow-lg ${
                    entry.rank === 1
                      ? "bg-gradient-to-r from-yellow-300 to-yellow-400"
                      : entry.rank === 2
                        ? "bg-gradient-to-r from-gray-300 to-gray-400"
                        : "bg-gradient-to-r from-orange-300 to-orange-400"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                      <span className="text-3xl font-bold text-gray-800">{entry.rank}</span>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{entry.nickname}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      正解数: {entry.correctCount}
                    </div>
                    <div className="text-lg text-gray-700">
                      平均: {entry.averageResponseTime.toFixed(1)}秒
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
