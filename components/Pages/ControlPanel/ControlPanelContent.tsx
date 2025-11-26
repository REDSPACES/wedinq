"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RANKING_DISPLAY_COUNT, TOTAL_QUESTIONS } from "../../../lib/constants/quiz";
import { saveQuizState } from "../../../lib/utils/quiz-state";
import type { GuestAnswer, RankingEntry, SessionStatus } from "../../../types/quiz";

// スライドファイル名の定義
const SLIDE_FILENAMES = [
  "1-TOP.jpg",
  "2-qr.jpg",
  "3-rule.jpg",
  "4-question-1.jpg",
  "5-answer-1.jpg",
  "6-question-2.jpg",
  "7-answer-2.jpg",
  "8-question-3.jpg",
  "9-answer-3.jpg",
  "10-question-4.jpg",
  "11-answer-4.jpg",
  "12-question-5.jpg",
  "13-answer-5.jpg",
  "14-result.jpg",
  "15-resultname.jpg",
  "16-end.jpg",
];

export default function ControlPanelContent() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("waiting");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [answers, setAnswers] = useState<GuestAnswer[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [allAnswers, setAllAnswers] = useState<GuestAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);

  // モックデータ生成
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
        isCorrect: true,
      },
      {
        guestId: "4",
        nickname: "美咲さん",
        questionNumber: currentQuestion,
        choice: 0,
        answeredAt: baseTime - 4500,
        isCorrect: true,
      },
    ];
  }, [sessionStatus, currentQuestion]);

  useEffect(() => {
    if (sessionStatus === "playing" && mockAnswersData.length > 0) {
      setAnswers(mockAnswersData);
      setGuestCount(Math.floor(Math.random() * 10) + 20);

      // リアルタイムランキングを計算（現在の問題の正解者をタイム順）
      const currentRankings: RankingEntry[] = mockAnswersData
        .filter((a) => a.isCorrect)
        .sort((a, b) => a.answeredAt - b.answeredAt)
        .slice(0, RANKING_DISPLAY_COUNT)
        .map((a, index) => ({
          rank: index + 1,
          nickname: a.nickname,
          correctCount: currentQuestion,
          averageResponseTime: (Date.now() - a.answeredAt) / 1000,
        }));
      setRankings(currentRankings);
    }
  }, [sessionStatus, mockAnswersData, currentQuestion]);

  const handleStart = useCallback(() => {
    try {
      setSessionStatus("playing");
      setCurrentQuestion(1);
      setCurrentSlideIndex(0);
      setAnswers([]);
      setRankings([]);
      setAllAnswers([]);
      setShowResults(false);

      // 状態を保存してscreenに通知
      saveQuizState({
        currentSlideIndex: 0,
        sessionStatus: "playing",
        currentQuestion: 1,
      });

      console.log("Quiz session started");
    } catch (error) {
      console.error("Failed to start quiz session:", error);
      alert("クイズの開始に失敗しました。もう一度お試しください。");
    }
  }, []);

  const calculateFinalRankings = useCallback((allAnswersData: GuestAnswer[]): RankingEntry[] => {
    const guestStats = new Map<
      string,
      { nickname: string; correctCount: number; totalTime: number }
    >();

    for (const answer of allAnswersData) {
      if (!answer.isCorrect) continue;

      const existing = guestStats.get(answer.guestId);
      const responseTime = answer.answeredAt;

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

    const rankingList = Array.from(guestStats.entries())
      .map(([, stats]) => ({
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
        rank: index + 1,
        ...entry,
      }));

    return rankingList;
  }, []);

  const handleNextQuestion = useCallback(() => {
    try {
      // 回答スライドから次の問題へ移動する場合
      if (showResults) {
        setAllAnswers((prev) => [...prev, ...answers]);
        setShowResults(false);

        if (currentQuestion < TOTAL_QUESTIONS) {
          const nextQuestion = currentQuestion + 1;
          const nextSlideIndex = currentSlideIndex + 1; // 次の問題スライドへ

          setCurrentQuestion(nextQuestion);
          setCurrentSlideIndex(nextSlideIndex);
          setAnswers([]);

          // 状態を保存してscreenに通知
          saveQuizState({
            currentSlideIndex: nextSlideIndex,
            sessionStatus: "playing",
            currentQuestion: nextQuestion,
          });

          console.log(`Moving to question ${nextQuestion}`);
        } else {
          const allAnswersWithCurrent = [...allAnswers, ...answers];
          const finalRankings = calculateFinalRankings(allAnswersWithCurrent);
          setRankings(finalRankings);
          setSessionStatus("finished");
          setCurrentSlideIndex(13); // 結果スライドへ

          // 状態を保存してscreenに通知
          saveQuizState({
            currentSlideIndex: 13,
            sessionStatus: "finished",
            currentQuestion: TOTAL_QUESTIONS,
          });

          console.log("Quiz session finished", { finalRankings });
        }
      } else {
        // 問題スライドから次へ移動（スライドを順に進める）
        const nextSlideIndex = currentSlideIndex + 1;
        setCurrentSlideIndex(nextSlideIndex);

        // 状態を保存してscreenに通知
        saveQuizState({
          currentSlideIndex: nextSlideIndex,
          sessionStatus: "playing",
          currentQuestion,
        });

        console.log(`Moving to slide ${nextSlideIndex}`);
      }
    } catch (error) {
      console.error("Failed to proceed to next question:", error);
      alert("次の問題への移動に失敗しました。");
    }
  }, [currentQuestion, currentSlideIndex, answers, allAnswers, calculateFinalRankings, showResults]);

  const handleShowResults = useCallback(() => {
    try {
      // 回答スライドの場合は前のスライドへ戻る
      if (showResults) {
        setShowResults(false);
        const prevSlideIndex = currentSlideIndex - 1;
        setCurrentSlideIndex(prevSlideIndex);

        // 状態を保存してscreenに通知
        saveQuizState({
          currentSlideIndex: prevSlideIndex,
          sessionStatus: "playing",
          currentQuestion,
        });

        console.log("Going back to question slide", currentQuestion);
      } else {
        // 問題スライドの場合は前のスライドへ
        if (currentSlideIndex > 0) {
          const prevSlideIndex = currentSlideIndex - 1;
          setCurrentSlideIndex(prevSlideIndex);

          // 状態を保存してscreenに通知
          saveQuizState({
            currentSlideIndex: prevSlideIndex,
            sessionStatus: "playing",
            currentQuestion,
          });

          console.log(`Going back to slide ${prevSlideIndex}`);
        }
      }
    } catch (error) {
      console.error("Failed to go back:", error);
      alert("前の画面への移動に失敗しました。");
    }
  }, [currentQuestion, currentSlideIndex, showResults]);

  const _getElapsedTime = useCallback((answeredAt: number): string => {
    const elapsed = (Date.now() - answeredAt) / 1000;
    return elapsed.toFixed(1);
  }, []);

  const currentSlideFilename = SLIDE_FILENAMES[currentSlideIndex];

  return (
    <div className="flex h-screen w-full bg-[#fef7ff] p-6">
      <div className="flex h-full w-full flex-col gap-4">
        {/* ヘッダー - Material 3スタイル */}
        <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-[#6750a4] to-[#7f67be] px-6 py-3 shadow-lg">
          <div>
            <h1 className="text-xl font-bold text-white">クイズコントロールパネル</h1>
            <p className="text-xs text-[#e8def8]">Moderator Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {/* 参加者カウント */}
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 backdrop-blur">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-sm font-semibold text-white">参加者: {guestCount}名</span>
            </div>
            {/* セッション状態 */}
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 backdrop-blur">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  sessionStatus === "playing"
                    ? "bg-[#4caf50] animate-pulse"
                    : sessionStatus === "finished"
                      ? "bg-[#2196f3]"
                      : "bg-[#ff9800]"
                }`}
              />
              <span className="text-sm font-semibold text-white">
                {sessionStatus === "waiting"
                  ? "待機中"
                  : sessionStatus === "playing"
                    ? "進行中"
                    : "終了"}
              </span>
            </div>
          </div>
        </div>

        {/* メインコンテンツ - 2カラムレイアウト */}
        <div className="grid h-[calc(100vh-120px)] grid-cols-2 gap-4">
          {/* 左側: スクリーンプレビュー */}
          <div className="flex flex-col gap-3">
            {/* スクリーンプレビュー */}
            <div className="flex-1 overflow-hidden rounded-3xl bg-white p-4 shadow-lg">
              <h2 className="mb-2 text-sm font-bold text-[#1c1b1f]">スクリーンプレビュー</h2>
              <div className="relative h-[calc(100%-32px)] w-full overflow-hidden rounded-2xl bg-gray-100">
                <Image
                  src={`/quiz-slides/${currentSlideFilename}`}
                  alt={`スライド ${currentSlideIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* コントロールボタン */}
            <div className="rounded-3xl bg-white p-4 shadow-lg">
              <h2 className="mb-3 text-sm font-bold text-[#1c1b1f]">操作</h2>
              <div className="flex gap-3">
                {sessionStatus === "waiting" && (
                  <button
                    type="button"
                    onClick={handleStart}
                    className="flex-1 rounded-full bg-[#6750a4] px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-[#7f67be] hover:shadow-xl active:scale-95"
                  >
                    クイズを開始
                  </button>
                )}

                {sessionStatus === "playing" && (
                  <>
                    <button
                      type="button"
                      onClick={handleShowResults}
                      className="flex-1 rounded-full bg-[#2196f3] px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-[#42a5f5] hover:shadow-xl active:scale-95"
                    >
                      前へ
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="flex-1 rounded-full bg-[#6750a4] px-6 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-[#7f67be] hover:shadow-xl active:scale-95"
                    >
                      {currentQuestion < TOTAL_QUESTIONS ? "次へ" : "最終結果"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 右側: ランキング */}
          <div className="overflow-hidden rounded-3xl bg-white p-5 shadow-lg">
            <h2 className="mb-4 text-base font-bold text-[#1c1b1f]">
              正解者トップ3{" "}
              <span className="text-sm font-normal text-[#79747e]">（リアルタイム）</span>
            </h2>
            {rankings.length === 0 ? (
              <div className="flex h-[calc(100%-40px)] items-center justify-center">
                <p className="text-base text-[#79747e]">まだ正解者がいません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rankings.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 rounded-2xl border-2 p-5 transition-all ${
                      entry.rank === 1
                        ? "border-[#ffd700] bg-gradient-to-br from-[#fff9e6] to-[#fffaed] shadow-md"
                        : entry.rank === 2
                          ? "border-[#c0c0c0] bg-gradient-to-br from-[#f5f5f5] to-[#fafafa] shadow-sm"
                          : "border-[#cd7f32] bg-gradient-to-br from-[#fff4e6] to-[#fff7ed] shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg ${
                        entry.rank === 1
                          ? "bg-[#ffd700]"
                          : entry.rank === 2
                            ? "bg-[#c0c0c0]"
                            : "bg-[#cd7f32]"
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-bold text-[#1c1b1f]">{entry.nickname}</div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-[#49454f]">
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          正解: {entry.correctCount}問
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {entry.averageResponseTime.toFixed(1)}秒
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
