'use client';

import { Navigation } from '@/components/Navigation';
import { Page } from '@/components/PageLayout';
import { hasCompletedOnboarding } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    // Only show navigation if user has completed onboarding
    const checkOnboarding = () => {
      setShowNav(hasCompletedOnboarding());
    };

    checkOnboarding();

    // Listen for storage changes (when onboarding completes)
    const handleStorage = () => checkOnboarding();
    window.addEventListener('storage', handleStorage);

    // Also check periodically for same-tab updates
    const interval = setInterval(checkOnboarding, 500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // During onboarding, render children without navigation wrapper
  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <Page>
      {children}
      <Page.Footer className="px-0 pt-2 fixed bottom-0 w-full bg-white z-50 border-t border-[#EBEBEB]">
        <Navigation />
      </Page.Footer>
    </Page>
  );
}
