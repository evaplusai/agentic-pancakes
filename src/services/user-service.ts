/**
 * User Service
 *
 * Manages user profiles, watch history, and preferences.
 * Provides in-memory storage with optional persistence.
 *
 * @module services/user-service
 */

import { createLogger } from '../utils/logger.js';
import {
  UserProfile,
  WatchHistoryEntry,
  createUserProfile,
  addWatchHistoryEntry,
  updateGenrePreferences,
  addToWatchlist,
  removeFromWatchlist,
  likeContent,
  dislikeContent,
  calculateMoodTonePreferences,
  getRecentlyWatched,
  wasRecentlyWatched,
  serializeUserProfile,
  deserializeUserProfile
} from '../models/user-profile.js';
import { ALL_MOCK_CONTENT } from '../data/mock-content.js';

const logger = createLogger('UserService');

// ============================================================================
// User Service Class
// ============================================================================

export class UserService {
  private users = new Map<string, UserProfile>();
  private sessionToUser = new Map<string, string>(); // sessionId -> userId

  constructor() {
    logger.info('UserService initialized');
  }

  /**
   * Get or create user profile
   */
  getOrCreateUser(userId: string, displayName?: string): UserProfile {
    let profile = this.users.get(userId);

    if (!profile) {
      profile = createUserProfile(userId, displayName);
      this.users.set(userId, profile);
      logger.info('Created new user profile', { userId });
    }

    return profile;
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): UserProfile | null {
    return this.users.get(userId) || null;
  }

  /**
   * Associate session with user
   */
  associateSession(sessionId: string, userId: string): void {
    this.sessionToUser.set(sessionId, userId);
  }

  /**
   * Get user by session
   */
  getUserBySession(sessionId: string): UserProfile | null {
    const userId = this.sessionToUser.get(sessionId);
    return userId ? this.getUser(userId) : null;
  }

  /**
   * Record content watched
   */
  recordWatch(
    userId: string,
    contentId: string,
    options: {
      completionRate: number;
      rating?: number;
      mood?: 'unwind' | 'engage';
      tone?: 'laugh' | 'feel' | 'thrill' | 'think';
      wasRecommended?: boolean;
      sessionDuration?: number;
    }
  ): UserProfile {
    const profile = this.getOrCreateUser(userId);
    const content = ALL_MOCK_CONTENT.find(c => c.id === contentId);

    if (!content) {
      logger.warn('Content not found for watch record', { contentId });
      return profile;
    }

    const entry: Omit<WatchHistoryEntry, 'watchedAt'> = {
      contentId,
      title: content.title,
      completionRate: options.completionRate,
      rating: options.rating,
      mood: options.mood || content.mood,
      tone: options.tone || content.tone,
      wasRecommended: options.wasRecommended || false,
      sessionDuration: options.sessionDuration
    };

    let updatedProfile = addWatchHistoryEntry(profile, entry);

    // Update genre preferences if good completion
    if (options.completionRate > 0.5) {
      updatedProfile = updateGenrePreferences(
        updatedProfile,
        content.genres,
        options.rating
      );
    }

    // Recalculate mood/tone preferences
    const viewingPatterns = calculateMoodTonePreferences(updatedProfile);
    updatedProfile = {
      ...updatedProfile,
      preferences: {
        ...updatedProfile.preferences,
        viewingPatterns
      }
    };

    this.users.set(userId, updatedProfile);
    logger.info('Recorded watch', {
      userId,
      contentId,
      completionRate: options.completionRate
    });

    return updatedProfile;
  }

  /**
   * Rate content
   */
  rateContent(userId: string, contentId: string, rating: number): UserProfile {
    const profile = this.getOrCreateUser(userId);

    // Find and update the watch history entry
    const historyIndex = profile.watchHistory.findIndex(e => e.contentId === contentId);

    if (historyIndex >= 0) {
      const updatedHistory = [...profile.watchHistory];
      updatedHistory[historyIndex] = {
        ...updatedHistory[historyIndex],
        rating
      };

      const updatedProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
        watchHistory: updatedHistory
      };

      // Update genre preferences with the new rating
      const content = ALL_MOCK_CONTENT.find(c => c.id === contentId);
      if (content) {
        const finalProfile = updateGenrePreferences(updatedProfile, content.genres, rating);
        this.users.set(userId, finalProfile);
        return finalProfile;
      }

      this.users.set(userId, updatedProfile);
      return updatedProfile;
    }

    return profile;
  }

  /**
   * Add to watchlist
   */
  addToWatchlist(userId: string, contentId: string): UserProfile {
    const profile = this.getOrCreateUser(userId);
    const updatedProfile = addToWatchlist(profile, contentId);
    this.users.set(userId, updatedProfile);
    logger.debug('Added to watchlist', { userId, contentId });
    return updatedProfile;
  }

  /**
   * Remove from watchlist
   */
  removeFromWatchlist(userId: string, contentId: string): UserProfile {
    const profile = this.getOrCreateUser(userId);
    const updatedProfile = removeFromWatchlist(profile, contentId);
    this.users.set(userId, updatedProfile);
    logger.debug('Removed from watchlist', { userId, contentId });
    return updatedProfile;
  }

  /**
   * Like content
   */
  likeContent(userId: string, contentId: string): UserProfile {
    const profile = this.getOrCreateUser(userId);
    const updatedProfile = likeContent(profile, contentId);

    // Also update genre preferences
    const content = ALL_MOCK_CONTENT.find(c => c.id === contentId);
    if (content) {
      const finalProfile = updateGenrePreferences(updatedProfile, content.genres);
      this.users.set(userId, finalProfile);
      return finalProfile;
    }

    this.users.set(userId, updatedProfile);
    return updatedProfile;
  }

  /**
   * Dislike content
   */
  dislikeContent(userId: string, contentId: string): UserProfile {
    const profile = this.getOrCreateUser(userId);
    const updatedProfile = dislikeContent(profile, contentId);
    this.users.set(userId, updatedProfile);
    return updatedProfile;
  }

  /**
   * Get recently watched
   */
  getRecentlyWatched(userId: string, limit = 10): string[] {
    const profile = this.getUser(userId);
    return profile ? getRecentlyWatched(profile, limit) : [];
  }

  /**
   * Check if recently watched
   */
  wasRecentlyWatched(userId: string, contentId: string, daysAgo = 7): boolean {
    const profile = this.getUser(userId);
    return profile ? wasRecentlyWatched(profile, contentId, daysAgo) : false;
  }

  /**
   * Get user stats
   */
  getUserStats(userId: string): UserProfile['stats'] | null {
    const profile = this.getUser(userId);
    return profile?.stats || null;
  }

  /**
   * Get top genres for user
   */
  getTopGenres(userId: string, limit = 5): string[] {
    const profile = this.getUser(userId);
    if (!profile) return [];

    return profile.preferences.favoriteGenres
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit)
      .map(g => g.genre);
  }

  /**
   * Get personalization weights for a user
   * Used to adjust recommendation scores
   */
  getPersonalizationWeights(userId: string): {
    genreWeights: Map<string, number>;
    moodWeight: { unwind: number; engage: number };
    toneWeight: { laugh: number; feel: number; thrill: number; think: number };
    excludeIds: Set<string>;
  } {
    const profile = this.getUser(userId);

    const genreWeights = new Map<string, number>();
    const moodWeight = { unwind: 0.5, engage: 0.5 };
    const toneWeight = { laugh: 0.25, feel: 0.25, thrill: 0.25, think: 0.25 };
    const excludeIds = new Set<string>();

    if (!profile) {
      return { genreWeights, moodWeight, toneWeight, excludeIds };
    }

    // Build genre weights
    for (const gp of profile.preferences.favoriteGenres) {
      genreWeights.set(gp.genre, gp.weight);
    }

    // Get mood/tone from viewing patterns
    const patterns = profile.preferences.viewingPatterns;
    if (patterns.preferredMood) {
      moodWeight.unwind = patterns.preferredMood.unwind ?? 0.5;
      moodWeight.engage = patterns.preferredMood.engage ?? 0.5;
    }
    if (patterns.preferredTone) {
      toneWeight.laugh = patterns.preferredTone.laugh ?? 0.25;
      toneWeight.feel = patterns.preferredTone.feel ?? 0.25;
      toneWeight.thrill = patterns.preferredTone.thrill ?? 0.25;
      toneWeight.think = patterns.preferredTone.think ?? 0.25;
    }

    // Exclude recently watched and disliked
    for (const entry of profile.watchHistory.slice(0, 20)) {
      excludeIds.add(entry.contentId);
    }
    for (const id of profile.dislikedContent) {
      excludeIds.add(id);
    }

    return { genreWeights, moodWeight, toneWeight, excludeIds };
  }

  /**
   * Export user profile for backup
   */
  exportProfile(userId: string): string | null {
    const profile = this.getUser(userId);
    return profile ? serializeUserProfile(profile) : null;
  }

  /**
   * Import user profile from backup
   */
  importProfile(data: string): UserProfile {
    const profile = deserializeUserProfile(data);
    this.users.set(profile.userId, profile);
    logger.info('Imported user profile', { userId: profile.userId });
    return profile;
  }

  /**
   * Get all user IDs
   */
  getAllUserIds(): string[] {
    return Array.from(this.users.keys());
  }

  /**
   * Delete user profile
   */
  deleteUser(userId: string): boolean {
    const deleted = this.users.delete(userId);
    if (deleted) {
      logger.info('Deleted user profile', { userId });
    }
    return deleted;
  }
}

// ============================================================================
// Default Instance
// ============================================================================

let defaultUserService: UserService | undefined;

/**
 * Get default user service instance
 */
export function getUserService(): UserService {
  if (!defaultUserService) {
    defaultUserService = new UserService();
  }
  return defaultUserService;
}
