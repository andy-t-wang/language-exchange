'use client';

import { LanguageProfile } from './types';
import { DbContact, DbUser } from './supabase';

const CURRENT_USER_KEY = 'language_exchange_current_user';
const PROFILE_PICTURE_CACHE = new Map<string, string>();

// Fetch profile picture from World username API
export async function fetchProfilePicture(username: string): Promise<string | null> {
  if (!username) return null;

  // Check cache first
  if (PROFILE_PICTURE_CACHE.has(username)) {
    return PROFILE_PICTURE_CACHE.get(username) || null;
  }

  try {
    const response = await fetch(`https://usernames.worldcoin.org/api/v1/${username}`);
    if (!response.ok) return null;

    const data = await response.json();
    const pictureUrl = data.minimized_profile_picture_url || data.profile_picture_url || null;

    if (pictureUrl) {
      PROFILE_PICTURE_CACHE.set(username, pictureUrl);
    }

    return pictureUrl;
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return null;
  }
}

// Convert database user to app user format
function dbUserToProfile(dbUser: DbUser): LanguageProfile {
  return {
    id: dbUser.id,
    walletAddress: dbUser.wallet_address,
    username: dbUser.username,
    profilePictureUrl: dbUser.profile_picture_url || undefined,
    name: dbUser.name,
    country: dbUser.country,
    countryCode: dbUser.country_code,
    nativeLanguages: dbUser.native_languages,
    learningLanguages: dbUser.learning_languages,
    createdAt: dbUser.created_at,
    notificationsEnabled: dbUser.notifications_enabled,
    qualityScore: dbUser.quality_score || 0,
  };
}

// Fetch all users via API
export async function getUsers(sortBy: 'best' | 'newest' = 'best'): Promise<LanguageProfile[]> {
  try {
    const params = new URLSearchParams({ sort: sortBy });
    const response = await fetch(`/api/users?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const { users } = await response.json();
    return (users || []).map(dbUserToProfile);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Save user via authenticated API route
export async function saveUser(user: LanguageProfile): Promise<LanguageProfile | null> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: user.walletAddress,
        username: user.username,
        profile_picture_url: user.profilePictureUrl || null,
        name: user.name,
        country: user.country,
        country_code: user.countryCode,
        native_languages: user.nativeLanguages,
        learning_languages: user.learningLanguages,
        notifications_enabled: user.notificationsEnabled,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error saving user:', error);
      return null;
    }

    const { user: savedUser } = await response.json();
    return dbUserToProfile(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    return null;
  }
}

// Search users by language via API
export async function searchUsersByLanguage(
  languageCode: string,
  excludeWalletAddress?: string
): Promise<LanguageProfile[]> {
  try {
    const params = new URLSearchParams({ language: languageCode });
    if (excludeWalletAddress) {
      params.append('exclude', excludeWalletAddress);
    }

    const response = await fetch(`/api/users?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search users');
    }

    const { users } = await response.json();
    return (users || []).map(dbUserToProfile);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// Local storage functions for current user session
export function getCurrentUser(): LanguageProfile | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function setCurrentUser(user: LanguageProfile): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export async function saveAndSetCurrentUser(user: LanguageProfile): Promise<LanguageProfile | null> {
  const savedUser = await saveUser(user);
  if (savedUser) {
    setCurrentUser(savedUser);
    return savedUser;
  }
  return null;
}

export function updateCurrentUserLocal(updates: Partial<LanguageProfile>): void {
  const current = getCurrentUser();
  if (current) {
    const updated = { ...current, ...updates };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  }
}

export function hasCompletedOnboarding(): boolean {
  return getCurrentUser() !== null;
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Convert database contact to app profile format
function dbContactToProfile(dbContact: DbContact): LanguageProfile {
  const data = dbContact.contact_data;
  return {
    id: dbContact.id,
    walletAddress: dbContact.contact_wallet,
    username: data.username,
    profilePictureUrl: data.profilePictureUrl || undefined,
    name: data.name,
    country: data.country,
    countryCode: data.countryCode,
    nativeLanguages: data.nativeLanguages,
    learningLanguages: data.learningLanguages,
    createdAt: dbContact.created_at,
    notificationsEnabled: false,
    qualityScore: 0,
  };
}

// Fetch all contacts
export async function getContacts(): Promise<LanguageProfile[]> {
  try {
    const response = await fetch('/api/contacts');
    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }
    const { contacts } = await response.json();
    return (contacts || []).map(dbContactToProfile);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

// Save a contact (after successful chat)
export async function saveContact(user: LanguageProfile): Promise<LanguageProfile | null> {
  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact_wallet: user.walletAddress,
        contact_username: user.username,
        contact_name: user.name,
        contact_country: user.country,
        contact_country_code: user.countryCode,
        contact_profile_picture_url: user.profilePictureUrl || null,
        contact_native_languages: user.nativeLanguages,
        contact_learning_languages: user.learningLanguages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error saving contact:', error);
      return null;
    }

    const { contact } = await response.json();
    return dbContactToProfile(contact);
  } catch (error) {
    console.error('Error saving contact:', error);
    return null;
  }
}

// Send notification to a user when initiating chat
export async function sendChatNotification(walletAddress: string): Promise<boolean> {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error sending notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Rate a user (thumbs up or thumbs down)
export async function rateUser(
  walletAddress: string,
  rating: 1 | -1
): Promise<{ success: boolean; myRating?: 1 | -1 | null }> {
  try {
    const response = await fetch('/api/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rated_wallet: walletAddress,
        rating,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error rating user:', error);
      return { success: false };
    }

    const data = await response.json();
    return { success: true, myRating: data.myRating };
  } catch (error) {
    console.error('Error rating user:', error);
    return { success: false };
  }
}

// Get my rating for a specific user
export async function getMyRating(walletAddress: string): Promise<1 | -1 | null> {
  try {
    const response = await fetch(`/api/ratings?rated_wallet=${walletAddress}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.rating;
  } catch (error) {
    console.error('Error getting rating:', error);
    return null;
  }
}

// Get my ratings for multiple users at once
export async function getMyRatings(walletAddresses: string[]): Promise<Record<string, 1 | -1>> {
  try {
    const response = await fetch('/api/ratings/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet_addresses: walletAddresses }),
    });
    if (!response.ok) {
      return {};
    }
    const data = await response.json();
    return data.ratings || {};
  } catch (error) {
    console.error('Error getting ratings:', error);
    return {};
  }
}
