# What to Watch in 60 Seconds - Conversational UI Design Specification

**Version**: 1.0
**Date**: 2025-12-06
**Status**: Concept Design

---

## Executive Summary

A revolutionary single-screen conversational interface that transforms content discovery from a multi-step form into a natural dialogue. Users interact with an AI companion through voice or text to receive personalized French content recommendations in under 60 seconds.

---

## 1. Design Philosophy

### Core Principles
- **Conversational First**: Natural language replaces traditional navigation
- **Ambient Intelligence**: UI reacts to emotional context and user intent
- **Immediate Gratification**: Recommendations appear inline, no screen transitions
- **Fluid Interaction**: Micro-animations create a living, breathing experience
- **Accessible**: Voice-first design with visual fallbacks

### User Promise
"Tell me what you feel, I'll find what you need - in 60 seconds or less"

---

## 2. Layout Architecture

### Screen Composition (Mobile-First)

```
┌─────────────────────────────────┐
│  ╔═══════════════════════════╗  │ ← Header (60px)
│  ║   60s  🌙  [Voice] [Menu]  ║  │
│  ╚═══════════════════════════╝  │
│                                 │
│  ╭───────────────────────────╮  │ ← Ambient Orb Layer
│  │    ◉ AI Companion Orb     │  │   (Floating, reacts to mood)
│  │   (Pulsing, glowing)      │  │
│  ╰───────────────────────────╯  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ AI: "Bonjour! Quelle     │   │ ← Chat Messages
│  │      est ton humeur?"    │   │   (Scrollable conversation)
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ User: "Je veux me        │   │
│  │       détendre"          │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ AI: "Voici quelque       │   │
│  │      chose..."           │   │
│  │  ╔═══════════════════╗  │   │ ← Content Card (Inline)
│  │  ║ 🎬 Film Title     ║  │   │
│  │  ║ [Image]           ║  │   │
│  │  ║ [Watch] [Save]    ║  │   │
│  │  ╚═══════════════════╝  │   │
│  └─────────────────────────┘   │
│                                 │
│  [🎤 Tap to speak] [💬 Type]   │ ← Input Controls (80px)
│                                 │
│  [😊 Engage] [🌙 Unwind] ...   │ ← Quick Action Chips
└─────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: 375px - 768px (Primary focus)
- **Tablet**: 769px - 1024px (Side-by-side chat + card preview)
- **Desktop**: 1025px+ (Expanded cards, ambient effects enhanced)

---

## 3. Key UI Components

### 3.1 AI Companion Orb

**Visual Design**:
- **Shape**: Floating sphere with aurora-like energy field
- **Size**: 120px diameter (mobile), scales with viewport
- **Position**: Top-center, hovers above conversation
- **Material**: Translucent glass with inner glow

**States & Behaviors**:

| State | Visual | Animation | Trigger |
|-------|--------|-----------|---------|
| **Idle** | Gentle pulse, soft glow | Slow breathing (2s cycle) | No interaction |
| **Listening** | Audio waveform rings | Reactive to voice amplitude | Voice input active |
| **Thinking** | Swirling particles inside | Clockwise rotation | Processing query |
| **Recommending** | Burst of sparkles outward | Expansion pulse | Displaying result |
| **Mood: Unwind** | Purple/lavender aurora | Slow, flowing waves | Mood detected |
| **Mood: Engage** | Gold/amber aurora | Sharp, energetic pulses | Mood detected |

**Technical Specs**:
```css
.ai-orb {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(138, 43, 226, 0.3) 0%,
    rgba(138, 43, 226, 0.05) 70%,
    transparent 100%
  );
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 40px rgba(138, 43, 226, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}
```

### 3.2 Chat Message Bubbles

**AI Messages**:
```
┌─────────────────────────────────┐
│  ◉  "Bonjour! Quelle est ton    │ ← Orb avatar (small, 32px)
│      humeur aujourd'hui?"        │ ← Glassmorphic background
│      ┌───────────────┐          │
│      │ 🌙 Détendre   │          │ ← Suggested quick replies
│      │ ⚡ Énergiser  │          │
│      └───────────────┘          │
│                          12:30  │ ← Timestamp
└─────────────────────────────────┘
```

**Styling**:
- Background: `rgba(255, 255, 255, 0.08)`
- Border: `1px solid rgba(255, 255, 255, 0.12)`
- Backdrop filter: `blur(12px)`
- Text: White with 90% opacity
- Typing animation: Dots appear sequentially

**User Messages**:
```
                  ┌──────────────────┐
                  │ "Je veux me      │ ← Aligned right
                  │  détendre"       │ ← Solid background
                  │          12:31   │
                  └──────────────────┘
```

**Styling**:
- Background: Mood-based gradient (purple for unwind, gold for engage)
- Text: White 100% opacity
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`

### 3.3 Content Cards (Inline)

**Card Structure**:
```
╔═══════════════════════════════════╗
║  ┌─────────────────────────────┐  ║
║  │                             │  ║ ← Hero Image (16:9 ratio)
║  │      [Thumbnail]            │  ║   Lazy-loaded, blur-to-sharp
║  │                             │  ║
║  └─────────────────────────────┘  ║
║  🎬 Film                          ║ ← Content Type Icon
║  "Le Fabuleux Destin d'Amélie"   ║ ← Title (bold, 18px)
║  ⭐ 8.3 • 2h 2min • 2001         ║ ← Metadata
║  "Une comédie romantique qui..." ║ ← Description (2 lines max)
║                                   ║
║  [▶ Regarder] [💾 Sauvegarder]   ║ ← Action Buttons
║  [🔄 Autre chose]                 ║
╚═══════════════════════════════════╝
```

**Visual Treatment**:
- **Background**: Glassmorphic with content-aware color extraction
  - Extract dominant color from thumbnail
  - Apply as subtle gradient overlay (`rgba(color, 0.15)`)
- **Border**: Animated glow matching mood color
- **Entrance**: Slide up + fade in (0.4s ease-out)
- **Hover** (Desktop): Slight scale (1.02x) + glow intensifies

**Responsive Sizing**:
- Mobile: Full width - 32px padding
- Tablet: 480px max-width
- Desktop: 560px max-width

### 3.4 Voice Input Interface

**Microphone Button**:
```
┌─────────────────────────────────┐
│                                 │
│         ┌─────────┐             │
│         │   🎤    │             │ ← Large tap target (64px)
│         └─────────┘             │
│     "Appuyez pour parler"       │ ← Hint text
│                                 │
│   ┌───────────────────────┐    │ ← Waveform (when active)
│   │ ═══╪═══╪═══╪═══╪═══   │    │   Real-time audio visualization
│   └───────────────────────┘    │
│                                 │
│   ⏸ Tap to stop • 00:12/00:60  │ ← Timer (max 60s)
└─────────────────────────────────┘
```

**States**:
1. **Inactive**: Gray icon, subtle pulse
2. **Active**: Glowing accent color, waveform appears
3. **Processing**: Spinning loader around mic icon
4. **Transcribing**: Text appears above in real-time

**Audio Waveform**:
```javascript
// Simplified visualization concept
const waveformBars = 24;
const barHeights = Array(waveformBars).fill(0);

// Update on audio input
audioContext.analyser.getByteFrequencyData(dataArray);
barHeights.forEach((_, i) => {
  barHeights[i] = normalize(dataArray[i * frequencyBin]);
});
```

### 3.5 Quick Action Chips

**Chip Design**:
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🌙 Détendre  │  │ ⚡ Énergiser │  │ 😂 Rire      │
└──────────────┘  └──────────────┘  └──────────────┘
     ↑ Inactive        ↑ Active         ↑ Hover
```

**Visual States**:
- **Inactive**:
  - Background: `rgba(255, 255, 255, 0.1)`
  - Border: `1px solid rgba(255, 255, 255, 0.2)`
  - Text: White 70% opacity
- **Active**:
  - Background: Mood gradient
  - Border: Glowing (0 0 12px mood-color)
  - Text: White 100% opacity
- **Hover**: Scale 1.05x, glow appears

**Layout**:
- Horizontal scrollable row
- Spacing: 12px between chips
- Height: 44px (comfortable tap target)

---

## 4. Interaction Flow (Chat-Based)

### Flow Diagram

```
User Opens App
      │
      ▼
┌─────────────────────────────────┐
│ AI: "Bonjour! Quelle est ton    │ ← Initial greeting
│      humeur aujourd'hui?"        │   Orb pulses gently
│  [🌙 Détendre] [⚡ Énergiser]   │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ User: "Je veux me détendre"     │ ← Text or voice input
└─────────────────────────────────┘   Orb shifts to purple aurora
      │
      ▼
┌─────────────────────────────────┐
│ AI: [Typing animation...]       │ ← 1-2 second thinking state
│     "Parfait! Quel genre?"      │   Orb swirls with particles
│  [🎭 Comédie] [📚 Documentaire] │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ User: "Comédie"                 │ ← Quick chip tap or voice
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ AI: "Voici une perle..."        │ ← Recommendation appears
│  ╔═══════════════════════════╗ │   Content card slides up
│  ║ [Film Card: Amélie]       ║ │   Orb bursts with sparkles
│  ║ [▶ Regarder] [💾 Sauver]  ║ │
│  ╚═══════════════════════════╝ │
│  "Une autre suggestion?"        │
│  [🔄 Autre chose] [✅ Parfait]  │
└─────────────────────────────────┘
      │
      ├─► User: "Autre chose" → New card appears
      │
      └─► User: "Parfait" → Confirmation + Save to profile
```

### Conversation Scenarios

#### Scenario 1: Simple Mood-Based Query
```
AI: "Bonjour! Quelle est ton humeur?"
User: "Fatigué" (voice)
AI: "Je comprends. Quelque chose de léger pour décompresser?"
User: "Oui"
AI: [Recommends feel-good comedy]
    "Cette comédie française va te remonter le moral 😊"
```

#### Scenario 2: Specific Request
```
User: "Je cherche un thriller psychologique"
AI: "Excellent choix! Plutôt récent ou classique?"
User: "Récent"
AI: [Shows 2024 thriller]
    "Sorti cette année, ce thriller a fait sensation à Cannes"
```

#### Scenario 3: Multi-Turn Refinement
```
User: "Quelque chose pour ce soir"
AI: "Tu préfères rire ou réfléchir?"
User: "Rire"
AI: [Shows comedy series]
    "Une série légère, épisodes de 20 minutes"
User: "Plutôt un film"
AI: [Adjusts to feature film]
    "Voici une comédie française de 1h45"
```

### Input Methods Priority

1. **Voice** (Primary)
   - Tap-and-hold microphone
   - Auto-detect language (French)
   - Real-time transcription display
   - Max 60 seconds per message

2. **Text** (Secondary)
   - Keyboard input with auto-suggestions
   - Emoji support for mood
   - Auto-complete for common queries

3. **Quick Chips** (Tertiary)
   - Context-aware suggestions
   - Mood, genre, format shortcuts
   - Action buttons on cards

---

## 5. Animation Concepts

### 5.1 Micro-Animations Timeline

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| **Orb Pulse** | Idle state | Scale 1.0 → 1.05 → 1.0 | 2000ms | ease-in-out |
| **Orb Mood Shift** | Mood detection | Color gradient transition | 800ms | ease-out |
| **Typing Indicator** | AI thinking | 3 dots bounce sequentially | 1400ms | ease-in-out |
| **Message Appear** | New message | Fade in + slide up 20px | 400ms | ease-out |
| **Card Entrance** | Recommendation | Slide up 40px + fade in | 500ms | cubic-bezier(0.34, 1.56, 0.64, 1) |
| **Card Image Load** | Image ready | Blur (20px → 0) + opacity | 600ms | ease-out |
| **Button Tap** | User interaction | Scale 0.95 → 1.0 + ripple | 200ms | ease-out |
| **Voice Waveform** | Audio input | Bar heights follow amplitude | 60fps | linear |
| **Chip Selection** | Chip tap | Scale 1.0 → 1.1 → 1.0 + glow | 300ms | ease-out |

### 5.2 Particle System (Orb Effects)

**Implementation Strategy**:
```javascript
// Conceptual particle system for orb
class ParticleEffect {
  particles: Array<{
    x, y, vx, vy, life, size, color
  }> = [];

  // Emit particles on mood detection
  emitMoodBurst(mood) {
    const color = getMoodColor(mood);
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: orbCenter.x,
        y: orbCenter.y,
        vx: randomRange(-2, 2),
        vy: randomRange(-3, -1),
        life: 1.0,
        size: randomRange(2, 6),
        color: color
      });
    }
  }

  update(delta) {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= delta * 0.01;
      p.vy += 0.05; // Gravity
    });
    // Remove dead particles
    this.particles = this.particles.filter(p => p.life > 0);
  }
}
```

### 5.3 Gesture Animations

| Gesture | Platform | Animation Response |
|---------|----------|-------------------|
| **Swipe Up** | Mobile | Scroll conversation history |
| **Swipe Down** | Mobile | Pull to refresh (new conversation) |
| **Swipe Left on Card** | Mobile | Dismiss card, show next |
| **Swipe Right on Card** | Mobile | Save to watchlist |
| **Long Press Orb** | All | Quick settings menu appears |
| **Shake Device** | Mobile | Clear conversation, fresh start |

---

## 6. Color Palette & Mood System

### Base Dark Theme

```css
:root {
  /* Background Gradients */
  --bg-primary: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  --bg-surface: rgba(255, 255, 255, 0.05);

  /* Text */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.70);
  --text-tertiary: rgba(255, 255, 255, 0.50);

  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-blur: 12px;
}
```

### Mood-Based Color Systems

#### 🌙 Détendre (Unwind)
**Primary Use**: Relaxation, calm content, winding down

```css
.mood-unwind {
  /* Gradient */
  --mood-gradient: linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%);

  /* Accent Colors */
  --accent-primary: #8B5CF6;    /* Vivid Purple */
  --accent-secondary: #A78BFA;  /* Light Purple */
  --accent-glow: rgba(139, 92, 246, 0.5);

  /* Orb Aurora */
  --orb-inner: rgba(139, 92, 246, 0.3);
  --orb-outer: rgba(139, 92, 246, 0.05);
  --orb-glow: 0 0 40px rgba(139, 92, 246, 0.6);

  /* Particle Colors */
  --particle-1: #E9D5FF;  /* Lightest */
  --particle-2: #C4B5FD;
  --particle-3: #8B5CF6;  /* Main */
}
```

**Recommended Content Types**: Cozy comedies, nature docs, lo-fi series

#### ⚡ Énergiser (Engage)
**Primary Use**: Action, excitement, energizing content

```css
.mood-engage {
  /* Gradient */
  --mood-gradient: linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%);

  /* Accent Colors */
  --accent-primary: #F59E0B;    /* Amber Gold */
  --accent-secondary: #FBBF24;  /* Light Gold */
  --accent-glow: rgba(245, 158, 11, 0.5);

  /* Orb Aurora */
  --orb-inner: rgba(245, 158, 11, 0.3);
  --orb-outer: rgba(245, 158, 11, 0.05);
  --orb-glow: 0 0 40px rgba(245, 158, 11, 0.6);

  /* Particle Colors */
  --particle-1: #FEF3C7;  /* Lightest */
  --particle-2: #FCD34D;
  --particle-3: #F59E0B;  /* Main */
}
```

**Recommended Content Types**: Action films, thrillers, sports docs

#### 😂 Rire (Laugh)
**Primary Use**: Comedy, lighthearted content

```css
.mood-laugh {
  /* Gradient */
  --mood-gradient: linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%);

  /* Accent Colors */
  --accent-primary: #10B981;    /* Emerald Green */
  --accent-secondary: #34D399;  /* Light Green */
  --accent-glow: rgba(16, 185, 129, 0.5);

  /* Orb Aurora */
  --orb-inner: rgba(16, 185, 129, 0.3);
  --orb-outer: rgba(16, 185, 129, 0.05);
  --orb-glow: 0 0 40px rgba(16, 185, 129, 0.6);
}
```

#### 🎭 Réfléchir (Think)
**Primary Use**: Dramas, documentaries, thought-provoking content

```css
.mood-think {
  /* Gradient */
  --mood-gradient: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);

  /* Accent Colors */
  --accent-primary: #6366F1;    /* Indigo */
  --accent-secondary: #818CF8;  /* Light Indigo */
  --accent-glow: rgba(99, 102, 241, 0.5);
}
```

#### ❤️ Émouvoir (Feel)
**Primary Use**: Romance, emotional dramas

```css
.mood-feel {
  /* Gradient */
  --mood-gradient: linear-gradient(135deg, #EC4899 0%, #F43F5E 50%, #FB7185 100%);

  /* Accent Colors */
  --accent-primary: #EC4899;    /* Pink */
  --accent-secondary: #F472B6;  /* Light Pink */
  --accent-glow: rgba(236, 72, 153, 0.5);
}
```

### Adaptive Color Extraction

**Dynamic Card Colors**:
```javascript
// Extract dominant color from content thumbnail
function extractCardAccent(imageUrl) {
  const colorThief = new ColorThief();
  const dominantColor = colorThief.getColor(imageElement);

  // Convert to HSL and adjust for UI
  const [h, s, l] = rgbToHsl(dominantColor);

  return {
    background: `hsla(${h}, ${s*0.5}%, ${l*0.3}%, 0.15)`,
    border: `hsla(${h}, ${s}%, ${l}%, 0.3)`,
    glow: `0 0 20px hsla(${h}, ${s}%, ${l}%, 0.4)`
  };
}
```

---

## 7. Example Conversation Flow (Complete)

### Full User Journey: Evening Relaxation

```
┌─────────────────────────────────────────────────────────────┐
│ [18:42] User opens app                                      │
│                                                              │
│  ◉  "Bonsoir! Comment te sens-tu ce soir?"                 │
│                                                              │
│  [🌙 Fatigué] [⚡ Énergique] [😊 Joyeux] [🎭 Pensif]      │
└─────────────────────────────────────────────────────────────┘
      │ User taps 🌙 Fatigué
      ▼
┌─────────────────────────────────────────────────────────────┐
│                          "Fatigué"                           │
│                                                     18:42    │
└─────────────────────────────────────────────────────────────┘
      │ Orb shifts to purple aurora, gentle breathing animation
      ▼
┌─────────────────────────────────────────────────────────────┐
│  ◉  [Typing...]                                             │
│     "Je comprends. Quelque chose de léger pour décompresser │
│      ou plutôt contemplatif?"                               │
│                                                              │
│  [🍿 Léger] [🌅 Contemplatif]                               │
└─────────────────────────────────────────────────────────────┘
      │ User says via voice: "Léger et drôle"
      ▼
┌─────────────────────────────────────────────────────────────┐
│  🎤 ═══╪═══╪═══╪═══ "Léger et drôle"                       │
│                                                     18:43    │
└─────────────────────────────────────────────────────────────┘
      │ Orb swirls with particles while processing
      ▼
┌─────────────────────────────────────────────────────────────┐
│  ◉  "Parfait! J'ai LA perle pour toi..."                   │
│                                                              │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  ┌─────────────────────────────────────────────────┐  ║ │
│  ║  │ [Image: Amélie Poulain café scene]             │  ║ │
│  ║  └─────────────────────────────────────────────────┘  ║ │
│  ║  🎬 Film                                              ║ │
│  ║  "Le Fabuleux Destin d'Amélie Poulain"               ║ │
│  ║  ⭐ 8.3 • 2h 2min • Comédie romantique • 2001        ║ │
│  ║                                                        ║ │
│  ║  "Une jeune serveuse parisienne décide de changer    ║ │
│  ║   la vie de ceux qui l'entourent..."                 ║ │
│  ║                                                        ║ │
│  ║  Pourquoi maintenant?                                 ║ │
│  ║  "Sa douceur visuelle et son humour tendre sont      ║ │
│  ║   parfaits pour décompresser. Un feel-good garanti." ║ │
│  ║                                                        ║ │
│  ║  [▶ Regarder sur Netflix] [💾 Sauvegarder]           ║ │
│  ║  [🔄 Autre suggestion]                                ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                     18:43    │
│                                                              │
│  "Tu veux d'autres suggestions similaires?"                 │
│  [✅ Parfait] [🔄 Autre genre] [⏱️ Plus court]            │
└─────────────────────────────────────────────────────────────┘
      │ User taps "Parfait"
      ▼
┌─────────────────────────────────────────────────────────────┐
│                        "Parfait"                             │
│                                                     18:44    │
└─────────────────────────────────────────────────────────────┘
      │ Orb bursts with purple sparkles (celebration)
      ▼
┌─────────────────────────────────────────────────────────────┐
│  ◉  "Excellent choix! ✨ Sauvegardé dans ta liste."        │
│                                                              │
│     "Bon visionnage! Tu peux me retrouver ici quand         │
│      tu auras besoin d'une nouvelle recommandation 😊"      │
│                                                              │
│  [🏠 Retour] [🔍 Nouvelle recherche]                        │
└─────────────────────────────────────────────────────────────┘
```

### Alternative Path: Refinement Loop

```
┌─────────────────────────────────────────────────────────────┐
│  User: "Quelque chose pour ce soir avec ma copine"         │
└─────────────────────────────────────────────────────────────┘
      ▼
┌─────────────────────────────────────────────────────────────┐
│  AI: "Romantique, drôle, ou intense?"                       │
└─────────────────────────────────────────────────────────────┘
      ▼
┌─────────────────────────────────────────────────────────────┐
│  User: "Romantique mais pas trop cliché"                    │
└─────────────────────────────────────────────────────────────┘
      ▼
┌─────────────────────────────────────────────────────────────┐
│  AI: [Shows French indie romance]                           │
│      "Ce film a surpris tout le monde à Cannes..."          │
└─────────────────────────────────────────────────────────────┘
      ▼
┌─────────────────────────────────────────────────────────────┐
│  User: "Trop long, on a 90 minutes max"                     │
└─────────────────────────────────────────────────────────────┘
      ▼
┌─────────────────────────────────────────────────────────────┐
│  AI: [Adjusts to shorter film]                              │
│      "Voici un court-métrage nominé aux César, 1h15..."     │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Technical Implementation Notes

### 8.1 Technology Stack Recommendations

**Frontend**:
- **Framework**: React with TypeScript
- **Animation**: Framer Motion (declarative animations)
- **3D/Particles**: Three.js or React Three Fiber (orb effects)
- **Voice**: Web Speech API (browser native) + fallback to Deepgram
- **Styling**: Tailwind CSS + CSS Custom Properties
- **Gestures**: React Use Gesture

**Backend**:
- **AI**: Claude API (Anthropic) for conversational intelligence
- **Content DB**: Mock French content database (from existing data)
- **Voice Processing**: Browser-native first, cloud fallback

### 8.2 Performance Optimizations

| Optimization | Implementation | Impact |
|--------------|----------------|--------|
| **Lazy Loading** | Intersection Observer for images | Faster initial load |
| **Virtual Scrolling** | React Window for long conversations | Smooth scrolling |
| **Animation FPS** | RequestAnimationFrame for 60fps | Buttery animations |
| **Debounced Voice** | 300ms silence detection | Reduces API calls |
| **Cached Responses** | LocalStorage for repeat queries | Instant answers |
| **Progressive Images** | Blur-up technique | Perceived speed |

### 8.3 Accessibility Features

**Screen Reader Support**:
- ARIA labels for all interactive elements
- Announce AI messages as they appear
- Voice input transcription displayed visually

**Keyboard Navigation**:
- Tab through quick chips
- Enter to send message
- Escape to close card
- Arrow keys for chip selection

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .ai-orb {
    animation: none;
  }
}
```

**Color Contrast**:
- All text meets WCAG AAA standards (7:1 ratio minimum)
- Mood colors tested for colorblind users

### 8.4 Voice Input Implementation

```javascript
// Simplified voice input flow
class VoiceInput {
  recognition: SpeechRecognition;

  constructor() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = 'fr-FR';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
  }

  start() {
    this.recognition.start();

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const isFinal = event.results[0].isFinal;

      if (isFinal) {
        this.sendToAI(transcript);
      } else {
        this.showInterimTranscript(transcript);
      }
    };
  }

  visualizeAudio() {
    // Create waveform from microphone input
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      analyser.getByteFrequencyData(dataArray);
      // Update waveform UI
      updateWaveformBars(dataArray);
      requestAnimationFrame(draw);
    }
    draw();
  }
}
```

---

## 9. Future Enhancements (Phase 2)

### Multi-User Modes
- **Group Mode**: "For 3 people with different tastes"
  - AI suggests content with broad appeal
  - Shows compatibility scores

### Contextual Awareness
- **Time-Based**: Auto-suggest based on time of day
  - Morning: Uplifting content
  - Evening: Relaxing content
  - Weekend: Binge-worthy series

### Persistent Memory
- **User Profile Learning**:
  - Remembers favorite genres
  - Learns viewing patterns
  - "Based on what you loved last week..."

### Social Features
- **Share Recommendations**:
  - Generate shareable links
  - "My friend recommended this via 60s app"

### Advanced Voice
- **Emotion Detection**: Analyze tone of voice to refine mood
- **Accent Adaptation**: Better recognition for regional French accents

---

## 10. Design System Documentation

### Component Library

```
components/
├── AIOrbCompanion/
│   ├── Orb.tsx              # Main orb component
│   ├── ParticleSystem.tsx   # Particle effects
│   ├── AuroraEffect.tsx     # Mood-based aurora
│   └── orb.styles.ts        # Styled components
│
├── ChatInterface/
│   ├── MessageBubble.tsx    # AI & user messages
│   ├── TypingIndicator.tsx  # 3-dot animation
│   ├── QuickChips.tsx       # Action chips
│   └── ConversationView.tsx # Scrollable container
│
├── ContentCard/
│   ├── Card.tsx             # Main card component
│   ├── CardImage.tsx        # Lazy-loaded thumbnail
│   ├── CardActions.tsx      # Watch/Save buttons
│   └── card.styles.ts       # Glassmorphism styles
│
├── VoiceInput/
│   ├── MicrophoneButton.tsx # Voice control
│   ├── Waveform.tsx         # Audio visualization
│   └── VoiceTranscript.tsx  # Real-time text
│
└── Ambient/
    ├── BackgroundGradient.tsx # Animated background
    └── ParticleField.tsx      # Floating particles
```

### Design Tokens (Figma Variables)

```json
{
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px"
  },
  "borderRadius": {
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "full": "9999px"
  },
  "shadows": {
    "card": "0 4px 24px rgba(0, 0, 0, 0.15)",
    "orb": "0 0 40px var(--orb-glow)",
    "button": "0 2px 8px rgba(0, 0, 0, 0.1)"
  },
  "transitions": {
    "fast": "200ms ease-out",
    "normal": "400ms ease-out",
    "slow": "600ms ease-out"
  }
}
```

---

## 11. Success Metrics

### User Experience KPIs
- **Time to Recommendation**: < 60 seconds (as promised)
- **Tap Count**: Average 3-5 taps per successful recommendation
- **Voice Adoption**: 60%+ of users try voice input
- **Conversation Length**: 4-6 message exchanges average
- **Refinement Rate**: 30% of users refine initial recommendation
- **Satisfaction Score**: 8.5+/10 on recommendation quality

### Technical Performance
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Animation FPS**: Maintain 60fps
- **Voice Latency**: < 500ms from speech end to transcription

---

## 12. Conclusion

This conversational UI transforms content discovery from a transactional form-filling experience into an engaging dialogue with an intelligent companion. By combining:

1. **Natural Language Processing** - Users speak/type their intent freely
2. **Ambient Intelligence** - UI reacts emotionally through the orb companion
3. **Inline Results** - No screen transitions, everything in one conversation
4. **Mood-Adaptive Design** - Colors and animations reflect emotional context
5. **Voice-First Interaction** - Speaking feels more natural than tapping

The result is a futuristic, delightful experience that delivers on its "60 seconds" promise while feeling more human than any traditional content discovery interface.

---

**Next Steps**:
1. Create interactive prototype in Figma
2. Develop React component library
3. Integrate Claude API for conversational AI
4. User testing with 5-7 French content consumers
5. Iterate based on feedback

**Files to Create**:
- `design-system.figma` - Visual design library
- `prototype.figma` - Interactive clickable prototype
- `animation-specs.lottie` - Exported animations for developers
- `voice-flow-diagram.pdf` - Detailed voice interaction flows
