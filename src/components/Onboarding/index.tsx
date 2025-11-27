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
      {/* Simple progress bar */}
      <div className="px-6 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-[#717171]">
            Step {currentIndex + 1} of {steps.length}
          </p>
          <p className="text-sm font-medium text-[#222222]">
            {stepLabels[step]}
          </p>
        </div>
        <div className="h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#222222] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
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
