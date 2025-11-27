'use client';

import { useState } from 'react';

interface NameStepProps {
  onNext: (name: string) => void;
  initialValue?: string;
}

export function NameStep({ onNext, initialValue = '' }: NameStepProps) {
  const [name, setName] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext(name.trim());
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 flex flex-col px-6 pt-8 min-h-0 overflow-y-auto">
        {/* Hero illustration */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-linear-to-br from-beach to-[#FFE4E1] flex items-center justify-center">
              <span className="text-6xl">🌍</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
          </div>
        </div>

        {/* Title section */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-[28px] font-semibold text-[#222222] mb-3 tracking-tight">
            Welcome to Lingua
          </h1>
          <p className="text-[#717171] text-base leading-relaxed">
            Connect with language learners around the world and practice together
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <label
              htmlFor="name"
              className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                isFocused || name
                  ? 'top-2 text-xs text-[#717171]'
                  : 'top-1/2 -translate-y-1/2 text-base text-[#717171]'
              }`}
            >
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoComplete="name"
              className={`block w-full h-14 px-4 pt-5 pb-2 rounded-lg text-base border transition-all duration-200 bg-white ${
                isFocused
                  ? 'border-[#222222] ring-2 ring-[#222222]/10'
                  : 'border-[#B0B0B0] hover:border-[#222222]'
              }`}
            />
          </div>

          <p className="mt-3 text-xs text-[#717171]">
            This is how you&apos;ll appear to other language learners
          </p>
        </form>
      </div>

      {/* Footer */}
      <div className="p-6 pb-10 shrink-0 border-t border-[#EBEBEB]">
        <button
          onClick={() => name.trim() && onNext(name.trim())}
          disabled={!name.trim()}
          className="btn-airbnb w-full h-12 text-base disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
