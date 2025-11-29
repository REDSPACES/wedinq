"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { SLIDE_FILENAMES, TIME_LIMIT_SECONDS, TIMER_INTERVAL_MS } from "../../../lib/constants/quiz";
import { getQuizState, saveQuizState, subscribeToQuizState } from "../../../lib/utils/quiz-state";

// カウントダウンを表示するスライド番号（ファイル名4,6,8,10,12 = インデックス3,5,7,9,11）
const COUNTDOWN_SLIDE_INDICES = [3, 5, 7, 9, 11];

export default function ScreenDisplayContent() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [imageError, setImageError] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  // 初期状態をlocalStorageから読み込み
  useEffect(() => {
    const initialState = getQuizState();
    setCurrentSlideIndex(initialState.currentSlideIndex);
  }, []);

  // controlパネルからの状態変更を監視
  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      console.log("Screen received state update:", state);
      setCurrentSlideIndex(state.currentSlideIndex);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // カウントダウンが必要なスライドかチェック
  useEffect(() => {
    const needsCountdown = COUNTDOWN_SLIDE_INDICES.includes(currentSlideIndex);
    setIsCountdownActive(needsCountdown);
    if (needsCountdown) {
      setTimeLeft(TIME_LIMIT_SECONDS);
    }
  }, [currentSlideIndex]);

  // カウントダウンタイマー
  useEffect(() => {
    if (!isCountdownActive || timeLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, TIMER_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [isCountdownActive, timeLeft]);

  // 次のスライドへ
  const handleNext = useCallback(() => {
    setImageError(false);
    if (currentSlideIndex < SLIDE_FILENAMES.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      saveQuizState({ currentSlideIndex: nextIndex });
    }
  }, [currentSlideIndex, saveQuizState]);

  // 前のスライドへ
  const handlePrevious = useCallback(() => {
    setImageError(false);
    if (currentSlideIndex > 0) {
      const prevIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIndex);
      saveQuizState({ currentSlideIndex: prevIndex });
    }
  }, [currentSlideIndex, saveQuizState]);

  // 最初に戻る
  const handleReset = useCallback(() => {
    setImageError(false);
    setCurrentSlideIndex(0);
    saveQuizState({ currentSlideIndex: 0 });
  }, [saveQuizState]);

  // 画像読み込みエラーハンドラー
  const handleImageError = useCallback(() => {
    setImageError(true);
    console.error(`Failed to load slide: ${SLIDE_FILENAMES[currentSlideIndex]}`);
  }, [currentSlideIndex]);

  const currentSlideFilename = SLIDE_FILENAMES[currentSlideIndex];
  const currentSlideNumber = currentSlideIndex + 1;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      {/* 16:9 アスペクト比のコンテナ */}
      <div className="relative h-full w-full max-h-screen max-w-[177.78vh]">
        <div className="relative h-full w-full bg-gradient-to-br from-pink-50 via-white to-pink-50">
          {/* メインスライド画像 */}
          <div className="relative h-full w-full">
            <Image
              src={`/quiz-slides/${currentSlideFilename}`}
              alt={`スライド ${currentSlideNumber}`}
              fill
              className="object-contain"
              priority
              onError={handleImageError}
            />

            {/* カウントダウンタイマー（右上）- 特定のスライドのみ */}
            {isCountdownActive && (
              <div className="absolute right-12 top-12 z-10">
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl">
                  <span className="text-7xl font-bold text-white">{timeLeft}</span>
                </div>
              </div>
            )}

            {/* 画像読み込みエラー表示 */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                  <span className="text-4xl text-gray-500">スライドの読み込みに失敗しました</span>
                  <p className="mt-4 text-xl text-gray-400">{currentSlideFilename}</p>
                </div>
              </div>
            )}

            {/* ナビゲーションボタン */}
            <div className="absolute bottom-12 left-12 right-12 flex items-center justify-between">
              {/* 前へボタン */}
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentSlideIndex === 0}
                className="rounded-full bg-gradient-to-r from-gray-500 to-gray-600 px-12 py-5 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← 前へ
              </button>

              {/* 次へボタン（最後のスライドでは「最初に戻る」） */}
              {currentSlideIndex < SLIDE_FILENAMES.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-12 py-5 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105"
                >
                  次へ →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-12 py-5 text-2xl font-bold text-white shadow-lg transition-all hover:scale-105"
                >
                  最初に戻る
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
