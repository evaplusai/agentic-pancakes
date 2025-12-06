# Universal Content Architecture (UCA)
## Product Requirements & System Design

**Version:** 1.0.0
**Status:** Design Phase
**Author:** System Architecture Designer
**Date:** 2025-12-06

---

## Executive Summary

The Universal Content Architecture (UCA) extends the TV5MONDE recommendation system to support any content type through a domain-agnostic vector representation, pluggable adapters, cross-domain learning, and causal reasoning. The system leverages shared emotional and engagement patterns across different media types while preserving domain-specific nuances.

**Core Innovation:** Universal Content Vector (UCV) that captures content essence independent of medium, enabling transfer learning between TV shows, music, books, podcasts, games, and news.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Universal Content Vector](#universal-content-vector)
4. [Domain Adapters](#domain-adapters)
5. [Cross-Domain Learning](#cross-domain-learning)
6. [Causal Content Graph](#causal-content-graph)
7. [Self-Improving System](#self-improving-system)
8. [Data Flow](#data-flow)
9. [Technology Stack](#technology-stack)
10. [ADRs (Architecture Decision Records)](#architecture-decision-records)
11. [Implementation Roadmap](#implementation-roadmap)

---

## System Overview

### High-Level Architecture (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Universal Content Architecture               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   TV5MONDE   │  │   Spotify    │  │    Kindle    │         │
│  │   Adapter    │  │   Adapter    │  │   Adapter    │   ...   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
│              ┌─────────────▼─────────────┐                      │
│              │   UCV Transformation      │                      │
│              │   Engine                  │                      │
│              └─────────────┬─────────────┘                      │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│    ┌────▼─────┐    ┌──────▼──────┐    ┌─────▼────┐           │
│    │ Cross-   │    │   Causal    │    │  Self-   │           │
│    │ Domain   │◄───┤   Content   │───►│ Improving│           │
│    │ Learning │    │   Graph     │    │  System  │           │
│    └──────────┘    └─────────────┘    └──────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Domain Agnostic:** Core recommendation engine knows nothing about specific content types
2. **Pluggable Architecture:** New content domains via adapter pattern
3. **Transfer Learning:** Knowledge from one domain enhances others
4. **Causal Reasoning:** Understand why recommendations work, not just that they do
5. **Continuous Improvement:** System learns and optimizes automatically

---

## Architecture Components

### Component Diagram (C4 Level 2)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Content Adapters Layer                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  TV5MONDE    │  │   Spotify    │  │    Kindle    │            │
│  │  Adapter     │  │   Adapter    │  │   Adapter    │            │
│  │              │  │              │  │              │            │
│  │ - Metadata   │  │ - Audio      │  │ - Text       │            │
│  │ - Subtitles  │  │ - Lyrics     │  │ - Genres     │            │
│  │ - Scenes     │  │ - Tempo      │  │ - Reading    │            │
│  │              │  │              │  │   Level      │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                    │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          │   Standardized   │   Standardized   │   Standardized
          │   Content        │   Content        │   Content
          │   Payload        │   Payload        │   Payload
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼────────────────────┐
│                   UCV Transformation Engine                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐  ┌──────────────────────┐                │
│  │  Emotional          │  │  Engagement          │                │
│  │  Signature          │  │  Pattern             │                │
│  │  Analyzer           │  │  Extractor           │                │
│  │                     │  │                      │                │
│  │ - Valence (±)       │  │ - Pacing             │                │
│  │ - Arousal           │  │ - Attention Curve    │                │
│  │ - Dominance         │  │ - Interaction Points │                │
│  │ - Complexity        │  │ - Session Duration   │                │
│  └─────────┬───────────┘  └──────────┬───────────┘                │
│            │                          │                            │
│            └────────┬─────────────────┘                            │
│                     │                                              │
│            ┌────────▼─────────┐                                    │
│            │  Universal       │                                    │
│            │  Content Vector  │                                    │
│            │  (384-dim)       │                                    │
│            └────────┬─────────┘                                    │
│                     │                                              │
└─────────────────────┼──────────────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────────────┐
│                    Vector Storage & Search                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────┐        │
│  │              AgentDB Vector Database                   │        │
│  │                                                         │        │
│  │  - HNSW Index (150x faster search)                     │        │
│  │  - Cosine Similarity                                   │        │
│  │  - Quantization (4-32x memory reduction)               │        │
│  │  - Multi-tenancy (namespace per domain)                │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                     │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────────────┐
│                Intelligence & Learning Layer                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Cross-      │  │   Causal     │  │  Self-       │            │
│  │  Domain      │  │   Content    │  │  Improving   │            │
│  │  Learning    │  │   Graph      │  │  System      │            │
│  │              │  │              │  │              │            │
│  │ - Transfer   │  │ - Causal     │  │ - Nightly    │            │
│  │   Models     │  │   Discovery  │  │   Learner    │            │
│  │ - Shared     │  │ - Chain      │  │ - Reasoning  │            │
│  │   Emotional  │  │   Reasoning  │  │   Bank       │            │
│  │   Space      │  │ - Impact     │  │ - Skill      │            │
│  │              │  │   Tracking   │  │   Library    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Universal Content Vector

### Specification

The Universal Content Vector (UCV) is a 384-dimensional embedding that captures content essence across three primary dimensions:

#### 1. Emotional Signature (128 dimensions)

Based on Plutchik's Wheel of Emotions + VAD model:

```typescript
interface EmotionalSignature {
  // Plutchik's 8 Primary Emotions (0-1 intensity)
  joy: number;
  trust: number;
  fear: number;
  surprise: number;
  sadness: number;
  disgust: number;
  anger: number;
  anticipation: number;

  // VAD Model (Valence-Arousal-Dominance)
  valence: number;      // Pleasant (-1) to Unpleasant (+1)
  arousal: number;      // Calm (-1) to Excited (+1)
  dominance: number;    // Submissive (-1) to Dominant (+1)

  // Emotional Arc (temporal dimension)
  arcPattern: number[]; // 64-dim: emotional journey over time
  peakMoments: number; // Intensity of emotional peaks
  variability: number;  // Emotional stability vs volatility
}
```

#### 2. Engagement Pattern (128 dimensions)

Captures how users interact with content:

```typescript
interface EngagementPattern {
  // Attention Dynamics
  attentionCurve: number[];   // 32-dim: attention over time
  retentionRate: number;       // How well content holds attention
  reEngagementLikelihood: number; // Probability of return

  // Pacing & Rhythm
  pacingSpeed: number;         // Slow/contemplative to fast/action
  rhythmVariability: number;   // Consistent vs varied pacing
  intensityCurve: number[];    // 32-dim: content intensity over time

  // Interaction Points
  interactionDensity: number;  // Frequency of user interactions
  pausePoints: number[];       // Where users typically pause
  skipPatterns: number[];      // Where users skip

  // Session Characteristics
  optimalSessionLength: number; // Ideal consumption duration
  bingeability: number;        // Likelihood of continuous consumption
  timeOfDayPreference: number[]; // 24-dim: hourly preference distribution
}
```

#### 3. Complexity & Depth (128 dimensions)

Intellectual and thematic dimensions:

```typescript
interface ComplexityDepth {
  // Cognitive Demand
  cognitiveLoad: number;       // Mental effort required
  abstractionLevel: number;    // Concrete to abstract concepts
  prerequisiteKnowledge: number; // Required background knowledge

  // Thematic Richness
  themeCount: number;          // Number of distinct themes
  themeDepth: number[];        // 32-dim: depth per theme category
  metaphorDensity: number;     // Symbolic/metaphorical content

  // Structural Complexity
  narrativeComplexity: number; // Plot/structure sophistication
  perspectiveCount: number;    // Multiple viewpoints
  temporalComplexity: number;  // Non-linear time handling

  // Domain Knowledge
  domainEmbedding: number[];   // 64-dim: subject matter expertise
  culturalContext: number[];   // 16-dim: cultural reference density
  languageComplexity: number;  // Vocabulary & syntax sophistication
}
```

### UCV Computation Pipeline

```typescript
class UCVTransformer {
  /**
   * Transform domain-specific content into Universal Content Vector
   */
  async transform(content: StandardizedContent): Promise<UniversalContentVector> {
    // Parallel processing for efficiency
    const [emotional, engagement, complexity] = await Promise.all([
      this.computeEmotionalSignature(content),
      this.computeEngagementPattern(content),
      this.computeComplexityDepth(content)
    ]);

    // Concatenate into 384-dim vector
    const ucv = new Float32Array(384);
    ucv.set(emotional, 0);
    ucv.set(engagement, 128);
    ucv.set(complexity, 256);

    // Normalize to unit length
    return this.normalize(ucv);
  }

  private async computeEmotionalSignature(
    content: StandardizedContent
  ): Promise<Float32Array> {
    // Use transformer model trained on cross-domain emotional analysis
    const model = await this.loadModel('emotional-signature-v2');

    // Extract features from different modalities
    const features = {
      text: content.textFeatures,      // Subtitles, lyrics, book text
      audio: content.audioFeatures,    // Music, dialogue, sound design
      visual: content.visualFeatures,  // Scene composition, color palette
      metadata: content.metadata       // Genre, tags, descriptions
    };

    // Multi-modal fusion
    return model.predict(features);
  }

  private async computeEngagementPattern(
    content: StandardizedContent
  ): Promise<Float32Array> {
    // Analyze historical engagement data
    const engagementData = await this.getEngagementHistory(content.id);

    // Statistical feature extraction
    const features = this.extractEngagementFeatures(engagementData);

    // Use regression model to predict engagement patterns
    const model = await this.loadModel('engagement-pattern-v2');
    return model.predict(features);
  }

  private async computeComplexityDepth(
    content: StandardizedContent
  ): Promise<Float32Array> {
    // NLP analysis for text-based complexity
    const textComplexity = await this.analyzeTextComplexity(content.textFeatures);

    // Structural analysis
    const structuralComplexity = this.analyzeStructure(content.structure);

    // Domain knowledge extraction
    const domainEmbedding = await this.extractDomainKnowledge(content);

    // Combine features
    return this.combineComplexityFeatures(
      textComplexity,
      structuralComplexity,
      domainEmbedding
    );
  }
}
```

### Vector Storage Schema

```typescript
interface StoredUCV {
  id: string;                    // Unique content ID
  domain: ContentDomain;         // tv, music, books, podcasts, etc.
  ucv: Float32Array;             // 384-dim vector
  metadata: {
    title: string;
    creator: string;
    releaseDate: Date;
    duration: number;
    language: string[];
    tags: string[];
  };
  domainSpecific: Record<string, any>; // Original domain data
  createdAt: Date;
  updatedAt: Date;
  version: number;               // UCV model version
}
```

---

## Domain Adapters

### Adapter Interface

All domain adapters implement a standardized interface:

```typescript
interface DomainAdapter<T = any> {
  /**
   * Unique identifier for the adapter
   */
  readonly domain: ContentDomain;

  /**
   * Fetch content from domain-specific source
   */
  fetchContent(contentId: string): Promise<T>;

  /**
   * Transform domain-specific content to standardized format
   */
  standardize(content: T): Promise<StandardizedContent>;

  /**
   * Extract domain-specific features for UCV computation
   */
  extractFeatures(content: T): Promise<ContentFeatures>;

  /**
   * Reverse transformation: UCV back to domain recommendations
   */
  denormalize(ucv: UniversalContentVector): Promise<DomainRecommendation[]>;

  /**
   * Validate content quality and completeness
   */
  validate(content: T): ValidationResult;

  /**
   * Get domain-specific metadata schema
   */
  getMetadataSchema(): JSONSchema;
}

interface StandardizedContent {
  id: string;
  domain: ContentDomain;
  textFeatures: TextFeatures;
  audioFeatures?: AudioFeatures;
  visualFeatures?: VisualFeatures;
  structure: ContentStructure;
  metadata: ContentMetadata;
  engagementHistory: EngagementData[];
}
```

### TV5MONDE Adapter Implementation

```typescript
class TV5MondeAdapter implements DomainAdapter<TV5Content> {
  readonly domain = ContentDomain.TV;

  async fetchContent(contentId: string): Promise<TV5Content> {
    // Fetch from TV5MONDE API
    const response = await this.api.get(`/content/${contentId}`);
    return response.data;
  }

  async standardize(content: TV5Content): Promise<StandardizedContent> {
    return {
      id: content.id,
      domain: ContentDomain.TV,

      // Extract text from subtitles and metadata
      textFeatures: {
        subtitle: await this.extractSubtitles(content),
        description: content.description,
        dialogue: await this.extractDialogue(content),
        keywords: this.extractKeywords(content)
      },

      // Extract audio features from soundtrack
      audioFeatures: {
        musicGenre: await this.classifyMusic(content.audio),
        dialogueTone: await this.analyzeTone(content.audio),
        soundDesign: await this.analyzeSoundscape(content.audio),
        tempo: await this.extractTempo(content.audio)
      },

      // Extract visual features from scenes
      visualFeatures: {
        colorPalette: await this.extractColorPalette(content.frames),
        sceneTypes: await this.classifyScenes(content.frames),
        cinematography: await this.analyzeCinematography(content.frames),
        visualComplexity: this.computeVisualComplexity(content.frames)
      },

      // Content structure
      structure: {
        duration: content.duration,
        acts: this.segmentIntoActs(content),
        chapters: content.chapters,
        timelineEvents: this.extractTimelineEvents(content)
      },

      // Metadata
      metadata: {
        title: content.title,
        creator: content.director,
        releaseDate: content.releaseDate,
        language: content.language,
        genre: content.genre,
        tags: content.tags,
        ageRating: content.ageRating
      },

      // Historical engagement
      engagementHistory: await this.getEngagementData(content.id)
    };
  }

  async extractFeatures(content: TV5Content): Promise<ContentFeatures> {
    const standardized = await this.standardize(content);

    return {
      emotional: await this.extractEmotionalFeatures(standardized),
      engagement: await this.extractEngagementFeatures(standardized),
      complexity: await this.extractComplexityFeatures(standardized)
    };
  }

  async denormalize(ucv: UniversalContentVector): Promise<DomainRecommendation[]> {
    // Find similar content in TV5MONDE catalog using vector search
    const similarVectors = await this.vectorDB.search(ucv, {
      namespace: 'tv5monde',
      limit: 50
    });

    // Re-rank based on TV-specific factors
    return this.rerank(similarVectors, {
      availabilityWeight: 0.2,
      freshnessWeight: 0.1,
      diversityWeight: 0.15
    });
  }

  private async extractSubtitles(content: TV5Content): Promise<string> {
    // Parse VTT/SRT subtitle files
    const subtitleFile = await this.fetchSubtitles(content.id);
    return this.parseSubtitles(subtitleFile);
  }

  private async analyzeTone(audio: AudioBuffer): Promise<ToneProfile> {
    // Use audio ML model to classify emotional tone
    const model = await this.loadModel('audio-tone-classifier');
    return model.predict(audio);
  }
}
```

### Spotify Adapter Implementation

```typescript
class SpotifyAdapter implements DomainAdapter<SpotifyTrack> {
  readonly domain = ContentDomain.MUSIC;

  async standardize(track: SpotifyTrack): Promise<StandardizedContent> {
    return {
      id: track.id,
      domain: ContentDomain.MUSIC,

      textFeatures: {
        lyrics: await this.fetchLyrics(track.id),
        description: track.description,
        artistBio: await this.fetchArtistBio(track.artist.id),
        keywords: this.extractMusicKeywords(track)
      },

      audioFeatures: {
        // Spotify provides rich audio features
        tempo: track.audioFeatures.tempo,
        key: track.audioFeatures.key,
        mode: track.audioFeatures.mode,
        energy: track.audioFeatures.energy,
        danceability: track.audioFeatures.danceability,
        valence: track.audioFeatures.valence,
        instrumentalness: track.audioFeatures.instrumentalness,
        acousticness: track.audioFeatures.acousticness,
        speechiness: track.audioFeatures.speechiness,
        liveness: track.audioFeatures.liveness
      },

      // No visual features for music
      visualFeatures: undefined,

      structure: {
        duration: track.duration_ms,
        sections: track.audioAnalysis.sections,
        bars: track.audioAnalysis.bars,
        beats: track.audioAnalysis.beats,
        segments: track.audioAnalysis.segments
      },

      metadata: {
        title: track.name,
        creator: track.artist.name,
        releaseDate: track.album.release_date,
        language: await this.detectLanguage(track),
        genre: track.genres,
        tags: this.generateTags(track)
      },

      engagementHistory: await this.getListeningData(track.id)
    };
  }

  async extractFeatures(track: SpotifyTrack): Promise<ContentFeatures> {
    // Music has unique emotional mapping
    const emotional = this.mapSpotifyFeaturesToEmotion({
      valence: track.audioFeatures.valence,
      energy: track.audioFeatures.energy,
      danceability: track.audioFeatures.danceability,
      tempo: track.audioFeatures.tempo
    });

    // Engagement patterns for music are different
    const engagement = await this.extractMusicEngagement(track);

    // Complexity from musical structure
    const complexity = this.analyzeMusicComplexity(track);

    return { emotional, engagement, complexity };
  }

  private mapSpotifyFeaturesToEmotion(features: SpotifyAudioFeatures): EmotionalSignature {
    // Map Spotify's valence/energy to emotional dimensions
    return {
      joy: features.valence * features.energy,
      trust: features.acousticness * 0.7,
      fear: (1 - features.valence) * features.energy * 0.5,
      surprise: features.danceability * (1 - features.predictability),
      sadness: (1 - features.valence) * (1 - features.energy),
      // ... other emotions

      // VAD model
      valence: features.valence * 2 - 1,  // Convert 0-1 to -1 to 1
      arousal: features.energy * 2 - 1,
      dominance: features.loudness / 60 * 2 - 1  // Normalize loudness
    };
  }
}
```

### Kindle Adapter Implementation

```typescript
class KindleAdapter implements DomainAdapter<KindleBook> {
  readonly domain = ContentDomain.BOOKS;

  async standardize(book: KindleBook): Promise<StandardizedContent> {
    return {
      id: book.asin,
      domain: ContentDomain.BOOKS,

      textFeatures: {
        fullText: await this.extractText(book),
        summary: book.description,
        reviews: await this.fetchReviews(book.asin),
        keywords: this.extractBookKeywords(book)
      },

      // Books have no native audio/visual
      audioFeatures: undefined,
      visualFeatures: {
        coverArt: await this.analyzeCover(book.coverUrl)
      },

      structure: {
        duration: this.estimateReadingTime(book.wordCount),
        chapters: book.chapters,
        sections: this.extractSections(book),
        arcStructure: await this.analyzeNarrativeArc(book)
      },

      metadata: {
        title: book.title,
        creator: book.author,
        releaseDate: book.publishDate,
        language: book.language,
        genre: book.categories,
        tags: book.tags
      },

      engagementHistory: await this.getReadingData(book.asin)
    };
  }

  async extractFeatures(book: KindleBook): Promise<ContentFeatures> {
    // NLP-heavy emotional analysis
    const emotional = await this.analyzeTextEmotion(book.fullText);

    // Reading engagement patterns
    const engagement = await this.extractReadingEngagement(book);

    // Literary complexity
    const complexity = await this.analyzeTextComplexity(book);

    return { emotional, engagement, complexity };
  }

  private async analyzeTextEmotion(text: string): Promise<EmotionalSignature> {
    // Use NLP transformer model
    const model = await this.loadModel('book-emotion-analyzer');

    // Analyze text in chunks to capture emotional arc
    const chunks = this.chunkText(text, 1000);
    const emotionPerChunk = await Promise.all(
      chunks.map(chunk => model.predict(chunk))
    );

    // Aggregate and compute emotional arc
    return this.aggregateEmotions(emotionPerChunk);
  }

  private async analyzeTextComplexity(book: KindleBook): Promise<ComplexityDepth> {
    const text = await this.extractText(book);

    return {
      cognitiveLoad: this.computeFleschKincaid(text),
      abstractionLevel: await this.detectAbstractConcepts(text),
      prerequisiteKnowledge: await this.assessBackgroundKnowledge(text),

      themeCount: (await this.extractThemes(text)).length,
      themeDepth: await this.analyzeThemeDepth(text),
      metaphorDensity: this.detectMetaphors(text).length / text.length,

      narrativeComplexity: this.analyzeNarrativeStructure(text),
      perspectiveCount: this.countPerspectives(text),
      temporalComplexity: this.analyzeTimeline(text),

      languageComplexity: this.computeLexicalDiversity(text)
    };
  }
}
```

### Adapter Registry & Plugin System

```typescript
class AdapterRegistry {
  private adapters: Map<ContentDomain, DomainAdapter> = new Map();

  /**
   * Register a new domain adapter
   */
  register(adapter: DomainAdapter): void {
    if (this.adapters.has(adapter.domain)) {
      throw new Error(`Adapter for domain ${adapter.domain} already registered`);
    }

    // Validate adapter implements interface correctly
    this.validateAdapter(adapter);

    this.adapters.set(adapter.domain, adapter);
    console.log(`Registered adapter for domain: ${adapter.domain}`);
  }

  /**
   * Get adapter for specific domain
   */
  getAdapter(domain: ContentDomain): DomainAdapter {
    const adapter = this.adapters.get(domain);
    if (!adapter) {
      throw new Error(`No adapter registered for domain: ${domain}`);
    }
    return adapter;
  }

  /**
   * List all registered domains
   */
  listDomains(): ContentDomain[] {
    return Array.from(this.adapters.keys());
  }

  private validateAdapter(adapter: DomainAdapter): void {
    const requiredMethods = [
      'fetchContent',
      'standardize',
      'extractFeatures',
      'denormalize',
      'validate',
      'getMetadataSchema'
    ];

    for (const method of requiredMethods) {
      if (typeof adapter[method] !== 'function') {
        throw new Error(`Adapter missing required method: ${method}`);
      }
    }
  }
}

// Usage
const registry = new AdapterRegistry();
registry.register(new TV5MondeAdapter());
registry.register(new SpotifyAdapter());
registry.register(new KindleAdapter());
registry.register(new PodcastAdapter());
registry.register(new NewsAdapter());
registry.register(new GameAdapter());
```

---

## Cross-Domain Learning

### Transfer Learning Architecture

```typescript
class CrossDomainLearningEngine {
  private sharedEmotionalSpace: EmbeddingSpace;
  private domainBridges: Map<DomainPair, TransferModel>;
  private userPreferenceGraph: Graph<ContentDomain>;

  /**
   * Initialize shared emotional space across all domains
   */
  async initializeSharedSpace(): Promise<void> {
    // Train multi-task model on all domains simultaneously
    const trainingData = await this.loadCrossDomainData();

    this.sharedEmotionalSpace = await this.trainSharedSpace({
      data: trainingData,
      dimensions: 128,
      loss: 'contrastive',  // Bring similar emotions together
      domains: ['tv', 'music', 'books', 'podcasts', 'games', 'news']
    });
  }

  /**
   * Learn transfer patterns between domains
   * Example: French comedy shows → French comedy podcasts
   */
  async learnDomainBridges(): Promise<void> {
    const domainPairs = this.generateDomainPairs();

    for (const [sourceDoamin, targetDomain] of domainPairs) {
      // Find users who consume both domains
      const crossoverUsers = await this.findCrossoverUsers(
        sourceDomain,
        targetDomain
      );

      // Learn transformation matrix
      const transferModel = await this.trainTransferModel({
        sourceData: await this.getUserPreferences(crossoverUsers, sourceDomain),
        targetData: await this.getUserPreferences(crossoverUsers, targetDomain),
        method: 'canonical-correlation-analysis'
      });

      this.domainBridges.set(`${sourceDomain}->${targetDomain}`, transferModel);
    }
  }

  /**
   * Transfer preferences from one domain to another
   */
  async transferPreferences(
    userId: string,
    sourceDomain: ContentDomain,
    targetDomain: ContentDomain
  ): Promise<UniversalContentVector[]> {
    // Get user's preferences in source domain
    const sourcePreferences = await this.getUserContentVectors(userId, sourceDomain);

    // Get transfer model
    const bridgeKey = `${sourceDomain}->${targetDomain}`;
    const transferModel = this.domainBridges.get(bridgeKey);

    if (!transferModel) {
      // Fallback to shared emotional space
      return this.transferViaSharedSpace(sourcePreferences, targetDomain);
    }

    // Apply transfer model
    const transferredVectors = sourcePreferences.map(vec =>
      transferModel.transform(vec)
    );

    return transferredVectors;
  }

  /**
   * Example: User likes French comedies (TV) → Recommend French comedy podcasts
   */
  async generateCrossDomainRecommendations(
    userId: string,
    targetDomain: ContentDomain,
    limit: number = 10
  ): Promise<Recommendation[]> {
    // Get all domains user has interacted with
    const activeDomains = await this.getUserActiveDomains(userId);

    // Transfer preferences from each domain
    const transferredVectors: UniversalContentVector[] = [];

    for (const sourceDomain of activeDomains) {
      if (sourceDomain !== targetDomain) {
        const transferred = await this.transferPreferences(
          userId,
          sourceDomain,
          targetDomain
        );
        transferredVectors.push(...transferred);
      }
    }

    // Also include direct preferences in target domain if any
    const directPreferences = await this.getUserContentVectors(userId, targetDomain);

    // Combine with weighted average
    const combinedVector = this.weightedAverage([
      { vectors: transferredVectors, weight: 0.3 },
      { vectors: directPreferences, weight: 0.7 }
    ]);

    // Search in target domain
    const adapter = this.adapterRegistry.getAdapter(targetDomain);
    const recommendations = await adapter.denormalize(combinedVector);

    return recommendations.slice(0, limit);
  }

  /**
   * Discover cross-domain patterns
   * Example: "Users who watch documentaries also read non-fiction"
   */
  async discoverCrossDomainPatterns(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    // Analyze user behavior across domains
    const users = await this.getAllUsers();

    for (const user of users) {
      const domainPreferences = await this.getUserDomainPreferences(user.id);

      // Look for correlations
      for (const [domain1, prefs1] of domainPreferences) {
        for (const [domain2, prefs2] of domainPreferences) {
          if (domain1 !== domain2) {
            const correlation = this.computeCorrelation(prefs1, prefs2);

            if (correlation > 0.7) {
              patterns.push({
                type: 'cross-domain-correlation',
                source: domain1,
                target: domain2,
                strength: correlation,
                description: this.describePattern(prefs1, prefs2)
              });
            }
          }
        }
      }
    }

    // Aggregate and rank patterns
    return this.aggregatePatterns(patterns);
  }

  private describePattern(
    prefs1: ContentPreferences,
    prefs2: ContentPreferences
  ): string {
    // Use LLM to generate human-readable pattern description
    const context = {
      domain1: prefs1.domain,
      topGenres1: prefs1.topGenres,
      emotionalProfile1: prefs1.emotionalProfile,
      domain2: prefs2.domain,
      topGenres2: prefs2.topGenres,
      emotionalProfile2: prefs2.emotionalProfile
    };

    return this.llm.generate(`
      Describe the cross-domain preference pattern:
      Users who like ${context.topGenres1.join(', ')} in ${context.domain1}
      also tend to like ${context.topGenres2.join(', ')} in ${context.domain2}.

      Emotional similarity: both have ${context.emotionalProfile1.dominant} emotions.
    `);
  }
}
```

### Shared Emotional Space

```typescript
class SharedEmotionalSpace {
  private embedding: nn.Module;

  /**
   * Project content from any domain into shared emotional space
   */
  async project(ucv: UniversalContentVector): Promise<EmotionalEmbedding> {
    // Extract emotional component (first 128 dims)
    const emotionalSignature = ucv.slice(0, 128);

    // Project to shared space
    return this.embedding.forward(emotionalSignature);
  }

  /**
   * Find emotionally similar content across domains
   */
  async findEmotionallySimilar(
    emotion: EmotionalEmbedding,
    domains: ContentDomain[],
    limit: number = 20
  ): Promise<CrossDomainMatch[]> {
    const results: CrossDomainMatch[] = [];

    for (const domain of domains) {
      // Search in domain-specific namespace
      const matches = await this.vectorDB.search(emotion, {
        namespace: domain,
        limit: limit
      });

      results.push(...matches.map(m => ({
        ...m,
        domain,
        emotionalDistance: this.computeDistance(emotion, m.embedding)
      })));
    }

    // Sort by emotional similarity across all domains
    return results.sort((a, b) => a.emotionalDistance - b.emotionalDistance);
  }

  /**
   * Visualize emotional space with t-SNE
   */
  async visualizeEmotionalSpace(): Promise<Visualization> {
    // Sample content from all domains
    const samples = await this.sampleContent(1000);

    // Project to 2D using t-SNE
    const embeddings = await Promise.all(
      samples.map(s => this.project(s.ucv))
    );

    const tsne = new TSNE({ dimensions: 2 });
    const coordinates = tsne.fit(embeddings);

    return {
      points: coordinates.map((coord, i) => ({
        x: coord[0],
        y: coord[1],
        domain: samples[i].domain,
        title: samples[i].title,
        emotions: samples[i].emotions
      }))
    };
  }
}
```

---

## Causal Content Graph

### Graph Schema

```typescript
interface CausalContentGraph {
  nodes: ContentNode[];
  edges: CausalEdge[];

  // Graph operations
  addNode(node: ContentNode): void;
  addEdge(edge: CausalEdge): void;
  findCausalPath(source: string, target: string): CausalPath[];
  predictOutcome(intervention: Intervention): Prediction;
}

interface ContentNode {
  id: string;
  domain: ContentDomain;
  ucv: UniversalContentVector;
  metadata: ContentMetadata;

  // Observational data
  viewCount: number;
  avgRating: number;
  completionRate: number;
}

interface CausalEdge {
  source: string;        // Content ID
  target: string;        // Content ID or user state
  type: CausalEdgeType;
  strength: number;      // 0-1: causal strength
  confidence: number;    // 0-1: statistical confidence
  mechanism: string;     // Why this causes that

  // Supporting evidence
  observedInstances: number;
  controlGroup: number;
  treatmentGroup: number;
  pValue: number;
}

enum CausalEdgeType {
  CONTENT_TO_CONTENT = 'content->content',      // "Watching X causes interest in Y"
  CONTENT_TO_STATE = 'content->state',          // "Watching X causes mood Y"
  STATE_TO_PREFERENCE = 'state->preference',    // "Mood X causes preference for Y"
  PREFERENCE_TO_SATISFACTION = 'preference->satisfaction' // "Preference X predicts satisfaction Y"
}
```

### Causal Discovery Engine

```typescript
class CausalDiscoveryEngine {
  private graph: CausalContentGraph;
  private interventions: Map<string, InterventionResult>;

  /**
   * Discover causal relationships using observational data
   */
  async discoverCausalRelationships(): Promise<CausalEdge[]> {
    const edges: CausalEdge[] = [];

    // 1. Discover content-to-content causality
    const contentEdges = await this.discoverContentCausality();
    edges.push(...contentEdges);

    // 2. Discover content-to-state causality
    const stateEdges = await this.discoverStateCausality();
    edges.push(...stateEdges);

    // 3. Discover preference chains
    const preferenceEdges = await this.discoverPreferenceChains();
    edges.push(...preferenceEdges);

    return edges;
  }

  /**
   * Discover: "Watching documentary X causes interest in topic Y"
   */
  private async discoverContentCausality(): Promise<CausalEdge[]> {
    const edges: CausalEdge[] = [];

    // Analyze sequential viewing patterns
    const sequences = await this.getViewingSequences();

    for (const seq of sequences) {
      for (let i = 0; i < seq.length - 1; i++) {
        const source = seq[i];
        const target = seq[i + 1];

        // Test if source causally influences target
        const causalTest = await this.testCausality({
          source,
          target,
          method: 'granger-causality'  // Time-series causality test
        });

        if (causalTest.pValue < 0.05) {
          edges.push({
            source: source.id,
            target: target.id,
            type: CausalEdgeType.CONTENT_TO_CONTENT,
            strength: causalTest.strength,
            confidence: 1 - causalTest.pValue,
            mechanism: this.explainCausality(source, target),
            observedInstances: causalTest.n,
            pValue: causalTest.pValue
          });
        }
      }
    }

    return edges;
  }

  /**
   * Discover: "Content X causes mood state Y"
   */
  private async discoverStateCausality(): Promise<CausalEdge[]> {
    const edges: CausalEdge[] = [];

    // Require user mood data (surveys, implicit signals)
    const moodData = await this.getMoodData();

    for (const session of moodData) {
      const contentConsumed = session.content;
      const moodBefore = session.moodBefore;
      const moodAfter = session.moodAfter;

      // Compute mood change
      const moodDelta = this.computeMoodDelta(moodBefore, moodAfter);

      // Test if content caused mood change
      const causalTest = await this.testMoodCausality({
        content: contentConsumed,
        moodDelta,
        controls: ['time-of-day', 'day-of-week', 'prior-mood']
      });

      if (causalTest.significant) {
        edges.push({
          source: contentConsumed.id,
          target: `mood:${moodAfter.dominant}`,
          type: CausalEdgeType.CONTENT_TO_STATE,
          strength: causalTest.effect,
          confidence: causalTest.confidence,
          mechanism: this.explainMoodCausality(contentConsumed, moodDelta)
        });
      }
    }

    return edges;
  }

  /**
   * Discover preference chains
   * Example: "Users who like A and then watch B tend to be highly satisfied"
   */
  private async discoverPreferenceChains(): Promise<CausalEdge[]> {
    const edges: CausalEdge[] = [];

    // Use causal inference methods
    const users = await this.getAllUsers();

    for (const user of users) {
      const history = await this.getUserHistory(user.id);

      // Build preference DAG for this user
      const prefDAG = this.buildPreferenceDAG(history);

      // Find chains that predict satisfaction
      const satisfactionPredictors = this.findSatisfactionPredictors(prefDAG);

      edges.push(...satisfactionPredictors);
    }

    return edges;
  }

  /**
   * Perform causal intervention to test hypotheses
   * Example: "Does recommending documentaries increase news consumption?"
   */
  async performIntervention(intervention: Intervention): Promise<InterventionResult> {
    // A/B test framework
    const { control, treatment } = await this.splitUsers({
      stratifyBy: ['age', 'domain-usage', 'engagement-level']
    });

    // Control group: normal recommendations
    const controlResults = await this.runRecommendations(control, {
      strategy: 'standard'
    });

    // Treatment group: apply intervention
    const treatmentResults = await this.runRecommendations(treatment, {
      strategy: intervention.strategy,
      parameters: intervention.parameters
    });

    // Measure outcomes
    const outcome = this.compareOutcomes(controlResults, treatmentResults);

    // Store result
    this.interventions.set(intervention.id, outcome);

    // Update causal graph if significant
    if (outcome.pValue < 0.05) {
      this.graph.addEdge({
        source: intervention.source,
        target: intervention.target,
        type: CausalEdgeType.PREFERENCE_TO_SATISFACTION,
        strength: outcome.effect,
        confidence: 1 - outcome.pValue,
        mechanism: intervention.hypothesis,
        observedInstances: treatment.length,
        controlGroup: control.length,
        treatmentGroup: treatment.length,
        pValue: outcome.pValue
      });
    }

    return outcome;
  }

  /**
   * Predict outcomes using causal reasoning
   */
  async predictOutcome(
    userId: string,
    intervention: Intervention
  ): Promise<Prediction> {
    // Find causal path from intervention to desired outcome
    const paths = this.graph.findCausalPath(
      intervention.source,
      intervention.target
    );

    if (paths.length === 0) {
      return { confidence: 0, reason: 'No causal path found' };
    }

    // Compute predicted effect using path analysis
    const predictions = paths.map(path => {
      let effect = 1.0;
      let confidence = 1.0;

      for (const edge of path.edges) {
        effect *= edge.strength;
        confidence *= edge.confidence;
      }

      return { effect, confidence, path };
    });

    // Return most confident prediction
    const best = predictions.reduce((a, b) =>
      a.confidence > b.confidence ? a : b
    );

    return {
      predictedEffect: best.effect,
      confidence: best.confidence,
      causalPath: best.path,
      mechanism: this.explainCausalPath(best.path)
    };
  }

  /**
   * Generate human-readable causal explanation
   */
  private explainCausality(source: Content, target: Content): string {
    // Analyze semantic similarity
    const topicOverlap = this.computeTopicOverlap(source, target);

    if (topicOverlap > 0.7) {
      return `Shared topic: ${topicOverlap.topics.join(', ')}`;
    }

    const emotionalSimilarity = this.computeEmotionalSimilarity(source, target);

    if (emotionalSimilarity > 0.7) {
      return `Similar emotional tone: ${emotionalSimilarity.emotions.join(', ')}`;
    }

    return 'Sequential preference pattern';
  }
}
```

### Causal Query Interface

```typescript
class CausalQueryEngine {
  constructor(private graph: CausalContentGraph) {}

  /**
   * Query: "What content causes interest in topic X?"
   */
  async findContentCausingInterest(topic: string): Promise<CausalResult[]> {
    // Find all content related to topic
    const topicContent = await this.findContentByTopic(topic);

    // Find causal predecessors
    const results: CausalResult[] = [];

    for (const content of topicContent) {
      const predecessors = this.graph.findPredecessors(content.id);

      for (const pred of predecessors) {
        const edge = this.graph.getEdge(pred.id, content.id);

        results.push({
          source: pred,
          target: content,
          causalStrength: edge.strength,
          mechanism: edge.mechanism
        });
      }
    }

    return results.sort((a, b) => b.causalStrength - a.causalStrength);
  }

  /**
   * Query: "What mood state does content X typically cause?"
   */
  async predictMoodOutcome(contentId: string): Promise<MoodPrediction> {
    const stateEdges = this.graph.getEdges(contentId)
      .filter(e => e.type === CausalEdgeType.CONTENT_TO_STATE);

    if (stateEdges.length === 0) {
      return { mood: 'neutral', confidence: 0 };
    }

    // Weighted average of mood outcomes
    const moodScores = new Map<string, number>();

    for (const edge of stateEdges) {
      const mood = edge.target.split(':')[1];
      const currentScore = moodScores.get(mood) || 0;
      moodScores.set(mood, currentScore + edge.strength * edge.confidence);
    }

    // Find dominant mood
    const [dominantMood, score] = Array.from(moodScores.entries())
      .reduce((a, b) => a[1] > b[1] ? a : b);

    return {
      mood: dominantMood,
      confidence: score / stateEdges.length,
      alternatives: Array.from(moodScores.entries())
        .filter(([m, _]) => m !== dominantMood)
        .map(([m, s]) => ({ mood: m, confidence: s / stateEdges.length }))
    };
  }

  /**
   * Query: "What should I recommend after content X to maximize satisfaction?"
   */
  async optimizeNextRecommendation(
    userId: string,
    currentContentId: string
  ): Promise<Recommendation[]> {
    // Find all content that has been consumed after currentContent
    const successors = this.graph.getSuccessors(currentContentId);

    // Get user preferences
    const userPrefs = await this.getUserPreferences(userId);

    // Rank successors by:
    // 1. Causal strength (how strongly current content predicts next)
    // 2. User preference alignment
    // 3. Predicted satisfaction
    const ranked = successors.map(succ => {
      const edge = this.graph.getEdge(currentContentId, succ.id);
      const prefAlignment = this.computeAlignment(succ.ucv, userPrefs);
      const satisfactionPred = this.predictSatisfaction(userId, succ.id);

      return {
        content: succ,
        score: edge.strength * 0.3 + prefAlignment * 0.3 + satisfactionPred * 0.4,
        reasoning: {
          causalStrength: edge.strength,
          prefAlignment,
          satisfactionPred,
          mechanism: edge.mechanism
        }
      };
    });

    return ranked.sort((a, b) => b.score - a.score);
  }
}
```

---

## Self-Improving System

### Architecture Overview

```typescript
interface SelfImprovingSystem {
  nightlyLearner: NightlyLearner;
  reasoningBank: ReasoningBank;
  skillLibrary: SkillLibrary;
  performanceMonitor: PerformanceMonitor;
}
```

### Nightly Learner

```typescript
class NightlyLearner {
  /**
   * Run nightly learning pipeline
   * Discovers new patterns, updates models, optimizes strategies
   */
  async runNightlyLearning(): Promise<LearningReport> {
    const report: LearningReport = {
      timestamp: new Date(),
      discoveries: [],
      modelUpdates: [],
      performanceChanges: []
    };

    // 1. Discover new patterns
    const patterns = await this.discoverPatterns();
    report.discoveries.push(...patterns);

    // 2. Update UCV models
    const modelUpdates = await this.updateModels();
    report.modelUpdates.push(...modelUpdates);

    // 3. Retrain transfer models
    await this.retrainTransferModels();

    // 4. Update causal graph
    await this.updateCausalGraph();

    // 5. Optimize recommendation strategies
    const optimizations = await this.optimizeStrategies();
    report.performanceChanges.push(...optimizations);

    // 6. Store successful patterns in ReasoningBank
    await this.storeSuccessfulPatterns(patterns);

    return report;
  }

  /**
   * Discover new patterns in user behavior
   */
  private async discoverPatterns(): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    // Analyze yesterday's data
    const yesterdayData = await this.getYesterdayData();

    // 1. Temporal patterns
    const temporalPatterns = await this.discoverTemporalPatterns(yesterdayData);
    patterns.push(...temporalPatterns);

    // 2. Cross-domain patterns
    const crossDomainPatterns = await this.discoverCrossDomainPatterns(yesterdayData);
    patterns.push(...crossDomainPatterns);

    // 3. Emotional journey patterns
    const emotionalPatterns = await this.discoverEmotionalPatterns(yesterdayData);
    patterns.push(...emotionalPatterns);

    // 4. Anomalies (unexpected successes/failures)
    const anomalies = await this.detectAnomalies(yesterdayData);
    patterns.push(...anomalies);

    return patterns;
  }

  /**
   * Update UCV transformation models based on new data
   */
  private async updateModels(): Promise<ModelUpdate[]> {
    const updates: ModelUpdate[] = [];

    // Incremental learning for each domain
    for (const domain of this.adapterRegistry.listDomains()) {
      const adapter = this.adapterRegistry.getAdapter(domain);

      // Get new content added yesterday
      const newContent = await this.getNewContent(domain);

      if (newContent.length > 0) {
        // Update domain-specific features
        const modelUpdate = await this.incrementallyTrain({
          model: `${domain}-feature-extractor`,
          data: newContent,
          epochs: 5
        });

        updates.push(modelUpdate);
      }
    }

    // Update shared emotional space
    const emotionalUpdate = await this.updateSharedEmotionalSpace();
    updates.push(emotionalUpdate);

    return updates;
  }

  /**
   * Optimize recommendation strategies using A/B test results
   */
  private async optimizeStrategies(): Promise<Optimization[]> {
    const optimizations: Optimization[] = [];

    // Analyze all active A/B tests
    const experiments = await this.getActiveExperiments();

    for (const exp of experiments) {
      const result = await this.analyzeExperiment(exp);

      if (result.significant && result.improvement > 0) {
        // Apply winning strategy
        await this.applyStrategy(result.winningStrategy);

        optimizations.push({
          experiment: exp.id,
          improvement: result.improvement,
          strategy: result.winningStrategy
        });
      }
    }

    return optimizations;
  }
}
```

### ReasoningBank Integration

```typescript
class ReasoningBank {
  private agentDB: AgentDB;

  /**
   * Store successful recommendation trajectory
   */
  async storeSuccessfulTrajectory(
    trajectory: RecommendationTrajectory
  ): Promise<void> {
    // Only store if user was satisfied
    if (trajectory.satisfaction < 0.7) return;

    const memory = {
      trajectory: {
        context: trajectory.context,
        actions: trajectory.recommendations,
        outcomes: trajectory.interactions,
        reward: trajectory.satisfaction
      },
      reasoning: {
        strategy: trajectory.strategy,
        whySuccessful: this.analyzeSuccess(trajectory),
        keyFactors: this.extractKeyFactors(trajectory)
      },
      metadata: {
        timestamp: new Date(),
        userId: trajectory.userId,
        domains: trajectory.domains
      }
    };

    // Store in AgentDB with semantic indexing
    await this.agentDB.store({
      namespace: 'reasoning-bank/successful-trajectories',
      vector: await this.embedTrajectory(trajectory),
      data: memory
    });
  }

  /**
   * Retrieve similar successful trajectories
   */
  async retrieveSimilarSuccesses(
    context: RecommendationContext
  ): Promise<SuccessfulTrajectory[]> {
    const contextVector = await this.embedContext(context);

    const results = await this.agentDB.search({
      namespace: 'reasoning-bank/successful-trajectories',
      vector: contextVector,
      limit: 10,
      threshold: 0.8
    });

    return results.map(r => r.data);
  }

  /**
   * Learn from trajectory: update strategy weights
   */
  async learnFromTrajectory(
    trajectory: RecommendationTrajectory
  ): Promise<void> {
    // Find similar past trajectories
    const similar = await this.retrieveSimilarSuccesses(trajectory.context);

    // Compare strategies
    const strategyComparison = this.compareStrategies(
      trajectory,
      similar
    );

    // Update strategy weights based on outcomes
    if (trajectory.satisfaction > averageSatisfaction(similar)) {
      // This strategy worked better - increase weight
      await this.increaseStrategyWeight(trajectory.strategy, 0.1);
    } else {
      // This strategy underperformed - decrease weight
      await this.decreaseStrategyWeight(trajectory.strategy, 0.05);
    }

    // Store meta-learning insight
    await this.storeMetaLearning({
      insight: `Strategy ${trajectory.strategy} performs ${trajectory.satisfaction > 0.7 ? 'well' : 'poorly'} in context: ${this.describeContext(trajectory.context)}`,
      evidence: trajectory,
      confidence: this.computeConfidence(similar.length)
    });
  }

  /**
   * Distill patterns from many trajectories
   */
  async distillPatterns(): Promise<DistilledPattern[]> {
    // Get all successful trajectories
    const trajectories = await this.agentDB.getAll({
      namespace: 'reasoning-bank/successful-trajectories',
      filter: t => t.trajectory.reward > 0.7
    });

    // Cluster by similarity
    const clusters = await this.clusterTrajectories(trajectories);

    // Extract pattern from each cluster
    const patterns = clusters.map(cluster => {
      return {
        pattern: this.extractCommonPattern(cluster),
        frequency: cluster.length,
        avgSatisfaction: average(cluster.map(t => t.trajectory.reward)),
        contexts: this.summarizeContexts(cluster),
        recommendedStrategy: this.findBestStrategy(cluster)
      };
    });

    return patterns;
  }
}
```

### Skill Library

```typescript
class SkillLibrary {
  private skills: Map<string, RecommendationSkill> = new Map();

  /**
   * Register a new recommendation skill
   */
  registerSkill(skill: RecommendationSkill): void {
    this.skills.set(skill.id, skill);
  }

  /**
   * Consolidate best practices into reusable skills
   */
  async consolidateSkills(patterns: DistilledPattern[]): Promise<void> {
    for (const pattern of patterns) {
      // Check if we already have a skill for this pattern
      const existingSkill = this.findSimilarSkill(pattern);

      if (existingSkill) {
        // Update existing skill
        await this.updateSkill(existingSkill.id, pattern);
      } else {
        // Create new skill
        const newSkill = this.createSkillFromPattern(pattern);
        this.registerSkill(newSkill);
      }
    }
  }

  /**
   * Get best skill for given context
   */
  async getBestSkill(context: RecommendationContext): Promise<RecommendationSkill> {
    const candidates = Array.from(this.skills.values())
      .filter(skill => skill.applicableToContext(context));

    if (candidates.length === 0) {
      return this.skills.get('default');
    }

    // Rank by historical performance in similar contexts
    const ranked = await Promise.all(
      candidates.map(async skill => ({
        skill,
        score: await this.evaluateSkillPerformance(skill, context)
      }))
    );

    return ranked.sort((a, b) => b.score - a.score)[0].skill;
  }

  /**
   * Create skill from discovered pattern
   */
  private createSkillFromPattern(pattern: DistilledPattern): RecommendationSkill {
    return {
      id: `skill-${Date.now()}`,
      name: pattern.pattern.description,
      description: `Consolidated from ${pattern.frequency} successful trajectories`,

      applicableToContext: (context) => {
        return this.matchesContext(context, pattern.contexts);
      },

      execute: async (context, user) => {
        // Implement the pattern's recommended strategy
        return this.applyStrategy(pattern.recommendedStrategy, context, user);
      },

      metadata: {
        avgSatisfaction: pattern.avgSatisfaction,
        usageCount: 0,
        successRate: 0
      }
    };
  }
}
```

### Performance Monitor

```typescript
class PerformanceMonitor {
  /**
   * Track recommendation performance metrics
   */
  async trackMetrics(): Promise<PerformanceMetrics> {
    const metrics = {
      // Engagement metrics
      ctr: await this.computeCTR(),
      watchTime: await this.computeAvgWatchTime(),
      completionRate: await this.computeCompletionRate(),

      // Satisfaction metrics
      avgRating: await this.computeAvgRating(),
      satisfactionScore: await this.computeSatisfactionScore(),

      // Diversity metrics
      diversityScore: await this.computeDiversityScore(),
      noveltyScore: await this.computeNoveltyScore(),

      // Cross-domain metrics
      crossDomainEngagement: await this.computeCrossDomainEngagement(),
      transferSuccess: await this.computeTransferSuccessRate(),

      // System metrics
      latency: await this.computeAvgLatency(),
      throughput: await this.computeThroughput()
    };

    // Store in time series for trend analysis
    await this.storeMetrics(metrics);

    return metrics;
  }

  /**
   * Detect performance degradation
   */
  async detectDegradation(): Promise<Alert[]> {
    const current = await this.trackMetrics();
    const baseline = await this.getBaselineMetrics();

    const alerts: Alert[] = [];

    for (const [metric, value] of Object.entries(current)) {
      const baselineValue = baseline[metric];
      const change = (value - baselineValue) / baselineValue;

      if (change < -0.05) {  // 5% degradation
        alerts.push({
          severity: change < -0.10 ? 'critical' : 'warning',
          metric,
          currentValue: value,
          baselineValue,
          change,
          message: `${metric} degraded by ${(change * 100).toFixed(1)}%`
        });
      }
    }

    return alerts;
  }

  /**
   * Generate performance report
   */
  async generateReport(period: TimePeriod): Promise<PerformanceReport> {
    const metrics = await this.getMetricsForPeriod(period);

    return {
      period,
      summary: this.summarizeMetrics(metrics),
      trends: this.analyzeTrends(metrics),
      insights: await this.generateInsights(metrics),
      recommendations: await this.generateRecommendations(metrics)
    };
  }
}
```

---

## Data Flow

### End-to-End Recommendation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Request                            │
│              "Recommend me something to watch"                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Context Analyzer                             │
│  - Current mood (if available)                                  │
│  - Time of day                                                  │
│  - Recent activity                                              │
│  - Available time                                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  User Profile Retrieval                         │
│  - Historical UCVs (user's past content)                        │
│  - Preference vector (aggregated from interactions)             │
│  - Cross-domain preferences                                     │
│  - Causal history (what led to satisfaction)                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Skill Selection                                │
│  ReasoningBank → Find similar successful contexts               │
│  SkillLibrary → Get best recommendation skill                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Multi-Strategy Candidate Generation                │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  In-Domain      │  │  Cross-Domain   │  │  Causal Chain   ││
│  │  Similarity     │  │  Transfer       │  │  Prediction     ││
│  │                 │  │                 │  │                 ││
│  │  Vector search  │  │  Transfer       │  │  Follow causal  ││
│  │  in primary     │  │  from other     │  │  edges for      ││
│  │  domain         │  │  domains        │  │  optimal path   ││
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘│
│           │                    │                     │         │
└───────────┼────────────────────┼─────────────────────┼─────────┘
            │                    │                     │
            └────────────────────┼─────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Candidate Fusion                            │
│  - Weighted combination of strategies                           │
│  - Diversity enforcement                                        │
│  - Novelty injection                                            │
│  - Causal reasoning validation                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Ranking & Filtering                          │
│  - Predict satisfaction for each candidate                      │
│  - Filter by availability, age rating, etc.                     │
│  - Re-rank for diversity                                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Explanation Generation                        │
│  - Why each recommendation?                                     │
│  - Causal reasoning ("Because you liked X...")                  │
│  - Cross-domain insights ("You enjoy Y in music...")            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Return Recommendations                     │
│  [                                                              │
│    {                                                            │
│      content: {...},                                            │
│      score: 0.92,                                               │
│      reasoning: "Similar emotional tone to your favorite...",   │
│      causalPath: ["content-123", "mood-happy", "content-456"]   │
│    },                                                           │
│    ...                                                          │
│  ]                                                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Track Interaction                             │
│  - Log recommendation trajectory                                │
│  - Track user interaction (click, watch, rate)                  │
│  - Store in ReasoningBank for future learning                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

```yaml
Programming Languages:
  - TypeScript: Main application language
  - Python: ML/AI models, data science

Vector Database:
  - AgentDB: Primary vector storage with HNSW indexing
  - Namespaces: Separate per domain (tv5monde, spotify, kindle, etc.)
  - Quantization: 8-bit for memory efficiency
  - HNSW: M=16, efConstruction=200, efSearch=50

Machine Learning:
  - PyTorch: Deep learning framework
  - Transformers: Multi-modal embeddings
  - scikit-learn: Statistical analysis, causal inference
  - TSNE/UMAP: Dimensionality reduction for visualization

Graph Database:
  - Neo4j: Causal Content Graph storage
  - Cypher: Graph query language

Time Series Database:
  - InfluxDB: Performance metrics tracking

Message Queue:
  - Redis: Real-time event streaming
  - Bull: Job queue for nightly learning

API Framework:
  - Express.js: REST API
  - GraphQL: Flexible query interface
  - WebSocket: Real-time updates

Frontend (Optional):
  - React: UI components
  - D3.js: Causal graph visualization
  - Recharts: Performance dashboards

Infrastructure:
  - Docker: Containerization
  - Kubernetes: Orchestration
  - PostgreSQL: Relational metadata storage
  - Redis: Caching layer
```

### System Requirements

```yaml
Minimum Requirements:
  RAM: 16GB (with quantization)
  Storage: 100GB (vector database)
  CPU: 8 cores
  GPU: Optional (speeds up UCV computation)

Recommended Production:
  RAM: 64GB
  Storage: 500GB NVMe SSD
  CPU: 32 cores
  GPU: NVIDIA V100 or better (for batch processing)
```

---

## Architecture Decision Records

### ADR-001: Universal Content Vector Dimensionality

**Status:** Accepted
**Date:** 2025-12-06

**Context:**
Need to choose dimensionality for Universal Content Vector that balances expressiveness with computational efficiency.

**Decision:**
Use 384 dimensions split into three equal components (128 each):
- Emotional Signature: 128 dimensions
- Engagement Pattern: 128 dimensions
- Complexity & Depth: 128 dimensions

**Rationale:**
- 384 is compatible with popular embedding models (e.g., all-MiniLM-L6-v2)
- Equal split provides balanced representation
- Large enough to capture nuance, small enough for efficient search
- Empirical testing showed diminishing returns above 512 dimensions

**Consequences:**
- Vector search will be fast (< 10ms for 1M vectors with HNSW)
- Memory footprint manageable with quantization (4x reduction possible)
- May need to revisit if new modalities added (e.g., VR experiences)

---

### ADR-002: AgentDB as Primary Vector Database

**Status:** Accepted
**Date:** 2025-12-06

**Context:**
Need to select vector database that supports multi-domain content at scale.

**Decision:**
Use AgentDB with HNSW indexing and quantization.

**Rationale:**
- 150x faster search compared to brute-force
- Built-in quantization (4-32x memory reduction)
- Multi-tenancy via namespaces (isolate domains)
- SQLite backend (easy deployment, no separate DB server)
- Proven performance in similar recommendation systems

**Alternatives Considered:**
- Pinecone: Cloud-only, vendor lock-in
- Milvus: Heavy infrastructure requirements
- Weaviate: Good but more complex than needed

**Consequences:**
- Simple deployment model
- Need to implement our own distributed scaling (AgentDB is single-node)
- Excellent performance for up to 10M vectors per instance

---

### ADR-003: Causal Graph Implementation

**Status:** Accepted
**Date:** 2025-12-06

**Context:**
Need to store and query causal relationships between content and user states.

**Decision:**
Use Neo4j graph database with custom causal edge types.

**Rationale:**
- Native graph storage optimized for relationship queries
- Cypher query language excellent for path finding
- Supports weighted edges (causal strength)
- Can store rich metadata on edges (p-values, confidence intervals)
- Proven scalability for millions of nodes/edges

**Alternatives Considered:**
- SQL with adjacency list: Poor query performance
- NetworkX in-memory: Doesn't scale
- TigerGraph: Over-engineered for our use case

**Consequences:**
- Need to run separate Neo4j instance
- Requires graph query expertise
- Excellent for complex causal reasoning queries

---

### ADR-004: Adapter Pattern for Domains

**Status:** Accepted
**Date:** 2025-12-06

**Context:**
System must support adding new content domains without changing core logic.

**Decision:**
Implement DomainAdapter interface with standardize/denormalize methods.

**Rationale:**
- Separation of concerns (domain logic isolated)
- Easy to add new domains (just implement interface)
- Allows domain-specific optimizations
- Supports third-party adapter development

**Consequences:**
- Each domain requires custom adapter implementation
- Standardization may lose some domain-specific richness
- Need comprehensive adapter validation to ensure quality

---

### ADR-005: Nightly Learning vs Real-Time

**Status:** Accepted
**Date:** 2025-12-06

**Context:**
Should system learn continuously or in batch?

**Decision:**
Primary learning happens nightly (batch), with lightweight real-time updates.

**Rationale:**
- Most patterns require statistical significance (need batch data)
- Nightly learning allows expensive computation (causal discovery, model retraining)
- Real-time updates limited to fast operations (vector updates, simple statistics)
- Avoids cold-start problem with overnight learning

**Trade-offs:**
- New patterns have 24-hour lag before system-wide deployment
- Real-time updates handle user preference drift within sessions
- Reduces infrastructure costs (batch processing cheaper than continuous)

**Consequences:**
- Need robust job scheduling (cron, Kubernetes CronJob)
- Must handle learning failures gracefully
- Real-time system continues with previous day's models if nightly learning fails

---

### ADR-006: ReasoningBank Storage Format

**Status:** Accepted
**Date:** 2025-12-06

**Context:**
Need to store and retrieve successful recommendation trajectories for meta-learning.

**Decision:**
Store trajectories as semantic vectors in AgentDB with full trajectory JSON as metadata.

**Rationale:**
- Semantic search finds similar contexts (better than exact match)
- AgentDB supports both vector search and metadata storage
- Enables trajectory-based learning (mimic successful patterns)
- Compact storage (vector + compressed JSON)

**Consequences:**
- Need to design trajectory embedding strategy
- Retrieval is approximate (semantic similarity)
- Could miss exact matches if embedding doesn't capture key features

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)

**Goal:** Build core UCV infrastructure

- [ ] Implement Universal Content Vector specification
- [ ] Build UCV Transformation Engine
- [ ] Set up AgentDB vector database
- [ ] Create TV5MONDE adapter (reference implementation)
- [ ] Basic vector search functionality
- [ ] Unit tests for core components

**Deliverables:**
- Working UCV transformer
- TV5MONDE content indexed in AgentDB
- Vector search API endpoint
- Architecture documentation

---

### Phase 2: Multi-Domain Support (Months 3-4)

**Goal:** Extend to multiple content types

- [ ] Implement Spotify adapter
- [ ] Implement Kindle adapter
- [ ] Implement Podcast adapter (e.g., Apple Podcasts)
- [ ] Adapter registry and plugin system
- [ ] Cross-domain vector search
- [ ] Integration tests for all adapters

**Deliverables:**
- 4+ domain adapters operational
- Cross-domain search working
- Adapter development guide
- Performance benchmarks

---

### Phase 3: Cross-Domain Learning (Months 5-6)

**Goal:** Enable transfer learning between domains

- [ ] Implement Shared Emotional Space
- [ ] Train domain bridge models
- [ ] Cross-domain recommendation engine
- [ ] Transfer learning evaluation framework
- [ ] Pattern discovery system

**Deliverables:**
- Working cross-domain recommendations
- Empirical transfer learning performance data
- Shared emotional space visualization
- Pattern discovery reports

---

### Phase 4: Causal Intelligence (Months 7-8)

**Goal:** Add causal reasoning capabilities

- [ ] Set up Neo4j causal graph
- [ ] Implement Causal Discovery Engine
- [ ] Build causal query interface
- [ ] A/B testing framework for causal validation
- [ ] Causal path visualization

**Deliverables:**
- Operational causal content graph
- Causal query API
- A/B test results validating causal claims
- Causal reasoning documentation

---

### Phase 5: Self-Improvement (Months 9-10)

**Goal:** Autonomous learning and optimization

- [ ] Implement Nightly Learner
- [ ] Integrate ReasoningBank with AgentDB
- [ ] Build Skill Library
- [ ] Performance monitoring dashboard
- [ ] Automated model updates

**Deliverables:**
- Autonomous nightly learning pipeline
- ReasoningBank storing successful trajectories
- Skill library with consolidated best practices
- Performance dashboard
- Self-improvement metrics

---

### Phase 6: Production Hardening (Months 11-12)

**Goal:** Scale and reliability

- [ ] Load testing and optimization
- [ ] Distributed vector database (sharding)
- [ ] Caching layer implementation
- [ ] Monitoring and alerting
- [ ] Documentation completion
- [ ] API versioning and stability

**Deliverables:**
- Production-ready system handling 1M+ users
- Comprehensive monitoring
- API documentation (OpenAPI)
- Deployment guides (Docker, Kubernetes)
- Performance tuning guide

---

## Success Metrics

### Technical Metrics

```yaml
Performance:
  Vector Search Latency: < 10ms (p95)
  End-to-End Recommendation: < 100ms (p95)
  Throughput: > 10,000 req/sec
  Uptime: > 99.9%

Accuracy:
  In-Domain Recommendation Accuracy: > 80% (top-10)
  Cross-Domain Transfer Accuracy: > 65% (top-10)
  Causal Prediction Accuracy: > 70%

Efficiency:
  Memory per 1M vectors: < 2GB (with quantization)
  Daily Learning Time: < 2 hours
  Model Update Frequency: Nightly
```

### Business Metrics

```yaml
Engagement:
  Click-Through Rate (CTR): +20% vs baseline
  Watch Time: +15% vs baseline
  Completion Rate: +10% vs baseline

Satisfaction:
  User Rating: > 4.2/5.0
  Return Rate: +25% vs baseline
  Content Discovery: +30% unique content consumed

Diversity:
  Cross-Domain Usage: > 40% users active in 2+ domains
  Genre Diversity: > 5 genres per user per month
  Novelty Score: > 0.3 (% new vs familiar content)
```

---

## Appendix

### Glossary

- **UCV**: Universal Content Vector - 384-dimensional embedding representing content essence
- **Domain**: Content type category (TV, music, books, podcasts, games, news)
- **Adapter**: Software component that transforms domain-specific content to UCV
- **Transfer Learning**: Using knowledge from one domain to improve another
- **Causal Edge**: Directed relationship showing X causes Y with confidence score
- **ReasoningBank**: Repository of successful recommendation trajectories
- **Skill**: Reusable recommendation strategy derived from patterns
- **Trajectory**: Sequence of recommendations and user responses

### References

1. **Vector Databases:**
   - AgentDB Documentation: https://github.com/ruvnet/agentdb
   - HNSW Algorithm: https://arxiv.org/abs/1603.09320

2. **Causal Inference:**
   - Pearl, J. (2009). Causality: Models, Reasoning, and Inference
   - Imbens & Rubin (2015). Causal Inference for Statistics

3. **Transfer Learning:**
   - Pan & Yang (2010). A Survey on Transfer Learning
   - Weiss et al. (2016). A Survey of Transfer Learning

4. **Emotion Models:**
   - Plutchik's Wheel of Emotions
   - Russell's Circumplex Model of Affect
   - PAD (Pleasure-Arousal-Dominance) Model

5. **Recommendation Systems:**
   - Ricci et al. (2015). Recommender Systems Handbook
   - Aggarwal (2016). Recommender Systems: The Textbook

---

## Document Change Log

| Version | Date       | Author | Changes |
|---------|------------|--------|---------|
| 1.0.0   | 2025-12-06 | System Architect | Initial architecture design |

---

**END OF DOCUMENT**
