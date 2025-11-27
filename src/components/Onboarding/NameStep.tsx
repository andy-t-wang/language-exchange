'use client';

import { useState } from 'react';

interface NameStepProps {
  onNext: (name: string) => void;
  initialValue?: string;
}

export function NameStep({ onNext, initialValue = '' }: NameStepProps) {
  const [name, setName] = useState(initialValue);

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
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFE8E8] to-[#FFD6D6] flex items-center justify-center">
              <span className="text-5xl">🌍</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-[#EBEBEB]">
              <span className="text-xl">👋</span>
            </div>
          </div>
        </div>

        {/* Title section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#222222] mb-2">
            Welcome to Lingua
          </h1>
          <p className="text-[#717171] text-sm leading-relaxed px-4">
            Connect with language learners around the world
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs mx-auto">
          <div className="mb-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#222222] mb-2 text-center"
            >
              What&apos;s your name?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              autoFocus
              className="block w-full h-12 px-4 rounded-xl text-base text-center border border-[#DDDDDD] bg-white placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-all"
            />
          </div>
          <p className="text-xs text-[#717171] text-center">
            This is how you&apos;ll appear to other learners
          </p>
        </form>
      </div>

      {/* Footer */}
      <div className="p-6 pb-8 shrink-0 border-t border-[#EBEBEB]">
        <button
          onClick={() => name.trim() && onNext(name.trim())}
          disabled={!name.trim()}
          className="btn-airbnb w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
