"use client";

import { useState, useEffect } from "react";
import type { SessionStatus, GuestAnswer, RankingEntry } from "../../types/quiz";

export default function ControlPage() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("waiting");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [guestCount, setGuestCount] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [answers, setAnswers] = useState<GuestAnswer[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);

  // モックデータ：リアルタイム回答をシミュレート
  useEffect(() => {
    if (sessionStatus === "playing") {
      // モック：ゲスト数と回答数を更新
      setGuestCount(Math.floor(Math.random() * 30) + 20);
      setAnswerCount(Math.floor(Math.random() * 25) + 15);

      // モック回答データ
      const mockAnswers: GuestAnswer[] = [
        {
          guestId: "1",
          nickname: "太郎さん",
          questionNumber: currentQuestion,
          choice: 0,
          answeredAt: Date.now() - 2300,
          isCorrect: true,
        },
        {
          guestId: "2",
          nickname: "花子さん",
          questionNumber: currentQuestion,
          choice: 0,
          answeredAt: Date.now() - 3100,
          isCorrect: true,
        },
        {
          guestId: "3",
          nickname: "次郎さん",
          questionNumber: currentQuestion,
          choice: 1,
          answeredAt: Date.now() - 2800,
          isCorrect: false,
        },
      ];
      setAnswers(mockAnswers);
    }
  }, [sessionStatus, currentQuestion]);

  // セッション開始
  const handleStart = () => {
    setSessionStatus("playing");
    setCurrentQuestion(1);
    setAnswers([]);
    setRankings([]);
  };

  // 次の問題へ
  const handleNextQuestion = () => {
    if (currentQuestion < 5) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswers([]);
    } else {
      // 最終結果を計算
      const finalRankings: RankingEntry[] = [
        { rank: 1, nickname: "太郎さん", correctCount: 5, averageResponseTime: 2.3 },
        { rank: 2, nickname: "花子さん", correctCount: 5, averageResponseTime: 3.1 },
        { rank: 3, nickname: "次郎さん", correctCount: 4, averageResponseTime: 2.8 },
      ];
      setRankings(finalRankings);
      setSessionStatus("finished");
    }
  };

  // セッションリセット
  const handleReset = () => {
    setSessionStatus("waiting");
    setCurrentQuestion(1);
    setGuestCount(0);
    setAnswerCount(0);
    setAnswers([]);
    setRankings([]);
  };

  // 結果を表示
  const handleShowResults = () => {
    const currentRankings: RankingEntry[] = answers
      .filter((a) => a.isCorrect)
      .sort((a, b) => a.answeredAt - b.answeredAt)
      .slice(0, 3)
      .map((a, index) => ({
        rank: index + 1,
        nickname: a.nickname,
        correctCount: 1,
        averageResponseTime: (Date.now() - a.answeredAt) / 1000,
      }));
    setRankings(currentRankings);
  };

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
                  {currentQuestion} / 5
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
                    {currentQuestion < 5 ? "次の問題へ →" : "最終結果を表示"}
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
                <li>4. 第5問終了後、最終結果が表示されます</li>
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
                        ? "bg-green-50 border-2 border-green-300"
                        : "bg-red-50 border-2 border-red-300"
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
                      <span className="text-lg font-semibold text-gray-800">
                        {answer.nickname}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        選択: {["A", "B", "C", "D"][answer.choice]}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((Date.now() - answer.answeredAt) / 1000).toFixed(1)}秒
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
