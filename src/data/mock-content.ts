/**
 * Mock Content Database
 *
 * US/English content catalog for demo purposes.
 * Covers all mood/tone combinations with popular movies and series.
 *
 * Categories:
 * - unwind + laugh: Light comedies, feel-good films
 * - unwind + feel: Emotional dramas, romantic films
 * - engage + thrill: Thrillers, action, crime
 * - engage + think: Documentaries, thought-provoking films
 *
 * @module data/mock-content
 */

export interface MockContent {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  runtime: number;
  language: string;
  genres: string[];
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  director?: string;
  cast?: string[];
  rating: number;
  voteCount: number;
  popularity: number;
  streamingId?: string;
  streamingUrl?: string;
  type: 'movie' | 'series';
  episodeCount?: number;
  seasonCount?: number;
  // Mood matching attributes
  mood: 'unwind' | 'engage';
  tone: 'laugh' | 'feel' | 'thrill' | 'think';
  energy: number;      // 0-1
  valence: number;     // -1 to 1 (negative to positive)
  arousal: number;     // 0-1
  isTrending: boolean;
}

// ============================================================================
// UNWIND + LAUGH (Light comedies, feel-good)
// ============================================================================

const unwindLaughContent: MockContent[] = [
  {
    id: 'comedy-001',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    runtime: 99,
    language: 'en',
    genres: ['Comedy', 'Drama', 'Adventure'],
    overview: 'A legendary concierge at a famous European hotel and his trusted lobby boy become embroiled in a tale of theft, murder, and art.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/nX5XotM9yprCKarRH4fzOq1VM1J.jpg',
    director: 'Wes Anderson',
    cast: ['Ralph Fiennes', 'Tony Revolori', 'Saoirse Ronan'],
    rating: 8.1,
    voteCount: 15800,
    popularity: 92,
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.5,
    valence: 0.8,
    arousal: 0.5,
    isTrending: true
  },
  {
    id: 'comedy-002',
    title: 'Superbad',
    year: 2007,
    runtime: 113,
    language: 'en',
    genres: ['Comedy'],
    overview: 'Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg',
    backdropUrl: null,
    director: 'Greg Mottola',
    cast: ['Jonah Hill', 'Michael Cera', 'Christopher Mintz-Plasse'],
    rating: 7.6,
    voteCount: 12400,
    popularity: 78,
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.7,
    valence: 0.85,
    arousal: 0.6,
    isTrending: false
  },
  {
    id: 'comedy-003',
    title: 'The Hangover',
    year: 2009,
    runtime: 100,
    language: 'en',
    genres: ['Comedy'],
    overview: 'Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night and the groom missing.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/uluhlXubGu1VxU63X9VHCLWDAYP.jpg',
    backdropUrl: null,
    director: 'Todd Phillips',
    cast: ['Bradley Cooper', 'Ed Helms', 'Zach Galifianakis'],
    rating: 7.7,
    voteCount: 18200,
    popularity: 85,
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.7,
    valence: 0.9,
    arousal: 0.65,
    isTrending: false
  },
  {
    id: 'comedy-004',
    title: 'Bridesmaids',
    year: 2011,
    runtime: 125,
    language: 'en',
    genres: ['Comedy', 'Romance'],
    overview: 'Competition between the maid of honor and a bridesmaid over who is the bride\'s best friend threatens to upend the life of an idealistic woman.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/cSudgN2uo1lDI4GFaEzLR5d3W6H.jpg',
    backdropUrl: null,
    director: 'Paul Feig',
    cast: ['Kristen Wiig', 'Maya Rudolph', 'Melissa McCarthy'],
    rating: 6.8,
    voteCount: 9800,
    popularity: 72,
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.6,
    valence: 0.8,
    arousal: 0.55,
    isTrending: false
  },
  {
    id: 'comedy-005',
    title: 'Knives Out',
    year: 2019,
    runtime: 130,
    language: 'en',
    genres: ['Comedy', 'Crime', 'Mystery'],
    overview: 'A detective investigates the death of a patriarch of an eccentric, combative family, where everyone is a suspect.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    backdropUrl: null,
    director: 'Rian Johnson',
    cast: ['Daniel Craig', 'Ana de Armas', 'Chris Evans'],
    rating: 7.9,
    voteCount: 14500,
    popularity: 88,
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.55,
    valence: 0.75,
    arousal: 0.6,
    isTrending: true
  },
  // Series
  {
    id: 'comedy-series-001',
    title: 'The Office',
    year: 2005,
    runtime: 22,
    language: 'en',
    genres: ['Comedy'],
    overview: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg',
    backdropUrl: null,
    cast: ['Steve Carell', 'Rainn Wilson', 'John Krasinski'],
    rating: 8.9,
    voteCount: 24500,
    popularity: 95,
    type: 'series',
    episodeCount: 201,
    seasonCount: 9,
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.5,
    valence: 0.85,
    arousal: 0.5,
    isTrending: true
  },
  {
    id: 'comedy-series-002',
    title: 'Parks and Recreation',
    year: 2009,
    runtime: 22,
    language: 'en',
    genres: ['Comedy'],
    overview: 'The absurd antics of an Indiana town\'s public officials as they pursue sundry projects to make their city a better place.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ydXFxZHhjHRIIe3hzIYGLmLEPjX.jpg',
    backdropUrl: null,
    cast: ['Amy Poehler', 'Nick Offerman', 'Chris Pratt'],
    rating: 8.6,
    voteCount: 18200,
    popularity: 88,
    type: 'series',
    episodeCount: 125,
    seasonCount: 7,
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.55,
    valence: 0.9,
    arousal: 0.5,
    isTrending: false
  }
];

// ============================================================================
// UNWIND + FEEL (Emotional, romantic, touching)
// ============================================================================

const unwindFeelContent: MockContent[] = [
  {
    id: 'drama-001',
    title: 'The Shawshank Redemption',
    year: 1994,
    runtime: 142,
    language: 'en',
    genres: ['Drama', 'Crime'],
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    rating: 9.3,
    voteCount: 26500,
    popularity: 98,
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.4,
    valence: 0.6,
    arousal: 0.5,
    isTrending: true
  },
  {
    id: 'drama-002',
    title: 'Forrest Gump',
    year: 1994,
    runtime: 142,
    language: 'en',
    genres: ['Drama', 'Romance'],
    overview: 'The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man with an IQ of 75.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdropUrl: null,
    director: 'Robert Zemeckis',
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    rating: 8.8,
    voteCount: 22400,
    popularity: 92,
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.45,
    valence: 0.7,
    arousal: 0.45,
    isTrending: false
  },
  {
    id: 'drama-003',
    title: 'The Notebook',
    year: 2004,
    runtime: 123,
    language: 'en',
    genres: ['Drama', 'Romance'],
    overview: 'A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated by their social differences.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg',
    backdropUrl: null,
    director: 'Nick Cassavetes',
    cast: ['Ryan Gosling', 'Rachel McAdams', 'James Garner'],
    rating: 7.8,
    voteCount: 14200,
    popularity: 82,
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.35,
    valence: 0.65,
    arousal: 0.4,
    isTrending: false
  },
  {
    id: 'drama-004',
    title: 'Good Will Hunting',
    year: 1997,
    runtime: 126,
    language: 'en',
    genres: ['Drama', 'Romance'],
    overview: 'Will Hunting, a janitor at M.I.T., has a gift for mathematics, but needs help from a psychologist to find direction in his life.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/bABCBKYBK7A5G1x0FzoeoNfuj2b.jpg',
    backdropUrl: null,
    director: 'Gus Van Sant',
    cast: ['Matt Damon', 'Robin Williams', 'Ben Affleck'],
    rating: 8.3,
    voteCount: 16800,
    popularity: 85,
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.4,
    valence: 0.6,
    arousal: 0.45,
    isTrending: false
  },
  {
    id: 'drama-005',
    title: 'Up',
    year: 2009,
    runtime: 96,
    language: 'en',
    genres: ['Animation', 'Adventure', 'Comedy'],
    overview: 'A 78-year-old balloon salesman ties thousands of balloons to his house and flies to South America, inadvertently taking a young stowaway.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mwDnSQR1CkxuDjSKfoCNxcYVHcx.jpg',
    backdropUrl: null,
    director: 'Pete Docter',
    cast: ['Ed Asner', 'Jordan Nagai', 'Christopher Plummer'],
    rating: 8.3,
    voteCount: 19200,
    popularity: 88,
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.5,
    valence: 0.7,
    arousal: 0.5,
    isTrending: true
  },
  // Series
  {
    id: 'drama-series-001',
    title: 'This Is Us',
    year: 2016,
    runtime: 45,
    language: 'en',
    genres: ['Drama', 'Comedy', 'Romance'],
    overview: 'A heartwarming and emotional story about a unique set of triplets, their struggles and their wonderful parents.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/huxmY6Dmzwpv5Q2hnUYyzKvS5ga.jpg',
    backdropUrl: null,
    cast: ['Milo Ventimiglia', 'Mandy Moore', 'Sterling K. Brown'],
    rating: 8.7,
    voteCount: 8900,
    popularity: 82,
    type: 'series',
    episodeCount: 106,
    seasonCount: 6,
    mood: 'unwind',
    tone: 'feel',
    energy: 0.4,
    valence: 0.55,
    arousal: 0.45,
    isTrending: false
  },
  {
    id: 'drama-series-002',
    title: 'Ted Lasso',
    year: 2020,
    runtime: 30,
    language: 'en',
    genres: ['Comedy', 'Drama', 'Sport'],
    overview: 'An American football coach hired to manage a British soccer team despite having no experience leads with optimism and kindness.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg',
    backdropUrl: null,
    cast: ['Jason Sudeikis', 'Hannah Waddingham', 'Brett Goldstein'],
    rating: 8.8,
    voteCount: 12400,
    popularity: 92,
    type: 'series',
    episodeCount: 34,
    seasonCount: 3,
    mood: 'unwind',
    tone: 'feel',
    energy: 0.5,
    valence: 0.85,
    arousal: 0.5,
    isTrending: true
  }
];

// ============================================================================
// ENGAGE + THRILL (Thrillers, action, crime)
// ============================================================================

const engageThrillContent: MockContent[] = [
  {
    id: 'thriller-001',
    title: 'The Dark Knight',
    year: 2008,
    runtime: 152,
    language: 'en',
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    overview: 'When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    rating: 9.0,
    voteCount: 32500,
    popularity: 98,
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.85,
    valence: 0.2,
    arousal: 0.9,
    isTrending: true
  },
  {
    id: 'thriller-002',
    title: 'Inception',
    year: 2010,
    runtime: 148,
    language: 'en',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    backdropUrl: null,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    rating: 8.8,
    voteCount: 28400,
    popularity: 95,
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.8,
    valence: 0.3,
    arousal: 0.85,
    isTrending: true
  },
  {
    id: 'thriller-003',
    title: 'John Wick',
    year: 2014,
    runtime: 101,
    language: 'en',
    genres: ['Action', 'Thriller'],
    overview: 'An ex-hitman comes out of retirement to track down the gangsters who killed his dog and took everything from him.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg',
    backdropUrl: null,
    director: 'Chad Stahelski',
    cast: ['Keanu Reeves', 'Michael Nyqvist', 'Alfie Allen'],
    rating: 7.4,
    voteCount: 18200,
    popularity: 88,
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.9,
    valence: 0.1,
    arousal: 0.92,
    isTrending: false
  },
  {
    id: 'thriller-004',
    title: 'Gone Girl',
    year: 2014,
    runtime: 149,
    language: 'en',
    genres: ['Drama', 'Mystery', 'Thriller'],
    overview: 'With his wife\'s disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him when it\'s suspected he may not be innocent.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qymaJh9SfJPZLwP7UWlP2xjGZCh.jpg',
    backdropUrl: null,
    director: 'David Fincher',
    cast: ['Ben Affleck', 'Rosamund Pike', 'Neil Patrick Harris'],
    rating: 8.1,
    voteCount: 16800,
    popularity: 85,
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.7,
    valence: -0.1,
    arousal: 0.8,
    isTrending: false
  },
  {
    id: 'thriller-005',
    title: 'Get Out',
    year: 2017,
    runtime: 104,
    language: 'en',
    genres: ['Horror', 'Mystery', 'Thriller'],
    overview: 'A young African-American visits his white girlfriend\'s parents for the weekend, where his simmering uneasiness about their reception of him reaches a boiling point.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3zy7fXEPNm2z9D3v.jpg',
    backdropUrl: null,
    director: 'Jordan Peele',
    cast: ['Daniel Kaluuya', 'Allison Williams', 'Bradley Whitford'],
    rating: 7.7,
    voteCount: 14500,
    popularity: 82,
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.75,
    valence: -0.2,
    arousal: 0.85,
    isTrending: false
  },
  {
    id: 'thriller-006',
    title: 'Oppenheimer',
    year: 2023,
    runtime: 180,
    language: 'en',
    genres: ['Biography', 'Drama', 'History'],
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: null,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Robert Downey Jr.'],
    rating: 8.4,
    voteCount: 22800,
    popularity: 96,
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.7,
    valence: 0.1,
    arousal: 0.75,
    isTrending: true
  },
  // Series
  {
    id: 'thriller-series-001',
    title: 'Breaking Bad',
    year: 2008,
    runtime: 49,
    language: 'en',
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'A high school chemistry teacher diagnosed with lung cancer turns to manufacturing and selling meth to secure his family\'s future.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdropUrl: null,
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
    rating: 9.5,
    voteCount: 28500,
    popularity: 98,
    type: 'series',
    episodeCount: 62,
    seasonCount: 5,
    mood: 'engage',
    tone: 'thrill',
    energy: 0.75,
    valence: 0.0,
    arousal: 0.85,
    isTrending: true
  },
  {
    id: 'thriller-series-002',
    title: 'Stranger Things',
    year: 2016,
    runtime: 51,
    language: 'en',
    genres: ['Drama', 'Fantasy', 'Horror'],
    overview: 'When a young boy disappears, his mother and friends must confront terrifying supernatural forces in order to get him back.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropUrl: null,
    cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
    rating: 8.7,
    voteCount: 24800,
    popularity: 95,
    type: 'series',
    episodeCount: 42,
    seasonCount: 5,
    mood: 'engage',
    tone: 'thrill',
    energy: 0.7,
    valence: 0.2,
    arousal: 0.8,
    isTrending: true
  },
  {
    id: 'thriller-series-003',
    title: 'The Last of Us',
    year: 2023,
    runtime: 55,
    language: 'en',
    genres: ['Action', 'Adventure', 'Drama'],
    overview: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity\'s last hope.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    backdropUrl: null,
    cast: ['Pedro Pascal', 'Bella Ramsey', 'Anna Torv'],
    rating: 8.8,
    voteCount: 18500,
    popularity: 94,
    type: 'series',
    episodeCount: 16,
    seasonCount: 2,
    mood: 'engage',
    tone: 'thrill',
    energy: 0.75,
    valence: 0.1,
    arousal: 0.8,
    isTrending: true
  }
];

// ============================================================================
// ENGAGE + THINK (Documentaries, thought-provoking)
// ============================================================================

const engageThinkContent: MockContent[] = [
  {
    id: 'think-001',
    title: 'The Social Dilemma',
    year: 2020,
    runtime: 94,
    language: 'en',
    genres: ['Documentary', 'Drama'],
    overview: 'Tech experts from Silicon Valley sound the alarm on the dangerous impact of social networking, which big tech companies exploit for profit.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7aGIGxkr5rO4cw5VuaI7uV4UCJK.jpg',
    backdropUrl: null,
    director: 'Jeff Orlowski',
    cast: ['Tristan Harris', 'Jeff Seibert', 'Bailey Richardson'],
    rating: 7.6,
    voteCount: 8200,
    popularity: 78,
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.5,
    valence: 0.1,
    arousal: 0.6,
    isTrending: false
  },
  {
    id: 'think-002',
    title: 'Interstellar',
    year: 2014,
    runtime: 169,
    language: 'en',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival as Earth becomes uninhabitable.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: null,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    rating: 8.6,
    voteCount: 28400,
    popularity: 95,
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.6,
    valence: 0.4,
    arousal: 0.7,
    isTrending: true
  },
  {
    id: 'think-003',
    title: 'The Matrix',
    year: 1999,
    runtime: 136,
    language: 'en',
    genres: ['Action', 'Sci-Fi'],
    overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdropUrl: null,
    director: 'The Wachowskis',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    rating: 8.7,
    voteCount: 26800,
    popularity: 92,
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.75,
    valence: 0.3,
    arousal: 0.8,
    isTrending: false
  },
  {
    id: 'think-004',
    title: 'A Beautiful Mind',
    year: 2001,
    runtime: 135,
    language: 'en',
    genres: ['Biography', 'Drama'],
    overview: 'After John Nash accepts secret work in cryptography, his life takes a turn for the nightmarish as he battles schizophrenia.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/zwi4MQG8jJFzCE3A7x3ejxJKDMg.jpg',
    backdropUrl: null,
    director: 'Ron Howard',
    cast: ['Russell Crowe', 'Ed Harris', 'Jennifer Connelly'],
    rating: 8.2,
    voteCount: 14500,
    popularity: 82,
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.45,
    valence: 0.3,
    arousal: 0.55,
    isTrending: false
  },
  {
    id: 'think-005',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    runtime: 139,
    language: 'en',
    genres: ['Action', 'Adventure', 'Comedy'],
    overview: 'A middle-aged Chinese immigrant is swept up into an insane adventure where she alone can save existence by exploring other universes.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    backdropUrl: null,
    director: 'Daniel Kwan',
    cast: ['Michelle Yeoh', 'Stephanie Hsu', 'Ke Huy Quan'],
    rating: 8.0,
    voteCount: 18500,
    popularity: 90,
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.8,
    valence: 0.5,
    arousal: 0.75,
    isTrending: true
  },
  // Series
  {
    id: 'think-series-001',
    title: 'Black Mirror',
    year: 2011,
    runtime: 60,
    language: 'en',
    genres: ['Drama', 'Sci-Fi', 'Thriller'],
    overview: 'An anthology series exploring a twisted, high-tech multiverse where humanity\'s greatest innovations and darkest instincts collide.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5UaYsGZOFhjFDwQh6GuLjjA1WlF.jpg',
    backdropUrl: null,
    cast: ['Various'],
    rating: 8.8,
    voteCount: 18200,
    popularity: 88,
    type: 'series',
    episodeCount: 27,
    seasonCount: 6,
    mood: 'engage',
    tone: 'think',
    energy: 0.6,
    valence: 0.0,
    arousal: 0.7,
    isTrending: true
  },
  {
    id: 'think-series-002',
    title: 'Severance',
    year: 2022,
    runtime: 50,
    language: 'en',
    genres: ['Drama', 'Mystery', 'Sci-Fi'],
    overview: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/lFf6LLrQjYZgvWgjJelNDdQxXNk.jpg',
    backdropUrl: null,
    cast: ['Adam Scott', 'Zach Cherry', 'Britt Lower'],
    rating: 8.7,
    voteCount: 12500,
    popularity: 85,
    type: 'series',
    episodeCount: 19,
    seasonCount: 2,
    mood: 'engage',
    tone: 'think',
    energy: 0.5,
    valence: 0.1,
    arousal: 0.65,
    isTrending: true
  },
  {
    id: 'think-series-003',
    title: 'The Bear',
    year: 2022,
    runtime: 30,
    language: 'en',
    genres: ['Comedy', 'Drama'],
    overview: 'A young chef from the fine dining world returns to Chicago to run his family sandwich shop after a tragedy.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg',
    backdropUrl: null,
    cast: ['Jeremy Allen White', 'Ebon Moss-Bachrach', 'Ayo Edebiri'],
    rating: 8.6,
    voteCount: 14200,
    popularity: 88,
    type: 'series',
    episodeCount: 28,
    seasonCount: 3,
    mood: 'engage',
    tone: 'think',
    energy: 0.7,
    valence: 0.3,
    arousal: 0.7,
    isTrending: true
  }
];

// ============================================================================
// Export All Content
// ============================================================================

export const ALL_MOCK_CONTENT: MockContent[] = [
  ...unwindLaughContent,
  ...unwindFeelContent,
  ...engageThrillContent,
  ...engageThinkContent
];

/**
 * Get content by mood and tone
 */
export function getContentByMoodTone(
  mood: 'unwind' | 'engage',
  tone: 'laugh' | 'feel' | 'thrill' | 'think',
  options?: {
    type?: 'movie' | 'series' | 'any';
    limit?: number;
    includeTrending?: boolean;
  }
): MockContent[] {
  let filtered = ALL_MOCK_CONTENT.filter(c => c.mood === mood && c.tone === tone);

  if (options?.type && options.type !== 'any') {
    filtered = filtered.filter(c => c.type === options.type);
  }

  if (options?.includeTrending) {
    // Sort trending first
    filtered = filtered.sort((a, b) => {
      if (a.isTrending && !b.isTrending) return -1;
      if (!a.isTrending && b.isTrending) return 1;
      return b.popularity - a.popularity;
    });
  }

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Get trending content
 */
export function getTrendingContent(limit = 10): MockContent[] {
  return ALL_MOCK_CONTENT
    .filter(c => c.isTrending)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Search content by title
 */
export function searchContent(query: string): MockContent[] {
  const lowerQuery = query.toLowerCase();
  return ALL_MOCK_CONTENT.filter(c =>
    c.title.toLowerCase().includes(lowerQuery) ||
    (c.originalTitle && c.originalTitle.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get content by ID
 */
export function getContentById(id: string): MockContent | undefined {
  return ALL_MOCK_CONTENT.find(c => c.id === id);
}
