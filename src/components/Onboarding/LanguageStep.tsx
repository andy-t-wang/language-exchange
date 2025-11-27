'use client';

import { LANGUAGES } from '@/lib/types';
import { useState } from 'react';

interface LanguageStepProps {
  type: 'native' | 'learning';
  onNext: (languages: string[]) => void;
  onBack: () => void;
  initialSelection?: string[];
}

export function LanguageStep({
  type,
  onNext,
  onBack,
  initialSelection = [],
}: LanguageStepProps) {
  const [selected, setSelected] = useState<string[]>(initialSelection);

  const toggleLanguage = (code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const isNative = type === 'native';

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-4 mb-6 animate-fade-in">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isNative
              ? 'bg-linear-to-br from-[#FFF0ED] to-[#FFE4E1]'
              : 'bg-linear-to-br from-[#E8F8F5] to-[#D1F2EB]'
          }`}>
            <span className="text-3xl">{isNative ? '🗣️' : '📚'}</span>
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-[#222222] tracking-tight">
              {isNative ? 'Languages you speak' : 'Languages to learn'}
            </h1>
            <p className="text-[#717171] text-sm mt-0.5">
              {isNative
                ? 'Select all that apply'
                : 'What would you like to practice?'}
            </p>
          </div>
        </div>

        {/* Selected count pill */}
        {selected.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F7F7F7] rounded-full animate-scale-in">
            <div className="w-5 h-5 rounded-full bg-[#222222] flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{selected.length}</span>
            </div>
            <span className="text-sm text-[#222222] font-medium">
              {selected.length === 1 ? 'language' : 'languages'} selected
            </span>
          </div>
        )}
      </div>

      {/* Language grid */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang, index) => {
            const isSelected = selected.includes(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 animate-fade-in ${
                  isSelected
                    ? 'border-[#222222] bg-[#F7F7F7]'
                    : 'border-[#EBEBEB] bg-white hover:border-[#B0B0B0] hover:shadow-sm'
                }`}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span
                  className={`text-sm font-medium ${
                    isSelected ? 'text-[#222222]' : 'text-hof'
                  }`}
                >
                  {lang.name}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#222222] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pb-10 shrink-0 border-t border-[#EBEBEB] bg-white">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 h-12 rounded-lg border border-[#222222] text-[#222222] font-semibold hover:bg-[#F7F7F7] transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => onNext(selected)}
            disabled={selected.length === 0}
            className="flex-2 btn-airbnb h-12 text-base disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
