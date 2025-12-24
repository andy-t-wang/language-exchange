"use client";

import { searchUsersByLanguage, getUsers } from "@/lib/store";
import { LANGUAGES, LanguageProfile } from "@/lib/types";
import { Search as SearchIcon } from "iconoir-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { UserCard } from "./UserCard";

interface SearchProps {
  onUserConnect: (user: LanguageProfile) => void;
  currentUser: LanguageProfile | null;
}

export function Search({ onUserConnect, currentUser }: SearchProps) {
  const t = useTranslations("search");
  const tLang = useTranslations("languages");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [results, setResults] = useState<LanguageProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      tLang(lang.code).toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = useCallback(
    async (code: string) => {
      setSelectedLanguage(code);
      setIsSearching(true);

      try {
        const users = await searchUsersByLanguage(
          code,
          currentUser?.walletAddress
        );
        setResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [currentUser?.walletAddress]
  );

  const handleClearSelection = () => {
    setSelectedLanguage(null);
    setResults([]);
    setSearchQuery("");
    loadFeaturedUsers();
  };

  const selectedLang = LANGUAGES.find((l) => l.code === selectedLanguage);

  // Load featured users on mount
  const loadFeaturedUsers = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const allUsers = await getUsers();
      // Filter out current user and take first 6
      const featured = allUsers
        .filter((u) => u.walletAddress !== currentUser?.walletAddress)
        .slice(0, 6);
      setResults(featured);
    } catch (error) {
      console.error("Error loading users:", error);
      setResults([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, [currentUser?.walletAddress]);

  useEffect(() => {
    if (!selectedLanguage) {
      loadFeaturedUsers();
    }
  }, [selectedLanguage, loadFeaturedUsers]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-[#EBEBEB] shrink-0">
        {selectedLanguage ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearSelection}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[#222222] hover:bg-[#F7F7F7] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex items-center gap-3 flex-1 bg-[#F7F7F7] px-4 py-3 rounded-xl">
              <span className="text-2xl">{selectedLang?.flag}</span>
              <span className="font-semibold text-[#222222]">
                {selectedLang ? tLang(selectedLang.code) : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full h-14 px-4 bg-[#F7F7F7] rounded-full border border-[#EBEBEB] focus-within:border-[#222222] focus-within:ring-2 focus-within:ring-[#222222]/10 focus-within:bg-white transition-all">
            <SearchIcon
              width={20}
              height={20}
              className="text-[#717171] shrink-0"
            />
            <input
              type="text"
              placeholder={t("searchLanguage")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full bg-transparent text-base outline-none placeholder:text-[#717171]"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-20 bg-[#F7F7F7]">
        {!selectedLanguage ? (
          // Language selection grid
          <div>
            <h2 className="text-xs font-semibold text-[#717171] uppercase tracking-wider mb-4">
              {searchQuery ? t("searchResults") : t("browseByLanguage")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(searchQuery ? filteredLanguages : LANGUAGES).map(
                (lang, index) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#EBEBEB] hover:border-[#222222] hover:shadow-md transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium text-[#222222]">
                      {tLang(lang.code)}
                    </span>
                  </button>
                )
              )}
            </div>

            {searchQuery && filteredLanguages.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EBEBEB] flex items-center justify-center">
                  <span className="text-3xl">🔍</span>
                </div>
                <p className="text-[#717171]">{t("noLanguagesFound")}</p>
              </div>
            )}

            {/* Featured users section */}
            {!searchQuery && results.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xs font-semibold text-[#717171] uppercase tracking-wider mb-4">
                  {t("partnersNearYou")}
                </h2>
                {isInitialLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-4 border-[#EBEBEB]" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rausch animate-spin" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.slice(0, 12).map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        currentUser={currentUser}
                        onConnect={onUserConnect}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isSearching ? (
          // Loading state
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[#EBEBEB]" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rausch animate-spin" />
            </div>
            <p className="text-[#222222] font-medium">{t("findingPartners")}</p>
            <p className="text-[#717171] text-sm mt-1">{t("wontTakeLong")}</p>
          </div>
        ) : results.length > 0 ? (
          // User results
          <div>
            <h2 className="text-xs font-semibold text-[#717171] uppercase tracking-wider mb-4">
              {t("peopleFound", { count: results.length })}
            </h2>
            <div className="space-y-4">
              {results.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                  onConnect={onUserConnect}
                />
              ))}
            </div>
          </div>
        ) : (
          // No results
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-20 h-20 mb-6 rounded-full bg-[#FFF0ED] flex items-center justify-center">
              <span className="text-4xl">🌍</span>
            </div>
            <h3 className="font-semibold text-[#222222] text-lg mb-2">
              {t("noOneFound")}
            </h3>
            <p className="text-[#717171] text-center text-sm max-w-xs">
              {t("noOneFoundDesc", {
                language: selectedLang ? tLang(selectedLang.code) : "",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { UserCard } from "./UserCard";
