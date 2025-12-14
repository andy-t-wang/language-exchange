"use client";

import {
  fetchProfilePicture,
  saveContact,
  sendChatNotification,
} from "@/lib/store";
import { LANGUAGES, LanguageProfile } from "@/lib/types";
import { MiniKit } from "minikit-js-dev-preview";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface UserCardProps {
  user: LanguageProfile;
  currentUser?: LanguageProfile | null;
  onConnect: (user: LanguageProfile) => void;
}

const getLanguageFlag = (code: string): string => {
  return LANGUAGES.find((l) => l.code === code)?.flag || "🌐";
};

const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode === "XX") return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export function UserCard({ user, currentUser, onConnect }: UserCardProps) {
  const t = useTranslations("userCard");
  const tLang = useTranslations("languages");
  const [profilePic, setProfilePic] = useState<string | null>(
    user.profilePictureUrl || null
  );
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Fetch profile picture from username API if not already set
    if (!profilePic && user.username) {
      fetchProfilePicture(user.username).then((url) => {
        if (url) setProfilePic(url);
      });
    }
  }, [user.username, profilePic]);

  // Generate personalized intro message
  const getIntroMessage = (): string => {
    // Find a language they speak that the current user is learning
    const targetLanguage = user.nativeLanguages.find((lang) =>
      currentUser?.learningLanguages.includes(lang)
    );

    if (targetLanguage) {
      return `Hey! I'm from Lingua and would love to learn ${getLanguageFlag(
        targetLanguage
      )} with you!`;
    }

    // Fallback: use their first native language
    if (user.nativeLanguages.length > 0) {
      return `Hey! I'm from Lingua and would love to practice ${getLanguageFlag(
        user.nativeLanguages[0]
      )} with you!`;
    }

    return "Hey! I'm from Lingua and would love to practice languages with you!";
  };

  const handleConnect = async () => {
    if (!user.username || isConnecting) return;

    setIsConnecting(true);

    try {
      // Save contact and send notification BEFORE opening chat
      // (since chat takes user out of mini app, code after may not run)
      await Promise.all([
        saveContact(user),
        sendChatNotification(user.walletAddress),
      ]);

      // Notify parent component
      onConnect(user);

      // Open World App chat with the user's username prefilled
      await MiniKit.commandsAsync.chat({
        to: [user.username],
        message: getIntroMessage(),
      });
    } catch (error) {
      console.error("Error opening chat:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="card-airbnb p-5 animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Profile picture */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F7F7F7]">
            {profilePic ? (
              <img
                src={profilePic}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 text-lg drop-shadow-sm">
            {getCountryFlag(user.countryCode)}
          </span>
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#222222] text-lg truncate">
            {user.name}
          </h3>
          <p className="text-sm text-[#717171] mt-0.5">{user.country}</p>
        </div>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting || !user.username}
          className="btn-airbnb px-5 py-2.5 text-sm shrink-0 disabled:opacity-50"
        >
          {isConnecting ? t("connecting") : t("connect")}
        </button>
      </div>

      {/* Languages section */}
      <div className="mt-4 pt-4 border-t border-[#EBEBEB] space-y-3">
        {/* Speaks */}
        <div>
          <p className="text-xs font-medium text-[#717171] uppercase tracking-wide mb-2">
            {t("native")}
          </p>
          <div className="flex flex-wrap gap-2">
            {user.nativeLanguages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F8F5] text-babu text-sm font-medium rounded-full"
              >
                <span>{getLanguageFlag(lang)}</span>
                {tLang(lang)}
              </span>
            ))}
          </div>
        </div>

        {/* Learning */}
        <div>
          <p className="text-xs font-medium text-[#717171] uppercase tracking-wide mb-2">
            {t("learning")}
          </p>
          <div className="flex flex-wrap gap-2">
            {user.learningLanguages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0ED] text-[#E61E4D] text-sm font-medium rounded-full"
              >
                <span>{getLanguageFlag(lang)}</span>
                {tLang(lang)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
