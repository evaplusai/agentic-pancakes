/**
 * Demo User Data
 *
 * Pre-populated demo user with realistic watch history for testing
 * the content discovery app with US/English content.
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
export const DEMO_USER_NAME = 'Alex';

/**
 * Initialize demo users with realistic watch history
 */
export function initializeDemoUsers(userService: UserService): void {
  logger.info('Initializing demo users');

  // Create Alex's profile
  const alex = userService.getOrCreateUser(DEMO_USER_ID, DEMO_USER_NAME);
  logger.info('Created demo user profile', { userId: alex.userId, displayName: alex.displayName });

  // ============================================================================
  // Watch History - Mix of completion rates and ratings
  // ============================================================================

  // 1. The Grand Budapest Hotel - Fully watched, loved it
  userService.recordWatch(DEMO_USER_ID, 'comedy-001', {
    completionRate: 1.0,
    rating: 5,
    mood: 'unwind',
    tone: 'laugh',
    wasRecommended: false,
    sessionDuration: 99
  });

  // 2. The Shawshank Redemption - Fully watched, all-time favorite
  userService.recordWatch(DEMO_USER_ID, 'drama-001', {
    completionRate: 1.0,
    rating: 5,
    mood: 'unwind',
    tone: 'feel',
    wasRecommended: false,
    sessionDuration: 142
  });

  // 3. Breaking Bad (series) - Binge watched, highly engaged
  userService.recordWatch(DEMO_USER_ID, 'thriller-series-001', {
    completionRate: 0.95,
    rating: 5,
    mood: 'engage',
    tone: 'thrill',
    wasRecommended: true,
    sessionDuration: 180
  });

  // 4. The Office (series) - Currently watching
  userService.recordWatch(DEMO_USER_ID, 'comedy-series-001', {
    completionRate: 0.6,
    rating: 5,
    mood: 'unwind',
    tone: 'laugh',
    wasRecommended: true,
    sessionDuration: 156
  });

  // 5. The Dark Knight - Fully watched, loved it
  userService.recordWatch(DEMO_USER_ID, 'thriller-001', {
    completionRate: 1.0,
    rating: 5,
    mood: 'engage',
    tone: 'thrill',
    wasRecommended: false,
    sessionDuration: 152
  });

  // 6. Black Mirror (series) - Started but didn't finish yet
  userService.recordWatch(DEMO_USER_ID, 'think-series-001', {
    completionRate: 0.4,
    rating: 4,
    mood: 'engage',
    tone: 'think',
    wasRecommended: true,
    sessionDuration: 60
  });

  // 7. Ted Lasso - Watched, emotional but uplifting
  userService.recordWatch(DEMO_USER_ID, 'drama-series-002', {
    completionRate: 0.85,
    rating: 5,
    mood: 'unwind',
    tone: 'feel',
    wasRecommended: false,
    sessionDuration: 90
  });

  // 8. Inception - Mind-bending thriller, loved it
  userService.recordWatch(DEMO_USER_ID, 'thriller-002', {
    completionRate: 1.0,
    rating: 5,
    mood: 'engage',
    tone: 'thrill',
    wasRecommended: true,
    sessionDuration: 148
  });

  // 9. Knives Out - Fun mystery comedy
  userService.recordWatch(DEMO_USER_ID, 'comedy-005', {
    completionRate: 1.0,
    rating: 4,
    mood: 'unwind',
    tone: 'laugh',
    wasRecommended: false,
    sessionDuration: 130
  });

  // 10. Everything Everywhere All at Once - Recent watch, mind-blowing
  userService.recordWatch(DEMO_USER_ID, 'think-005', {
    completionRate: 1.0,
    rating: 5,
    mood: 'engage',
    tone: 'think',
    wasRecommended: true,
    sessionDuration: 139
  });

  // ============================================================================
  // Watchlist - Mix of genres and moods
  // ============================================================================

  userService.addToWatchlist(DEMO_USER_ID, 'drama-003'); // The Notebook
  userService.addToWatchlist(DEMO_USER_ID, 'thriller-003'); // John Wick
  userService.addToWatchlist(DEMO_USER_ID, 'think-002'); // Interstellar
  userService.addToWatchlist(DEMO_USER_ID, 'comedy-003'); // The Hangover
  userService.addToWatchlist(DEMO_USER_ID, 'thriller-series-003'); // The Last of Us

  // ============================================================================
  // Liked Content
  // ============================================================================

  userService.likeContent(DEMO_USER_ID, 'comedy-001'); // The Grand Budapest Hotel
  userService.likeContent(DEMO_USER_ID, 'drama-001'); // The Shawshank Redemption
  userService.likeContent(DEMO_USER_ID, 'thriller-series-001'); // Breaking Bad
  userService.likeContent(DEMO_USER_ID, 'think-005'); // Everything Everywhere All at Once

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
