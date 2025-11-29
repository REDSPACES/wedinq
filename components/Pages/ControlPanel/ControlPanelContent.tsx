"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ANSWER_SLIDE_INDICES,
  CHOICE_LABELS,
  QUESTION_SLIDE_INDICES,
  RANKING_DISPLAY_COUNT,
  SLIDE_FILENAMES,
  TOTAL_QUESTIONS,
} from "../../../lib/constants/quiz";
import { getQuizState, saveQuizState, subscribeToQuizState } from "../../../lib/utils/quiz-state";
import type { GuestAnswer, RankingEntry, SessionStatus } from "../../../types/quiz";

const TOTAL_SLIDES = SLIDE_FILENAMES.length;
const RESULT_SLIDE_START_INDEX = ANSWER_SLIDE_INDICES[ANSWER_SLIDE_INDICES.length - 1] + 1;

export default function ControlPanelContent() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("waiting");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [guestCount, setGuestCount] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [answers, setAnswers] = useState<GuestAnswer[]>([]);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [allAnswers, setAllAnswers] = useState<GuestAnswer[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const initialState = getQuizState();
    setCurrentSlideIndex(initialState.currentSlideIndex);
    setSessionStatus(initialState.sessionStatus);
    setCurrentQuestion(initialState.currentQuestion);

    const unsubscribe = subscribeToQuizState((state) => {
      setCurrentSlideIndex(state.currentSlideIndex);
      setSessionStatus(state.sessionStatus);
      setCurrentQuestion(state.currentQuestion);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
        isCorrect: Math.random() > 0.3,
      },
    ];
  }, [sessionStatus, currentQuestion]);

  useEffect(() => {
    if (sessionStatus === "playing" && mockAnswersData.length > 0) {
      setAnswers(mockAnswersData);
      setGuestCount(Math.floor(Math.random() * 10) + 20);
      setAnswerCount(Math.floor(Math.random() * 10) + 15);
    }
  }, [sessionStatus, mockAnswersData]);

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
      setAllAnswers((prev) => [...prev, ...answers]);

      if (currentQuestion < TOTAL_QUESTIONS) {
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        setAnswers([]);
        setRankings([]);
        saveQuizState({
          currentQuestion: nextQuestion,
          sessionStatus,
        });
        console.log(`Moving to question ${currentQuestion + 1}`);
      } else {
        const allAnswersWithCurrent = [...allAnswers, ...answers];
        const finalRankings = calculateFinalRankings(allAnswersWithCurrent);
        setRankings(finalRankings);
        setSessionStatus("finished");
        saveQuizState({
          sessionStatus: "finished",
          currentQuestion,
        });
        console.log("Quiz session finished", { finalRankings });
      }
    } catch (error) {
      console.error("Failed to proceed to next question:", error);
      alert("次の問題への移動に失敗しました。");
    }
  }, [currentQuestion, answers, allAnswers, calculateFinalRankings, sessionStatus]);

  const deriveStateFromSlide = useCallback(
    (slideIndex: number): { nextStatus: SessionStatus; nextQuestion: number } => {
      if (slideIndex >= RESULT_SLIDE_START_INDEX) {
        return { nextStatus: "finished", nextQuestion: TOTAL_QUESTIONS };
      }

      const questionIndex = QUESTION_SLIDE_INDICES.indexOf(slideIndex);
      if (questionIndex !== -1) {
        return { nextStatus: "playing", nextQuestion: questionIndex + 1 };
      }

      const answerIndex = ANSWER_SLIDE_INDICES.indexOf(slideIndex);
      if (answerIndex !== -1) {
        return { nextStatus: "playing", nextQuestion: answerIndex + 1 };
      }

      return { nextStatus: "waiting", nextQuestion: currentQuestion };
    },
    [currentQuestion],
  );

  const updateSlideState = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= TOTAL_SLIDES) {
        return;
      }
      const { nextStatus, nextQuestion } = deriveStateFromSlide(targetIndex);
      setCurrentSlideIndex(targetIndex);
      setSessionStatus(nextStatus);
      setCurrentQuestion(nextQuestion);
      saveQuizState({
        currentSlideIndex: targetIndex,
        sessionStatus: nextStatus,
        currentQuestion: nextQuestion,
      });
    },
    [deriveStateFromSlide],
  );

  const handlePreviousSlide = useCallback(() => {
    updateSlideState(currentSlideIndex - 1);
  }, [currentSlideIndex, updateSlideState]);

  const handleNextSlide = useCallback(() => {
    updateSlideState(currentSlideIndex + 1);
  }, [currentSlideIndex, updateSlideState]);

  const handleShowResults = useCallback(() => {
    try {
      const currentRankings: RankingEntry[] = answers
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
      console.log("Current question results:", currentRankings);
    } catch (error) {
      console.error("Failed to show results:", error);
      alert("結果の表示に失敗しました。");
    }
  }, [answers, currentQuestion]);

  const getElapsedTime = useCallback((answeredAt: number): string => {
    const elapsed = (Date.now() - answeredAt) / 1000;
    return elapsed.toFixed(1);
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#fef7ff] p-4">
      <div className="flex h-full w-full max-w-7xl flex-col gap-4 overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#6750a4] to-[#7f67be] px-6 py-4 shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-white">クイズコントロール</h1>
            <p className="text-sm text-[#e8def8]">Operator Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
              <div
                className={`h-2 w-2 rounded-full ${
                  sessionStatus === "playing"
                    ? "bg-[#4caf50] animate-pulse"
                    : sessionStatus === "finished"
                      ? "bg-[#2196f3]"
                      : "bg-[#ff9800]"
                }`}
              />
              <span className="text-sm font-medium text-white">
                {sessionStatus === "waiting"
                  ? "待機中"
                  : sessionStatus === "playing"
                    ? "進行中"
                    : "終了"}
              </span>
            </div>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid flex-1 grid-cols-3 gap-4 overflow-hidden">
          {/* 左カラム：セッション状態 */}
          <div className="flex flex-col gap-4 overflow-auto">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-[#1c1b1f]">セッション情報</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-[#f5f5f5] p-3">
                  <span className="text-sm text-[#49454f]">問題</span>
                  <span className="text-lg font-bold text-[#6750a4]">
                    {currentQuestion} / {TOTAL_QUESTIONS}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#f5f5f5] p-3">
                  <span className="text-sm text-[#49454f]">スライド</span>
                  <span className="text-lg font-bold text-[#1c1b1f]">
                    {currentSlideIndex + 1} / {TOTAL_SLIDES}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#f5f5f5] p-3">
                  <span className="text-sm text-[#49454f]">参加者</span>
                  <span className="text-lg font-bold text-[#2196f3]">{guestCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#f5f5f5] p-3">
                  <span className="text-sm text-[#49454f]">回答数</span>
                  <span className="text-lg font-bold text-[#4caf50]">{answerCount}</span>
                </div>
              </div>
            </div>

            {/* 操作ボタン */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-[#1c1b1f]">操作</h2>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#49454f]">スライド操作</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handlePreviousSlide}
                      disabled={currentSlideIndex === 0}
                      className="w-full rounded-full bg-[#79747e] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#938f99] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ← 前へ
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      disabled={currentSlideIndex === TOTAL_SLIDES - 1}
                      className="w-full rounded-full bg-[#6750a4] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7f67be] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      次へ →
                    </button>
                  </div>
                </div>

                {sessionStatus === "playing" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleShowResults}
                      className="w-full rounded-full bg-[#2196f3] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#42a5f5] active:scale-95"
                    >
                      結果を表示
                    </button>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="w-full rounded-full bg-[#6750a4] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7f67be] hover:shadow-lg active:scale-95"
                    >
                      {currentQuestion < TOTAL_QUESTIONS ? "次の問題へ" : "最終結果"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 中央カラム：リアルタイム回答 */}
          <div className="overflow-auto rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-[#1c1b1f]">
              リアルタイム回答
              {sessionStatus === "playing" && (
                <span className="ml-2 text-xs text-[#79747e]">（第{currentQuestion}問）</span>
              )}
            </h2>
            <div className="space-y-2">
              {sessionStatus === "playing" && answers.length === 0 && (
                <p className="py-4 text-center text-sm text-[#79747e]">回答待ち...</p>
              )}
              {answers.map((answer) => (
                <div
                  key={answer.guestId}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    answer.isCorrect
                      ? "border-[#4caf50] bg-[#e8f5e9]"
                      : "border-[#f44336] bg-[#ffebee]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        answer.isCorrect ? "bg-[#4caf50] text-white" : "bg-[#f44336] text-white"
                      }`}
                    >
                      {answer.isCorrect ? "正解" : "不正解"}
                    </span>
                    <span className="text-sm font-medium text-[#1c1b1f]">{answer.nickname}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#49454f]">{CHOICE_LABELS[answer.choice]}</div>
                    <div className="text-xs text-[#79747e]">
                      {getElapsedTime(answer.answeredAt)}秒
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右カラム：ランキング */}
          <div className="overflow-auto rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-[#1c1b1f]">ランキング TOP3</h2>
            {rankings.length === 0 ? (
              <p className="py-4 text-center text-sm text-[#79747e]">結果なし</p>
            ) : (
              <div className="space-y-2">
                {rankings.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      entry.rank === 1
                        ? "border-[#ffd700] bg-gradient-to-r from-[#fff9e6] to-[#fffaed]"
                        : entry.rank === 2
                          ? "border-[#c0c0c0] bg-gradient-to-r from-[#f5f5f5] to-[#fafafa]"
                          : "border-[#cd7f32] bg-gradient-to-r from-[#fff4e6] to-[#fff7ed]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${
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
                      <div className="text-sm font-semibold text-[#1c1b1f]">{entry.nickname}</div>
                      <div className="text-xs text-[#49454f]">
                        正解: {entry.correctCount} 問 ・ 平均:{" "}
                        {entry.averageResponseTime.toFixed(1)}秒
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
