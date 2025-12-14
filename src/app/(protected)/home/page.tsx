'use client';

import { Chats } from '@/components/Chats';
import { NavTab, subscribeToTabChange } from '@/components/Navigation';
import { OnboardingFlow } from '@/components/Onboarding';
import { Profile } from '@/components/Profile';
import { Search } from '@/components/Search';
import {
  clearCurrentUser,
  fetchProfilePicture,
  getCurrentUser,
  hasCompletedOnboarding,
  saveAndSetCurrentUser,
  setCurrentUser,
} from '@/lib/store';
import { LanguageProfile, OnboardingData } from '@/lib/types';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function Home() {
  const t = useTranslations('home');
  const { data: session } = useSession();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [currentUser, setCurrentUserState] = useState<LanguageProfile | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('search');
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserPic, setCurrentUserPic] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboarded = hasCompletedOnboarding();
    setIsOnboarded(onboarded);
    if (onboarded) {
      const user = getCurrentUser();
      setCurrentUserState(user);
      // Fetch current user's profile picture
      if (user?.username) {
        fetchProfilePicture(user.username).then(setCurrentUserPic);
      }
    }

    // Subscribe to navigation tab changes
    const unsubscribe = subscribeToTabChange((tab) => {
      setActiveTab(tab);
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = async (
    data: OnboardingData,
    notificationsEnabled: boolean
  ) => {
    setIsSaving(true);

    const newUser: LanguageProfile = {
      id: session?.user?.id || crypto.randomUUID(),
      walletAddress: session?.user?.walletAddress || `0x${crypto.randomUUID().replace(/-/g, '')}`,
      username: session?.user?.username || 'user',
      profilePictureUrl: session?.user?.profilePictureUrl,
      name: data.name,
      country: data.country,
      countryCode: data.countryCode,
      nativeLanguages: data.nativeLanguages,
      learningLanguages: data.learningLanguages,
      createdAt: new Date().toISOString(),
      notificationsEnabled,
    };

    // Save to Supabase and localStorage
    const savedUser = await saveAndSetCurrentUser(newUser);

    if (savedUser) {
      setCurrentUserState(savedUser);
    } else {
      // Fallback to local storage if Supabase fails
      setCurrentUser(newUser);
      setCurrentUserState(newUser);
    }

    setIsSaving(false);
    setIsOnboarded(true);
  };

  const handleUserConnect = () => {
    // Chat is opened via World App, nothing to do here
  };

  // Loading state
  if (isOnboarded === null || isSaving) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 bg-white">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#EBEBEB]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rausch animate-spin" />
        </div>
        {isSaving && (
          <p className="text-[#717171] text-sm">{t('settingUp')}</p>
        )}
      </div>
    );
  }

  // Onboarding flow
  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const handleUserUpdate = (user: LanguageProfile) => {
    setCurrentUserState(user);
  };

  // Main app with tabs
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden pb-16">
      {/* Main content area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'search' ? (
          <div className="h-full flex flex-col">
            {/* Search Header */}
            <div className="px-5 pt-4 pb-5 bg-linear-to-b from-white to-[#FAFAFA] shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#717171] mb-0.5">{t('welcomeBack')}</p>
                  <h1 className="text-2xl font-bold text-[#222222]">
                    {currentUser?.name?.split(' ')[0] || 'Friend'} <span className="inline-block animate-wave">👋</span>
                  </h1>
                </div>
                <button
                  onClick={() => {
                    clearCurrentUser();
                    signOut({ callbackUrl: '/' });
                  }}
                  className="relative"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-rausch to-arches p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      {currentUserPic || currentUser?.profilePictureUrl ? (
                        <img
                          src={currentUserPic || currentUser?.profilePictureUrl}
                          alt={currentUser?.name || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-semibold bg-[#F7F7F7] text-[#222222]">
                          {currentUser?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-babu rounded-full border-2 border-white" />
                </button>
              </div>
              <p className="text-[#717171] text-sm mt-3">
                {t('findPartners')}
              </p>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <Search onUserConnect={handleUserConnect} currentUser={currentUser} />
            </div>
          </div>
        ) : activeTab === 'chats' ? (
          currentUser && <Chats currentUser={currentUser} />
        ) : (
          currentUser && <Profile currentUser={currentUser} onUserUpdate={handleUserUpdate} />
        )}
      </div>
    </div>
  );
}
