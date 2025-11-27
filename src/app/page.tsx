"use client";

import { walletAuth } from "@/auth/wallet";
import { useMiniKit } from "minikit-js-dev-preview/minikit-provider";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [isPending, setIsPending] = useState(false);
  const { isInstalled } = useMiniKit();

  const handleLogin = useCallback(async () => {
    if (!isInstalled || isPending) {
      return;
    }
    setIsPending(true);
    try {
      await walletAuth();
    } catch (error) {
      console.error("Wallet authentication error", error);
      setIsPending(false);
    }
  }, [isInstalled, isPending]);

  useEffect(() => {
    const authenticate = async () => {
      if (isInstalled && !isPending) {
        setIsPending(true);
        try {
          // await walletAuth();
        } catch (error) {
          console.error("Auto wallet authentication error", error);
        } finally {
          setIsPending(false);
        }
      }
    };

    authenticate();
  }, [isInstalled, isPending]);

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col px-6 pt-16">
        {/* Logo and brand */}
        <div className="mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-rausch to-arches flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">🌍</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#222222] tracking-tight">
            Lingua
          </h1>
          <p className="text-[#717171] text-lg mt-2 leading-relaxed max-w-[280px]">
            Find language partners and practice together in World App
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mt-8">
          <div
            className="flex items-start gap-4 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#FFF0ED] flex items-center justify-center shrink-0">
              <span className="text-2xl">🗣️</span>
            </div>
            <div>
              <p className="font-semibold text-[#222222]">
                Practice with natives
              </p>
              <p className="text-[#717171] text-sm">
                Chat with speakers of the language you&apos;re learning
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-4 animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#E8F8F5] flex items-center justify-center shrink-0">
              <span className="text-2xl">🌐</span>
            </div>
            <div>
              <p className="font-semibold text-[#222222]">25+ languages</p>
              <p className="text-[#717171] text-sm">
                From Spanish to Swahili, find your match
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-4 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#F0F0FF] flex items-center justify-center shrink-0">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <p className="font-semibold text-[#222222]">
                Verified humans only
              </p>
              <p className="text-[#717171] text-sm">
                World ID ensures real connections
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login button */}
      <div
        className="p-6 pb-10 border-t border-[#EBEBEB] animate-slide-up"
        style={{ animationDelay: "0.25s" }}
      >
        <button
          onClick={handleLogin}
          disabled={isPending}
          className="btn-airbnb w-full h-14 text-base font-semibold disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            "Get started"
          )}
        </button>

        <p className="text-center text-xs text-[#717171] mt-3 pt-2">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
