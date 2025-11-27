"use client";

import { MiniKit, Permission } from "minikit-js-dev-preview";
import { useMiniKit } from "minikit-js-dev-preview/minikit-provider";
import { useState } from "react";

interface NotificationStepProps {
  onNext: (enabled: boolean) => void;
  onBack: () => void;
}

export function NotificationStep({ onNext, onBack }: NotificationStepProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "granted" | "denied">("idle");
  const { isInstalled } = useMiniKit();

  const requestNotifications = async () => {
    if (!isInstalled) {
      console.log("MiniKit not installed, skipping notification request");
      onNext(false);
      return;
    }

    setLoading(true);
    try {
      const result = await MiniKit.commandsAsync.requestPermission({
        permission: Permission.Notifications,
      });

      if (result?.finalPayload?.status === "success") {
        setStatus("granted");
        setTimeout(() => onNext(true), 1500);
      } else {
        setStatus("denied");
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      setStatus("denied");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onNext(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0 overflow-y-auto">
        {/* Hero illustration */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-linear-to-br from-[#FFF4E6] to-[#FFE8CC] flex items-center justify-center">
              <span className="text-6xl">🔔</span>
            </div>
            {status === "granted" && (
              <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-babu flex items-center justify-center animate-scale-in">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Title section */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-[28px] font-semibold text-[#222222] mb-3 tracking-tight">
            {status === "granted" ? "You're all set!" : "Stay in the loop"}
          </h1>
          <p className="text-[#717171] text-base leading-relaxed max-w-xs mx-auto">
            {status === "granted"
              ? "We'll notify you when language partners want to connect"
              : "Get notified when someone wants to practice with you"}
          </p>
        </div>

        {/* Status states */}
        {status === "granted" && (
          <div className="flex items-center gap-3 px-5 py-4 bg-[#E8F8F5] rounded-xl animate-scale-in">
            <div className="w-8 h-8 rounded-full bg-babu flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="font-semibold text-[#222222]">
              Notifications enabled
            </span>
          </div>
        )}

        {status === "denied" && (
          <div className="w-full max-w-sm space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 px-5 py-4 bg-[#FFF8F6] border border-[#FFD4C8] rounded-xl">
              <span className="text-2xl">😔</span>
              <div>
                <p className="font-semibold text-[#222222] text-sm">
                  Permission not granted
                </p>
                <p className="text-[#717171] text-xs mt-0.5">
                  You can enable this later in settings
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "idle" && (
          <div
            className="w-full max-w-sm animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Mock notifications */}
            <div className="space-y-3">
              <div className="card-airbnb p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF0ED] flex items-center justify-center shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#222222] text-sm">
                      New message
                    </p>
                    <span className="text-xs text-[#717171]">now</span>
                  </div>
                  <p className="text-[#717171] text-sm mt-0.5 truncate">
                    &ldquo;Hola! Want to practice Spanish?&rdquo;
                  </p>
                </div>
              </div>

              <div className="card-airbnb p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E8F8F5] flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎉</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#222222] text-sm">
                      New match
                    </p>
                    <span className="text-xs text-[#717171]">2m ago</span>
                  </div>
                  <p className="text-[#717171] text-sm mt-0.5 truncate">
                    Yuki wants to practice English with you!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pb-10 shrink-0 border-t border-[#EBEBEB]">
        {status === "idle" && (
          <div className="space-y-3">
            <button
              onClick={requestNotifications}
              disabled={loading}
              className="btn-airbnb w-full h-12 text-base disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Requesting...</span>
                </>
              ) : (
                "Enable Notifications"
              )}
            </button>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 h-12 rounded-lg border border-[#222222] text-[#222222] font-semibold hover:bg-[#F7F7F7] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 h-12 rounded-lg text-[#717171] font-semibold hover:text-[#222222] hover:bg-[#F7F7F7] transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {status === "denied" && (
          <div className="space-y-3">
            <button
              onClick={() => onNext(false)}
              className="btn-airbnb w-full h-12 text-base"
            >
              Continue anyway
            </button>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 h-12 rounded-lg border border-[#222222] text-[#222222] font-semibold hover:bg-[#F7F7F7] transition-colors"
              >
                Back
              </button>
              <button
                onClick={requestNotifications}
                className="flex-1 h-12 rounded-lg text-[#222222] font-semibold underline underline-offset-2 hover:bg-[#F7F7F7] transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {status === "granted" && (
          <div className="text-center text-[#717171] text-sm animate-fade-in">
            Redirecting you to find language partners...
          </div>
        )}
      </div>
    </div>
  );
}
