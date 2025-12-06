# API Data Sources for Content Discovery and Trending Signals

**Research Date**: 2025-12-06
**Focus**: Content catalog APIs, trending signal APIs, and data pipeline architecture

---

## Executive Summary

This document analyzes API data sources for building a content discovery and trending recommendation system. The research covers content catalog APIs (Watchmode, OMDb, TMDB), trending signal APIs (FlixPatrol, Reddit, Trakt.tv), news APIs for press coverage, and trend score calculation methodologies.

**Key Findings**:
- **Watchmode** offers the most comprehensive streaming availability API (200+ services, 50+ countries)
- **TMDB** provides the best free metadata API with generous rate limits (50 req/sec)
- **FlixPatrol** delivers daily top 10 charts for multiple platforms (requires premium for API)
- **Reddit API** captures social buzz but has shifted to paid model for high-volume access
- **Hybrid approach recommended**: Combine catalog APIs (Watchmode/TMDB) with trending signals (FlixPatrol/Trakt.tv/Reddit)

---

## 1. Content Catalog APIs

### 1.1 Watchmode API

**Overview**: Most comprehensive streaming availability API with metadata for movies and shows on 200+ streaming services across 50+ countries.

**Key Features**:
- Universal catalog indexing (Netflix, Prime, HBO Max, Disney+, Hulu, 100+ more)
- Country-specific availability data (46 Tier 2 countries)
- iOS/Android deeplinks for native app launches
- Episode-level availability tracking (individual seasons/episodes)
- Daily catalog updates

**Coverage**:
- **Tier 1** (USA): All streaming services including smaller platforms
- **Tier 2** (46 countries): Major streaming services only
- **Free Plan**: USA availability only
- **Paid Plans**: Country availability based on tier

**API Endpoints**:
```javascript
// Search for titles
GET https://api.watchmode.com/v1/search/
  ?apiKey={key}
  &search_value={title}
  &search_type=1  // 1=movies, 2=tv shows

// Get title details with sources
GET https://api.watchmode.com/v1/title/{id}/details/
  ?apiKey={key}
  &append_to_response=sources

// Get streaming sources by country
GET https://api.watchmode.com/v1/title/{id}/sources/
  ?apiKey={key}
  &regions=US,FR,GB
```

**Data Schema**:
```typescript
interface WatchmodeTitle {
  id: number;
  title: string;
  year: number;
  imdb_id: string;
  tmdb_id: number;
  type: "movie" | "tv_series";
  sources: {
    source_id: number;
    name: string;  // "Netflix", "Prime Video"
    type: "sub" | "buy" | "rent" | "free";
    region: string;
    web_url: string;
    ios_url?: string;
    android_url?: string;
    price?: number;
    seasons?: number[];  // For TV shows
  }[];
  user_rating?: number;
  critic_score?: number;
}
```

**Rate Limits**:
- Free tier: 1,000 API calls/month
- Paid tiers: Variable based on plan
- No specific requests-per-second limit documented

**Pricing**:
- Free: 1,000 calls/month (USA only)
- Startup: Custom pricing
- Business: Custom pricing
- No credit card required for free tier

**Authentication**:
```bash
# Request API key (no credit card required)
curl https://api.watchmode.com/requestApiKey \
  -d "email=your@email.com"

# Use in requests
curl "https://api.watchmode.com/v1/search/?apiKey=YOUR_KEY&search_value=Inception"
```

**Strengths**:
- Most comprehensive streaming availability
- Episode-level granularity
- Mobile deeplinks (critical for iOS App Store compliance)
- Country-specific data

**Limitations**:
- Free tier limited to USA
- Pricing not publicly disclosed for paid tiers
- No trending/popularity data included

**Use Case**: Primary source for "Where to Watch" functionality

---

### 1.2 OMDb API (Open Movie Database)

**Overview**: RESTful web service for movie information with compact JSON responses. Focuses on metadata and ratings from IMDb, Rotten Tomatoes, and Metacritic.

**Key Features**:
- IMDb ratings and vote counts
- Rotten Tomatoes scores
- Metacritic ratings
- Search by title, IMDb ID, year, type
- Season and episode-level data for TV shows
- Poster images (patrons only)

**API Endpoints**:
```javascript
// Search by title
GET http://www.omdbapi.com/?apikey={key}&t={title}&y={year}

// Search by IMDb ID
GET http://www.omdbapi.com/?apikey={key}&i={imdb_id}

// Search with plot
GET http://www.omdbapi.com/?apikey={key}&t={title}&plot=full

// TV show episode
GET http://www.omdbapi.com/?apikey={key}&t=Game of Thrones&Season=1&Episode=1
```

**Data Schema**:
```typescript
interface OMDbMovie {
  Title: string;
  Year: string;
  Rated: string;  // "PG-13", "R"
  Released: string;
  Runtime: string;
  Genre: string;  // "Action, Sci-Fi, Thriller"
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;  // URL (patrons only)
  Ratings: {
    Source: string;  // "Internet Movie Database", "Rotten Tomatoes"
    Value: string;   // "8.8/10", "87%"
  }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  Response: "True" | "False";
}
```

**Rate Limits**:
- Free tier: 1,000 calls/day
- Paid tier: No daily limit
- No specific requests-per-second limit

**Pricing**:
- Free: 1,000 calls/day
- Patreon: Small monthly donation ($1/month) for unlimited calls and poster API

**Authentication**:
```bash
# Sign up at http://www.omdbapi.com/apikey.aspx
# Activate via email verification link

curl "http://www.omdbapi.com/?apikey=YOUR_KEY&t=Inception"
```

**Strengths**:
- Simple, straightforward API
- Multiple rating sources (IMDb, RT, Metacritic)
- Very affordable pricing
- Good for movie-focused applications

**Limitations**:
- No streaming availability data
- Limited TV show metadata compared to TMDB
- Poster API requires paid plan
- No trending/popularity signals

**Use Case**: Secondary metadata source for ratings aggregation

---

### 1.3 TMDB API (The Movie Database)

**Overview**: Most complete free API ecosystem for non-commercial use. Extensive metadata for movies and TV shows with rich image library and discovery features.

**Key Features**:
- Detailed metadata (cast, crew, keywords, genres)
- Rich image library (posters, backdrops, profiles)
- Discovery endpoints (trending, now playing, upcoming)
- JustWatch partnership for streaming availability
- Multi-language support
- Video trailers and clips
- User ratings and reviews

**API Endpoints**:
```javascript
// Search for movies
GET https://api.themoviedb.org/3/search/movie
  ?api_key={key}
  &query={title}
  &year={year}
  &language=en-US

// Get movie details
GET https://api.themoviedb.org/3/movie/{id}
  ?api_key={key}
  &append_to_response=credits,videos,images,watch/providers

// Streaming availability (JustWatch partnership)
GET https://api.themoviedb.org/3/movie/{id}/watch/providers
  ?api_key={key}

// Trending (day or week)
GET https://api.themoviedb.org/3/trending/{media_type}/{time_window}
  ?api_key={key}
  // media_type: all, movie, tv, person
  // time_window: day, week

// Discover with filters
GET https://api.themoviedb.org/3/discover/movie
  ?api_key={key}
  &sort_by=popularity.desc
  &with_genres=28,12  // Action, Adventure
  &with_watch_providers=8  // Netflix
  &watch_region=US
```

**Data Schema**:
```typescript
interface TMDbMovie {
  id: number;
  imdb_id: string;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  runtime: number;  // minutes
  genres: { id: number; name: string }[];
  vote_average: number;  // 0-10
  vote_count: number;
  popularity: number;  // TMDB popularity score
  poster_path: string;  // "/path/to/poster.jpg"
  backdrop_path: string;
  adult: boolean;
  budget: number;
  revenue: number;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
      order: number;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
  videos?: {
    results: {
      key: string;  // YouTube video ID
      site: "YouTube";
      type: "Trailer" | "Teaser" | "Clip";
      official: boolean;
    }[];
  };
  "watch/providers"?: {
    results: {
      [country: string]: {
        link: string;  // JustWatch link
        flatrate?: {  // Subscription
          provider_id: number;
          provider_name: string;
          logo_path: string;
        }[];
        rent?: { /* same structure */ }[];
        buy?: { /* same structure */ }[];
      };
    };
  };
}
```

**Rate Limits**:
- **API requests**: 50 requests/second per IP
- **Image CDN**: 20 simultaneous connections per IP
- **No difference** between developer and commercial keys
- No daily request limit

**Pricing**:
- **Free**: Unlimited for non-commercial use
- **Commercial**: Must contact TMDB for licensing

**Authentication**:
```bash
# Register at https://www.themoviedb.org/settings/api
# Requires account on desktop browser (not mobile-optimized)
# Accept terms of use before receiving API key

curl "https://api.themoviedb.org/3/movie/550?api_key=YOUR_KEY"

# Also supports read access token authentication
curl "https://api.themoviedb.org/3/movie/550" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Image URLs**:
```javascript
// Images are on separate CDN
const BASE_URL = "https://image.tmdb.org/t/p/";
const SIZES = {
  poster: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
  backdrop: ["w300", "w780", "w1280", "original"],
  profile: ["w45", "w185", "h632", "original"]
};

const posterUrl = `${BASE_URL}w500${movie.poster_path}`;
```

**Strengths**:
- Most generous free tier (50 req/sec)
- Comprehensive metadata
- Rich image library
- Discovery and trending endpoints
- JustWatch integration for streaming availability
- Active community and good documentation

**Limitations**:
- Streaming availability requires attribution to JustWatch
- Commercial use requires licensing
- No built-in trending score (only popularity metric)

**Use Case**: Primary metadata source and discovery engine

---

### 1.4 JustWatch API

**Overview**: Streaming availability data for 400,000+ titles across 600+ services in 140+ countries. Includes streaming popularity rankings updated daily.

**Key Features**:
- Daily catalog updates (refreshed every 24 hours)
- AI and manual cross-referencing for accuracy
- Streaming popularity rankings (daily, weekly, monthly)
- VOD availability with pricing
- Title matching and deduplication (IMDb, TMDB, EIDR IDs)
- Offer types: subscription, rental, purchase, free

**API Integration**:
```javascript
// Note: JustWatch data is available through TMDB partnership
// Direct JustWatch API is restricted to commercial partners

// Via TMDB (requires JustWatch attribution)
GET https://api.themoviedb.org/3/movie/{id}/watch/providers
  ?api_key={tmdb_key}

// Response includes JustWatch data
{
  "results": {
    "US": {
      "link": "https://justwatch.com/us/movie/inception",
      "flatrate": [
        {
          "provider_id": 8,
          "provider_name": "Netflix",
          "logo_path": "/netflix.jpg"
        }
      ],
      "rent": [...],
      "buy": [...]
    }
  }
}
```

**Popularity Rankings**:
```typescript
interface JustWatchPopularity {
  title_id: string;
  rank_1d: number;   // Daily rank
  rank_7d: number;   // Weekly rank
  rank_30d: number;  // Monthly rank
  change_1d: number; // Position change vs yesterday
  change_7d: number; // Position change vs last week
  change_30d: number; // Position change vs last month
}
```

**Rate Limits**:
- Direct API: Commercial partners only
- Via TMDB: Subject to TMDB rate limits (50 req/sec)

**Pricing**:
- Direct API: Commercial licensing required
- Via TMDB: Free (requires JustWatch attribution)

**Usage Restrictions**:
- **Non-commercial use only** via TMDB partnership
- Commercial purposes require direct licensing
- Must attribute JustWatch as data source
- Be respectful with API calls

**Strengths**:
- Most accurate streaming availability
- Global coverage (140 countries)
- Popularity rankings for trend detection
- Daily updates

**Limitations**:
- Direct API requires commercial license
- Non-commercial use limited to TMDB partnership
- Must display JustWatch attribution

**Use Case**: Streaming availability via TMDB partnership, popularity rankings for trending detection

---

## 2. Trending Signal APIs

### 2.1 FlixPatrol API

**Overview**: VOD charts and streaming ratings for 300+ services in 100+ countries. Provides daily top 10 lists and popularity rankings.

**Key Features**:
- Daily top 10 charts (Netflix, Prime, HBO, Disney+, etc.)
- Weekly, monthly, yearly reports
- Popularity points based on multiple metrics
- Social media popularity integration
- Trailer views tracking
- 300+ individual streaming charts

**Data Sources**:
- Platform-specific top 10s (Netflix, Disney+, HBO)
- Social media buzz and engagement
- Trailer views and shares
- Streaming service bestseller charts

**API Access**:
```javascript
// FlixPatrol Premium includes API key
// Contact for commercial API access

// Example API response structure (inferred)
interface FlixPatrolChart {
  rank: number;
  title: string;
  tmdb_id?: number;
  imdb_id?: string;
  platform: string;  // "Netflix", "Prime Video"
  country: string;
  date: string;
  popularity_score: number;
  rank_change: number;  // vs previous period
  categories: string[];
}
```

**Update Frequency**:
- Top 10 lists: Daily updates
- Streaming charts: Daily, weekly, monthly
- Real-time trending: Changes throughout the day (Netflix)

**Rate Limits**:
- Not publicly documented
- Premium plan required for API access

**Pricing**:
- Basic: Free (web access only)
- Premium: Includes API key (price not disclosed)
- Enterprise: Custom pricing

**Strengths**:
- Most comprehensive streaming charts
- Daily top 10 data from platforms
- Multi-platform coverage
- Historical data available

**Limitations**:
- Requires premium subscription for API
- Pricing not transparent
- No free API tier
- Data based on FlixPatrol's methodology (not official platform data)

**Use Case**: Primary trending signal for platform popularity (40% weight in trend score)

---

### 2.2 Trakt.tv API

**Overview**: Community-driven platform for tracking TV shows and movies. Provides trending, popular, and watched data based on 1M+ titles and active user community.

**Key Features**:
- Real-time trending based on community activity
- Popular titles (all-time and by period)
- Most watched content
- User check-ins and scrobbling
- Social features (comments, ratings, recommendations)
- Integration with media centers and streaming services

**API Endpoints**:
```javascript
// Trending movies (recently watched by community)
GET https://api.trakt.tv/movies/trending
  ?extended=full
  &limit=50

// Trending shows
GET https://api.trakt.tv/shows/trending

// Popular (all-time popularity)
GET https://api.trakt.tv/movies/popular

// Most watched (by period)
GET https://api.trakt.tv/movies/watched/weekly
  // Options: daily, weekly, monthly, yearly, all

// Show/movie details
GET https://api.trakt.tv/movies/{id}
  ?extended=full

// Available IDs: trakt-id, trakt-slug, imdb-id, tmdb-id
```

**Data Schema**:
```typescript
interface TraktTrending {
  watchers: number;  // Number of users watching
  movie: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
    };
  };
}

interface TraktPopular {
  watcher_count: number;
  play_count: number;
  collected_count: number;
  movie: { /* same as above */ };
}
```

**Rate Limits**:
- 1,000 requests per 5 minutes per IP
- Uses OAuth2 for authentication
- Requires API key registration

**Pricing**:
- **Free**: Full API access
- **VIP**: Optional ($2.50/month) - removes ads, supports platform

**Authentication**:
```bash
# Register app at https://trakt.tv/oauth/applications
# Get Client ID and Client Secret

# Include in headers
curl "https://api.trakt.tv/movies/trending" \
  -H "Content-Type: application/json" \
  -H "trakt-api-version: 2" \
  -H "trakt-api-key: YOUR_CLIENT_ID"
```

**Available Libraries**:
- R package (tRakt): `shows_trending()`, `movies_trending()`, etc.
- Kotlin Multiplatform: Android, iOS, desktop, web support
- Various community SDKs

**Strengths**:
- Completely free API
- Real-time community activity
- Multiple popularity metrics (trending, popular, watched)
- Social engagement data
- Good for detecting emerging trends

**Limitations**:
- Smaller user base than IMDb/TMDB
- Trending based on Trakt community (may not reflect general audience)
- No official platform data
- Requires OAuth for some endpoints

**Use Case**: Secondary trending signal for social engagement (20% weight in trend score)

---

### 2.3 Reddit API

**Overview**: Social media platform with TV and entertainment communities. Provides social buzz signals through posts, comments, and voting.

**Key Subreddits**:
- r/television (17M+ members)
- r/france (1.4M+ members)
- r/movies (32M+ members)
- r/netflix (4M+ members)
- Show-specific subreddits (e.g., r/YouOnLifetime)

**API Features**:
- Subreddit posts and comments
- Voting data (upvotes, downvotes)
- Reddit Score (net votes across posts/comments)
- Trending content
- User engagement metrics

**API Endpoints**:
```javascript
// Subreddit hot/trending posts
GET https://oauth.reddit.com/r/television/hot
  ?limit=100

// Search posts
GET https://oauth.reddit.com/r/television/search
  ?q=title:"{show_name}"
  &restrict_sr=1
  &sort=new
  &t=week

// Post details with comments
GET https://oauth.reddit.com/r/television/comments/{post_id}

// Subreddit stats
GET https://oauth.reddit.com/r/television/about
```

**Data Schema**:
```typescript
interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  score: number;  // Upvotes - downvotes
  upvote_ratio: number;  // 0-1
  num_comments: number;
  created_utc: number;
  subreddit: string;
  author: string;
  permalink: string;
  url: string;
}

// Reddit Score calculation for content
interface RedditScore {
  total_score: number;  // Net votes across all posts/comments
  post_count: number;
  comment_count: number;
  avg_score: number;
  engagement_rate: number;
}
```

**Rate Limits** (2025 Changes):
- **Free tier**: Limited to small-scale or exempt use cases
- **Enterprise tier**: $0.24 per 1,000 API calls
- Significant cost at scale for high-volume access
- 2023 API changes shifted to paid model

**Authentication**:
```bash
# OAuth2 required
# Register app at https://www.reddit.com/prefs/apps

# Get access token
curl -X POST https://www.reddit.com/api/v1/access_token \
  -H "User-Agent: MyApp/1.0" \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=password&username=USERNAME&password=PASSWORD"

# Use token in requests
curl "https://oauth.reddit.com/r/television/hot" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "User-Agent: MyApp/1.0"
```

**Pricing** (Post-2023):
- Free: Small-scale, non-commercial use
- Enterprise: $0.24 per 1,000 calls
- Can become expensive at scale

**Social Buzz Metrics**:
```javascript
// Calculate buzz score for a show/movie
async function calculateRedditBuzz(title: string, period: string = "week") {
  const posts = await searchReddit(title, period);

  const buzzScore = {
    post_count: posts.length,
    total_score: posts.reduce((sum, p) => sum + p.score, 0),
    avg_score: 0,
    total_comments: posts.reduce((sum, p) => sum + p.num_comments, 0),
    sentiment: analyzeSentiment(posts),  // Requires sentiment analysis
    trending_velocity: calculateVelocity(posts)
  };

  buzzScore.avg_score = buzzScore.total_score / buzzScore.post_count;
  return buzzScore;
}
```

**Strengths**:
- Rich social engagement data
- Real community discussions and sentiment
- Early detection of emerging trends
- Strong TV/movie communities
- Good for French content (r/france)

**Limitations**:
- Expensive at scale ($0.24/1K calls)
- Requires sentiment analysis for meaningful insights
- Rate limits on free tier
- Data requires significant processing
- May not reflect general audience (skews younger, tech-savvy)

**Use Case**: Social buzz indicator (20% weight in trend score), use sparingly due to cost

---

### 2.4 News APIs

**Overview**: Track press coverage, festival announcements, awards, and entertainment news for trending signals.

#### NewsAPI.org

**Features**:
- 150,000+ worldwide sources
- 14 languages, 55 countries
- US entertainment news category
- Historical articles (current and past)
- Search and filtering

**API Endpoints**:
```javascript
// Top entertainment headlines (US)
GET https://newsapi.org/v2/top-headlines
  ?apiKey={key}
  &country=us
  &category=entertainment

// Search entertainment news
GET https://newsapi.org/v2/everything
  ?apiKey={key}
  &q="Inception" OR "Christopher Nolan"
  &language=en
  &sortBy=publishedAt

// French entertainment news
GET https://newsapi.org/v2/top-headlines
  ?apiKey={key}
  &country=fr
  &category=entertainment
```

**Rate Limits**:
- Free: 100 requests/day
- Developer: 500 requests/day ($49/month)
- Business: 5,000 requests/day ($449/month)
- Enterprise: Custom

**Pricing**:
- Free: 100 req/day
- Developer: $49/month (500 req/day)
- Business: $449/month (5K req/day)

#### NewsAPI.ai

**Features**:
- Historical news since 2014
- Token-based pricing (pay-as-you-go)
- Advanced search and filtering
- Sentiment analysis

**Rate Limits**:
- 1 request per second across all plans
- Token consumption varies by endpoint

**Pricing**:
- Basic: Free (5 requests/month)
- Pro: $3/month (10K requests)
- Ultra: $6/month (30K requests)
- Mega: $9/month (1M requests)

**Data Schema**:
```typescript
interface NewsArticle {
  source: {
    id: string;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;  // ISO 8601
  content: string;
}

// Press coverage score
interface PressCoverage {
  article_count: number;
  total_sources: number;
  avg_sentiment: number;  // -1 to 1
  coverage_velocity: number;  // Articles per day
  source_authority: number;  // Weighted by source credibility
}
```

**Strengths**:
- Good for detecting festival/award buzz
- Press coverage as trend signal
- Relatively affordable
- Multiple language support

**Limitations**:
- Low rate limits on free tier
- Expensive for high-volume use
- Requires NLP for meaningful insights
- May have delays (not real-time)

**Use Case**: Press coverage indicator for freshness and award boost (15% combined weight)

---

## 3. Trend Score Calculation

### 3.1 Weighted Algorithm

**Formula**:
```javascript
TrendScore =
  (PlatformPopularity × 0.40) +
  (CriticalAcclaim × 0.25) +
  (SocialBuzz × 0.20) +
  (Freshness × 0.10) +
  (AwardBoost × 0.05)
```

**Normalization**: All components normalized to 0-100 scale

---

### 3.2 Component Calculations

#### Platform Popularity (40% weight)

**Data Sources**: FlixPatrol, Trakt.tv, JustWatch

```javascript
async function calculatePlatformPopularity(titleId: string): Promise<number> {
  // FlixPatrol: Top 10 rank on major platforms
  const flixpatrol = await getFlixPatrolRank(titleId);
  const platformScore = flixpatrol.reduce((score, platform) => {
    // Inverse rank: #1 = 100, #10 = 10, unranked = 0
    const rankScore = platform.rank <= 10
      ? ((11 - platform.rank) / 10) * 100
      : 0;
    return score + rankScore;
  }, 0) / flixpatrol.length;

  // Trakt.tv: Trending watchers
  const trakt = await getTraktTrending(titleId);
  const traktScore = normalizeWatchers(trakt.watchers);

  // JustWatch: Popularity rank
  const justwatch = await getJustWatchPopularity(titleId);
  const justwatchScore = normalizeRank(justwatch.rank_7d);

  // Weighted average
  return (platformScore * 0.5) + (traktScore * 0.3) + (justwatchScore * 0.2);
}

function normalizeWatchers(watchers: number): number {
  // Logarithmic scale: 1K watchers = 50, 10K = 75, 100K = 100
  const logScore = Math.log10(watchers + 1);
  return Math.min((logScore / 5) * 100, 100);
}

function normalizeRank(rank: number): number {
  // Top 100 ranks normalized
  if (rank <= 0) return 0;
  if (rank > 100) return 0;
  return ((101 - rank) / 100) * 100;
}
```

---

#### Critical Acclaim (25% weight)

**Data Sources**: TMDB, OMDb (IMDb, Rotten Tomatoes, Metacritic)

```javascript
async function calculateCriticalAcclaim(titleId: string): Promise<number> {
  const tmdb = await getTMDbDetails(titleId);
  const omdb = await getOMDbDetails(titleId);

  // TMDB user rating (0-10 → 0-100)
  const tmdbScore = (tmdb.vote_average / 10) * 100;
  const tmdbWeight = Math.log10(tmdb.vote_count + 1) / 5; // Weight by votes

  // IMDb rating (0-10 → 0-100)
  const imdbScore = parseFloat(omdb.imdbRating) * 10;
  const imdbWeight = Math.log10(parseInt(omdb.imdbVotes.replace(/,/g, '')) + 1) / 6;

  // Rotten Tomatoes (0-100)
  const rtRating = omdb.Ratings.find(r => r.Source === "Rotten Tomatoes");
  const rtScore = rtRating ? parseInt(rtRating.Value) : 0;

  // Metacritic (0-100)
  const metaScore = omdb.Metascore ? parseInt(omdb.Metascore) : 0;

  // Weighted average with vote-based confidence
  const weightedTmdb = tmdbScore * Math.min(tmdbWeight, 1);
  const weightedImdb = imdbScore * Math.min(imdbWeight, 1);

  return (
    (weightedTmdb * 0.3) +
    (weightedImdb * 0.3) +
    (rtScore * 0.25) +
    (metaScore * 0.15)
  );
}
```

---

#### Social Buzz (20% weight)

**Data Sources**: Reddit, Trakt.tv

```javascript
async function calculateSocialBuzz(title: string, titleId: string): Promise<number> {
  // Reddit buzz (if budget allows)
  let redditScore = 0;
  if (ENABLE_REDDIT_API) {
    const reddit = await getRedditBuzz(title, "week");
    redditScore = normalizeBuzz(reddit);
  }

  // Trakt social engagement
  const trakt = await getTraktEngagement(titleId);
  const traktScore = normalizeEngagement(trakt);

  // Combine
  return ENABLE_REDDIT_API
    ? (redditScore * 0.6) + (traktScore * 0.4)
    : traktScore;  // Fallback to Trakt only
}

function normalizeBuzz(reddit: RedditBuzzData): number {
  // Score based on posts, comments, and sentiment
  const volumeScore = Math.log10(reddit.post_count + 1) * 20;
  const engagementScore = Math.log10(reddit.total_comments + 1) * 20;
  const sentimentBoost = (reddit.sentiment + 1) * 25;  // -1 to 1 → 0 to 50

  return Math.min(volumeScore + engagementScore + sentimentBoost, 100);
}

function normalizeEngagement(trakt: TraktEngagementData): number {
  const checkIns = Math.log10(trakt.check_ins + 1) * 25;
  const comments = Math.log10(trakt.comments + 1) * 25;
  const ratings = Math.log10(trakt.ratings + 1) * 25;
  const velocity = calculateVelocity(trakt.recent_activity) * 25;

  return checkIns + comments + ratings + velocity;
}
```

---

#### Freshness (10% weight)

**Data Sources**: TMDB, Watchmode

```javascript
function calculateFreshness(releaseDate: string, addedDate?: string): number {
  const release = new Date(releaseDate);
  const added = addedDate ? new Date(addedDate) : new Date();
  const now = new Date();

  // Days since release
  const daysSinceRelease = (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24);

  // Days since added to streaming
  const daysSinceAdded = (now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24);

  // Decay curve: 100 at day 0, 50 at 30 days, 0 at 365 days
  const releaseScore = Math.max(0, 100 * Math.exp(-daysSinceRelease / 120));
  const addedScore = Math.max(0, 100 * Math.exp(-daysSinceAdded / 60));

  // Prioritize streaming addition for catalog freshness
  return (releaseScore * 0.4) + (addedScore * 0.6);
}
```

---

#### Award Boost (5% weight)

**Data Sources**: OMDb, News APIs

```javascript
async function calculateAwardBoost(title: string, omdb: OMDbData): Promise<number> {
  let score = 0;

  // Awards from OMDb
  const awards = omdb.Awards.toLowerCase();
  if (awards.includes("won") && awards.includes("oscar")) score += 50;
  else if (awards.includes("nominated") && awards.includes("oscar")) score += 30;
  if (awards.includes("won") && awards.includes("golden globe")) score += 40;
  if (awards.includes("won") && awards.includes("emmy")) score += 40;

  // Recent news coverage about awards
  const news = await searchNewsAPI(title + " award", "month");
  const newsBoost = Math.min(news.articles.length * 5, 30);

  // Festival mentions
  const festivalKeywords = ["cannes", "sundance", "toronto", "venice", "berlin"];
  const festivalBoost = festivalKeywords.some(k => awards.includes(k)) ? 20 : 0;

  return Math.min(score + newsBoost + festivalBoost, 100);
}
```

---

### 3.3 Complete Trend Score Implementation

```javascript
interface TrendScoreComponents {
  platformPopularity: number;
  criticalAcclaim: number;
  socialBuzz: number;
  freshness: number;
  awardBoost: number;
  finalScore: number;
  breakdown: {
    [key: string]: { score: number; weight: number; contribution: number };
  };
}

async function calculateTrendScore(
  titleId: string,
  title: string,
  releaseDate: string,
  addedDate?: string
): Promise<TrendScoreComponents> {
  // Calculate all components
  const [platform, acclaim, buzz, fresh, awards] = await Promise.all([
    calculatePlatformPopularity(titleId),
    calculateCriticalAcclaim(titleId),
    calculateSocialBuzz(title, titleId),
    Promise.resolve(calculateFreshness(releaseDate, addedDate)),
    calculateAwardBoost(title, await getOMDbDetails(titleId))
  ]);

  // Apply weights
  const weights = {
    platformPopularity: 0.40,
    criticalAcclaim: 0.25,
    socialBuzz: 0.20,
    freshness: 0.10,
    awardBoost: 0.05
  };

  const finalScore =
    (platform * weights.platformPopularity) +
    (acclaim * weights.criticalAcclaim) +
    (buzz * weights.socialBuzz) +
    (fresh * weights.freshness) +
    (awards * weights.awardBoost);

  return {
    platformPopularity: platform,
    criticalAcclaim: acclaim,
    socialBuzz: buzz,
    freshness: fresh,
    awardBoost: awards,
    finalScore: Math.round(finalScore * 10) / 10,  // Round to 1 decimal
    breakdown: {
      platformPopularity: {
        score: platform,
        weight: weights.platformPopularity,
        contribution: platform * weights.platformPopularity
      },
      criticalAcclaim: {
        score: acclaim,
        weight: weights.criticalAcclaim,
        contribution: acclaim * weights.criticalAcclaim
      },
      socialBuzz: {
        score: buzz,
        weight: weights.socialBuzz,
        contribution: buzz * weights.socialBuzz
      },
      freshness: {
        score: fresh,
        weight: weights.freshness,
        contribution: fresh * weights.freshness
      },
      awardBoost: {
        score: awards,
        weight: weights.awardBoost,
        contribution: awards * weights.awardBoost
      }
    }
  };
}
```

---

## 4. Data Pipeline Architecture

### 4.1 Update Frequencies

**Catalog Updates (Hourly)**:
- Watchmode: New streaming availability
- TMDB: New releases, metadata updates
- JustWatch: Catalog changes

**Trending Updates (6 Hours)**:
- FlixPatrol: Top 10 charts
- Trakt.tv: Trending and popular lists
- Reddit: Social buzz (if enabled)
- News APIs: Press coverage

**Real-time Updates**:
- User sessions and interactions
- Personalization signals
- Click-through rates

---

### 4.2 Pipeline Implementation

```javascript
// Catalog sync job (runs hourly)
async function syncCatalog() {
  console.log("Starting catalog sync...");

  // 1. Fetch new releases from TMDB
  const newReleases = await fetchTMDbDiscovery({
    releaseDate: { gte: getDate(-30), lte: getDate(0) },
    sortBy: "release_date.desc"
  });

  // 2. Check streaming availability via Watchmode
  for (const release of newReleases) {
    const availability = await fetchWatchmodeSources(release.imdb_id);
    await upsertCatalogEntry({
      tmdb_id: release.id,
      imdb_id: release.imdb_id,
      title: release.title,
      metadata: release,
      sources: availability,
      last_updated: new Date()
    });
  }

  // 3. Update existing catalog (check for availability changes)
  const existingTitles = await getRecentlyUpdated({ days: 7 });
  for (const title of existingTitles) {
    const availability = await fetchWatchmodeSources(title.imdb_id);
    if (hasAvailabilityChanged(title.sources, availability)) {
      await updateCatalogSources(title.id, availability);
    }
  }

  console.log(`Catalog sync completed: ${newReleases.length} new, ${existingTitles.length} updated`);
}

// Trending sync job (runs every 6 hours)
async function syncTrending() {
  console.log("Starting trending sync...");

  // 1. Fetch FlixPatrol top 10s
  const platforms = ["netflix", "prime", "disney", "hbo"];
  for (const platform of platforms) {
    const top10 = await fetchFlixPatrolTop10(platform, "US");
    await updatePlatformTrending(platform, top10);
  }

  // 2. Fetch Trakt trending
  const traktMovies = await fetchTraktTrending("movies");
  const traktShows = await fetchTraktTrending("shows");
  await updateTraktTrending([...traktMovies, ...traktShows]);

  // 3. Calculate trend scores for active catalog
  const activeTitles = await getActiveCatalog({ limit: 1000 });
  for (const title of activeTitles) {
    const trendScore = await calculateTrendScore(
      title.tmdb_id,
      title.title,
      title.release_date,
      title.added_date
    );
    await updateTrendScore(title.id, trendScore);
  }

  console.log(`Trending sync completed: ${activeTitles.length} scores updated`);
}

// News monitoring job (runs every 6 hours)
async function syncNewsCoverage() {
  console.log("Starting news coverage sync...");

  // Get trending titles to monitor
  const trending = await getTrendingTitles({ limit: 100 });

  for (const title of trending) {
    const news = await searchNewsAPI(title.title, "week");
    const coverage = {
      article_count: news.articles.length,
      total_sources: new Set(news.articles.map(a => a.source.id)).size,
      latest_article: news.articles[0]?.publishedAt,
      keywords: extractKeywords(news.articles)
    };

    await updatePressCoverage(title.id, coverage);
  }

  console.log(`News coverage sync completed: ${trending.length} titles monitored`);
}

// Social buzz job (runs every 6 hours, if Reddit enabled)
async function syncSocialBuzz() {
  if (!ENABLE_REDDIT_API) return;

  console.log("Starting social buzz sync...");

  const trending = await getTrendingTitles({ limit: 50 });

  for (const title of trending) {
    const reddit = await getRedditBuzz(title.title, "week");
    await updateSocialBuzz(title.id, reddit);

    // Rate limiting: Wait between requests
    await sleep(2000);  // 2 seconds to avoid rate limits
  }

  console.log(`Social buzz sync completed: ${trending.length} titles analyzed`);
}
```

---

### 4.3 Cron Schedule

```javascript
// Using node-cron or similar scheduler

// Hourly: Catalog sync
cron.schedule("0 * * * *", syncCatalog);

// Every 6 hours: Trending signals
cron.schedule("0 */6 * * *", async () => {
  await syncTrending();
  await syncNewsCoverage();
  await syncSocialBuzz();
});

// Daily: Cleanup old data
cron.schedule("0 2 * * *", cleanupOldData);

// Weekly: Full catalog refresh
cron.schedule("0 3 * * 0", fullCatalogRefresh);
```

---

### 4.4 Error Handling and Retries

```javascript
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    console.warn(`Retry failed, ${retries} attempts remaining:`, error.message);
    await sleep(delay);
    return withRetry(fn, retries - 1, delay * 2);  // Exponential backoff
  }
}

// Usage
const tmdbData = await withRetry(() => fetchTMDbDetails(titleId));
```

---

### 4.5 Rate Limit Management

```javascript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  constructor(
    private requestsPerSecond: number,
    private requestsPerDay?: number
  ) {}

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    this.processing = true;
    const delay = 1000 / this.requestsPerSecond;

    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) await fn();
      await sleep(delay);
    }

    this.processing = false;
  }
}

// Create limiters for each API
const tmdbLimiter = new RateLimiter(50);  // 50 req/sec
const omdbLimiter = new RateLimiter(1, 1000);  // 1 req/sec, 1000/day
const redditLimiter = new RateLimiter(1);  // Conservative: 1 req/sec

// Usage
const tmdbData = await tmdbLimiter.add(() =>
  fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${key}`)
    .then(r => r.json())
);
```

---

## 5. API Integration Code Examples

### 5.1 Watchmode Integration

```javascript
import axios from "axios";

class WatchmodeClient {
  private baseUrl = "https://api.watchmode.com/v1";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchTitle(title: string, type: "movie" | "tv") {
    const response = await axios.get(`${this.baseUrl}/search/`, {
      params: {
        apiKey: this.apiKey,
        search_value: title,
        search_type: type === "movie" ? 1 : 2
      }
    });
    return response.data.title_results;
  }

  async getTitleDetails(watchmodeId: number) {
    const response = await axios.get(`${this.baseUrl}/title/${watchmodeId}/details/`, {
      params: {
        apiKey: this.apiKey,
        append_to_response: "sources"
      }
    });
    return response.data;
  }

  async getStreamingSources(watchmodeId: number, regions: string[] = ["US"]) {
    const response = await axios.get(`${this.baseUrl}/title/${watchmodeId}/sources/`, {
      params: {
        apiKey: this.apiKey,
        regions: regions.join(",")
      }
    });
    return response.data;
  }

  async getSourcesByImdbId(imdbId: string) {
    // Search by IMDB ID
    const response = await axios.get(`${this.baseUrl}/title/${imdbId}/details/`, {
      params: {
        apiKey: this.apiKey,
        append_to_response: "sources"
      }
    });
    return response.data.sources || [];
  }
}

// Usage
const watchmode = new WatchmodeClient(process.env.WATCHMODE_API_KEY);
const sources = await watchmode.getSourcesByImdbId("tt1375666");  // Inception
console.log(sources.filter(s => s.region === "US" && s.type === "sub"));
```

---

### 5.2 TMDB Integration

```javascript
import axios from "axios";

class TMDbClient {
  private baseUrl = "https://api.themoviedb.org/3";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchMovie(title: string, year?: number) {
    const response = await axios.get(`${this.baseUrl}/search/movie`, {
      params: {
        api_key: this.apiKey,
        query: title,
        year,
        language: "en-US"
      }
    });
    return response.data.results;
  }

  async getMovieDetails(movieId: number) {
    const response = await axios.get(`${this.baseUrl}/movie/${movieId}`, {
      params: {
        api_key: this.apiKey,
        append_to_response: "credits,videos,images,watch/providers,keywords"
      }
    });
    return response.data;
  }

  async getTrending(mediaType: "all" | "movie" | "tv", timeWindow: "day" | "week") {
    const response = await axios.get(`${this.baseUrl}/trending/${mediaType}/${timeWindow}`, {
      params: { api_key: this.apiKey }
    });
    return response.data.results;
  }

  async discover(filters: {
    sortBy?: string;
    withGenres?: number[];
    withWatchProviders?: number[];
    watchRegion?: string;
    releaseDateGte?: string;
    releaseDateLte?: string;
  }) {
    const response = await axios.get(`${this.baseUrl}/discover/movie`, {
      params: {
        api_key: this.apiKey,
        sort_by: filters.sortBy || "popularity.desc",
        with_genres: filters.withGenres?.join(","),
        with_watch_providers: filters.withWatchProviders?.join(","),
        watch_region: filters.watchRegion,
        "release_date.gte": filters.releaseDateGte,
        "release_date.lte": filters.releaseDateLte
      }
    });
    return response.data.results;
  }

  getImageUrl(path: string, size: string = "w500") {
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

// Usage
const tmdb = new TMDbClient(process.env.TMDB_API_KEY);
const trending = await tmdb.getTrending("movie", "week");
const details = await tmdb.getMovieDetails(trending[0].id);
console.log(details["watch/providers"]?.results?.US);
```

---

### 5.3 OMDb Integration

```javascript
import axios from "axios";

class OMDbClient {
  private baseUrl = "http://www.omdbapi.com";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchByTitle(title: string, year?: number) {
    const response = await axios.get(this.baseUrl, {
      params: {
        apikey: this.apiKey,
        t: title,
        y: year,
        plot: "full"
      }
    });

    if (response.data.Response === "False") {
      throw new Error(response.data.Error);
    }

    return response.data;
  }

  async searchByImdbId(imdbId: string) {
    const response = await axios.get(this.baseUrl, {
      params: {
        apikey: this.apiKey,
        i: imdbId,
        plot: "full"
      }
    });

    if (response.data.Response === "False") {
      throw new Error(response.data.Error);
    }

    return response.data;
  }

  extractRatings(omdbData: any) {
    return {
      imdb: {
        rating: parseFloat(omdbData.imdbRating) || 0,
        votes: parseInt(omdbData.imdbVotes?.replace(/,/g, "") || "0")
      },
      rottenTomatoes: this.parseRating(omdbData.Ratings, "Rotten Tomatoes"),
      metacritic: parseInt(omdbData.Metascore || "0")
    };
  }

  private parseRating(ratings: any[], source: string) {
    const rating = ratings?.find(r => r.Source === source);
    return rating ? parseInt(rating.Value) : 0;
  }
}

// Usage
const omdb = new OMDbClient(process.env.OMDB_API_KEY);
const movieData = await omdb.searchByImdbId("tt1375666");
const ratings = omdb.extractRatings(movieData);
console.log(ratings);
```

---

### 5.4 FlixPatrol Integration (Hypothetical)

```javascript
// Note: FlixPatrol API requires premium subscription
// This is a hypothetical implementation based on expected structure

class FlixPatrolClient {
  private baseUrl = "https://api.flixpatrol.com/v1";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getTop10(platform: string, country: string, date?: string) {
    const response = await axios.get(`${this.baseUrl}/top10/${platform}/${country}`, {
      params: {
        apiKey: this.apiKey,
        date: date || new Date().toISOString().split("T")[0]
      }
    });
    return response.data;
  }

  async getTitleRank(titleId: string, platform: string) {
    const response = await axios.get(`${this.baseUrl}/title/${titleId}/rank`, {
      params: {
        apiKey: this.apiKey,
        platform
      }
    });
    return response.data;
  }

  async getPopularityScore(titleId: string) {
    const response = await axios.get(`${this.baseUrl}/title/${titleId}/popularity`, {
      params: { apiKey: this.apiKey }
    });
    return response.data;
  }
}

// Usage (requires premium FlixPatrol subscription)
const flixpatrol = new FlixPatrolClient(process.env.FLIXPATROL_API_KEY);
const netflixTop10 = await flixpatrol.getTop10("netflix", "US");
```

---

### 5.5 Trakt.tv Integration

```javascript
import axios from "axios";

class TraktClient {
  private baseUrl = "https://api.trakt.tv";
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": this.clientId
    };
  }

  async getTrendingMovies(limit: number = 50) {
    const response = await axios.get(`${this.baseUrl}/movies/trending`, {
      headers: this.headers,
      params: { extended: "full", limit }
    });
    return response.data;
  }

  async getPopularMovies(limit: number = 50) {
    const response = await axios.get(`${this.baseUrl}/movies/popular`, {
      headers: this.headers,
      params: { extended: "full", limit }
    });
    return response.data;
  }

  async getMostWatched(period: "daily" | "weekly" | "monthly", limit: number = 50) {
    const response = await axios.get(`${this.baseUrl}/movies/watched/${period}`, {
      headers: this.headers,
      params: { extended: "full", limit }
    });
    return response.data;
  }

  async getMovieDetails(movieId: string) {
    const response = await axios.get(`${this.baseUrl}/movies/${movieId}`, {
      headers: this.headers,
      params: { extended: "full" }
    });
    return response.data;
  }
}

// Usage
const trakt = new TraktClient(process.env.TRAKT_CLIENT_ID);
const trending = await trakt.getTrendingMovies(50);
console.log(trending.map(t => ({ title: t.movie.title, watchers: t.watchers })));
```

---

### 5.6 Reddit Integration

```javascript
import axios from "axios";

class RedditClient {
  private baseUrl = "https://oauth.reddit.com";
  private accessToken: string;

  constructor() {
    // Initialize with OAuth token
  }

  async authenticate(clientId: string, clientSecret: string, username: string, password: string) {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "password",
        username,
        password
      }),
      {
        headers: {
          "Authorization": `Basic ${auth}`,
          "User-Agent": "ContentDiscoveryBot/1.0"
        }
      }
    );

    this.accessToken = response.data.access_token;
  }

  async searchSubreddit(subreddit: string, query: string, timeRange: string = "week") {
    const response = await axios.get(`${this.baseUrl}/r/${subreddit}/search`, {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "User-Agent": "ContentDiscoveryBot/1.0"
      },
      params: {
        q: query,
        restrict_sr: 1,
        sort: "relevance",
        t: timeRange,
        limit: 100
      }
    });

    return response.data.data.children.map(c => c.data);
  }

  async calculateBuzzScore(title: string) {
    const subreddits = ["television", "movies", "netflix"];
    let totalScore = 0;
    let totalPosts = 0;
    let totalComments = 0;

    for (const sub of subreddits) {
      const posts = await this.searchSubreddit(sub, title, "week");
      totalPosts += posts.length;
      totalScore += posts.reduce((sum, p) => sum + p.score, 0);
      totalComments += posts.reduce((sum, p) => sum + p.num_comments, 0);
    }

    return {
      post_count: totalPosts,
      total_score: totalScore,
      avg_score: totalPosts > 0 ? totalScore / totalPosts : 0,
      total_comments: totalComments,
      buzz_score: Math.log10(totalScore + 1) * 20 + Math.log10(totalComments + 1) * 20
    };
  }
}

// Usage (expensive due to API costs)
const reddit = new RedditClient();
await reddit.authenticate(
  process.env.REDDIT_CLIENT_ID,
  process.env.REDDIT_CLIENT_SECRET,
  process.env.REDDIT_USERNAME,
  process.env.REDDIT_PASSWORD
);

const buzz = await reddit.calculateBuzzScore("Inception");
console.log(buzz);
```

---

## 6. Cost Analysis and Recommendations

### 6.1 API Cost Breakdown

| API | Free Tier | Paid Tier | Monthly Cost (Estimated) |
|-----|-----------|-----------|--------------------------|
| **Watchmode** | 1,000 calls | Custom | $50-200 (startup tier) |
| **TMDB** | Unlimited | N/A (commercial license) | $0 (non-commercial) |
| **OMDb** | 1,000/day | Unlimited | $1/month (Patreon) |
| **FlixPatrol** | Web only | Premium + API | $30-100/month (estimated) |
| **Trakt.tv** | Unlimited | N/A | $0 |
| **Reddit** | Small-scale | $0.24/1K calls | $100-500/month (high volume) |
| **NewsAPI** | 100/day | 500-5K/day | $49-449/month |
| **Total** | - | - | **$230-1,250/month** |

### 6.2 Recommended API Stack

**Tier 1: Minimum Viable Product**
- **TMDB**: Primary metadata (free)
- **Watchmode**: Streaming availability (1K free calls/month)
- **Trakt.tv**: Trending signals (free)
- **Total**: $0-1/month

**Tier 2: Production Ready**
- **TMDB**: Metadata + discovery (free)
- **Watchmode**: Full streaming availability ($50-100/month)
- **OMDb**: Ratings aggregation ($1/month)
- **Trakt.tv**: Social engagement (free)
- **NewsAPI**: Press coverage ($49/month)
- **Total**: $100-150/month

**Tier 3: Full-Featured**
- All Tier 2 APIs
- **FlixPatrol**: Platform top 10s ($50-100/month)
- **Reddit**: Limited social buzz monitoring ($100/month)
- **Total**: $250-350/month

### 6.3 Optimization Strategies

**Caching**:
```javascript
// Redis cache for expensive API calls
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function cachedApiCall<T>(
  key: string,
  ttl: number,  // seconds
  fn: () => Promise<T>
): Promise<T> {
  // Check cache
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Call API
  const result = await fn();

  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(result));

  return result;
}

// Usage: Cache TMDB details for 24 hours
const details = await cachedApiCall(
  `tmdb:movie:${id}`,
  86400,
  () => tmdb.getMovieDetails(id)
);
```

**Smart Polling**:
```javascript
// Only update trending scores for titles with recent activity
async function smartTrendingUpdate() {
  const titles = await db.query(`
    SELECT id, tmdb_id, title, last_trend_update
    FROM catalog
    WHERE
      -- Recently added (high priority)
      (added_date > NOW() - INTERVAL '7 days')
      OR
      -- Has streaming availability (medium priority)
      (sources IS NOT NULL AND sources != '[]')
      OR
      -- Previously trending (update less frequently)
      (trend_score > 70 AND last_trend_update < NOW() - INTERVAL '12 hours')
      OR
      -- Low priority (update daily)
      (last_trend_update < NOW() - INTERVAL '24 hours')
    LIMIT 500
  `);

  for (const title of titles) {
    const score = await calculateTrendScore(title.tmdb_id, title.title);
    await updateTrendScore(title.id, score);
  }
}
```

---

## 7. Summary and Recommendations

### 7.1 Recommended Architecture

**Primary Data Sources**:
1. **TMDB API**: Metadata, discovery, trending (free, 50 req/sec)
2. **Watchmode API**: Streaming availability (paid, essential for "where to watch")
3. **Trakt.tv API**: Social engagement and trending (free, good community signals)

**Secondary Data Sources**:
4. **OMDb API**: Multi-source ratings ($1/month, nice-to-have)
5. **NewsAPI**: Press coverage for award boost ($49/month, optional)
6. **FlixPatrol**: Platform top 10s (paid, premium feature)

**Not Recommended Initially**:
- **Reddit API**: Too expensive for social buzz ($0.24/1K calls)
- Use Trakt.tv as primary social signal instead

### 7.2 Update Strategy

- **Hourly**: Catalog sync (new releases, availability changes)
- **Every 6 hours**: Trending scores, platform charts, news coverage
- **Daily**: Full catalog refresh, cleanup old data
- **Real-time**: User interactions, session data

### 7.3 Cost-Effective Implementation

**Phase 1 (MVP)**: $0-1/month
- TMDB (free) + Trakt.tv (free) + Watchmode free tier

**Phase 2 (Production)**: $100-150/month
- Add paid Watchmode + OMDb + NewsAPI

**Phase 3 (Premium)**: $250-350/month
- Add FlixPatrol for platform-specific trending

### 7.4 Integration Priorities

1. ✅ **TMDB**: Implement first (metadata foundation)
2. ✅ **Watchmode**: Critical for streaming availability
3. ✅ **Trakt.tv**: Good free trending signals
4. ⚠️ **OMDb**: Nice-to-have for ratings aggregation
5. ⚠️ **NewsAPI**: Optional for press coverage
6. ❌ **Reddit**: Skip initially (too expensive)
7. ❌ **FlixPatrol**: Premium feature (add later)

---

## Sources

**Content Catalog APIs**:
- [Watchmode - Streaming Availability Metadata API](https://api.watchmode.com/)
- [Watchmode API Documentation](https://api.watchmode.com/docs)
- [OMDb API - The Open Movie Database](https://www.omdbapi.com/)
- [What's the Best Movie Database API? IMDb vs TMDb vs OMDb](https://zuplo.com/learning-center/best-movie-api-imdb-vs-omdb-vs-tmdb)
- [TMDB API - Getting Started](https://developer.themoviedb.org/docs/getting-started)
- [TMDB Rate Limiting](https://developer.themoviedb.org/docs/rate-limiting)
- [JustWatch Content Insights & Streaming Data API](https://media.justwatch.com/content-insights)
- [JustWatch API Documentation](https://apis.justwatch.com/docs/api/)

**Trending Signal APIs**:
- [FlixPatrol - TOP 10 on Streaming](https://flixpatrol.com/)
- [FlixPatrol Streaming Ratings](https://flixpatrol.com/about/product/streaming-ratings/)
- [Trakt.tv - Track Your Shows & Movies](https://trakt.tv/)
- [Trakt API - PublicAPI](https://publicapi.dev/trakt-api)
- [Reddit Social Listening for Marketers](https://www.socialmediatoday.com/news/reddit-guide-social-media-marketing-ai-discovery/804787/)
- [5 Netflix Insights Found Using Reddit Social Panels](https://www.brandwatch.com/blog/reddit-netflix/)

**News APIs**:
- [NewsAPI - Search News and Blog Articles](https://newsapi.org/)
- [NewsAPI Pricing](https://newsapi.org/pricing)
- [9 Best News APIs for Your Business in 2025](https://www.contify.com/resources/blog/best-news-api/)
- [NewsAPI.ai - Real-Time News API](https://newsapi.ai/)

**Trend Algorithms**:
- [Predicting Popularity of Video Streaming Services with Representation Learning](https://pmc.ncbi.nlm.nih.gov/articles/PMC8588537/)
- [Video Streaming Stats 2025: Trends Across VOD, OTT](https://www.vdocipher.com/blog/streaming-statistics-insights-and-trends/)
- [Future of Live Streaming: AI Tools Shaping 2025](https://superagi.com/future-of-live-streaming-trends-and-ai-tools-shaping-the-industry-in-2025-and-beyond/)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-06
**Next Review**: Update costs and API features quarterly
