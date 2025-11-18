"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CHOICE_LABELS, RANKING_DISPLAY_COUNT, TOTAL_QUESTIONS } from "../../../lib/constants/quiz";
import type { GuestAnswer, RankingEntry, SessionStatus } from "../../../types/quiz";

export default function ControlPanelContent() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("waiting");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [guestCount, setGuestCount] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [answers, setAnswers] = useState<GuestAnswer[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [allAnswers, setAllAnswers] = useState<GuestAnswer[]>([]); // 全問題の回答を保存

  // モックデータ生成（useEffectの無限ループを防ぐためにuseMemoを使用）
  const mockAnswersData = useMemo(() => {
    if (sessionStatus !== "playing") return [];

    const baseTime = Date.now();
    return [
      {
        guestId: "1",
        nickname: "太郎さん",
        questionNumber: currentQuestion,
        choice: 0,
        answeredAt: baseTime - 2300,
        isCorrect: true,
      },
      {
        guestId: "2",
        nickname: "花子さん",
        questionNumber: currentQuestion,
        choice: 0,
        answeredAt: baseTime - 3100,
        isCorrect: true,
      },
      {
        guestId: "3",
        nickname: "次郎さん",
        questionNumber: currentQuestion,
        choice: 1,
        answeredAt: baseTime - 2800,
        isCorrect: Math.random() > 0.3, // ランダムに正解/不正解
      },
    ];
  }, [sessionStatus, currentQuestion]);

  // モックデータをセット（依存関係を最小限に）
  useEffect(() => {
    if (sessionStatus === "playing" && mockAnswersData.length > 0) {
      setAnswers(mockAnswersData);
      setGuestCount(Math.floor(Math.random() * 10) + 20); // 20-30名
      setAnswerCount(Math.floor(Math.random() * 10) + 15); // 15-25件
    }
  }, [sessionStatus, mockAnswersData]);

  // セッション開始
  const handleStart = useCallback(() => {
    try {
      setSessionStatus("playing");
      setCurrentQuestion(1);
      setAnswers([]);
      setRankings([]);
      setAllAnswers([]);
      console.log("Quiz session started");
    } catch (error) {
      console.error("Failed to start quiz session:", error);
      alert("クイズの開始に失敗しました。もう一度お試しください。");
    }
  }, []);

  // 最終ランキング計算（全問題の回答から計算）
  const calculateFinalRankings = useCallback((allAnswersData: GuestAnswer[]): RankingEntry[] => {
    // ゲストごとに集計
    const guestStats = new Map<
      string,
      { nickname: string; correctCount: number; totalTime: number }
    >();

    for (const answer of allAnswersData) {
      if (!answer.isCorrect) continue;

      const existing = guestStats.get(answer.guestId);
      const responseTime = answer.answeredAt; // 実際には問題開始時刻からの経過時間

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
      .map(([guestId, stats]) => ({
        guestId,
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
        rank: index + 1,
        nickname: entry.nickname,
        correctCount: entry.correctCount,
        averageResponseTime: entry.averageResponseTime,
      }));

    return rankingList;
  }, []);

  // 次の問題へ
  const handleNextQuestion = useCallback(() => {
    try {
      // 現在の回答を全回答リストに追加
      setAllAnswers((prev) => [...prev, ...answers]);

      if (currentQuestion < TOTAL_QUESTIONS) {
        setCurrentQuestion((prev) => prev + 1);
        setAnswers([]);
        setRankings([]);
        console.log(`Moving to question ${currentQuestion + 1}`);
      } else {
        // 最終結果を計算
        const allAnswersWithCurrent = [...allAnswers, ...answers];
        const finalRankings = calculateFinalRankings(allAnswersWithCurrent);
        setRankings(finalRankings);
        setSessionStatus("finished");
        console.log("Quiz session finished", { finalRankings });
      }
    } catch (error) {
      console.error("Failed to proceed to next question:", error);
      alert("次の問題への移動に失敗しました。");
    }
  }, [currentQuestion, answers, allAnswers, calculateFinalRankings]);

  // セッションリセット
  const handleReset = useCallback(() => {
    try {
      setSessionStatus("waiting");
      setCurrentQuestion(1);
      setGuestCount(0);
      setAnswerCount(0);
      setAnswers([]);
      setRankings([]);
      setAllAnswers([]);
      console.log("Quiz session reset");
    } catch (error) {
      console.error("Failed to reset quiz session:", error);
      alert("セッションのリセットに失敗しました。");
    }
  }, []);

  // 現在の問題の結果を表示
  const handleShowResults = useCallback(() => {
    try {
      const currentRankings: RankingEntry[] = answers
        .filter((a) => a.isCorrect)
        .sort((a, b) => a.answeredAt - b.answeredAt) // 回答時刻が早い順
        .slice(0, RANKING_DISPLAY_COUNT)
        .map((a, index) => ({
          rank: index + 1,
          nickname: a.nickname,
          correctCount: currentQuestion, // 現在までの正解数（モック）
          averageResponseTime: (Date.now() - a.answeredAt) / 1000,
        }));
      setRankings(currentRankings);
      console.log("Current question results:", currentRankings);
    } catch (error) {
      console.error("Failed to show results:", error);
      alert("結果の表示に失敗しました。");
    }
  }, [answers, currentQuestion]);

  // 経過時間を計算
  const getElapsedTime = useCallback((answeredAt: number): string => {
    const elapsed = (Date.now() - answeredAt) / 1000;
    return elapsed.toFixed(1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white">クイズコントロールパネル</h1>
          <p className="mt-2 text-xl text-pink-100">Wedding Quiz Operator Dashboard</p>
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
                <span className="text-2xl font-bold text-green-600">{answerCount} 件</span>
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
              {answers.length === 0 ? (
                <p className="text-center text-gray-500">回答待ち...</p>
              ) : (
                answers.map((answer) => (
                  <div
                    key={answer.guestId}
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
                      <div className="text-xs text-gray-500">
                        {getElapsedTime(answer.answeredAt)}秒
                      </div>
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
