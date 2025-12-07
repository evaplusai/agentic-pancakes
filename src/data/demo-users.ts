/**
 * Demo User Data
 *
 * Pre-populated demo users with distinct viewing personas for testing
 * the content discovery app with US/English content.
 *
 * @module data/demo-users
 */

import { UserService } from '../services/user-service.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('DemoUsers');

// ============================================================================
// Demo User Personas - 5 Distinct Types
// ============================================================================

export interface DemoUserPersona {
  id: string;
  name: string;
  avatar: string;
  description: string;
  primaryMood: 'unwind' | 'engage';
  primaryTones: string[];
  favoriteGenres: string[];
  watchingStyle: string;
}

export const DEMO_USERS: DemoUserPersona[] = [
  {
    id: 'alex-explorer',
    name: 'Alex',
    avatar: '🧭',
    description: 'The Explorer - Loves discovering hidden gems across all genres',
    primaryMood: 'engage',
    primaryTones: ['think', 'thrill'],
    favoriteGenres: ['Sci-Fi', 'Documentary', 'Thriller', 'Drama'],
    watchingStyle: 'Eclectic taste, high completion rates'
  },
  {
    id: 'maya-binger',
    name: 'Maya',
    avatar: '📺',
    description: 'The Binge Watcher - Series enthusiast, weekend marathons',
    primaryMood: 'unwind',
    primaryTones: ['feel', 'laugh'],
    favoriteGenres: ['Drama', 'Comedy', 'Romance', 'Reality'],
    watchingStyle: 'Prefers series over movies, emotional stories'
  },
  {
    id: 'jake-action',
    name: 'Jake',
    avatar: '💥',
    description: 'The Thrill Seeker - Action, suspense, edge-of-seat content',
    primaryMood: 'engage',
    primaryTones: ['thrill'],
    favoriteGenres: ['Action', 'Thriller', 'Horror', 'Crime'],
    watchingStyle: 'High-energy content, late night viewer'
  },
  {
    id: 'sofia-chill',
    name: 'Sofia',
    avatar: '🌙',
    description: 'The Relaxer - Light comedies, feel-good content after work',
    primaryMood: 'unwind',
    primaryTones: ['laugh', 'feel'],
    favoriteGenres: ['Comedy', 'Romance', 'Animation', 'Family'],
    watchingStyle: 'Evening wind-down, comfort rewatches'
  },
  {
    id: 'test-user',
    name: 'Guest',
    avatar: '👤',
    description: 'New User - Fresh profile, no watch history',
    primaryMood: 'unwind',
    primaryTones: ['laugh', 'feel', 'thrill', 'think'],
    favoriteGenres: [],
    watchingStyle: 'New to the platform'
  }
];

// Default user for backward compatibility
export const DEMO_USER_ID = 'alex-explorer';
export const DEMO_USER_NAME = 'Alex';

/**
 * Initialize all demo users with distinct watch histories
 */
export function initializeDemoUsers(userService: UserService): void {
  logger.info('Initializing demo users');

  // ============================================================================
  // ALEX - The Explorer (eclectic taste, documentaries, sci-fi, thrillers)
  // ============================================================================
  const alex = userService.getOrCreateUser('alex-explorer', 'Alex');
  logger.info('Created Alex profile', { userId: alex.userId });

  // Alex's watch history - diverse genres, high completion
  userService.recordWatch('alex-explorer', 'think-001', { completionRate: 1.0, rating: 5, mood: 'engage', tone: 'think', wasRecommended: false, sessionDuration: 169 });
  userService.recordWatch('alex-explorer', 'thriller-002', { completionRate: 1.0, rating: 5, mood: 'engage', tone: 'thrill', wasRecommended: true, sessionDuration: 148 });
  userService.recordWatch('alex-explorer', 'think-series-001', { completionRate: 0.85, rating: 5, mood: 'engage', tone: 'think', wasRecommended: true, sessionDuration: 120 });
  userService.recordWatch('alex-explorer', 'drama-001', { completionRate: 1.0, rating: 5, mood: 'unwind', tone: 'feel', wasRecommended: false, sessionDuration: 142 });
  userService.recordWatch('alex-explorer', 'think-005', { completionRate: 1.0, rating: 5, mood: 'engage', tone: 'think', wasRecommended: true, sessionDuration: 139 });
  userService.recordWatch('alex-explorer', 'thriller-series-001', { completionRate: 0.95, rating: 5, mood: 'engage', tone: 'thrill', wasRecommended: true, sessionDuration: 180 });
  userService.addToWatchlist('alex-explorer', 'think-002');
  userService.addToWatchlist('alex-explorer', 'thriller-003');
  userService.likeContent('alex-explorer', 'think-001');
  userService.likeContent('alex-explorer', 'thriller-002');

  // ============================================================================
  // MAYA - The Binge Watcher (series lover, drama, emotional content)
  // ============================================================================
  const maya = userService.getOrCreateUser('maya-binger', 'Maya');
  logger.info('Created Maya profile', { userId: maya.userId });

  // Maya's watch history - series-heavy, emotional content
  userService.recordWatch('maya-binger', 'drama-series-001', { completionRate: 1.0, rating: 5, mood: 'unwind', tone: 'feel', wasRecommended: false, sessionDuration: 420 });
  userService.recordWatch('maya-binger', 'drama-series-002', { completionRate: 1.0, rating: 5, mood: 'unwind', tone: 'feel', wasRecommended: true, sessionDuration: 300 });
  userService.recordWatch('maya-binger', 'comedy-series-001', { completionRate: 0.9, rating: 5, mood: 'unwind', tone: 'laugh', wasRecommended: true, sessionDuration: 360 });
  userService.recordWatch('maya-binger', 'romance-001', { completionRate: 1.0, rating: 4, mood: 'unwind', tone: 'feel', wasRecommended: false, sessionDuration: 125 });
  userService.recordWatch('maya-binger', 'drama-001', { completionRate: 1.0, rating: 5, mood: 'unwind', tone: 'feel', wasRecommended: false, sessionDuration: 142 });
  userService.recordWatch('maya-binger', 'comedy-series-002', { completionRate: 0.7, rating: 4, mood: 'unwind', tone: 'laugh', wasRecommended: true, sessionDuration: 240 });
  userService.addToWatchlist('maya-binger', 'drama-series-003');
  userService.addToWatchlist('maya-binger', 'romance-002');
  userService.addToWatchlist('maya-binger', 'drama-003');
  userService.likeContent('maya-binger', 'drama-series-001');
  userService.likeContent('maya-binger', 'drama-series-002');
  userService.likeContent('maya-binger', 'drama-001');

  // ============================================================================
  // JAKE - The Thrill Seeker (action, horror, crime, late-night viewer)
  // ============================================================================
  const jake = userService.getOrCreateUser('jake-action', 'Jake');
  logger.info('Created Jake profile', { userId: jake.userId });

  // Jake's watch history - action-heavy, high-energy
  userService.recordWatch('jake-action', 'thriller-001', { completionRate: 1.0, rating: 5, mood: 'engage', tone: 'thrill', wasRecommended: false, sessionDuration: 152 });
  userService.recordWatch('jake-action', 'action-001', { completionRate: 1.0, rating: 5, mood: 'engage', tone: 'thrill', wasRecommended: true, sessionDuration: 137 });
  userService.recordWatch('jake-action', 'action-002', { completionRate: 1.0, rating: 4, mood: 'engage', tone: 'thrill', wasRecommended: true, sessionDuration: 129 });
  userService.recordWatch('jake-action', 'horror-001', { completionRate: 0.95, rating: 4, mood: 'engage', tone: 'thrill', wasRecommended: false, sessionDuration: 108 });
  userService.recordWatch('jake-action', 'thriller-series-001', { completionRate: 1.0, rating: 5, mood: 'engage', tone: 'thrill', wasRecommended: true, sessionDuration: 180 });
  userService.recordWatch('jake-action', 'crime-001', { completionRate: 1.0, rating: 4, mood: 'engage', tone: 'thrill', wasRecommended: false, sessionDuration: 148 });
  userService.recordWatch('jake-action', 'action-series-001', { completionRate: 0.8, rating: 5, mood: 'engage', tone: 'thrill', wasRecommended: true, sessionDuration: 200 });
  userService.addToWatchlist('jake-action', 'action-003');
  userService.addToWatchlist('jake-action', 'thriller-004');
  userService.addToWatchlist('jake-action', 'horror-002');
  userService.likeContent('jake-action', 'thriller-001');
  userService.likeContent('jake-action', 'action-001');
  userService.likeContent('jake-action', 'thriller-series-001');

  // ============================================================================
  // SOFIA - The Relaxer (comedies, feel-good, evening wind-down)
  // ============================================================================
  const sofia = userService.getOrCreateUser('sofia-chill', 'Sofia');
  logger.info('Created Sofia profile', { userId: sofia.userId });

  // Sofia's watch history - light content, comfort rewatches
  userService.recordWatch('sofia-chill', 'comedy-001', { completionRate: 1.0, rating: 5, mood: 'unwind', tone: 'laugh', wasRecommended: false, sessionDuration: 99 });
  userService.recordWatch('sofia-chill', 'comedy-002', { completionRate: 1.0, rating: 4, mood: 'unwind', tone: 'laugh', wasRecommended: true, sessionDuration: 96 });
  userService.recordWatch('sofia-chill', 'romance-001', { completionRate: 1.0, rating: 5, mood: 'unwind', tone: 'feel', wasRecommended: false, sessionDuration: 125 });
  userService.recordWatch('sofia-chill', 'animation-001', { completionRate: 1.0, rating: 5, mood: 'unwind', tone: 'laugh', wasRecommended: true, sessionDuration: 100 });
  userService.recordWatch('sofia-chill', 'comedy-series-001', { completionRate: 0.95, rating: 5, mood: 'unwind', tone: 'laugh', wasRecommended: true, sessionDuration: 320 });
  userService.recordWatch('sofia-chill', 'family-001', { completionRate: 1.0, rating: 4, mood: 'unwind', tone: 'feel', wasRecommended: false, sessionDuration: 118 });
  userService.recordWatch('sofia-chill', 'comedy-005', { completionRate: 1.0, rating: 4, mood: 'unwind', tone: 'laugh', wasRecommended: true, sessionDuration: 130 });
  userService.addToWatchlist('sofia-chill', 'comedy-003');
  userService.addToWatchlist('sofia-chill', 'animation-002');
  userService.addToWatchlist('sofia-chill', 'romance-002');
  userService.likeContent('sofia-chill', 'comedy-001');
  userService.likeContent('sofia-chill', 'comedy-series-001');
  userService.likeContent('sofia-chill', 'animation-001');

  // ============================================================================
  // GUEST - New User (empty profile for testing cold start)
  // ============================================================================
  userService.getOrCreateUser('test-user', 'Guest');
  logger.info('Created Guest profile (empty)');

  // ============================================================================
  // Log Summary
  // ============================================================================
  logger.info('All demo users initialized', {
    users: DEMO_USERS.map(u => ({ id: u.id, name: u.name }))
  });
}

/**
 * Get all demo user personas
 */
export function getDemoUserPersonas(): DemoUserPersona[] {
  return DEMO_USERS;
}

/**
 * Get demo user profile by ID
 */
export function getDemoUser(userService: UserService, userId?: string) {
  return userService.getUser(userId || DEMO_USER_ID);
}

/**
 * Get demo user persona by ID
 */
export function getDemoUserPersona(userId: string): DemoUserPersona | undefined {
  return DEMO_USERS.find(u => u.id === userId);
}

/**
 * Reset all demo users (clear all data and reinitialize)
 */
export function resetDemoUsers(userService: UserService): void {
  logger.info('Resetting all demo users');
  DEMO_USERS.forEach(user => {
    userService.deleteUser(user.id);
  });
  initializeDemoUsers(userService);
}
