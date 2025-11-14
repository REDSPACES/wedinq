import { useEffect, useState } from "react";
import type { SlidePhase, SlideSyncState } from "@/types/slides";

const CHANNEL_NAME = "wedinq-quiz-slide";

type SlideMessage = {
  type: "sync";
  payload: SlideSyncState;
};

const createChannel = (): BroadcastChannel | null => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
};

export const useSlideBroadcast = (index: number, phase: SlidePhase) => {
  useEffect(() => {
    const channel = createChannel();
    if (!channel) {
      return undefined;
    }
    const message: SlideMessage = { type: "sync", payload: { index, phase } };
    channel.postMessage(message);
    return () => {
      channel.close();
    };
  }, [index, phase]);
};

export const useSlideSubscription = (initialState: SlideSyncState) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const channel = createChannel();
    if (!channel) {
      return undefined;
    }

    const handleMessage = (event: MessageEvent<SlideMessage>) => {
      if (event.data?.type === "sync" && event.data.payload) {
        setState(event.data.payload);
      }
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  return state;
};
