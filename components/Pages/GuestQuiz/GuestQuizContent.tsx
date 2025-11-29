"use client";

import { useCallback, useEffect, useState } from "react";
import { CHOICE_LABELS, TOTAL_QUESTIONS } from "../../../lib/constants/quiz";
import { subscribeToQuizState } from "../../../lib/utils/quiz-state";
import type { GuestScreenState } from "../../../types/quiz";

export default function GuestQuizContent() {
  const [screenState, setScreenState] = useState<GuestScreenState>("intro");
  const [nickname, setNickname] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // セッション状態（controlパネルから同期）
  const [_sessionStatus, setSessionStatus] = useState<"waiting" | "playing" | "finished">(
    "waiting",
  );
  const [_sessionCurrentQuestion, setSessionCurrentQuestion] = useState(1);

  // controlパネルからの状態変更を監視
  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      console.log("Guest Quiz received state update:", state);
      setSessionStatus(state.sessionStatus);
      setSessionCurrentQuestion(state.currentQuestion);

      // 状態に応じて画面を切り替え
      if (screenState === "waiting_for_question" && state.sessionStatus === "playing") {
        setScreenState("question_display");
        setCurrentQuestion(state.currentQuestion);
      }

      // クイズが終了したら終了画面へ
      if (state.sessionStatus === "finished" && screenState !== "finished") {
        setScreenState("finished");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [screenState]);

  // イントロ画面から入力画面へ
  const handleStartClick = useCallback(() => {
    setScreenState("nickname_input");
  }, []);

  // ニックネーム送信
  const handleNicknameSubmit = useCallback(async () => {
    if (!nickname.trim()) {
      alert("ニックネームを入力してください");
      return;
    }

    if (nickname.trim().length > 20) {
      alert("ニックネームは20文字以内で入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Supabaseにニックネームを登録
      console.log("Registering nickname:", nickname);

      // 登録完了後、準備中画面へ
      setScreenState("waiting_for_question");

      // モック：3秒後にクイズ開始（実際はRealtimeで通知を受け取る）
      setTimeout(() => {
        setSessionStatus("playing");
        setSessionCurrentQuestion(1);
      }, 3000);
    } catch (error) {
      console.error("Failed to register nickname:", error);
      alert("登録に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }, [nickname]);

  // 回答を送信
  const handleAnswerSubmit = useCallback(async () => {
    if (selectedChoice === null) {
      alert("選択肢を選んでください");
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Supabaseに回答を送信
      console.log("Submitting answer:", {
        question: currentQuestion,
        choice: selectedChoice,
        answeredAt: Date.now(),
      });

      // 回答送信後、次の問題を待つ
      setScreenState("waiting_next");
      setSelectedChoice(null);

      // モック：2秒後に次の問題へ（実際はRealtimeで通知を受け取る）
      setTimeout(() => {
        if (currentQuestion < TOTAL_QUESTIONS) {
          setCurrentQuestion((prev) => prev + 1);
          setSessionCurrentQuestion((prev) => prev + 1);
          setScreenState("question_display");
        } else {
          setSessionStatus("finished");
          setScreenState("finished");
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("回答の送信に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedChoice, currentQuestion]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4">
      <div className="w-full max-w-md">
        {/* イントロ画面 */}
        {screenState === "intro" && (
          <div className="animate-fadeIn rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <h1
                className="mb-4 text-4xl font-bold text-pink-900"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Wedding Quiz
              </h1>
              <p
                className="text-lg text-gray-700"
                style={{
                  fontFamily: '"Shippori Mincho", "Noto Serif JP", serif',
                }}
              >
                皆様にお楽しみいただけるように
                <br />
                クイズ企画をご用意しました！
                <br />
                指示がございましたら
                <br />
                始めるをタップしてください。
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartClick}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              style={{
                fontFamily: '"Shippori Mincho", "Noto Serif JP", serif',
              }}
            >
              はじめる
            </button>
          </div>
        )}

        {/* ニックネーム入力画面 */}
        {screenState === "nickname_input" && (
          <div className="animate-fadeIn rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-pink-900">ニックネーム入力</h2>
              <p className="text-sm text-gray-600">
                ランキングに表示されるニックネームを
                <br />
                入力してください（20文字以内）
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例：太郎さん"
                maxLength={20}
                className="w-full rounded-xl border-2 border-pink-200 bg-pink-50 px-4 py-3 text-lg text-gray-800 placeholder-gray-400 transition-colors focus:border-pink-400 focus:bg-white focus:outline-none"
                disabled={isSubmitting}
              />
              <div className="mt-2 text-right text-sm text-gray-500">
                {nickname.length} / 20文字
              </div>
            </div>

            <button
              type="button"
              onClick={handleNicknameSubmit}
              disabled={isSubmitting || !nickname.trim()}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                fontFamily: '"Shippori Mincho", "Noto Serif JP", serif',
              }}
            >
              {isSubmitting ? "登録中..." : "スタート"}
            </button>
          </div>
        )}

        {/* 準備中画面 */}
        {screenState === "waiting_for_question" && (
          <div className="animate-fadeIn rounded-3xl bg-white p-12 text-center shadow-2xl">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-pink-900">ただいま準備中…</h2>
            <p className="text-gray-600">
              クイズが始まるまで
              <br />
              しばらくお待ちください
            </p>
          </div>
        )}

        {/* 問題表示画面 */}
        {screenState === "question_display" && (
          <div className="animate-fadeIn rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mb-2 inline-block rounded-full bg-pink-100 px-4 py-1 text-sm font-semibold text-pink-800">
                第 {currentQuestion} 問 / {TOTAL_QUESTIONS}
              </div>
              <h2 className="text-xl font-bold text-gray-800">問題</h2>
              <p className="mt-2 text-sm text-gray-600">
                スクリーンの問題を確認して
                <br />
                選択肢を選んでください
              </p>
            </div>

            <div className="mb-6 space-y-3">
              {CHOICE_LABELS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedChoice(index)}
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border-2 px-6 py-4 text-left text-lg font-semibold transition-all ${
                    selectedChoice === index
                      ? "border-pink-500 bg-pink-100 text-pink-900 shadow-md"
                      : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="mr-3 inline-block h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-center leading-8 text-white">
                    {label}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAnswerSubmit}
              disabled={isSubmitting || selectedChoice === null}
              className="w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-xl font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "送信中..." : "回答を送信"}
            </button>
          </div>
        )}

        {/* 次の問題を待機中画面 */}
        {screenState === "waiting_next" && (
          <div className="animate-fadeIn rounded-3xl bg-white p-12 text-center shadow-2xl">
            <h2 className="mb-2 text-2xl font-bold text-blue-900">集計中</h2>
            <p className="text-gray-600">
              答えは前のスクリーンで発表します！
              <br />
              画面が切り替わるまでお待ちください
            </p>
          </div>
        )}

        {/* 終了画面 */}
        {screenState === "finished" && (
          <div className="animate-fadeIn rounded-3xl bg-gradient-to-br from-yellow-50 to-pink-50 p-8 text-center shadow-2xl">
            <div className="mb-6">
              <div className="mb-4 text-6xl">🎉</div>
              <h2
                className="mb-4 text-3xl font-bold text-pink-900"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                ご参加ありがとうございました
              </h2>
              <p
                className="text-lg text-gray-700"
                style={{
                  fontFamily: '"Shippori Mincho", "Noto Serif JP", serif',
                }}
              >
                クイズはこれで終了です
                <br />
                結果はスクリーンをご覧ください
                <br />
                この画面は閉じてください
                <br />
                この後も素敵なお時間をお過ごしください！
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
