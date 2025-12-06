# UI Personalization Implementation Plan

## Architecture Overview

This document provides a detailed plan for implementing personalized UI features in the TV5MONDE recommendation system. The plan integrates seamlessly with the existing quiz flow while adding Netflix-style personalization sections.

---

## Current State Analysis

### Existing Structure (`public/index.html`)
- **Single-page application** with screen-based navigation
- **5 screens**: Welcome → Mood → Tone → Format → Processing → Result
- **Inline styles** (~350 lines) with gradient theme (dark purple/blue)
- **Vanilla JavaScript** (~200 lines) with simple state management
- **Mock data fallback** when API unavailable
- **Responsive design** with mobile-first approach

### Available Backend APIs
Based on code analysis:
- `UserService` with profile management
- `WatchHistory` tracking with completion rates
- `Watchlist` management
- `Genre preferences` with weights
- `Mood/tone tracking` from viewing patterns
- `User stats` (totalWatched, totalMinutes, avgRating)

---

## Section 1: User Profile Header

### HTML Structure
```html
<!-- Insert after logo, before screens -->
<div id="user-profile-header" class="profile-header" style="display: none;">
  <div class="profile-container">
    <div class="profile-avatar">
      <div class="avatar-circle" id="user-avatar">
        <span id="avatar-initials">U</span>
      </div>
      <div class="profile-stats-badge">
        <span id="profile-badge-count">0</span>
      </div>
    </div>

    <div class="profile-info">
      <h3 class="profile-name" id="profile-name">Guest User</h3>
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value" id="stat-watched">0</span>
          <span class="stat-label">Watched</span>
        </div>
        <div class="stat-separator">•</div>
        <div class="stat-item">
          <span class="stat-value" id="stat-hours">0h</span>
          <span class="stat-label">Hours</span>
        </div>
        <div class="stat-separator">•</div>
        <div class="stat-item">
          <span class="stat-value" id="stat-streak">0</span>
          <span class="stat-label">Day Streak</span>
        </div>
      </div>
      <div class="profile-genres" id="top-genres">
        <!-- Dynamic genre tags -->
      </div>
    </div>

    <button class="profile-menu-btn" onclick="toggleProfileMenu()">
      <span>⚙️</span>
    </button>
  </div>
</div>
```

### CSS Styling
```css
.profile-header {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  position: relative;
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.profile-stats-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #4caf50;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid #1a1a2e;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #e91e63;
}

.stat-label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-separator {
  color: #444;
  font-size: 12px;
}

.profile-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.profile-genre-tag {
  background: rgba(233, 30, 99, 0.15);
  border: 1px solid rgba(233, 30, 99, 0.3);
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  color: #e91e63;
}

.profile-menu-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.profile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #e91e63;
}
```

### JavaScript API Integration
```javascript
// Add to app.js
let currentUser = null;

async function loadUserProfile(userId = 'demo-user') {
  try {
    const response = await fetch(`/api/users/${userId}/profile`);
    if (!response.ok) throw new Error('Profile not found');

    const profile = await response.json();
    currentUser = profile;

    // Update UI
    updateProfileHeader(profile);
    document.getElementById('user-profile-header').style.display = 'block';

    return profile;
  } catch (error) {
    console.error('Failed to load profile:', error);
    // Show guest profile
    showGuestProfile();
  }
}

function updateProfileHeader(profile) {
  // Avatar initials
  const initials = profile.displayName
    ? profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';
  document.getElementById('avatar-initials').textContent = initials;

  // Profile name
  document.getElementById('profile-name').textContent = profile.displayName || 'Guest User';

  // Stats
  document.getElementById('stat-watched').textContent = profile.stats.totalWatched;
  const hours = Math.floor(profile.stats.totalMinutes / 60);
  document.getElementById('stat-hours').textContent = `${hours}h`;
  document.getElementById('profile-badge-count').textContent = profile.stats.totalWatched;

  // Top genres
  const topGenres = profile.preferences.favoriteGenres
    .slice(0, 3)
    .map(g => `<span class="profile-genre-tag">${g.genre}</span>`)
    .join('');
  document.getElementById('top-genres').innerHTML = topGenres;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  loadUserProfile('demo-user');
});
```

### Integration with Quiz Flow
- **Header persists** across all screens (position: sticky optional)
- **Updates dynamically** when user completes quiz (increment stats)
- **Collapsible on mobile** - shrinks to avatar only below 640px

---

## Section 2: Continue Watching Carousel

### HTML Structure
```html
<!-- Insert as new screen or section before welcome -->
<div id="section-continue-watching" class="personalized-section">
  <div class="section-header">
    <h2 class="section-title">Continue Watching</h2>
    <button class="section-nav-btn" onclick="scrollCarousel('continue', -1)">‹</button>
    <button class="section-nav-btn" onclick="scrollCarousel('continue', 1)">›</button>
  </div>

  <div class="carousel-container">
    <div class="carousel-track" id="continue-carousel">
      <!-- Dynamic content cards -->
    </div>
  </div>
</div>
```

### Content Card Template
```html
<div class="content-card continue-card">
  <div class="card-poster" data-content-id="${contentId}">
    <div class="card-poster-emoji">${emoji}</div>
    <div class="progress-bar-overlay">
      <div class="progress-bar-fill" style="width: ${completionRate}%"></div>
    </div>
    <div class="card-badge">
      <span>${Math.round(completionRate)}%</span>
    </div>
  </div>
  <div class="card-info">
    <h4 class="card-title">${title}</h4>
    <p class="card-meta">${runtime} • ${year}</p>
  </div>
  <button class="card-action-btn" onclick="resumeContent('${contentId}')">
    ▶ Resume
  </button>
</div>
```

### CSS Styling
```css
.personalized-section {
  margin-bottom: 50px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.section-nav-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.section-nav-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #e91e63;
}

.carousel-container {
  overflow-x: hidden;
  position: relative;
}

.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 10px;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.content-card {
  flex: 0 0 280px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.content-card:hover {
  transform: translateY(-8px);
  border-color: #e91e63;
  box-shadow: 0 12px 40px rgba(233, 30, 99, 0.3);
}

.card-poster {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-poster-emoji {
  font-size: 64px;
}

.progress-bar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.progress-bar-fill {
  height: 100%;
  background: #e91e63;
  transition: width 0.3s ease;
}

.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

.card-info {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 12px;
  color: #888;
}

.card-action-btn {
  width: 100%;
  background: rgba(233, 30, 99, 0.15);
  border: 1px solid rgba(233, 30, 99, 0.3);
  border-radius: 0;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #e91e63;
  cursor: pointer;
  transition: all 0.2s;
}

.card-action-btn:hover {
  background: rgba(233, 30, 99, 0.25);
  border-color: #e91e63;
}
```

### JavaScript API Integration
```javascript
async function loadContinueWatching(userId) {
  try {
    const response = await fetch(`/api/users/${userId}/continue-watching`);
    if (!response.ok) throw new Error('Failed to load');

    const items = await response.json();

    if (items.length === 0) {
      document.getElementById('section-continue-watching').style.display = 'none';
      return;
    }

    renderContinueWatching(items);
    document.getElementById('section-continue-watching').style.display = 'block';
  } catch (error) {
    console.error('Continue watching error:', error);
  }
}

function renderContinueWatching(items) {
  const carousel = document.getElementById('continue-carousel');

  const html = items
    .filter(item => item.completionRate > 0 && item.completionRate < 0.95)
    .slice(0, 10)
    .map(item => `
      <div class="content-card continue-card">
        <div class="card-poster" onclick="resumeContent('${item.contentId}')">
          <div class="card-poster-emoji">${item.emoji || '🎬'}</div>
          <div class="progress-bar-overlay">
            <div class="progress-bar-fill" style="width: ${item.completionRate * 100}%"></div>
          </div>
          <div class="card-badge">
            <span>${Math.round(item.completionRate * 100)}%</span>
          </div>
        </div>
        <div class="card-info">
          <h4 class="card-title">${item.title}</h4>
          <p class="card-meta">${item.runtime} • ${item.year}</p>
        </div>
        <button class="card-action-btn" onclick="resumeContent('${item.contentId}')">
          ▶ Resume
        </button>
      </div>
    `).join('');

  carousel.innerHTML = html;
}

function scrollCarousel(carouselId, direction) {
  const carousel = document.getElementById(`${carouselId}-carousel`);
  const scrollAmount = 300 * direction;
  carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

async function resumeContent(contentId) {
  // Track resume action
  await fetch(`/api/users/${currentUser.userId}/watch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentId,
      action: 'resume',
      timestamp: new Date().toISOString()
    })
  });

  // Open player or navigate to content
  watchNow(contentId);
}
```

### Backend Endpoint Needed
```typescript
// New endpoint: GET /api/users/:userId/continue-watching
// Returns: WatchHistoryEntry[] with completionRate between 0.05 and 0.95
// Sorted by watchedAt DESC
```

---

## Section 3: "Because You Watched X" Recommendations

### HTML Structure
```html
<div id="section-because-you-watched" class="personalized-section">
  <div class="section-header">
    <h2 class="section-title">
      Because you watched
      <span class="highlight-title" id="watched-title">Minuit à Paris</span>
    </h2>
    <div class="section-nav-btns">
      <button class="section-nav-btn" onclick="scrollCarousel('because', -1)">‹</button>
      <button class="section-nav-btn" onclick="scrollCarousel('because', 1)">›</button>
    </div>
  </div>

  <div class="carousel-container">
    <div class="carousel-track" id="because-carousel">
      <!-- Similar content cards -->
    </div>
  </div>
</div>
```

### CSS Additions
```css
.highlight-title {
  color: #e91e63;
  font-style: italic;
}

.match-percentage {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #4caf50;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}
```

### JavaScript Implementation
```javascript
async function loadBecauseYouWatched(userId) {
  try {
    // Get user's most recent highly-rated watch
    const profile = currentUser || await loadUserProfile(userId);
    const recentWatch = profile.watchHistory
      .filter(w => w.completionRate > 0.7 && (w.rating || 0) >= 4)
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))[0];

    if (!recentWatch) return;

    // Fetch similar content
    const response = await fetch(`/api/recommend/similar/${recentWatch.contentId}?limit=10`);
    const recommendations = await response.json();

    // Update title
    document.getElementById('watched-title').textContent = recentWatch.title;

    // Render carousel
    renderSimilarContent(recommendations);
    document.getElementById('section-because-you-watched').style.display = 'block';
  } catch (error) {
    console.error('Similar content error:', error);
  }
}

function renderSimilarContent(items) {
  const carousel = document.getElementById('because-carousel');

  const html = items.map(item => `
    <div class="content-card">
      <div class="card-poster" onclick="viewContent('${item.id}')">
        <div class="card-poster-emoji">${item.emoji || '🎬'}</div>
        <div class="match-percentage">${item.match}% Match</div>
        ${item.trending ? '<div class="trending-badge">🔥 Trending</div>' : ''}
      </div>
      <div class="card-info">
        <h4 class="card-title">${item.title}</h4>
        <p class="card-meta">${item.runtime} • ${item.year}</p>
        <div class="card-genres">
          ${item.genres.slice(0, 2).map(g => `<span class="genre-tag-mini">${g}</span>`).join('')}
        </div>
      </div>
      <div class="card-actions">
        <button class="card-action-btn" onclick="watchNow('${item.id}')">Watch</button>
        <button class="card-icon-btn" onclick="addToWatchlist('${item.id}')">+</button>
      </div>
    </div>
  `).join('');

  carousel.innerHTML = html;
}
```

### Backend Endpoint Needed
```typescript
// New endpoint: GET /api/recommend/similar/:contentId
// Uses vectorizer to find similar content based on:
// - Genre overlap
// - Mood/tone match
// - Collaborative filtering (users who watched X also watched Y)
```

---

## Section 4: Your Watchlist

### HTML Structure
```html
<div id="section-watchlist" class="personalized-section">
  <div class="section-header">
    <h2 class="section-title">Your Watchlist</h2>
    <span class="section-subtitle" id="watchlist-count">0 items</span>
  </div>

  <div class="watchlist-grid" id="watchlist-grid">
    <!-- Grid of watchlist items -->
  </div>

  <button class="show-more-btn" id="watchlist-show-more" onclick="loadMoreWatchlist()">
    Show More
  </button>
</div>
```

### CSS Styling
```css
.section-subtitle {
  color: #888;
  font-size: 14px;
  font-weight: 400;
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.watchlist-card {
  position: relative;
}

.watchlist-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.watchlist-card:hover .watchlist-remove-btn {
  opacity: 1;
}

.show-more-btn {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: block;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.show-more-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #e91e63;
}
```

### JavaScript Implementation
```javascript
let watchlistPage = 0;
const watchlistPageSize = 8;

async function loadWatchlist(userId, page = 0) {
  try {
    const response = await fetch(`/api/users/${userId}/watchlist`);
    const watchlist = await response.json();

    if (watchlist.length === 0) {
      document.getElementById('section-watchlist').style.display = 'none';
      return;
    }

    document.getElementById('watchlist-count').textContent = `${watchlist.length} items`;

    const startIdx = page * watchlistPageSize;
    const endIdx = startIdx + watchlistPageSize;
    const pageItems = watchlist.slice(startIdx, endIdx);

    renderWatchlist(pageItems, page === 0);

    // Show/hide "Show More" button
    const showMoreBtn = document.getElementById('watchlist-show-more');
    showMoreBtn.style.display = endIdx < watchlist.length ? 'block' : 'none';

    document.getElementById('section-watchlist').style.display = 'block';
  } catch (error) {
    console.error('Watchlist error:', error);
  }
}

function renderWatchlist(items, replace = true) {
  const grid = document.getElementById('watchlist-grid');

  const html = items.map(item => `
    <div class="content-card watchlist-card">
      <button class="watchlist-remove-btn" onclick="removeFromWatchlist('${item.id}')">
        ✕
      </button>
      <div class="card-poster" onclick="viewContent('${item.id}')">
        <div class="card-poster-emoji">${item.emoji || '🎬'}</div>
      </div>
      <div class="card-info">
        <h4 class="card-title">${item.title}</h4>
        <p class="card-meta">${item.runtime} • ${item.year}</p>
      </div>
      <button class="card-action-btn" onclick="watchNow('${item.id}')">
        ▶ Watch Now
      </button>
    </div>
  `).join('');

  if (replace) {
    grid.innerHTML = html;
  } else {
    grid.innerHTML += html;
  }
}

function loadMoreWatchlist() {
  watchlistPage++;
  loadWatchlist(currentUser.userId, watchlistPage);
}

async function addToWatchlist(contentId) {
  try {
    await fetch(`/api/users/${currentUser.userId}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId })
    });

    // Show success feedback
    showToast('Added to watchlist');

    // Refresh watchlist
    watchlistPage = 0;
    await loadWatchlist(currentUser.userId);
  } catch (error) {
    console.error('Add to watchlist error:', error);
    showToast('Failed to add to watchlist', 'error');
  }
}

async function removeFromWatchlist(contentId) {
  try {
    await fetch(`/api/users/${currentUser.userId}/watchlist/${contentId}`, {
      method: 'DELETE'
    });

    showToast('Removed from watchlist');

    // Refresh watchlist
    watchlistPage = 0;
    await loadWatchlist(currentUser.userId);
  } catch (error) {
    console.error('Remove from watchlist error:', error);
  }
}

// Toast notification helper
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-visible');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

---

## Section 5: Semantic Text Search

### HTML Structure
```html
<!-- Insert before welcome screen -->
<div id="section-search" class="search-section">
  <div class="search-container">
    <div class="search-icon">🔍</div>
    <input
      type="text"
      id="search-input"
      class="search-input"
      placeholder="Describe what you want to watch..."
      onkeyup="handleSearchInput(event)"
    />
    <button class="search-clear-btn" id="search-clear" onclick="clearSearch()" style="display: none;">
      ✕
    </button>
  </div>

  <div id="search-suggestions" class="search-suggestions" style="display: none;">
    <!-- Quick suggestions -->
  </div>

  <div id="search-results" class="search-results" style="display: none;">
    <div class="section-header">
      <h3 class="section-title">Search Results</h3>
      <span class="section-subtitle" id="search-count">0 results</span>
    </div>
    <div class="search-results-grid" id="search-results-grid">
      <!-- Results -->
    </div>
  </div>
</div>
```

### CSS Styling
```css
.search-section {
  margin-bottom: 40px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px 20px;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  background: rgba(255, 255, 255, 0.08);
  border-color: #e91e63;
  box-shadow: 0 4px 20px rgba(233, 30, 99, 0.2);
}

.search-icon {
  font-size: 24px;
  margin-right: 12px;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: white;
  font-family: inherit;
}

.search-input::placeholder {
  color: #666;
}

.search-clear-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.search-clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.search-suggestions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  background: rgba(233, 30, 99, 0.15);
  border: 1px solid rgba(233, 30, 99, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  color: #e91e63;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: rgba(233, 30, 99, 0.25);
  border-color: #e91e63;
}

.search-results {
  margin-top: 30px;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
```

### JavaScript Implementation
```javascript
let searchTimeout = null;

function handleSearchInput(event) {
  const query = event.target.value.trim();
  const clearBtn = document.getElementById('search-clear');

  // Show/hide clear button
  clearBtn.style.display = query.length > 0 ? 'block' : 'none';

  // Handle Enter key
  if (event.key === 'Enter' && query.length > 0) {
    performSearch(query);
    return;
  }

  // Debounced search
  clearTimeout(searchTimeout);

  if (query.length >= 3) {
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 500);
  } else {
    hideSearchResults();
    showSearchSuggestions();
  }
}

async function performSearch(query) {
  try {
    hideSearchSuggestions();

    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        userId: currentUser?.userId,
        limit: 20
      })
    });

    const results = await response.json();

    displaySearchResults(results, query);
  } catch (error) {
    console.error('Search error:', error);
  }
}

function displaySearchResults(results, query) {
  const resultsSection = document.getElementById('search-results');
  const resultsGrid = document.getElementById('search-results-grid');
  const countSpan = document.getElementById('search-count');

  if (results.length === 0) {
    resultsGrid.innerHTML = `
      <div class="no-results">
        <p>No results found for "${query}"</p>
        <p class="no-results-hint">Try different keywords or use our quiz below</p>
      </div>
    `;
  } else {
    resultsGrid.innerHTML = results.map(item => `
      <div class="content-card">
        <div class="card-poster" onclick="viewContent('${item.id}')">
          <div class="card-poster-emoji">${item.emoji || '🎬'}</div>
          ${item.matchScore ? `<div class="match-percentage">${Math.round(item.matchScore * 100)}%</div>` : ''}
        </div>
        <div class="card-info">
          <h4 class="card-title">${item.title}</h4>
          <p class="card-meta">${item.runtime} • ${item.year}</p>
        </div>
        <button class="card-action-btn" onclick="watchNow('${item.id}')">
          Watch
        </button>
      </div>
    `).join('');
  }

  countSpan.textContent = `${results.length} results`;
  resultsSection.style.display = 'block';
}

function showSearchSuggestions() {
  const suggestions = [
    'Something funny',
    'Romantic drama',
    'French comedy',
    'Suspenseful thriller',
    'Feel-good movie'
  ];

  const suggestionsDiv = document.getElementById('search-suggestions');
  suggestionsDiv.innerHTML = suggestions
    .map(s => `<div class="suggestion-chip" onclick="searchSuggestion('${s}')">${s}</div>`)
    .join('');
  suggestionsDiv.style.display = 'flex';
}

function hideSearchSuggestions() {
  document.getElementById('search-suggestions').style.display = 'none';
}

function hideSearchResults() {
  document.getElementById('search-results').style.display = 'none';
}

function searchSuggestion(text) {
  document.getElementById('search-input').value = text;
  performSearch(text);
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('search-clear').style.display = 'none';
  hideSearchResults();
  showSearchSuggestions();
}
```

### Backend Endpoint Needed
```typescript
// New endpoint: POST /api/search
// Uses AgentDB vector search to find semantically similar content
// Request: { query: string, userId?: string, limit?: number }
// Response: Array of content with matchScore
```

---

## Section 6: Personalized Trending

### HTML Structure
```html
<div id="section-personalized-trending" class="personalized-section">
  <div class="section-header">
    <h2 class="section-title">Trending For You</h2>
    <div class="trending-filter-tabs">
      <button class="filter-tab active" onclick="filterTrending('all')">All</button>
      <button class="filter-tab" onclick="filterTrending('today')">Today</button>
      <button class="filter-tab" onclick="filterTrending('week')">This Week</button>
    </div>
  </div>

  <div class="trending-grid" id="trending-grid">
    <!-- Trending items with rankings -->
  </div>
</div>
```

### CSS Styling
```css
.trending-filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.filter-tab.active {
  background: #e91e63;
  border-color: #e91e63;
  color: white;
}

.trending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.trending-card {
  position: relative;
}

.trending-rank {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4);
}

.trending-velocity {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(76, 175, 80, 0.9);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trending-velocity.up::before {
  content: '↗';
}

.trending-velocity.down::before {
  content: '↘';
}
```

### JavaScript Implementation
```javascript
let currentTrendingFilter = 'all';

async function loadPersonalizedTrending(userId, filter = 'all') {
  try {
    const response = await fetch(`/api/trending/personalized?userId=${userId}&period=${filter}`);
    const trending = await response.json();

    renderTrendingGrid(trending);
    currentTrendingFilter = filter;

    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    event.target.classList.add('active');
  } catch (error) {
    console.error('Trending error:', error);
  }
}

function renderTrendingGrid(items) {
  const grid = document.getElementById('trending-grid');

  const html = items.map((item, index) => `
    <div class="content-card trending-card">
      <div class="trending-rank">${index + 1}</div>
      <div class="card-poster" onclick="viewContent('${item.id}')">
        <div class="card-poster-emoji">${item.emoji || '🎬'}</div>
        ${item.velocity ? `
          <div class="trending-velocity ${item.velocity > 0 ? 'up' : 'down'}">
            ${Math.abs(item.velocity)}
          </div>
        ` : ''}
        ${item.personalMatch ? `
          <div class="match-percentage">${item.personalMatch}% Match</div>
        ` : ''}
      </div>
      <div class="card-info">
        <h4 class="card-title">${item.title}</h4>
        <p class="card-meta">${item.runtime} • ${item.year}</p>
        <div class="trending-stats">
          <span>🔥 ${item.viewCount.toLocaleString()} views</span>
        </div>
      </div>
      <button class="card-action-btn" onclick="watchNow('${item.id}')">
        Watch
      </button>
    </div>
  `).join('');

  grid.innerHTML = html;
}

function filterTrending(period) {
  loadPersonalizedTrending(currentUser.userId, period);
}
```

---

## Integration Strategy

### Page Load Sequence
```javascript
// Update DOMContentLoaded handler
window.addEventListener('DOMContentLoaded', async () => {
  // 1. Load user profile (shows header)
  await loadUserProfile('demo-user');

  // 2. Show search section
  showSearchSuggestions();

  // 3. Load personalized sections in parallel
  Promise.all([
    loadContinueWatching(currentUser.userId),
    loadWatchlist(currentUser.userId),
    loadBecauseYouWatched(currentUser.userId),
    loadPersonalizedTrending(currentUser.userId)
  ]);

  // 4. Show welcome screen (quiz flow)
  // Existing quiz remains as fallback/discovery tool
});
```

### Screen Flow Integration
```
User arrives → [Profile Header + Search visible]
                ↓
             [Personalized Sections visible if user has history]
                ↓
             [Welcome Screen - Quiz as discovery tool]
                ↓
             [User completes quiz]
                ↓
             [Result shown + Profile stats updated]
                ↓
             [Personalized sections refresh with new data]
```

### Mobile Responsive Adjustments
```css
@media (max-width: 640px) {
  .profile-container {
    flex-direction: column;
    text-align: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .carousel-track {
    padding: 0 20px;
  }

  .content-card {
    flex: 0 0 220px;
  }

  .watchlist-grid,
  .trending-grid,
  .search-results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .section-nav-btn {
    display: none; /* Use swipe gestures on mobile */
  }
}
```

---

## New Backend Endpoints Summary

1. **GET /api/users/:userId/profile**
   - Returns full UserProfile with stats

2. **GET /api/users/:userId/continue-watching**
   - Returns WatchHistoryEntry[] filtered by 0 < completionRate < 0.95
   - Limited to 10 items

3. **GET /api/recommend/similar/:contentId**
   - Uses vector similarity to find related content
   - Returns content with match scores

4. **GET /api/users/:userId/watchlist**
   - Returns full watchlist with content details

5. **POST /api/users/:userId/watchlist**
   - Adds contentId to watchlist
   - Returns updated UserProfile

6. **DELETE /api/users/:userId/watchlist/:contentId**
   - Removes from watchlist

7. **POST /api/search**
   - Semantic search using AgentDB vectors
   - Body: { query, userId?, limit? }
   - Returns ranked results with matchScore

8. **GET /api/trending/personalized**
   - Query params: userId, period (all/today/week)
   - Returns trending content filtered by user preferences
   - Includes personalMatch scores and velocity

---

## Performance Considerations

### Lazy Loading
- Load personalized sections only after profile is loaded
- Implement intersection observer for below-fold content
- Defer trending section until user scrolls

### Caching Strategy
- Cache user profile in localStorage (1 hour TTL)
- Cache watchlist locally, sync on changes
- Use HTTP caching headers for trending data (5 min TTL)

### Optimistic UI Updates
- Immediately update UI when adding/removing from watchlist
- Show loading states during API calls
- Rollback on error with user notification

---

## Accessibility

### Keyboard Navigation
- All carousel navigation accessible via arrow keys
- Search input has proper focus management
- Tab order follows logical flow

### Screen Readers
- Semantic HTML structure with proper ARIA labels
- Progress bars have aria-valuenow/valuemax
- Dynamic content updates announced

### Color Contrast
- All text meets WCAG AA standards
- Focus indicators visible on all interactive elements
- Error states use both color and icons

---

## Analytics Events to Track

```javascript
// Track these events for ML improvement
trackEvent('profile_viewed');
trackEvent('search_performed', { query, resultCount });
trackEvent('continue_watching_clicked', { contentId, completionRate });
trackEvent('watchlist_added', { contentId, source });
trackEvent('similar_content_clicked', { sourceId, targetId });
trackEvent('trending_filter_changed', { period });
```

---

## Next Steps

1. **Implement backend endpoints** (priority order listed above)
2. **Create HTML structure** in public/index.html
3. **Add CSS styles** (can be inline or separate file)
4. **Implement JavaScript functions** in public/app.js
5. **Test with demo user data**
6. **Add real-time updates** via WebSocket (optional enhancement)
7. **Implement A/B testing** framework for recommendation tuning

---

## Estimated Implementation Time

- **Profile Header**: 2-3 hours
- **Continue Watching**: 3-4 hours
- **Because You Watched**: 4-5 hours (includes vector similarity endpoint)
- **Watchlist**: 3-4 hours
- **Semantic Search**: 5-6 hours (includes AgentDB integration)
- **Personalized Trending**: 3-4 hours

**Total**: ~20-26 hours for full implementation

---

## Testing Checklist

- [ ] Profile header displays correct user stats
- [ ] Continue watching shows only partial completions
- [ ] Similar content recommendations are relevant
- [ ] Watchlist add/remove works correctly
- [ ] Search returns semantically relevant results
- [ ] Trending updates based on filter selection
- [ ] Mobile responsive on all sections
- [ ] Keyboard navigation works throughout
- [ ] Loading states show during API calls
- [ ] Error states handle gracefully
- [ ] Analytics events fire correctly
- [ ] Performance metrics acceptable (<3s initial load)
