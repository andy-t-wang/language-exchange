'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { ChatBubble, Search, User } from 'iconoir-react';
import { useEffect, useState } from 'react';

export type NavTab = 'search' | 'chats' | 'profile';

// Global state for tab management
let tabChangeListeners: ((tab: NavTab) => void)[] = [];
let currentTab: NavTab = 'search';

export function subscribeToTabChange(listener: (tab: NavTab) => void) {
  tabChangeListeners.push(listener);
  // Call immediately with current value
  listener(currentTab);
  return () => {
    tabChangeListeners = tabChangeListeners.filter(l => l !== listener);
  };
}

export function setActiveTab(tab: NavTab) {
  currentTab = tab;
  tabChangeListeners.forEach(listener => listener(tab));
}

export function getActiveTab(): NavTab {
  return currentTab;
}

/**
 * Bottom navigation for the language exchange app
 * Mobile first design pattern
 */
export const Navigation = () => {
  const [value, setValue] = useState<NavTab>(currentTab);

  useEffect(() => {
    // Subscribe to external tab changes
    return subscribeToTabChange((tab) => {
      setValue(tab);
    });
  }, []);

  const handleChange = (newValue: string) => {
    const tab = newValue as NavTab;
    setValue(tab);
    setActiveTab(tab);
  };

  return (
    <Tabs value={value} onValueChange={handleChange}>
      <TabItem value="search" icon={<Search />} label="Search" />
      <TabItem value="chats" icon={<ChatBubble />} label="Chats" />
      <TabItem value="profile" icon={<User />} label="Profile" />
    </Tabs>
  );
};
