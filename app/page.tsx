"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <title>Chevron down</title>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (messageRef.current) {
        const elementTop = messageRef.current.getBoundingClientRect().top;
        const elementBottom = messageRef.current.getBoundingClientRect().bottom;
        const isVisible = elementTop < window.innerHeight && elementBottom > 0;
        setShowMessage(isVisible);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-gradient-to-b from-amber-50 via-rose-50 to-amber-50">
      <div className="pointer-events-none fixed left-0 top-0 h-96 w-96 opacity-60">
        <svg viewBox="0 0 300 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <title>Top left floral decoration</title>
          <g
            className={`transition-all duration-1000 ${
              isLoaded ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
            }`}
          >
            <circle cx="120" cy="80" r="25" fill="#fce7f3" opacity="0.7" />
            <circle cx="140" cy="85" r="20" fill="#fbcfe8" opacity="0.8" />
            <circle cx="110" cy="95" r="18" fill="#f9a8d4" opacity="0.7" />
            <circle cx="140" cy="105" r="22" fill="#f472b6" opacity="0.8" />
            <circle cx="128" cy="92" r="8" fill="#fbbf24" />
            <circle cx="160" cy="60" r="20" fill="#be123c" opacity="0.6" />
            <circle cx="180" cy="70" r="18" fill="#991b1b" opacity="0.7" />
            <circle cx="170" cy="85" r="16" fill="#7c2d12" opacity="0.6" />
            <path d="M 125 110 Q 120 130 115 150" stroke="#86efac" strokeWidth="2" fill="none" />
            <path d="M 145 110 Q 155 135 165 160" stroke="#86efac" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </div>

      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 opacity-60">
        <svg viewBox="0 0 300 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <title>Bottom right floral decoration</title>
          <g
            className={`delay-200 transition-all duration-1000 ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            <circle cx="180" cy="220" r="26" fill="#fce7f3" opacity="0.7" />
            <circle cx="165" cy="215" r="21" fill="#fbcfe8" opacity="0.8" />
            <circle cx="195" cy="205" r="19" fill="#f9a8d4" opacity="0.7" />
            <circle cx="160" cy="195" r="23" fill="#f472b6" opacity="0.8" />
            <circle cx="178" cy="208" r="8" fill="#fbbf24" />
            <circle cx="140" cy="240" r="20" fill="#be123c" opacity="0.6" />
            <circle cx="120" cy="230" r="18" fill="#991b1b" opacity="0.7" />
            <circle cx="130" cy="215" r="16" fill="#7c2d12" opacity="0.6" />
            <path
              d="M 155 180 Q 140 160 125 140"
              stroke="#d4af37"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          </g>
        </svg>
      </div>

      <div className="relative w-full">
        <div className="flex min-h-screen items-center justify-center">
          <div
            ref={containerRef}
            className={`relative mx-auto max-w-2xl px-6 py-12 text-center transition-all duration-1000 ${
              isLoaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <h1 className="animate-fade-in-slow text-6xl font-light italic tracking-wide text-amber-900 md:text-7xl">
              Happy <br className="hidden md:block" /> Wedding
            </h1>

            <div className="animation-delay-200 mt-12 mb-8 space-y-2 animate-fade-in-slow">
              <h2 className="text-3xl font-light tracking-wide text-amber-900 md:text-4xl">
                Akito &amp; Marina
              </h2>
              <p className="text-lg font-light tracking-widest text-amber-700 md:text-xl">
                20 May 2026
              </p>
            </div>

            <div className="animation-delay-400 my-12 flex items-center justify-center gap-4 animate-fade-in-slow">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
              <span className="text-xs tracking-[0.4em] text-amber-700">
                TOGETHER WITH THEIR FAMILIES
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
            </div>

            <p className="mx-auto max-w-xl text-lg leading-relaxed text-amber-900">
              We joyfully invite you to celebrate the union of our hearts as we begin our journey
              together as one.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-3 rounded-full border border-amber-200 px-6 py-3 text-amber-800">
                <span className="text-xs tracking-[0.3em]">SCROLL</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </div>
              <Link
                href="/quiz"
                className="rounded-full bg-amber-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-amber-50 shadow-lg shadow-amber-900/20 transition hover:bg-amber-950"
              >
                クイズに参加する
              </Link>
            </div>
          </div>
        </div>

        <div ref={messageRef} className="flex min-h-screen items-center justify-center px-6 py-12">
          <div
            className={`w-full max-w-2xl transition-all duration-1000 ${
              showMessage ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="relative mx-auto" style={{ maxWidth: "500px" }}>
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 500 700"
                preserveAspectRatio="none"
              >
                <title>Decorative frame</title>
                <rect
                  x="20"
                  y="20"
                  width="460"
                  height="660"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="8"
                />
                <rect
                  x="30"
                  y="30"
                  width="440"
                  height="640"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="2"
                />
              </svg>

              <div className="relative z-10 p-8 pt-12">
                <h3 className="mb-6 text-3xl font-light tracking-wide text-amber-900">Message</h3>

                <div className="mb-6 flex justify-center">
                  <svg width="200" height="40" viewBox="0 0 200 40" className="text-pink-300">
                    <title>Floral divider</title>
                    <path
                      d="M 30 20 Q 35 10 40 5 Q 38 15 30 20"
                      fill="currentColor"
                      opacity="0.6"
                    />
                    <circle cx="50" cy="18" r="3" fill="currentColor" opacity="0.5" />
                    <circle cx="65" cy="20" r="4" fill="currentColor" opacity="0.6" />
                    <circle cx="75" cy="18" r="3" fill="currentColor" opacity="0.5" />
                    <line
                      x1="40"
                      y1="20"
                      x2="160"
                      y2="20"
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.4"
                    />
                    <circle cx="125" cy="20" r="3" fill="currentColor" opacity="0.5" />
                    <circle cx="135" cy="22" r="4" fill="currentColor" opacity="0.6" />
                    <path
                      d="M 160 20 Q 165 10 170 5 Q 168 15 160 20"
                      fill="currentColor"
                      opacity="0.6"
                    />
                  </svg>
                </div>

                <div className="mb-8 flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-gray-200 relative">
                  <Image
                    src="/wedding-couple-photo-elegant-white-room.jpg"
                    alt="Wedding couple"
                    fill
                    sizes="(min-width: 768px) 400px, 300px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="space-y-3 text-center text-sm font-light leading-relaxed text-amber-900">
                  <p>本日はご多用中にもかかわらずお越しくださり誠にありがとうございます。</p>
                  <p>皆さまと共にこの日を迎えられたことを嬉しく思います。</p>
                  <p>ささやかではございますが、心を込めておもてなしさせていただきます。</p>
                  <p>どうぞごゆっくりとお過ごしください</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
