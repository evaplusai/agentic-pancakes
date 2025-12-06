/**
 * Demo User Data
 *
 * Pre-populated demo user with realistic watch history for testing
 * the French content discovery app.
 *
 * @module data/demo-users
 */

import { UserService } from '../services/user-service.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('DemoUsers');

// ============================================================================
// Demo User Configuration
// ============================================================================

export const DEMO_USER_ID = 'demo-user';
export const DEMO_USER_NAME = 'Marie';

/**
 * Initialize demo users with realistic watch history
 */
export function initializeDemoUsers(userService: UserService): void {
  logger.info('Initializing demo users');

  // Create Marie's profile
  const marie = userService.getOrCreateUser(DEMO_USER_ID, DEMO_USER_NAME);
  logger.info('Created demo user profile', { userId: marie.userId, displayName: marie.displayName });

  // ============================================================================
  // Watch History - Mix of completion rates and ratings
  // ============================================================================

  // 1. Les Intouchables - Fully watched, loved it
  userService.recordWatch(DEMO_USER_ID, 'fr-comedy-001', {
    completionRate: 1.0,
    rating: 5,
    mood: 'unwind',
    tone: 'laugh',
    wasRecommended: false,
    sessionDuration: 112
  });

  // 2. Amélie - Fully watched, favorite film
  userService.recordWatch(DEMO_USER_ID, 'fr-drama-001', {
    completionRate: 1.0,
    rating: 5,
    mood: 'unwind',
    tone: 'feel',
    wasRecommended: false,
    sessionDuration: 122
  });

  // 3. Lupin (series) - Binge watched, highly engaged
  userService.recordWatch(DEMO_USER_ID, 'fr-thriller-series-001', {
    completionRate: 0.95,
    rating: 5,
    mood: 'engage',
    tone: 'thrill',
    wasRecommended: true,
    sessionDuration: 180
  });

  // 4. Dix pour cent (Call My Agent!) - Currently watching
  userService.recordWatch(DEMO_USER_ID, 'fr-comedy-series-001', {
    completionRate: 0.6,
    rating: 4,
    mood: 'unwind',
    tone: 'laugh',
    wasRecommended: true,
    sessionDuration: 156
  });

  // 5. Bienvenue chez les Ch'tis - Fully watched, enjoyed
  userService.recordWatch(DEMO_USER_ID, 'fr-comedy-002', {
    completionRate: 1.0,
    rating: 4,
    mood: 'unwind',
    tone: 'laugh',
    wasRecommended: false,
    sessionDuration: 106
  });

  // 6. Le Bureau des Légendes - Started but didn't finish yet
  userService.recordWatch(DEMO_USER_ID, 'fr-think-series-001', {
    completionRate: 0.3,
    rating: 4,
    mood: 'engage',
    tone: 'think',
    wasRecommended: true,
    sessionDuration: 45
  });

  // 7. Les Choristes - Watched partially, emotional but good
  userService.recordWatch(DEMO_USER_ID, 'fr-drama-003', {
    completionRate: 0.85,
    rating: 4,
    mood: 'unwind',
    tone: 'feel',
    wasRecommended: false,
    sessionDuration: 82
  });

  // 8. Ne le dis à personne - Intense thriller, finished
  userService.recordWatch(DEMO_USER_ID, 'fr-thriller-001', {
    completionRate: 1.0,
    rating: 4,
    mood: 'engage',
    tone: 'thrill',
    wasRecommended: true,
    sessionDuration: 131
  });

  // 9. OSS 117 - Fun spy comedy, watched fully
  userService.recordWatch(DEMO_USER_ID, 'fr-comedy-005', {
    completionRate: 1.0,
    rating: 4,
    mood: 'unwind',
    tone: 'laugh',
    wasRecommended: false,
    sessionDuration: 99
  });

  // 10. Anatomie d'une chute - Recent watch, thought-provoking
  userService.recordWatch(DEMO_USER_ID, 'fr-think-005', {
    completionRate: 0.9,
    rating: 5,
    mood: 'engage',
    tone: 'think',
    wasRecommended: true,
    sessionDuration: 135
  });

  // ============================================================================
  // Watchlist - Mix of genres and moods
  // ============================================================================

  userService.addToWatchlist(DEMO_USER_ID, 'fr-drama-002'); // La Vie en Rose
  userService.addToWatchlist(DEMO_USER_ID, 'fr-thriller-002'); // La Haine
  userService.addToWatchlist(DEMO_USER_ID, 'fr-think-001'); // Entre les murs
  userService.addToWatchlist(DEMO_USER_ID, 'fr-comedy-004'); // Qu'est-ce qu'on a fait au Bon Dieu?
  userService.addToWatchlist(DEMO_USER_ID, 'fr-thriller-series-002'); // Engrenages

  // ============================================================================
  // Liked Content
  // ============================================================================

  userService.likeContent(DEMO_USER_ID, 'fr-comedy-001'); // Les Intouchables
  userService.likeContent(DEMO_USER_ID, 'fr-drama-001'); // Amélie
  userService.likeContent(DEMO_USER_ID, 'fr-thriller-series-001'); // Lupin
  userService.likeContent(DEMO_USER_ID, 'fr-think-005'); // Anatomie d'une chute

  // ============================================================================
  // Log Summary
  // ============================================================================

  const updatedProfile = userService.getUser(DEMO_USER_ID);
  if (updatedProfile) {
    logger.info('Demo user initialized with watch history', {
      userId: DEMO_USER_ID,
      totalWatches: updatedProfile.watchHistory.length,
      watchlistItems: updatedProfile.watchlist.length,
      likedItems: updatedProfile.likedContent.length,
      topGenres: updatedProfile.preferences.favoriteGenres
        .slice(0, 3)
        .map(g => `${g.genre} (${g.weight.toFixed(2)})`)
    });
  }

  logger.info('Demo users initialization complete');
}

/**
 * Get demo user profile
 */
export function getDemoUser(userService: UserService) {
  return userService.getUser(DEMO_USER_ID);
}

/**
 * Reset demo user (clear all data and reinitialize)
 */
export function resetDemoUser(userService: UserService): void {
  logger.info('Resetting demo user');
  userService.deleteUser(DEMO_USER_ID);
  initializeDemoUsers(userService);
}
