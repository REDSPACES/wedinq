'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (messageRef.current) {
        const elementTop = messageRef.current.getBoundingClientRect().top
        const elementBottom = messageRef.current.getBoundingClientRect().bottom
        const isVisible = elementTop < window.innerHeight && elementBottom > 0
        setShowMessage(isVisible)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-amber-50 flex items-center justify-center overflow-x-hidden">
      {/* Decorative floral elements */}
      <div className="fixed top-0 left-0 w-96 h-96 opacity-60 pointer-events-none">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Top left floral decoration */}
          <g className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
            {/* Pink flower */}
            <circle cx="120" cy="80" r="25" fill="#fce7f3" opacity="0.7" />
            <circle cx="140" cy="85" r="20" fill="#fbcfe8" opacity="0.8" />
            <circle cx="110" cy="95" r="18" fill="#f9a8d4" opacity="0.7" />
            <circle cx="140" cy="105" r="22" fill="#f472b6" opacity="0.8" />
            {/* Center stamen */}
            <circle cx="128" cy="92" r="8" fill="#fbbf24" />
            {/* Burgundy flower */}
            <circle cx="160" cy="60" r="20" fill="#be123c" opacity="0.6" />
            <circle cx="180" cy="70" r="18" fill="#991b1b" opacity="0.7" />
            <circle cx="170" cy="85" r="16" fill="#7c2d12" opacity="0.6" />
            {/* Leaves and stems */}
            <path d="M 125 110 Q 120 130 115 150" stroke="#86efac" strokeWidth="2" fill="none" />
            <path d="M 145 110 Q 155 135 165 160" stroke="#86efac" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </div>

      {/* Bottom right floral decoration */}
      <div className="fixed bottom-0 right-0 w-96 h-96 opacity-60 pointer-events-none">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <g className={`transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* Pink flower */}
            <circle cx="180" cy="220" r="26" fill="#fce7f3" opacity="0.7" />
            <circle cx="165" cy="215" r="21" fill="#fbcfe8" opacity="0.8" />
            <circle cx="195" cy="205" r="19" fill="#f9a8d4" opacity="0.7" />
            <circle cx="160" cy="195" r="23" fill="#f472b6" opacity="0.8" />
            {/* Center stamen */}
            <circle cx="178" cy="208" r="8" fill="#fbbf24" />
            {/* Burgundy flower */}
            <circle cx="140" cy="240" r="20" fill="#be123c" opacity="0.6" />
            <circle cx="120" cy="230" r="18" fill="#991b1b" opacity="0.7" />
            <circle cx="130" cy="215" r="16" fill="#7c2d12" opacity="0.6" />
            {/* Decorative leaves */}
            <path d="M 155 180 Q 140 160 125 140" stroke="#d4af37" strokeWidth="2" fill="none" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* Sections container */}
      <div className="w-full relative z-10">
        {/* Section 1: Invitation */}
        <div className="min-h-screen flex items-center justify-center">
          <div
            ref={containerRef}
            className={`relative max-w-2xl mx-auto px-6 py-12 text-center transition-all duration-1000 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {/* Main heading */}
            <h1 className="text-6xl md:text-7xl font-serif text-amber-900 mb-4 animate-fade-in-slow italic font-light tracking-wide">
              Happy <br className="hidden md:block" /> Wedding
            </h1>

            {/* Couple names */}
            <div className="mt-12 mb-8 space-y-2 animate-fade-in-slow animation-delay-200">
              <h2 className="text-3xl md:text-4xl font-serif text-amber-900 font-light tracking-wide">
                Akito & Marina
              </h2>
              <p className="text-lg md:text-xl text-amber-700 font-light tracking-widest">
                20 May 2026
              </p>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 my-12 animate-fade-in-slow animation-delay-400">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            </div>

            {/* Chevron animation */}
            <div className="flex justify-center animate-fade-in-slow animation-delay-600">
              <div className="animate-bounce-slow">
                <ChevronDown className="w-8 h-8 text-amber-700" strokeWidth={1.5} />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-16 flex flex-col md:flex-row gap-4 justify-center animate-fade-in-slow animation-delay-800">
              <button className="px-8 py-3 bg-amber-900 hover:bg-amber-800 text-white rounded-full font-serif tracking-widest uppercase text-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                RSVP
              </button>
              <button className="px-8 py-3 border-2 border-amber-700 text-amber-900 hover:bg-amber-50 rounded-full font-serif tracking-widest uppercase text-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Message */}
        <div 
          ref={messageRef}
          className="min-h-screen flex items-center justify-center py-12 px-6"
        >
          <div className={`max-w-2xl w-full transition-all duration-1000 ${showMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Decorative frame with message */}
            <div className="relative mx-auto" style={{ maxWidth: '500px' }}>
              {/* Outer frame border */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 700" preserveAspectRatio="none">
                {/* Gold frame outline */}
                <rect x="20" y="20" width="460" height="660" fill="none" stroke="#d4af37" strokeWidth="8" />
                <rect x="30" y="30" width="440" height="640" fill="none" stroke="#d4af37" strokeWidth="2" />
                
                {/* Decorative corners */}
                <line x1="40" y1="50" x2="80" y2="50" stroke="#d4af37" strokeWidth="3" />
                <line x1="40" y1="50" x2="40" y2="90" stroke="#d4af37" strokeWidth="3" />
                
                <line x1="460" y1="50" x2="420" y2="50" stroke="#d4af37" strokeWidth="3" />
                <line x1="460" y1="50" x2="460" y2="90" stroke="#d4af37" strokeWidth="3" />
                
                <line x1="40" y1="650" x2="80" y2="650" stroke="#d4af37" strokeWidth="3" />
                <line x1="40" y1="650" x2="40" y2="610" stroke="#d4af37" strokeWidth="3" />
                
                <line x1="460" y1="650" x2="420" y2="650" stroke="#d4af37" strokeWidth="3" />
                <line x1="460" y1="650" x2="460" y2="610" stroke="#d4af37" strokeWidth="3" />
              </svg>

              {/* Content inside frame */}
              <div className="relative z-10 p-8 pt-12">
                {/* Message title */}
                <h3 className="text-3xl font-serif text-amber-900 font-light tracking-wide mb-6">
                  Message
                </h3>

                {/* Decorative floral divider */}
                <div className="flex justify-center mb-6">
                  <svg width="200" height="40" viewBox="0 0 200 40" className="text-pink-300">
                    {/* Left leaf */}
                    <path d="M 30 20 Q 35 10 40 5 Q 38 15 30 20" fill="currentColor" opacity="0.6" />
                    <circle cx="50" cy="18" r="3" fill="currentColor" opacity="0.5" />
                    {/* Flower */}
                    <circle cx="65" cy="20" r="4" fill="currentColor" opacity="0.6" />
                    <circle cx="75" cy="18" r="3" fill="currentColor" opacity="0.5" />
                    {/* Center line */}
                    <line x1="40" y1="20" x2="160" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    {/* Right decorations */}
                    <circle cx="125" cy="20" r="3" fill="currentColor" opacity="0.5" />
                    <circle cx="135" cy="22" r="4" fill="currentColor" opacity="0.6" />
                    <path d="M 160 20 Q 165 10 170 5 Q 168 15 160 20" fill="currentColor" opacity="0.6" />
                  </svg>
                </div>

                {/* Placeholder for photo */}
                <div className="bg-gray-200 rounded-sm aspect-square mb-8 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/wedding-couple-photo-elegant-white-room.jpg"
                    alt="Wedding couple"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Message text */}
                <div className="text-center space-y-3 text-sm text-amber-900 leading-relaxed font-light">
                  <p>本日はご多用中にもかかわらず</p>
                  <p>お越しくださり誠にありがとうございます</p>
                  <p>皆様にあたたかく見守られ</p>
                  <p>今日の日を迎えられることを嬉しく思います</p>
                  <p>短い時間ではございますが</p>
                  <p>結婚披露宴をご用意いたしましたので</p>
                  <p>どうぞ楽しひと時をお過ごしください</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in-slow {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }

        .animate-fade-in-slow {
          animation: fade-in-slow 0.8s ease-out forwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }
      `}</style>
    </main>
  )
}
