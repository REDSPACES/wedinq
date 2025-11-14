import { useEffect, useState } from "react";

const CHANNEL_NAME = "wedinq-quiz-slide";

type SlideMessage = {
  type: "sync";
  index: number;
};

const createChannel = (): BroadcastChannel | null => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
};

export const useSlideBroadcast = (index: number) => {
  useEffect(() => {
    const channel = createChannel();
    if (!channel) {
      return undefined;
    }
    const message: SlideMessage = { type: "sync", index };
    channel.postMessage(message);
    return () => {
      channel.close();
    };
  }, [index]);
};

export const useSlideSubscription = (initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const channel = createChannel();
    if (!channel) {
      return undefined;
    }

    const handleMessage = (event: MessageEvent<SlideMessage>) => {
      if (event.data?.type === "sync") {
        setCurrentIndex(event.data.index);
      }
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  return currentIndex;
};
