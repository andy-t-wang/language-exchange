'use client';

import { useEffect, useState } from 'react';

interface LocationStepProps {
  onNext: (country: string, countryCode: string) => void;
  onBack: () => void;
}

interface LocationData {
  country: string;
  countryCode: string;
}

export function LocationStep({ onNext, onBack }: LocationStepProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setLoading(true);
    setError(null);

    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      setLocation({ country: 'Unknown', countryCode: 'XX' });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          setLocation({
            country: data.countryName || 'Unknown',
            countryCode: data.countryCode || 'XX',
          });
        } catch {
          setError('Could not determine your location');
          setLocation({ country: 'Unknown', countryCode: 'XX' });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access denied');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Location unavailable');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out');
        } else {
          setError('Could not get location');
        }
        setLocation({ country: 'Unknown', countryCode: 'XX' });
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const getCountryFlag = (countryCode: string): string => {
    if (countryCode === 'XX') return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 flex flex-col px-6 pt-8 min-h-0 overflow-y-auto">
        {/* Hero illustration */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-linear-to-br from-[#E8F4F8] to-[#D1E9F0] flex items-center justify-center">
              <span className="text-6xl">📍</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-[#EBEBEB]">
              <span className="text-xl">✨</span>
            </div>
          </div>
        </div>

        {/* Title section */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-[28px] font-semibold text-[#222222] mb-3 tracking-tight">
            Where are you located?
          </h1>
          <p className="text-[#717171] text-base leading-relaxed">
            We&apos;ll use this to connect you with nearby language partners
          </p>
        </div>

        {/* Location content */}
        <div className="w-full max-w-sm mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-[#EBEBEB]" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E61E4D] animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-[#222222] font-medium">Detecting your location</p>
                <p className="text-[#717171] text-sm mt-1">This may take a moment...</p>
              </div>
            </div>
          ) : location ? (
            <div className="space-y-4">
              {/* Location card */}
              <div className="card-airbnb p-5 animate-scale-in">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#F7F7F7] flex items-center justify-center">
                    <span className="text-4xl">{getCountryFlag(location.countryCode)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-[#222222]">
                      {location.country}
                    </p>
                    {error ? (
                      <p className="text-sm text-[#C13515] mt-0.5">{error}</p>
                    ) : (
                      <p className="text-sm text-[#717171] mt-0.5">Your detected location</p>
                    )}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-babu flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Retry button */}
              <button
                onClick={detectLocation}
                className="w-full py-3 text-[#222222] text-sm font-semibold underline underline-offset-2 hover:text-[#000000] transition-colors"
              >
                Not right? Try again
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pb-10 shrink-0 border-t border-[#EBEBEB]">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 h-12 rounded-lg border border-[#222222] text-[#222222] font-semibold hover:bg-[#F7F7F7] transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => location && onNext(location.country, location.countryCode)}
            disabled={!location || loading}
            className="flex-2 btn-airbnb h-12 text-base disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
