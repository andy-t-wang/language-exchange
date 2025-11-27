// Language exchange user types

export interface LanguageProfile {
  id: string;
  walletAddress: string;
  username: string;
  profilePictureUrl?: string;
  name: string;
  country: string;
  countryCode: string;
  nativeLanguages: string[];
  learningLanguages: string[];
  createdAt: string;
  notificationsEnabled: boolean;
}

export interface OnboardingData {
  name: string;
  country: string;
  countryCode: string;
  nativeLanguages: string[];
  learningLanguages: string[];
}

// Common languages with their codes
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];
