'use client';

import { fetchProfilePicture, getCurrentUser, saveUser, setCurrentUser } from '@/lib/store';
import { LANGUAGES, LanguageProfile } from '@/lib/types';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface ProfileProps {
  currentUser: LanguageProfile;
  onUserUpdate: (user: LanguageProfile) => void;
}

const getLanguageFlag = (code: string): string => {
  return LANGUAGES.find((l) => l.code === code)?.flag || '🌐';
};

const getLanguageName = (code: string): string => {
  return LANGUAGES.find((l) => l.code === code)?.name || code;
};

const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode === 'XX') return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

type EditMode = 'none' | 'native' | 'learning';

export function Profile({ currentUser, onUserUpdate }: ProfileProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [profilePic, setProfilePic] = useState<string | null>(currentUser.profilePictureUrl || null);
  const [editMode, setEditMode] = useState<EditMode>('none');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser.username) {
      fetchProfilePicture(currentUser.username).then((url) => {
        if (url) setProfilePic(url);
      });
    }
  }, [currentUser.username]);

  const handleEditNative = () => {
    setSelectedLanguages([...currentUser.nativeLanguages]);
    setEditMode('native');
  };

  const handleEditLearning = () => {
    setSelectedLanguages([...currentUser.learningLanguages]);
    setEditMode('learning');
  };

  const handleToggleLanguage = (code: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const handleSave = async () => {
    if (selectedLanguages.length === 0) return;

    setIsSaving(true);

    const updatedUser: LanguageProfile = {
      ...currentUser,
      nativeLanguages: editMode === 'native' ? selectedLanguages : currentUser.nativeLanguages,
      learningLanguages: editMode === 'learning' ? selectedLanguages : currentUser.learningLanguages,
    };

    // Save to Supabase
    const savedUser = await saveUser(updatedUser);

    if (savedUser) {
      setCurrentUser(savedUser);
      onUserUpdate(savedUser);
    } else {
      // Fallback to local update
      setCurrentUser(updatedUser);
      onUserUpdate(updatedUser);
    }

    setIsSaving(false);
    setEditMode('none');
  };

  const handleCancel = () => {
    setEditMode('none');
    setSelectedLanguages([]);
  };

  // Language selection modal
  if (editMode !== 'none') {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#EBEBEB] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[#222222] hover:bg-[#F7F7F7] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-[#222222]">
                {editMode === 'native' ? 'Languages You Speak' : 'Languages You\'re Learning'}
              </h1>
              <p className="text-sm text-[#717171]">
                {selectedLanguages.length} selected
              </p>
            </div>
          </div>
        </div>

        {/* Language grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-[#F7F7F7]">
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang, index) => {
              const isSelected = selectedLanguages.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => handleToggleLanguage(lang.code)}
                  className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all animate-fade-in ${
                    isSelected
                      ? 'border-[#222222] bg-[#F7F7F7]'
                      : 'border-[#EBEBEB] bg-white hover:border-[#B0B0B0] hover:shadow-sm'
                  }`}
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-[#222222]' : 'text-hof'}`}>
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

        {/* Save button */}
        <div className="p-4 border-t border-[#EBEBEB] bg-white shrink-0">
          <button
            onClick={handleSave}
            disabled={selectedLanguages.length === 0 || isSaving}
            className="w-full btn-airbnb h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : `Save ${selectedLanguages.length} Language${selectedLanguages.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    );
  }

  // Main profile view
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#EBEBEB] shrink-0">
        <h1 className="text-xl font-semibold text-[#222222]">{t('title')}</h1>
        <p className="text-sm text-[#717171]">{t('languages')}</p>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#F7F7F7]">
        {/* Profile card */}
        <div className="p-4">
          <div className="card-airbnb p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F7F7F7]">
                  {profilePic ? (
                    <img src={profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-medium text-[#717171]">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 text-2xl drop-shadow-sm">
                  {getCountryFlag(currentUser.countryCode)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-[#222222] truncate">{currentUser.name}</h2>
                <p className="text-[#717171]">{currentUser.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Languages sections */}
        <div className="px-4 pb-20 space-y-4">
          {/* Native languages */}
          <div className="card-airbnb p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#222222]">{t('speaks')}</h3>
                <p className="text-sm text-[#717171]">{t('languages')}</p>
              </div>
              <button
                onClick={handleEditNative}
                className="px-4 py-2 text-sm font-medium text-[#222222] border border-[#222222] rounded-lg hover:bg-[#F7F7F7] transition-colors"
              >
                {t('editProfile')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.nativeLanguages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F8F5] text-babu text-sm font-medium rounded-full"
                >
                  <span>{getLanguageFlag(lang)}</span>
                  {getLanguageName(lang)}
                </span>
              ))}
            </div>
          </div>

          {/* Learning languages */}
          <div className="card-airbnb p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#222222]">{t('learning')}</h3>
                <p className="text-sm text-[#717171]">{t('languages')}</p>
              </div>
              <button
                onClick={handleEditLearning}
                className="px-4 py-2 text-sm font-medium text-[#222222] border border-[#222222] rounded-lg hover:bg-[#F7F7F7] transition-colors"
              >
                {t('editProfile')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.learningLanguages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0ED] text-[#E61E4D] text-sm font-medium rounded-full"
                >
                  <span>{getLanguageFlag(lang)}</span>
                  {getLanguageName(lang)}
                </span>
              ))}
            </div>
          </div>

          {/* Language switcher */}
          <div className="card-airbnb p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-[#222222]">{t('language')}</h3>
              <p className="text-sm text-[#717171]">{t('languageDesc')}</p>
            </div>
            <LocaleSwitcher />
          </div>

          {/* Stats card */}
          <div className="card-airbnb p-5">
            <h3 className="font-semibold text-[#222222] mb-4">{tCommon('settings')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-[#F7F7F7] rounded-xl">
                <p className="text-2xl font-bold text-[#222222]">{currentUser.nativeLanguages.length}</p>
                <p className="text-sm text-[#717171]">{t('speaks')}</p>
              </div>
              <div className="text-center p-4 bg-[#F7F7F7] rounded-xl">
                <p className="text-2xl font-bold text-[#222222]">{currentUser.learningLanguages.length}</p>
                <p className="text-sm text-[#717171]">{t('learning')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
