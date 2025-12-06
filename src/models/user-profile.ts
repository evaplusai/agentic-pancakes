/**
 * User Profile Model
 *
 * Defines user preferences, watch history, and personalization data.
 * Used for tailoring recommendations based on past behavior.
 *
 * @module models/user-profile
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Watch history entry schema
 */
export const WatchHistoryEntrySchema = z.object({
  contentId: z.string(),
  title: z.string(),
  watchedAt: z.string().datetime(),
  completionRate: z.number().min(0).max(1).describe('0-1, how much was watched'),
  rating: z.number().int().min(1).max(5).optional(),
  mood: z.enum(['unwind', 'engage']).optional(),
  tone: z.enum(['laugh', 'feel', 'thrill', 'think']).optional(),
  wasRecommended: z.boolean().default(false),
  sessionDuration: z.number().min(0).optional().describe('Minutes watched')
});

/**
 * Genre preference schema
 */
export const GenrePreferenceSchema = z.object({
  genre: z.string(),
  weight: z.number().min(0).max(1).describe('Preference strength'),
  watchCount: z.number().int().min(0),
  avgRating: z.number().min(1).max(5).optional()
});

/**
 * Viewing pattern schema
 */
export const ViewingPatternSchema = z.object({
  preferredTimeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
  preferredDayOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  avgSessionDuration: z.number().min(0).default(0),
  preferredMood: z.record(z.enum(['unwind', 'engage']), z.number()).optional(),
  preferredTone: z.record(z.enum(['laugh', 'feel', 'thrill', 'think']), z.number()).optional()
});

/**
 * User preferences schema
 */
export const UserPreferencesSchema = z.object({
  favoriteGenres: z.array(GenrePreferenceSchema).default([]),
  excludedGenres: z.array(z.string()).default([]),
  preferredLanguages: z.array(z.string()).default(['fr']),
  maxRuntime: z.number().int().min(0).optional(),
  minYear: z.number().int().optional(),
  contentRatings: z.array(z.string()).default([]),
  viewingPatterns: ViewingPatternSchema.default({})
});

/**
 * User profile schema
 */
export const UserProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  preferences: UserPreferencesSchema.default({}),
  watchHistory: z.array(WatchHistoryEntrySchema).default([]),
  watchlist: z.array(z.string()).default([]),
  likedContent: z.array(z.string()).default([]),
  dislikedContent: z.array(z.string()).default([]),
  stats: z.object({
    totalWatched: z.number().int().min(0).default(0),
    totalMinutes: z.number().min(0).default(0),
    avgRating: z.number().min(1).max(5).optional(),
    recommendationAccuracy: z.number().min(0).max(1).optional()
  }).default({})
});

// ============================================================================
// TypeScript Types
// ============================================================================

export type WatchHistoryEntry = z.infer<typeof WatchHistoryEntrySchema>;
export type GenrePreference = z.infer<typeof GenrePreferenceSchema>;
export type ViewingPattern = z.infer<typeof ViewingPatternSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a new user profile
 */
export function createUserProfile(userId: string, displayName?: string): UserProfile {
  const now = new Date().toISOString();
  return {
    userId,
    displayName,
    createdAt: now,
    updatedAt: now,
    preferences: {
      favoriteGenres: [],
      excludedGenres: [],
      preferredLanguages: ['fr'],
      contentRatings: [],
      viewingPatterns: {
        preferredDayOfWeek: [],
        avgSessionDuration: 0
      }
    },
    watchHistory: [],
    watchlist: [],
    likedContent: [],
    dislikedContent: [],
    stats: {
      totalWatched: 0,
      totalMinutes: 0
    }
  };
}

/**
 * Add watch history entry
 */
export function addWatchHistoryEntry(
  profile: UserProfile,
  entry: Omit<WatchHistoryEntry, 'watchedAt'>
): UserProfile {
  const newEntry: WatchHistoryEntry = {
    ...entry,
    watchedAt: new Date().toISOString()
  };

  const updatedHistory = [newEntry, ...profile.watchHistory].slice(0, 100); // Keep last 100
  const totalMinutes = profile.stats.totalMinutes + (entry.sessionDuration || 0);

  return {
    ...profile,
    updatedAt: new Date().toISOString(),
    watchHistory: updatedHistory,
    stats: {
      ...profile.stats,
      totalWatched: profile.stats.totalWatched + 1,
      totalMinutes
    }
  };
}

/**
 * Update genre preferences based on watch history
 */
export function updateGenrePreferences(profile: UserProfile, genres: string[], rating?: number): UserProfile {
  const genreMap = new Map<string, GenrePreference>(
    profile.preferences.favoriteGenres.map(g => [g.genre, g])
  );

  for (const genre of genres) {
    const existing = genreMap.get(genre);
    if (existing) {
      const newCount = existing.watchCount + 1;
      const newAvgRating = rating && existing.avgRating
        ? (existing.avgRating * existing.watchCount + rating) / newCount
        : rating || existing.avgRating;

      genreMap.set(genre, {
        genre,
        watchCount: newCount,
        weight: Math.min(1, existing.weight + 0.05),
        avgRating: newAvgRating
      });
    } else {
      genreMap.set(genre, {
        genre,
        watchCount: 1,
        weight: 0.3,
        avgRating: rating
      });
    }
  }

  return {
    ...profile,
    updatedAt: new Date().toISOString(),
    preferences: {
      ...profile.preferences,
      favoriteGenres: Array.from(genreMap.values())
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 20)
    }
  };
}

/**
 * Add content to watchlist
 */
export function addToWatchlist(profile: UserProfile, contentId: string): UserProfile {
  if (profile.watchlist.includes(contentId)) {
    return profile;
  }

  return {
    ...profile,
    updatedAt: new Date().toISOString(),
    watchlist: [contentId, ...profile.watchlist].slice(0, 50)
  };
}

/**
 * Remove content from watchlist
 */
export function removeFromWatchlist(profile: UserProfile, contentId: string): UserProfile {
  return {
    ...profile,
    updatedAt: new Date().toISOString(),
    watchlist: profile.watchlist.filter(id => id !== contentId)
  };
}

/**
 * Like content
 */
export function likeContent(profile: UserProfile, contentId: string): UserProfile {
  const likedContent = profile.likedContent.includes(contentId)
    ? profile.likedContent
    : [contentId, ...profile.likedContent].slice(0, 100);

  const dislikedContent = profile.dislikedContent.filter(id => id !== contentId);

  return {
    ...profile,
    updatedAt: new Date().toISOString(),
    likedContent,
    dislikedContent
  };
}

/**
 * Dislike content
 */
export function dislikeContent(profile: UserProfile, contentId: string): UserProfile {
  const dislikedContent = profile.dislikedContent.includes(contentId)
    ? profile.dislikedContent
    : [contentId, ...profile.dislikedContent].slice(0, 100);

  const likedContent = profile.likedContent.filter(id => id !== contentId);

  return {
    ...profile,
    updatedAt: new Date().toISOString(),
    likedContent,
    dislikedContent
  };
}

/**
 * Calculate mood/tone preferences from history
 */
export function calculateMoodTonePreferences(profile: UserProfile): ViewingPattern {
  const moodCounts: Record<string, number> = { unwind: 0, engage: 0 };
  const toneCounts: Record<string, number> = { laugh: 0, feel: 0, thrill: 0, think: 0 };

  for (const entry of profile.watchHistory) {
    if (entry.mood && entry.completionRate > 0.5) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + entry.completionRate;
    }
    if (entry.tone && entry.completionRate > 0.5) {
      toneCounts[entry.tone] = (toneCounts[entry.tone] || 0) + entry.completionRate;
    }
  }

  const totalMood = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;
  const totalTone = Object.values(toneCounts).reduce((a, b) => a + b, 0) || 1;

  return {
    ...profile.preferences.viewingPatterns,
    preferredMood: {
      unwind: moodCounts.unwind / totalMood,
      engage: moodCounts.engage / totalMood
    },
    preferredTone: {
      laugh: toneCounts.laugh / totalTone,
      feel: toneCounts.feel / totalTone,
      thrill: toneCounts.thrill / totalTone,
      think: toneCounts.think / totalTone
    }
  };
}

/**
 * Get recently watched content IDs
 */
export function getRecentlyWatched(profile: UserProfile, limit = 10): string[] {
  return profile.watchHistory
    .slice(0, limit)
    .map(entry => entry.contentId);
}

/**
 * Check if content was recently watched
 */
export function wasRecentlyWatched(profile: UserProfile, contentId: string, daysAgo = 7): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);

  return profile.watchHistory.some(entry =>
    entry.contentId === contentId &&
    new Date(entry.watchedAt) > cutoff
  );
}

/**
 * Validate user profile
 */
export function validateUserProfile(data: unknown): UserProfile {
  return UserProfileSchema.parse(data);
}

/**
 * Serialize user profile for storage
 */
export function serializeUserProfile(profile: UserProfile): string {
  return JSON.stringify(profile);
}

/**
 * Deserialize user profile from storage
 */
export function deserializeUserProfile(data: string): UserProfile {
  return validateUserProfile(JSON.parse(data));
}
