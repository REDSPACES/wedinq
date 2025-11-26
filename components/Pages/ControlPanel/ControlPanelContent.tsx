"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	CHOICE_LABELS,
	RANKING_DISPLAY_COUNT,
	TOTAL_QUESTIONS,
} from "../../../lib/constants/quiz";
import {
	createQuizSession,
	getAllAnswers,
	updateSessionStatus,
} from "../../../lib/firebase/quiz-service";
import { useGuestCount } from "../../../lib/hooks/use-guest-count";
import { useQuizAnswers } from "../../../lib/hooks/use-quiz-answers";
import { useQuizSession } from "../../../lib/hooks/use-quiz-session";
import {
	clearSessionId,
	getSessionId,
	saveSessionId,
} from "../../../lib/utils/session-manager";
import type { GuestAnswer, RankingEntry, SessionStatus } from "../../../types/quiz";

export default function ControlPanelContent() {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [allAnswers, setAllAnswers] = useState<GuestAnswer[]>([]);
	const [rankings, setRankings] = useState<RankingEntry[]>([]);

	// Firestoreからリアルタイムでデータ取得
	const { session, loading: sessionLoading } = useQuizSession(sessionId);
	const { answers, loading: answersLoading } = useQuizAnswers(
		sessionId,
		session?.currentQuestion || 1,
	);
	const { count: guestCount } = useGuestCount(sessionId);

	const sessionStatus: SessionStatus = session?.status || "waiting";
	const currentQuestion = session?.currentQuestion || 1;

	// 初回マウント時に既存セッションIDを復元
	useEffect(() => {
		const savedSessionId = getSessionId();
		if (savedSessionId) {
			setSessionId(savedSessionId);
		}
	}, []);

	const handleStart = useCallback(async () => {
		try {
			const newSessionId = await createQuizSession(TOTAL_QUESTIONS);
			setSessionId(newSessionId);
			saveSessionId(newSessionId);
			await updateSessionStatus(newSessionId, "playing", 1);
			setAllAnswers([]);
			setRankings([]);
			console.log("Quiz session started:", newSessionId);
		} catch (error) {
			console.error("Failed to start quiz session:", error);
			alert("クイズの開始に失敗しました。もう一度お試しください。");
		}
	}, []);

	const calculateFinalRankings = useCallback(
		(allAnswersData: GuestAnswer[]): RankingEntry[] => {
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
		},
		[],
	);

	const handleNextQuestion = useCallback(async () => {
		if (!sessionId) return;

		try {
			setAllAnswers((prev) => [...prev, ...answers]);

			if (currentQuestion < TOTAL_QUESTIONS) {
				await updateSessionStatus(
					sessionId,
					"playing",
					currentQuestion + 1,
				);
				setRankings([]);
				console.log(`Moving to question ${currentQuestion + 1}`);
			} else {
				// 最終問題の場合、全回答を取得してランキング計算
				const allSessionAnswers = await getAllAnswers(sessionId);
				const finalRankings = calculateFinalRankings(allSessionAnswers);
				setRankings(finalRankings);
				await updateSessionStatus(sessionId, "finished");
				console.log("Quiz session finished", { finalRankings });
			}
		} catch (error) {
			console.error("Failed to proceed to next question:", error);
			alert("次の問題への移動に失敗しました。");
		}
	}, [sessionId, currentQuestion, answers, calculateFinalRankings]);

	const handleReset = useCallback(() => {
		try {
			setSessionId(null);
			clearSessionId();
			setAllAnswers([]);
			setRankings([]);
			console.log("Quiz session reset");
		} catch (error) {
			console.error("Failed to reset quiz session:", error);
			alert("セッションのリセットに失敗しました。");
		}
	}, []);

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
					averageResponseTime: a.answeredAt / 1000,
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

	const answerCount = answers.length;

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
							<h2 className="mb-3 text-sm font-semibold text-[#1c1b1f]">
								セッション情報
							</h2>
							<div className="space-y-2">
								<div className="flex items-center justify-between rounded-lg bg-[#f5f5f5] p-3">
									<span className="text-sm text-[#49454f]">問題</span>
									<span className="text-lg font-bold text-[#6750a4]">
										{currentQuestion} / {TOTAL_QUESTIONS}
									</span>
								</div>
								<div className="flex items-center justify-between rounded-lg bg-[#f5f5f5] p-3">
									<span className="text-sm text-[#49454f]">参加者</span>
									<span className="text-lg font-bold text-[#2196f3]">
										{guestCount}
									</span>
								</div>
								<div className="flex items-center justify-between rounded-lg bg-[#f5f5f5] p-3">
									<span className="text-sm text-[#49454f]">回答数</span>
									<span className="text-lg font-bold text-[#4caf50]">
										{answerCount}
									</span>
								</div>
							</div>
						</div>

						{/* 操作ボタン */}
						<div className="rounded-xl bg-white p-4 shadow-sm">
							<h2 className="mb-3 text-sm font-semibold text-[#1c1b1f]">操作</h2>
							<div className="space-y-2">
								{sessionStatus === "waiting" && (
									<button
										type="button"
										onClick={handleStart}
										className="w-full rounded-full bg-[#6750a4] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#7f67be] hover:shadow-lg active:scale-95"
									>
										クイズを開始
									</button>
								)}

								{sessionStatus === "playing" && (
									<>
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
											{currentQuestion < TOTAL_QUESTIONS
												? "次の問題へ"
												: "最終結果"}
										</button>
									</>
								)}

								<button
									type="button"
									onClick={handleReset}
									className="w-full rounded-full border border-[#79747e] bg-white px-6 py-3 text-sm font-semibold text-[#6750a4] transition-all hover:bg-[#f5f5f5] active:scale-95"
								>
									リセット
								</button>
							</div>
						</div>
					</div>

					{/* 中央カラム：リアルタイム回答 */}
					<div className="overflow-auto rounded-xl bg-white p-4 shadow-sm">
						<h2 className="mb-3 text-sm font-semibold text-[#1c1b1f]">
							リアルタイム回答
							{sessionStatus === "playing" && (
								<span className="ml-2 text-xs text-[#79747e]">
									（第{currentQuestion}問）
								</span>
							)}
						</h2>
						<div className="space-y-2">
							{sessionStatus === "playing" && answers.length === 0 && (
								<p className="py-4 text-center text-sm text-[#79747e]">
									回答待ち...
								</p>
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
												answer.isCorrect
													? "bg-[#4caf50] text-white"
													: "bg-[#f44336] text-white"
											}`}
										>
											{answer.isCorrect ? "正解" : "不正解"}
										</span>
										<span className="text-sm font-medium text-[#1c1b1f]">
											{answer.nickname}
										</span>
									</div>
									<div className="text-right">
										<div className="text-xs text-[#49454f]">
											{CHOICE_LABELS[answer.choice]}
										</div>
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
						<h2 className="mb-3 text-sm font-semibold text-[#1c1b1f]">
							ランキング TOP3
						</h2>
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
											<div className="text-sm font-semibold text-[#1c1b1f]">
												{entry.nickname}
											</div>
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
