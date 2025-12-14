'use client';

import { setLocale } from '@/i18n/actions';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useLocale } from 'next-intl';
import { useTransition, useState } from 'react';

export function LocaleSwitcher() {
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (locale: Locale) => {
    startTransition(async () => {
      await setLocale(locale);
      setIsOpen(false);
      window.location.reload();
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center justify-between w-full p-4 bg-white rounded-xl border border-[#EBEBEB] hover:border-[#222222] transition-colors disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{localeFlags[currentLocale]}</span>
          <span className="font-medium text-[#222222]">{localeNames[currentLocale]}</span>
        </div>
        <svg
          className={`w-5 h-5 text-[#717171] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#EBEBEB] shadow-lg z-50 max-h-64 overflow-y-auto">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`flex items-center gap-3 w-full p-4 hover:bg-[#F7F7F7] transition-colors first:rounded-t-xl last:rounded-b-xl ${
                locale === currentLocale ? 'bg-[#F7F7F7]' : ''
              }`}
            >
              <span className="text-xl">{localeFlags[locale]}</span>
              <span className="font-medium text-[#222222]">{localeNames[locale]}</span>
              {locale === currentLocale && (
                <svg className="w-5 h-5 text-babu ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
          <div className="w-5 h-5 border-2 border-[#EBEBEB] border-t-rausch rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
