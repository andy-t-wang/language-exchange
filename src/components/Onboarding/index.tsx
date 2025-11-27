'use client';

import { OnboardingData } from '@/lib/types';
import { useState } from 'react';
import { LanguageStep } from './LanguageStep';
import { LocationStep } from './LocationStep';
import { NameStep } from './NameStep';
import { NotificationStep } from './NotificationStep';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData, notificationsEnabled: boolean) => void;
}

type Step = 'name' | 'location' | 'native' | 'learning' | 'notifications';

const stepLabels: Record<Step, string> = {
  name: 'Profile',
  location: 'Location',
  native: 'Languages',
  learning: 'Learning',
  notifications: 'Notifications',
};

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('name');
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const steps: Step[] = ['name', 'location', 'native', 'learning', 'notifications'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const handleNameNext = (name: string) => {
    setData((prev) => ({ ...prev, name }));
    setStep('location');
  };

  const handleLocationNext = (country: string, countryCode: string) => {
    setData((prev) => ({ ...prev, country, countryCode }));
    setStep('native');
  };

  const handleNativeNext = (nativeLanguages: string[]) => {
    setData((prev) => ({ ...prev, nativeLanguages }));
    setStep('learning');
  };

  const handleLearningNext = (learningLanguages: string[]) => {
    setData((prev) => ({ ...prev, learningLanguages }));
    setStep('notifications');
  };

  const handleNotificationsNext = (notificationsEnabled: boolean) => {
    const completeData: OnboardingData = {
      name: data.name!,
      country: data.country!,
      countryCode: data.countryCode!,
      nativeLanguages: data.nativeLanguages!,
      learningLanguages: data.learningLanguages!,
    };
    onComplete(completeData, notificationsEnabled);
  };

  const goBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-white overflow-hidden">
      {/* Progress header - Airbnb style */}
      <div className="px-6 pt-4 pb-2 shrink-0 border-b border-[#EBEBEB]">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-3">
          {steps.map((s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  index < currentIndex
                    ? 'bg-[#222222] text-white'
                    : index === currentIndex
                    ? 'bg-[#222222] text-white ring-4 ring-[#222222]/10'
                    : 'bg-[#F7F7F7] text-[#717171]'
                }`}
              >
                {index < currentIndex ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                    index < currentIndex ? 'bg-[#222222]' : 'bg-[#EBEBEB]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current step label */}
        <p className="text-sm text-[#717171] text-center">
          <span className="text-[#222222] font-semibold">{stepLabels[step]}</span>
          {' '}&middot;{' '}
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>

      {/* Progress bar - thin accent line */}
      <div className="h-1 bg-[#F7F7F7] shrink-0">
        <div
          className="h-full bg-linear-to-r from-rausch to-arches transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {step === 'name' && (
          <NameStep onNext={handleNameNext} initialValue={data.name} />
        )}
        {step === 'location' && (
          <LocationStep onNext={handleLocationNext} onBack={goBack} />
        )}
        {step === 'native' && (
          <LanguageStep
            type="native"
            onNext={handleNativeNext}
            onBack={goBack}
            initialSelection={data.nativeLanguages}
          />
        )}
        {step === 'learning' && (
          <LanguageStep
            type="learning"
            onNext={handleLearningNext}
            onBack={goBack}
            initialSelection={data.learningLanguages}
          />
        )}
        {step === 'notifications' && (
          <NotificationStep onNext={handleNotificationsNext} onBack={goBack} />
        )}
      </div>
    </div>
  );
}

export { LanguageStep } from './LanguageStep';
export { LocationStep } from './LocationStep';
export { NameStep } from './NameStep';
export { NotificationStep } from './NotificationStep';
