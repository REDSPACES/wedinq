export type SlidePhase = "title" | "registration" | "rules" | "question" | "answer";

export type SlideSyncState = {
  index: number;
  phase: SlidePhase;
};
