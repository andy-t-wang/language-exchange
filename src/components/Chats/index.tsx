"use client";

import {
  fetchProfilePicture,
  getContacts,
  getMyRatings,
  rateUser,
} from "@/lib/store";
import { LANGUAGES, LanguageProfile } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

interface ChatsProps {
  currentUser: LanguageProfile;
}

const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode === "XX" || countryCode === "RU") return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const getLanguageFlag = (code: string): string => {
  return LANGUAGES.find((l) => l.code === code)?.flag || "🌐";
};

interface ContactWithPic extends LanguageProfile {
  profilePic: string | null;
}

export function Chats({ currentUser }: ChatsProps) {
  const t = useTranslations("chats");
  const tLang = useTranslations("languages");
  const [contacts, setContacts] = useState<ContactWithPic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [myRatings, setMyRatings] = useState<Record<string, 1 | -1>>({});
  const [ratingsLoaded, setRatingsLoaded] = useState(false);
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    // Only show loading spinner on first load
    if (!hasLoaded) {
      setIsLoading(true);
    }
    try {
      const contactsList = await getContacts();

      // Show contacts immediately with existing profile pics or null
      const initialContacts = contactsList.map((contact) => ({
        ...contact,
        profilePic: contact.profilePictureUrl || null,
      }));
      setContacts(initialContacts);
      setHasLoaded(true);
      setIsLoading(false);

      // Fetch existing ratings for contacts (only once)
      if (contactsList.length > 0 && !ratingsLoaded) {
        const wallets = contactsList.map((c) => c.walletAddress);
        const ratings = await getMyRatings(wallets);
        setMyRatings(ratings);
        setRatingsLoaded(true);
      }

      // Then fetch missing profile pictures in background
      contactsList.forEach(async (contact, index) => {
        if (!contact.profilePictureUrl && contact.username) {
          const pic = await fetchProfilePicture(contact.username);
          if (pic) {
            setContacts((prev) =>
              prev.map((c, i) => (i === index ? { ...c, profilePic: pic } : c))
            );
          }
        }
      });
    } catch (error) {
      console.error("Error loading contacts:", error);
      setIsLoading(false);
    }
  }, [hasLoaded, ratingsLoaded]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleOpenProfile = (contact: ContactWithPic) => {
    if (!contact.username) return;

    // Open World App profile
    window.open(
      `https://world.org/profile?username=${contact.username}`,
      "_blank"
    );
  };

  const handleOpenChat = (contact: ContactWithPic) => {
    if (!contact.username) return;

    // Open World App chat
    window.open(
      `worldapp://profile?username=${contact.username}&action=chat`,
      "_blank"
    );
  };

  const handleRate = async (
    e: React.MouseEvent,
    walletAddress: string,
    rating: 1 | -1
  ) => {
    e.stopPropagation(); // Prevent opening chat
    setRatingLoading(walletAddress);

    const result = await rateUser(walletAddress, rating);
    if (result.success) {
      setMyRatings((prev) => {
        const newRatings = { ...prev };
        if (result.myRating === null || result.myRating === undefined) {
          delete newRatings[walletAddress];
        } else {
          newRatings[walletAddress] = result.myRating;
        }
        return newRatings;
      });
    }
    setRatingLoading(null);
  };

  // Find matching languages between current user and contact
  const getMatchingLanguages = (contact: ContactWithPic): string[] => {
    const matches: string[] = [];
    // They speak what I'm learning
    contact.nativeLanguages.forEach((lang) => {
      if (currentUser.learningLanguages.includes(lang)) {
        matches.push(lang);
      }
    });
    // I speak what they're learning
    currentUser.nativeLanguages.forEach((lang) => {
      if (contact.learningLanguages.includes(lang) && !matches.includes(lang)) {
        matches.push(lang);
      }
    });
    return matches;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#EBEBEB] shrink-0">
        <h1 className="text-xl font-semibold text-[#222222]">{t("title")}</h1>
        <p className="text-sm text-[#717171]">{t("subtitle")}</p>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#F7F7F7]">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#EBEBEB]" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rausch animate-spin" />
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
            <div className="w-20 h-20 mb-6 rounded-full bg-[#FFF0ED] flex items-center justify-center">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="font-semibold text-[#222222] text-lg mb-2">
              {t("noContacts")}
            </h3>
            <p className="text-[#717171] text-center text-sm max-w-xs">
              {t("noContactsDesc")}
            </p>
          </div>
        ) : (
          <div className="p-4 pb-20 space-y-3">
            {contacts.map((contact, index) => {
              const matchingLangs = getMatchingLanguages(contact);
              const myRating = myRatings[contact.walletAddress];
              const isRatingThis = ratingLoading === contact.walletAddress;

              return (
                <div
                  key={contact.walletAddress}
                  className="card-airbnb p-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    {/* Profile picture & info - clickable to open profile */}
                    <button
                      onClick={() => handleOpenProfile(contact)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F7F7F7]">
                          {contact.profilePic ? (
                            <img
                              src={contact.profilePic}
                              alt={contact.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-medium text-[#717171]">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 text-lg drop-shadow-sm">
                          {getCountryFlag(contact.countryCode)}
                        </span>
                      </div>

                      {/* Contact info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#222222] truncate">
                          {contact.name}
                        </h3>
                        {matchingLangs.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {matchingLangs.slice(0, 3).map((lang) => (
                              <span
                                key={lang}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8F8F5] text-babu text-xs font-medium rounded-full"
                              >
                                <span>{getLanguageFlag(lang)}</span>
                                {tLang(lang)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Chat button - separate action */}
                    <button
                      onClick={() => handleOpenChat(contact)}
                      className="btn-airbnb px-4 py-2 text-sm shrink-0"
                    >
                      Chat
                    </button>
                  </div>

                  {/* Rating buttons */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#EBEBEB]">
                    <span className="text-xs text-[#717171] mr-auto">
                      {t("ratePartner")}
                    </span>
                    <button
                      onClick={(e) => handleRate(e, contact.walletAddress, 1)}
                      disabled={isRatingThis}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                        isRatingThis ? "opacity-50" : ""
                      }`}
                      style={
                        myRating === 1
                          ? {
                              backgroundColor: "#16a34a",
                              color: "#ffffff",
                            }
                          : {
                              backgroundColor: "#F7F7F7",
                              color: "#717171",
                            }
                      }
                    >
                      {myRating === 1 ? (
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="#ffffff"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                      )}
                      {t("goodPartner")}
                    </button>
                    <button
                      onClick={(e) => handleRate(e, contact.walletAddress, -1)}
                      disabled={isRatingThis}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                        isRatingThis ? "opacity-50" : ""
                      }`}
                      style={
                        myRating === -1
                          ? {
                              backgroundColor: "#dc2626",
                              color: "#ffffff",
                            }
                          : {
                              backgroundColor: "#F7F7F7",
                              color: "#717171",
                            }
                      }
                    >
                      {myRating === -1 ? (
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="#ffffff"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-3 h-3 shrink-0 rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                      )}
                      {t("notHelpful")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
