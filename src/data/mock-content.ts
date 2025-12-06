/**
 * Mock Content Database
 *
 * Comprehensive French content catalog for demo purposes.
 * Covers all mood/tone combinations with real French films and series.
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
  tv5Id: string;
  tv5Deeplink: string;
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
    id: 'fr-comedy-001',
    title: 'Les Intouchables',
    originalTitle: 'Intouchables',
    year: 2011,
    runtime: 112,
    language: 'fr',
    genres: ['Comedy', 'Drama'],
    overview: 'After he becomes a quadriplegic from a paragliding accident, an aristocrat hires a young man from the projects to be his caregiver. An unlikely friendship forms as they inspire each other.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/323BP0itpxTsO0skTwdnVmf7YC9.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/ihWaJZCUIon2dXcosjQG2JHJAPN.jpg',
    director: 'Olivier Nakache',
    cast: ['François Cluzet', 'Omar Sy', 'Anne Le Ny'],
    rating: 8.5,
    voteCount: 12500,
    popularity: 95,
    tv5Id: 'tv5-intouchables',
    tv5Deeplink: 'https://www.tv5monde.com/watch/les-intouchables',
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.4,
    valence: 0.8,
    arousal: 0.5,
    isTrending: true
  },
  {
    id: 'fr-comedy-002',
    title: 'Bienvenue chez les Ch\'tis',
    year: 2008,
    runtime: 106,
    language: 'fr',
    genres: ['Comedy'],
    overview: 'A French postal worker is transferred to the far north of France. He discovers the warmth and humor of the locals, challenging his preconceptions about the region.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/yhrFfunQf9r4kxrW6RJBi0z4kLs.jpg',
    backdropUrl: null,
    director: 'Dany Boon',
    cast: ['Kad Merad', 'Dany Boon', 'Zoé Félix'],
    rating: 7.2,
    voteCount: 8700,
    popularity: 78,
    tv5Id: 'tv5-chtis',
    tv5Deeplink: 'https://www.tv5monde.com/watch/bienvenue-chtis',
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.5,
    valence: 0.9,
    arousal: 0.4,
    isTrending: false
  },
  {
    id: 'fr-comedy-003',
    title: 'Le Dîner de Cons',
    year: 1998,
    runtime: 80,
    language: 'fr',
    genres: ['Comedy'],
    overview: 'A group of rich Parisians compete to bring the biggest "idiot" to their weekly dinner. But the tables turn when one guest proves to be smarter than expected.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2Qv6vPDCL5gDLrCv9FZlCf5R5D.jpg',
    backdropUrl: null,
    director: 'Francis Veber',
    cast: ['Jacques Villeret', 'Thierry Lhermitte', 'Francis Huster'],
    rating: 7.6,
    voteCount: 6200,
    popularity: 65,
    tv5Id: 'tv5-diner-cons',
    tv5Deeplink: 'https://www.tv5monde.com/watch/diner-de-cons',
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.5,
    valence: 0.85,
    arousal: 0.5,
    isTrending: false
  },
  {
    id: 'fr-comedy-004',
    title: 'Qu\'est-ce qu\'on a fait au Bon Dieu?',
    originalTitle: 'Serial (Bad) Weddings',
    year: 2014,
    runtime: 97,
    language: 'fr',
    genres: ['Comedy'],
    overview: 'A Catholic French couple sees their four daughters marry men of different religions and backgrounds, leading to hilarious family dynamics.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2wFLBODmEuTBPHB4VUxD9Ty4Z4m.jpg',
    backdropUrl: null,
    director: 'Philippe de Chauveron',
    cast: ['Christian Clavier', 'Chantal Lauby', 'Ary Abittan'],
    rating: 6.8,
    voteCount: 5800,
    popularity: 72,
    tv5Id: 'tv5-bon-dieu',
    tv5Deeplink: 'https://www.tv5monde.com/watch/bon-dieu',
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.6,
    valence: 0.8,
    arousal: 0.5,
    isTrending: true
  },
  {
    id: 'fr-comedy-005',
    title: 'OSS 117: Le Caire, nid d\'espions',
    year: 2006,
    runtime: 99,
    language: 'fr',
    genres: ['Comedy', 'Action'],
    overview: 'A suave but clueless French secret agent travels to Cairo in 1955 to investigate the death of a colleague. A brilliant parody of spy films.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/nBYV5R0yKoJg3NvJHoWZ4Xr4iE5.jpg',
    backdropUrl: null,
    director: 'Michel Hazanavicius',
    cast: ['Jean Dujardin', 'Bérénice Bejo', 'Aure Atika'],
    rating: 7.3,
    voteCount: 4900,
    popularity: 68,
    tv5Id: 'tv5-oss117-caire',
    tv5Deeplink: 'https://www.tv5monde.com/watch/oss117-caire',
    type: 'movie',
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.6,
    valence: 0.85,
    arousal: 0.6,
    isTrending: false
  },
  // Series
  {
    id: 'fr-comedy-series-001',
    title: 'Dix pour cent',
    originalTitle: 'Call My Agent!',
    year: 2015,
    runtime: 52,
    language: 'fr',
    genres: ['Comedy', 'Drama'],
    overview: 'A Parisian talent agency navigates the egos and demands of French celebrities while dealing with their own complicated personal lives.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/rgMfhcrVZjuy5b0JvXwGGTapUCr.jpg',
    backdropUrl: null,
    cast: ['Camille Cottin', 'Thibault de Montalembert', 'Grégory Montel'],
    rating: 8.2,
    voteCount: 3400,
    popularity: 85,
    tv5Id: 'tv5-dix-pour-cent',
    tv5Deeplink: 'https://www.tv5monde.com/watch/dix-pour-cent',
    type: 'series',
    episodeCount: 24,
    seasonCount: 4,
    mood: 'unwind',
    tone: 'laugh',
    energy: 0.5,
    valence: 0.75,
    arousal: 0.5,
    isTrending: true
  }
];

// ============================================================================
// UNWIND + FEEL (Emotional, romantic, touching)
// ============================================================================

const unwindFeelContent: MockContent[] = [
  {
    id: 'fr-drama-001',
    title: 'Amélie',
    originalTitle: 'Le Fabuleux Destin d\'Amélie Poulain',
    year: 2001,
    runtime: 122,
    language: 'fr',
    genres: ['Comedy', 'Romance', 'Fantasy'],
    overview: 'A whimsical young woman in Montmartre decides to change the lives of those around her for the better, while struggling with her own isolation.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f0uorE7K7SSBChsIChKFgWkfJLR.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/nWiOHQjiN2SxMj5MPEG79gLnQhM.jpg',
    director: 'Jean-Pierre Jeunet',
    cast: ['Audrey Tautou', 'Mathieu Kassovitz', 'Rufus'],
    rating: 8.3,
    voteCount: 18200,
    popularity: 92,
    tv5Id: 'tv5-amelie',
    tv5Deeplink: 'https://www.tv5monde.com/watch/amelie',
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.4,
    valence: 0.7,
    arousal: 0.4,
    isTrending: true
  },
  {
    id: 'fr-drama-002',
    title: 'La Vie en Rose',
    originalTitle: 'La Môme',
    year: 2007,
    runtime: 140,
    language: 'fr',
    genres: ['Biography', 'Drama', 'Music'],
    overview: 'The extraordinary story of Édith Piaf, from her impoverished childhood to becoming the most celebrated singer in France.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/a8BjYQKnG2RAmQRWfK5bBDLF7gG.jpg',
    backdropUrl: null,
    director: 'Olivier Dahan',
    cast: ['Marion Cotillard', 'Sylvie Testud', 'Pascal Greggory'],
    rating: 7.6,
    voteCount: 8900,
    popularity: 78,
    tv5Id: 'tv5-vie-en-rose',
    tv5Deeplink: 'https://www.tv5monde.com/watch/la-vie-en-rose',
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.4,
    valence: 0.3,
    arousal: 0.5,
    isTrending: false
  },
  {
    id: 'fr-drama-003',
    title: 'Les Choristes',
    year: 2004,
    runtime: 97,
    language: 'fr',
    genres: ['Drama', 'Music'],
    overview: 'A failed musician takes a job as a teacher at a boarding school for troubled boys and transforms their lives through music.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/bfzSYgJmyGzRz2nF4b6w8RxGPHo.jpg',
    backdropUrl: null,
    director: 'Christophe Barratier',
    cast: ['Gérard Jugnot', 'François Berléand', 'Jean-Baptiste Maunier'],
    rating: 7.8,
    voteCount: 7200,
    popularity: 75,
    tv5Id: 'tv5-choristes',
    tv5Deeplink: 'https://www.tv5monde.com/watch/les-choristes',
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.35,
    valence: 0.65,
    arousal: 0.4,
    isTrending: false
  },
  {
    id: 'fr-drama-004',
    title: 'Le Petit Prince',
    year: 2015,
    runtime: 108,
    language: 'fr',
    genres: ['Animation', 'Fantasy', 'Family'],
    overview: 'A little girl lives in a very grown-up world with her mother. When she befriends an elderly aviator, she discovers a magical story.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5zM5j2pLfN7T0uo6q3P0h7h0jl4.jpg',
    backdropUrl: null,
    director: 'Mark Osborne',
    cast: ['Rachel McAdams', 'Jeff Bridges', 'Marion Cotillard'],
    rating: 7.7,
    voteCount: 6800,
    popularity: 72,
    tv5Id: 'tv5-petit-prince',
    tv5Deeplink: 'https://www.tv5monde.com/watch/le-petit-prince',
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.3,
    valence: 0.6,
    arousal: 0.35,
    isTrending: false
  },
  {
    id: 'fr-drama-005',
    title: 'Séraphine',
    year: 2008,
    runtime: 125,
    language: 'fr',
    genres: ['Biography', 'Drama'],
    overview: 'The true story of Séraphine Louis, a humble housekeeper who became one of the most celebrated naive painters of the early 20th century.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gWzF0oIcLfL5N8v4Fh3b2L1ZRZN.jpg',
    backdropUrl: null,
    director: 'Martin Provost',
    cast: ['Yolande Moreau', 'Ulrich Tukur', 'Anne Bennent'],
    rating: 7.4,
    voteCount: 4200,
    popularity: 58,
    tv5Id: 'tv5-seraphine',
    tv5Deeplink: 'https://www.tv5monde.com/watch/seraphine',
    type: 'movie',
    mood: 'unwind',
    tone: 'feel',
    energy: 0.25,
    valence: 0.4,
    arousal: 0.3,
    isTrending: false
  },
  // Series
  {
    id: 'fr-drama-series-001',
    title: 'Un Village Français',
    year: 2009,
    runtime: 52,
    language: 'fr',
    genres: ['Drama', 'War', 'History'],
    overview: 'The daily life of inhabitants of a village in central France during the German occupation in World War II.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/4Qm9v6DbjW9q5qWD8Qa7FEYUZ6.jpg',
    backdropUrl: null,
    cast: ['Robin Renucci', 'Audrey Fleurot', 'Thierry Godard'],
    rating: 8.1,
    voteCount: 2800,
    popularity: 65,
    tv5Id: 'tv5-village-francais',
    tv5Deeplink: 'https://www.tv5monde.com/watch/un-village-francais',
    type: 'series',
    episodeCount: 72,
    seasonCount: 7,
    mood: 'unwind',
    tone: 'feel',
    energy: 0.35,
    valence: 0.2,
    arousal: 0.45,
    isTrending: false
  }
];

// ============================================================================
// ENGAGE + THRILL (Thrillers, action, crime)
// ============================================================================

const engageThrillContent: MockContent[] = [
  {
    id: 'fr-thriller-001',
    title: 'Ne le dis à personne',
    originalTitle: 'Tell No One',
    year: 2006,
    runtime: 131,
    language: 'fr',
    genres: ['Crime', 'Drama', 'Mystery', 'Thriller'],
    overview: 'Eight years after his wife\'s murder, a doctor receives an anonymous email suggesting she may still be alive, leading him into a deadly conspiracy.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/bBKRFm5i5q0o4HgAEh8qDI6SZGZ.jpg',
    backdropUrl: null,
    director: 'Guillaume Canet',
    cast: ['François Cluzet', 'Marie-Josée Croze', 'André Dussollier'],
    rating: 7.6,
    voteCount: 6400,
    popularity: 72,
    tv5Id: 'tv5-ne-le-dis',
    tv5Deeplink: 'https://www.tv5monde.com/watch/ne-le-dis-a-personne',
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.7,
    valence: 0.1,
    arousal: 0.8,
    isTrending: true
  },
  {
    id: 'fr-thriller-002',
    title: 'La Haine',
    year: 1995,
    runtime: 98,
    language: 'fr',
    genres: ['Drama', 'Crime'],
    overview: '24 hours in the lives of three young men in the French suburbs following riots. A powerful, visceral portrait of urban tension.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vg3HcJaLRfvxu77j5aXc0qRdGT1.jpg',
    backdropUrl: null,
    director: 'Mathieu Kassovitz',
    cast: ['Vincent Cassel', 'Hubert Koundé', 'Saïd Taghmaoui'],
    rating: 8.1,
    voteCount: 8700,
    popularity: 82,
    tv5Id: 'tv5-la-haine',
    tv5Deeplink: 'https://www.tv5monde.com/watch/la-haine',
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.75,
    valence: -0.2,
    arousal: 0.85,
    isTrending: false
  },
  {
    id: 'fr-thriller-003',
    title: 'Le Prophète',
    originalTitle: 'A Prophet',
    year: 2009,
    runtime: 155,
    language: 'fr',
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'A young Arab man is sent to a French prison where he rises through the ranks of organized crime, becoming a powerful figure in the criminal underworld.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/nUG9i8N5I5q6pQ1qjM3qC3qv4gK.jpg',
    backdropUrl: null,
    director: 'Jacques Audiard',
    cast: ['Tahar Rahim', 'Niels Arestrup', 'Adel Bencherif'],
    rating: 7.9,
    voteCount: 5200,
    popularity: 68,
    tv5Id: 'tv5-prophete',
    tv5Deeplink: 'https://www.tv5monde.com/watch/le-prophete',
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.7,
    valence: -0.1,
    arousal: 0.75,
    isTrending: false
  },
  {
    id: 'fr-thriller-004',
    title: 'Les Rivières Pourpres',
    originalTitle: 'The Crimson Rivers',
    year: 2000,
    runtime: 106,
    language: 'fr',
    genres: ['Crime', 'Mystery', 'Thriller'],
    overview: 'Two detectives investigate separate cases that lead them to a remote mountain town, where they uncover a terrifying conspiracy.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/zF2LFcG3B0oLiZCjGVmhZXfh4aT.jpg',
    backdropUrl: null,
    director: 'Mathieu Kassovitz',
    cast: ['Jean Reno', 'Vincent Cassel', 'Nadia Farès'],
    rating: 6.8,
    voteCount: 4800,
    popularity: 65,
    tv5Id: 'tv5-rivieres-pourpres',
    tv5Deeplink: 'https://www.tv5monde.com/watch/les-rivieres-pourpres',
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.75,
    valence: -0.1,
    arousal: 0.8,
    isTrending: false
  },
  {
    id: 'fr-thriller-005',
    title: 'Bac Nord',
    year: 2021,
    runtime: 104,
    language: 'fr',
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'Based on true events, three cops from the tough northern districts of Marseille are caught up in a corruption scandal that threatens their careers.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fkBr1wJdPXCOFJ5v3k8jLCmHQmH.jpg',
    backdropUrl: null,
    director: 'Cédric Jimenez',
    cast: ['Gilles Lellouche', 'François Civil', 'Karim Leklou'],
    rating: 7.1,
    voteCount: 3200,
    popularity: 75,
    tv5Id: 'tv5-bac-nord',
    tv5Deeplink: 'https://www.tv5monde.com/watch/bac-nord',
    type: 'movie',
    mood: 'engage',
    tone: 'thrill',
    energy: 0.8,
    valence: 0.0,
    arousal: 0.85,
    isTrending: true
  },
  // Series
  {
    id: 'fr-thriller-series-001',
    title: 'Lupin',
    year: 2021,
    runtime: 45,
    language: 'fr',
    genres: ['Crime', 'Drama', 'Mystery'],
    overview: 'Inspired by the adventures of Arsène Lupin, a gentleman thief seeks revenge against a wealthy family for their role in his father\'s death.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/sgxawbFBk8Y0vMW6K7cXj75F6jt.jpg',
    backdropUrl: null,
    cast: ['Omar Sy', 'Ludivine Sagnier', 'Clotilde Hesme'],
    rating: 7.5,
    voteCount: 8500,
    popularity: 95,
    tv5Id: 'tv5-lupin',
    tv5Deeplink: 'https://www.tv5monde.com/watch/lupin',
    type: 'series',
    episodeCount: 17,
    seasonCount: 3,
    mood: 'engage',
    tone: 'thrill',
    energy: 0.7,
    valence: 0.3,
    arousal: 0.75,
    isTrending: true
  },
  {
    id: 'fr-thriller-series-002',
    title: 'Engrenages',
    originalTitle: 'Spiral',
    year: 2005,
    runtime: 52,
    language: 'fr',
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'A gripping police procedural following a team of Paris police officers and the judiciary as they investigate complex criminal cases.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/eRQz7iLiDXQJwJXGjGOOFFZZ2YU.jpg',
    backdropUrl: null,
    cast: ['Caroline Proust', 'Thierry Godard', 'Audrey Fleurot'],
    rating: 8.3,
    voteCount: 4200,
    popularity: 78,
    tv5Id: 'tv5-engrenages',
    tv5Deeplink: 'https://www.tv5monde.com/watch/engrenages',
    type: 'series',
    episodeCount: 96,
    seasonCount: 8,
    mood: 'engage',
    tone: 'thrill',
    energy: 0.65,
    valence: 0.0,
    arousal: 0.7,
    isTrending: false
  }
];

// ============================================================================
// ENGAGE + THINK (Documentaries, thought-provoking)
// ============================================================================

const engageThinkContent: MockContent[] = [
  {
    id: 'fr-think-001',
    title: 'Entre les murs',
    originalTitle: 'The Class',
    year: 2008,
    runtime: 128,
    language: 'fr',
    genres: ['Drama'],
    overview: 'A year in the life of a French teacher in a tough inner-city high school. A provocative look at education, culture, and identity.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wYR5XQn5Q8ZYHJDT3bSiHfOeFqS.jpg',
    backdropUrl: null,
    director: 'Laurent Cantet',
    cast: ['François Bégaudeau', 'Nassim Amrabt', 'Laura Baquela'],
    rating: 7.4,
    voteCount: 4500,
    popularity: 62,
    tv5Id: 'tv5-entre-murs',
    tv5Deeplink: 'https://www.tv5monde.com/watch/entre-les-murs',
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.5,
    valence: 0.2,
    arousal: 0.6,
    isTrending: false
  },
  {
    id: 'fr-think-002',
    title: 'Être et avoir',
    originalTitle: 'To Be and To Have',
    year: 2002,
    runtime: 104,
    language: 'fr',
    genres: ['Documentary'],
    overview: 'A touching documentary following a year in the life of a one-room schoolhouse in rural France and its dedicated teacher.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9pWLPFGGVCTnHFSGf5sSLGCOMJe.jpg',
    backdropUrl: null,
    director: 'Nicolas Philibert',
    rating: 7.6,
    voteCount: 3200,
    popularity: 55,
    tv5Id: 'tv5-etre-avoir',
    tv5Deeplink: 'https://www.tv5monde.com/watch/etre-et-avoir',
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.3,
    valence: 0.5,
    arousal: 0.35,
    isTrending: false
  },
  {
    id: 'fr-think-003',
    title: 'Le Cercle Rouge',
    year: 1970,
    runtime: 140,
    language: 'fr',
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'A masterful heist film about fate and honor among thieves. Melville\'s meditation on crime, friendship, and destiny.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/rNjbJ9yD7vVoD6FVMR6L6JN7L7r.jpg',
    backdropUrl: null,
    director: 'Jean-Pierre Melville',
    cast: ['Alain Delon', 'Bourvil', 'Yves Montand'],
    rating: 8.0,
    voteCount: 5800,
    popularity: 68,
    tv5Id: 'tv5-cercle-rouge',
    tv5Deeplink: 'https://www.tv5monde.com/watch/le-cercle-rouge',
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.45,
    valence: 0.1,
    arousal: 0.55,
    isTrending: false
  },
  {
    id: 'fr-think-004',
    title: 'Le Samouraï',
    year: 1967,
    runtime: 105,
    language: 'fr',
    genres: ['Crime', 'Drama', 'Thriller'],
    overview: 'A hitman lives by a strict code of honor. When a job goes wrong, he must navigate a deadly game of cat and mouse.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/bKbvMBCJCNk0rq6P4dMJON8AJNt.jpg',
    backdropUrl: null,
    director: 'Jean-Pierre Melville',
    cast: ['Alain Delon', 'François Périer', 'Nathalie Delon'],
    rating: 8.1,
    voteCount: 6200,
    popularity: 72,
    tv5Id: 'tv5-samourai',
    tv5Deeplink: 'https://www.tv5monde.com/watch/le-samourai',
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.4,
    valence: 0.0,
    arousal: 0.5,
    isTrending: false
  },
  {
    id: 'fr-think-005',
    title: 'Anatomie d\'une chute',
    originalTitle: 'Anatomy of a Fall',
    year: 2023,
    runtime: 150,
    language: 'fr',
    genres: ['Drama', 'Thriller', 'Mystery'],
    overview: 'When a man dies under mysterious circumstances, his wife becomes the prime suspect. A gripping courtroom drama about truth and perception.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV83VUwFtHkB.jpg',
    backdropUrl: null,
    director: 'Justine Triet',
    cast: ['Sandra Hüller', 'Swann Arlaud', 'Milo Machado-Graner'],
    rating: 7.8,
    voteCount: 4800,
    popularity: 88,
    tv5Id: 'tv5-anatomie-chute',
    tv5Deeplink: 'https://www.tv5monde.com/watch/anatomie-dune-chute',
    type: 'movie',
    mood: 'engage',
    tone: 'think',
    energy: 0.55,
    valence: 0.1,
    arousal: 0.65,
    isTrending: true
  },
  // Series
  {
    id: 'fr-think-series-001',
    title: 'Le Bureau des Légendes',
    originalTitle: 'The Bureau',
    year: 2015,
    runtime: 52,
    language: 'fr',
    genres: ['Drama', 'Thriller'],
    overview: 'An in-depth look at the French intelligence agency (DGSE), following undercover agents and their complex double lives.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/4xpYvRn8lM7WVGH0nQmJaJAv7Y9.jpg',
    backdropUrl: null,
    cast: ['Mathieu Kassovitz', 'Sara Giraudeau', 'Florence Loiret-Caille'],
    rating: 8.6,
    voteCount: 3800,
    popularity: 75,
    tv5Id: 'tv5-bureau-legendes',
    tv5Deeplink: 'https://www.tv5monde.com/watch/le-bureau-des-legendes',
    type: 'series',
    episodeCount: 50,
    seasonCount: 5,
    mood: 'engage',
    tone: 'think',
    energy: 0.55,
    valence: 0.15,
    arousal: 0.6,
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
