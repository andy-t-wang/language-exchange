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
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8F4F8] to-[#D1E9F0] flex items-center justify-center">
            <span className="text-5xl">📍</span>
          </div>
        </div>

        {/* Title section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#222222] mb-2">
            Where are you located?
          </h1>
          <p className="text-[#717171] text-sm leading-relaxed px-4">
            Connect with language partners nearby
          </p>
        </div>

        {/* Location content */}
        <div className="w-full max-w-xs mx-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-[3px] border-[#EBEBEB]" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#222222] animate-spin" />
              </div>
              <p className="text-[#222222] font-medium text-sm">Detecting location...</p>
            </div>
          ) : location ? (
            <div className="space-y-3">
              {/* Location card */}
              <div className="flex items-center justify-center gap-4 p-5 bg-[#F7F7F7] rounded-2xl">
                <span className="text-5xl">{getCountryFlag(location.countryCode)}</span>
                <div>
                  <p className="text-lg font-semibold text-[#222222]">
                    {location.country}
                  </p>
                  {error ? (
                    <p className="text-xs text-[#C13515]">{error}</p>
                  ) : (
                    <p className="text-xs text-[#717171]">Detected location</p>
                  )}
                </div>
              </div>

              {/* Retry button */}
              <button
                onClick={detectLocation}
                className="w-full py-2 text-[#717171] text-sm hover:text-[#222222] transition-colors text-center"
              >
                Not right? Try again
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pb-8 shrink-0 border-t border-[#EBEBEB]">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 h-12 rounded-xl border border-[#DDDDDD] text-[#222222] font-semibold hover:bg-[#F7F7F7] transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => location && onNext(location.country, location.countryCode)}
            disabled={!location || loading}
            className="flex-[2] btn-airbnb h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
