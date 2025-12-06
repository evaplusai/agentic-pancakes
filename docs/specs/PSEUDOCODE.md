# SPARC Pseudocode Documentation
## Universal Content Discovery Platform - "What to Watch in 60 Seconds"

**Version**: 1.0
**Date**: 2025-12-06
**Phase**: Pseudocode (SPARC Methodology)
**Derived From**: PRD v2.0

---

## Table of Contents

1. [Core Recommendation Flow](#1-core-recommendation-flow)
2. [Intent Extraction Algorithm](#2-intent-extraction-algorithm)
3. [Matching Engine Algorithms](#3-matching-engine-algorithms)
4. [Vector Search Algorithms](#4-vector-search-algorithms)
5. [ReasoningBank Operations](#5-reasoningbank-operations)
6. [Nightly Learner Pipeline](#6-nightly-learner-pipeline)
7. [Self-Healing Algorithm](#7-self-healing-algorithm)
8. [Agent Orchestration](#8-agent-orchestration)
9. [Data Structures](#9-data-structures)
10. [Complexity Analysis Summary](#10-complexity-analysis-summary)

---

## 1. Core Recommendation Flow

### 1.1 Main Recommendation Pipeline

```
ALGORITHM: GetRecommendation
INPUT:
    quizAnswers (QuizResponse): User's binary choice selections
    context (RequestContext): Time, device, location metadata
    userId (string): User identifier
OUTPUT:
    recommendation (Recommendation): Top pick with alternatives
    OR error (Error): If recommendation fails

CONSTANTS:
    MAX_PROCESSING_TIME = 3000 ms
    MIN_CANDIDATES = 10
    MAX_ALTERNATIVES = 3

BEGIN
    // Phase 1: Extract emotional state (parallel with memory query)
    startTime ← GetCurrentTime()

    PARALLEL:
        emotionalState ← ExtractIntent(quizAnswers, context, userId)
        pastPatterns ← QueryReflexionMemory(userId, context)
    END PARALLEL

    // Phase 2: Apply learned constraints from memory
    IF pastPatterns IS NOT NULL THEN
        emotionalState ← ApplyReflexionConstraints(emotionalState, pastPatterns)
    END IF

    // Phase 3: Parallel agent processing
    PARALLEL:
        vectorCandidates ← CatalogAgent.Search(emotionalState, userId)
        trendingBoosts ← TrendAgent.GetBoosts(emotionalState)
        gnnExpansion ← GNNAgent.ExpandQuery(emotionalState, userId)
    END PARALLEL

    // Phase 4: Merge and match
    allCandidates ← MergeCandidates(vectorCandidates, gnnExpansion)

    IF allCandidates.size < MIN_CANDIDATES THEN
        RETURN error("Insufficient candidates found")
    END IF

    // Phase 5: Score with utility-based matching
    scoredResults ← MatchEngine.Score(
        allCandidates,
        emotionalState,
        trendingBoosts,
        userId
    )

    // Phase 6: Diversify and select
    topPick ← scoredResults[0]
    alternatives ← DiversifyAlternatives(scoredResults[1:], MAX_ALTERNATIVES)

    // Phase 7: Generate provenance
    provenance ← GenerateProvenance(topPick, emotionalState, userId)

    // Phase 8: Check processing time
    elapsedTime ← GetCurrentTime() - startTime
    IF elapsedTime > MAX_PROCESSING_TIME THEN
        LogWarning("Recommendation exceeded time budget", elapsedTime)
    END IF

    // Phase 9: Store trajectory for learning
    StoreTrajectory({
        userId: userId,
        emotionalState: emotionalState,
        recommendation: topPick,
        processingTime: elapsedTime,
        timestamp: GetCurrentTime()
    })

    RETURN {
        topPick: topPick,
        alternatives: alternatives,
        provenance: provenance,
        processingTime: elapsedTime
    }

ERROR_HANDLING:
    CATCH VectorSearchError:
        RETURN FallbackStaticRecommendation(context)
    CATCH TimeoutError:
        RETURN PartialResults(scoredResults)
    CATCH ANY:
        LogError(error)
        RETURN DefaultRecommendation(userId)
END
```

**Complexity Analysis**:
- **Time**: O(k log n) where k = parallel operations, n = catalog size
  - Intent extraction: O(1)
  - Memory query: O(log m) where m = episode count
  - Vector search: O(log n) with HNSW
  - GNN expansion: O(d · |N|) where d = depth, |N| = neighbor count
  - Scoring: O(c) where c = candidate count
  - Total: O(log n + c) ≈ O(log n) since c << n
- **Space**: O(c) for candidate storage

---

## 2. Intent Extraction Algorithm

### 2.1 Quiz Answer Processing

```
ALGORITHM: ExtractIntent
INPUT:
    quizAnswers (QuizResponse): {mood, goal}
    context (RequestContext): {time, device, location, social}
    userId (string): User identifier
OUTPUT:
    emotionalState (UniversalEmotionalState): Normalized emotional vector

CONSTANTS:
    MOOD_MAPPING = {
        "unwind": {energy: 0.3, valence: 0.5, arousal: 0.2},
        "engage": {energy: 0.8, valence: 0.6, arousal: 0.7}
    }
    GOAL_MAPPING = {
        "laugh": {needs: {joy: 0.9, relaxation: 0.7}},
        "feel": {needs: {catharsis: 0.8, connection: 0.7}},
        "thrill": {needs: {stimulation: 0.9, escape: 0.6}},
        "think": {needs: {growth: 0.8, meaning: 0.7}}
    }

BEGIN
    // Step 1: Map binary choices to base emotional state
    baseMood ← MOOD_MAPPING[quizAnswers.mood]
    goalNeeds ← GOAL_MAPPING[quizAnswers.goal]

    // Step 2: Compute base emotional vector
    energy ← baseMood.energy
    valence ← baseMood.valence
    arousal ← baseMood.arousal

    // Step 3: Calculate cognitive capacity from context
    cognitiveCapacity ← CalculateCognitiveCapacity(context)

    // Step 4: Combine needs from goal
    needs ← InitializeNeedsVector()
    FOR EACH need, value IN goalNeeds.needs DO
        needs[need] ← value
    END FOR

    // Step 5: Apply contextual adjustments
    IF context.time IN LATE_EVENING THEN
        energy ← energy × 0.8        // Lower energy at night
        needs.relaxation ← needs.relaxation × 1.2
    END IF

    IF context.social == "family" THEN
        needs.connection ← needs.connection × 1.3
        cognitiveCapacity ← cognitiveCapacity × 0.9  // Simpler content
    END IF

    IF context.device == "mobile" THEN
        cognitiveCapacity ← cognitiveCapacity × 0.85  // Shorter attention
    END IF

    // Step 6: Query Reflexion Memory for past failures
    pastFailures ← QueryReflexionMemory(userId, {
        emotionalState: {energy, valence, arousal},
        context: context,
        outcome: "abandoned"
    })

    // Step 7: Apply self-critique constraints
    constraints ← []
    FOR EACH failure IN pastFailures DO
        IF failure.confidenceScore > 0.7 THEN
            constraint ← ExtractConstraint(failure)
            constraints.append(constraint)
        END IF
    END FOR

    // Step 8: Create final emotional state
    emotionalState ← {
        energy: CLAMP(energy, 0, 1),
        valence: CLAMP(valence, -1, 1),
        arousal: CLAMP(arousal, 0, 1),
        cognitiveCapacity: CLAMP(cognitiveCapacity, 0, 1),
        needs: NormalizeNeeds(needs),
        context: context,
        constraints: constraints,
        timestamp: GetCurrentTime()
    }

    RETURN emotionalState
END

SUBROUTINE: CalculateCognitiveCapacity
INPUT: context (RequestContext)
OUTPUT: capacity (number between 0 and 1)

BEGIN
    baseCapacity ← 1.0

    // Time-based adjustment
    hour ← context.time.hour
    IF hour < 6 OR hour > 22 THEN
        baseCapacity ← baseCapacity × 0.6
    ELSE IF hour >= 12 AND hour <= 14 THEN
        baseCapacity ← baseCapacity × 0.8  // Lunch fatigue
    END IF

    // Day of week adjustment
    IF context.time.dayOfWeek IN [MONDAY, TUESDAY] THEN
        baseCapacity ← baseCapacity × 0.9
    ELSE IF context.time.dayOfWeek == FRIDAY THEN
        baseCapacity ← baseCapacity × 1.1  // More energy
    END IF

    RETURN CLAMP(baseCapacity, 0, 1)
END
```

**Complexity Analysis**:
- **Time**: O(log m) where m = episode count for memory query
- **Space**: O(1) for emotional state construction

### 2.2 Mood Vector Generation

```
ALGORITHM: GenerateMoodVector
INPUT:
    emotionalState (UniversalEmotionalState): Extracted state
OUTPUT:
    moodVector (number[]): 64-dimensional mood representation

CONSTANTS:
    MOOD_DIMENSIONS = 64
    PLUTCHIK_EMOTIONS = 8
    VAD_DIMENSIONS = 3

BEGIN
    moodVector ← Array(MOOD_DIMENSIONS).fill(0)

    // Dimensions 0-7: Plutchik emotions (derived from state)
    moodVector[0] ← ComputeJoy(emotionalState)
    moodVector[1] ← ComputeTrust(emotionalState)
    moodVector[2] ← ComputeFear(emotionalState)
    moodVector[3] ← ComputeSurprise(emotionalState)
    moodVector[4] ← ComputeSadness(emotionalState)
    moodVector[5] ← ComputeDisgust(emotionalState)
    moodVector[6] ← ComputeAnger(emotionalState)
    moodVector[7] ← ComputeAnticipation(emotionalState)

    // Dimensions 8-10: VAD model
    moodVector[8] ← emotionalState.valence
    moodVector[9] ← emotionalState.arousal
    moodVector[10] ← emotionalState.energy  // Dominance proxy

    // Dimensions 11-20: Need strengths
    needsArray ← ObjectToArray(emotionalState.needs)
    FOR i ← 0 TO needsArray.length - 1 DO
        moodVector[11 + i] ← needsArray[i]
    END FOR

    // Dimensions 21-30: Context embeddings
    moodVector[21] ← EncodeTime(emotionalState.context.time)
    moodVector[22] ← EncodeDevice(emotionalState.context.device)
    moodVector[23] ← EncodeSocial(emotionalState.context.social)
    moodVector[24] ← EncodeLocation(emotionalState.context.location)

    // Dimensions 31-40: Cognitive and preference signals
    moodVector[31] ← emotionalState.cognitiveCapacity

    // Dimensions 41-63: Reserved for learned features
    // (Populated by pattern learning from ReasoningBank)

    // Normalize vector
    norm ← L2Norm(moodVector)
    FOR i ← 0 TO MOOD_DIMENSIONS - 1 DO
        moodVector[i] ← moodVector[i] / norm
    END FOR

    RETURN moodVector
END

SUBROUTINE: ComputeJoy
INPUT: state (UniversalEmotionalState)
OUTPUT: joy (number)

BEGIN
    // Joy = high valence + needs for joy/relaxation
    joy ← 0.4 × MAX(state.valence, 0) +
          0.3 × state.needs.joy +
          0.3 × state.needs.relaxation

    RETURN CLAMP(joy, 0, 1)
END
```

**Complexity Analysis**:
- **Time**: O(d) where d = 64 dimensions
- **Space**: O(d) for vector storage

---

## 3. Matching Engine Algorithms

### 3.1 Static Formula (MVP)

```
ALGORITHM: StaticMatchScore
INPUT:
    content (ContentItem): Candidate content
    emotionalState (UniversalEmotionalState): User state
    trendingBoost (number): Trending signal
    userId (string): User identifier
OUTPUT:
    finalScore (number): Match score between 0 and 1

CONSTANTS:
    WEIGHT_VECTOR_SIM = 0.25
    WEIGHT_MOOD = 0.30
    WEIGHT_INTENT = 0.20
    WEIGHT_CONTEXT = 0.15
    WEIGHT_TRENDING = 0.10

BEGIN
    // Component 1: Vector similarity (taste DNA)
    userVector ← GetUserVector(userId)
    contentVector ← content.vector
    vectorSimilarity ← CosineSimilarity(userVector, contentVector)

    // Component 2: Mood matching
    moodVector ← GenerateMoodVector(emotionalState)
    contentMood ← content.emotionalSignature
    moodScore ← CosineSimilarity(moodVector, contentMood)

    // Component 3: Intent matching (needs alignment)
    intentScore ← 0
    FOR EACH need, strength IN emotionalState.needs DO
        IF content.satisfiesNeeds[need] IS NOT NULL THEN
            intentScore ← intentScore + (strength × content.satisfiesNeeds[need])
        END IF
    END FOR
    intentScore ← intentScore / SUM(emotionalState.needs.values)

    // Component 4: Context matching
    contextScore ← CalculateContextScore(content, emotionalState.context)

    // Component 5: Trending signal
    trendingScore ← trendingBoost

    // Compute weighted sum
    rawScore ← (
        vectorSimilarity × WEIGHT_VECTOR_SIM +
        moodScore × WEIGHT_MOOD +
        intentScore × WEIGHT_INTENT +
        contextScore × WEIGHT_CONTEXT +
        trendingScore × WEIGHT_TRENDING
    )

    // Apply hard constraints
    constraintMultiplier ← ApplyConstraints(content, emotionalState)

    finalScore ← rawScore × constraintMultiplier

    RETURN CLAMP(finalScore, 0, 1)

ERROR_HANDLING:
    CATCH VectorNotFoundError:
        RETURN 0.5  // Neutral score for cold start
END

SUBROUTINE: ApplyConstraints
INPUT:
    content (ContentItem)
    state (UniversalEmotionalState)
OUTPUT:
    multiplier (number)

BEGIN
    multiplier ← 1.0

    // Runtime constraint
    IF state.cognitiveCapacity < 0.5 AND content.runtime > 120 THEN
        multiplier ← multiplier × 0.3  // Penalize long content when tired
    END IF

    // Social context constraint
    IF state.context.social == "family" AND content.maturityRating > PG13 THEN
        multiplier ← 0  // Hard filter
    END IF

    // Language constraint
    IF content.language NOT IN GetUserLanguages(state.userId) THEN
        multiplier ← multiplier × 0.5
    END IF

    // Reflexion constraints (learned from past failures)
    FOR EACH constraint IN state.constraints DO
        IF MatchesConstraint(content, constraint) THEN
            multiplier ← multiplier × constraint.penaltyFactor
        END IF
    END FOR

    RETURN MAX(multiplier, 0)
END
```

**Complexity Analysis**:
- **Time**: O(d) where d = vector dimensions (64)
- **Space**: O(1)

### 3.2 Utility-Based Formula (Phase 2)

```
ALGORITHM: UtilityBasedMatchScore
INPUT:
    content (ContentItem): Candidate content
    emotionalState (UniversalEmotionalState): User state
    userId (string): User identifier
OUTPUT:
    utilityScore (number): Expected utility

CONSTANTS:
    DEFAULT_ALPHA = 0.4    // Similarity weight
    DEFAULT_BETA = 0.5     // Causal uplift weight
    DEFAULT_GAMMA = 0.1    // Latency penalty weight

BEGIN
    // Step 1: Get learned weights from ReasoningBank
    learnedWeights ← QueryLearnedWeights(emotionalState, userId)

    IF learnedWeights IS NOT NULL THEN
        alpha ← learnedWeights.alpha
        beta ← learnedWeights.beta
        gamma ← learnedWeights.gamma
    ELSE
        alpha ← DEFAULT_ALPHA
        beta ← DEFAULT_BETA
        gamma ← DEFAULT_GAMMA
    END IF

    // Step 2: Compute base similarity
    userVector ← GetUserVector(userId)
    moodVector ← GenerateMoodVector(emotionalState)
    combinedVector ← CONCATENATE(userVector, moodVector)

    similarity ← CosineSimilarity(combinedVector, content.vector)

    // Step 3: Query causal uplift from Causal Memory Graph
    causalUplift ← QueryCausalUplift({
        intervention: "recommend_" + content.id,
        outcome: "watch_completion",
        context: {
            emotionalState: emotionalState,
            userId: userId
        }
    })

    IF causalUplift IS NULL THEN
        // Fallback: Estimate from similar content
        causalUplift ← EstimateUplift(content, emotionalState, userId)
    END IF

    // Step 4: Query context pattern boost from Skills
    patternBoost ← QueryPatternBoost(emotionalState, content)

    // Step 5: Estimate latency (processing + delivery)
    latency ← EstimateLatency(content, emotionalState.context)

    // Step 6: Compute utility
    utilityScore ← (
        alpha × similarity +
        beta × causalUplift +
        patternBoost
    ) - gamma × latency

    // Step 7: Apply constraints
    constraintMultiplier ← ApplyConstraints(content, emotionalState)

    finalUtility ← utilityScore × constraintMultiplier

    RETURN CLAMP(finalUtility, 0, 1)
END

SUBROUTINE: QueryPatternBoost
INPUT:
    emotionalState (UniversalEmotionalState)
    content (ContentItem)
OUTPUT:
    boost (number)

BEGIN
    // Query Skill Library for matching patterns
    matchedSkills ← SkillLibrary.Query({
        trigger: {
            mood: emotionalState.energy + "," + emotionalState.valence,
            context: emotionalState.context,
            needs: TopNeeds(emotionalState.needs, 3)
        }
    })

    boost ← 0
    FOR EACH skill IN matchedSkills DO
        IF skill.successRate > 0.8 THEN
            // Apply skill strategy to content
            IF AppliesTo(skill.strategy, content) THEN
                boost ← boost + skill.strategy.boostFactor × skill.successRate
            END IF
        END IF
    END FOR

    RETURN MIN(boost, 0.5)  // Cap boost at 0.5
END
```

**Complexity Analysis**:
- **Time**: O(d + log m + log s) where:
  - d = vector dimensions
  - m = causal graph nodes
  - s = skill library size
- **Space**: O(d) for vector operations

### 3.3 Weight Learning Algorithm

```
ALGORITHM: LearnFormulaWeights
INPUT:
    trajectories (Trajectory[]): Recent user interactions
    validationSet (Trajectory[]): Holdout set for validation
OUTPUT:
    optimizedWeights ({alpha, beta, gamma}): Learned weights

CONSTANTS:
    LEARNING_RATE = 0.01
    MAX_ITERATIONS = 1000
    CONVERGENCE_THRESHOLD = 0.001
    MIN_TRAJECTORIES = 100

BEGIN
    IF trajectories.length < MIN_TRAJECTORIES THEN
        RETURN NULL  // Insufficient data
    END IF

    // Initialize weights
    weights ← {alpha: 0.4, beta: 0.5, gamma: 0.1}
    prevLoss ← INFINITY

    FOR iteration ← 1 TO MAX_ITERATIONS DO
        // Compute predictions and loss
        totalLoss ← 0
        gradients ← {alpha: 0, beta: 0, gamma: 0}

        FOR EACH trajectory IN trajectories DO
            // Predict utility with current weights
            predictedUtility ← weights.alpha × trajectory.similarity +
                               weights.beta × trajectory.causalUplift -
                               weights.gamma × trajectory.latency

            // Actual outcome (watch completion rate)
            actualUtility ← trajectory.watchCompletionRate

            // Squared error loss
            error ← predictedUtility - actualUtility
            totalLoss ← totalLoss + (error × error)

            // Compute gradients
            gradients.alpha ← gradients.alpha + (2 × error × trajectory.similarity)
            gradients.beta ← gradients.beta + (2 × error × trajectory.causalUplift)
            gradients.gamma ← gradients.gamma + (2 × error × -trajectory.latency)
        END FOR

        // Average loss and gradients
        avgLoss ← totalLoss / trajectories.length
        FOR EACH param IN ["alpha", "beta", "gamma"] DO
            gradients[param] ← gradients[param] / trajectories.length
        END FOR

        // Update weights (gradient descent)
        weights.alpha ← weights.alpha - LEARNING_RATE × gradients.alpha
        weights.beta ← weights.beta - LEARNING_RATE × gradients.beta
        weights.gamma ← weights.gamma - LEARNING_RATE × gradients.gamma

        // Ensure non-negative weights
        weights.alpha ← MAX(weights.alpha, 0)
        weights.beta ← MAX(weights.beta, 0)
        weights.gamma ← MAX(weights.gamma, 0)

        // Normalize weights (alpha + beta should be close to 1)
        sumWeights ← weights.alpha + weights.beta
        weights.alpha ← weights.alpha / sumWeights
        weights.beta ← weights.beta / sumWeights

        // Check convergence
        IF ABS(prevLoss - avgLoss) < CONVERGENCE_THRESHOLD THEN
            BREAK
        END IF

        prevLoss ← avgLoss
    END FOR

    // Validate on holdout set
    validationScore ← EvaluateWeights(weights, validationSet)

    IF validationScore > 0.8 THEN
        RETURN weights
    ELSE
        RETURN NULL  // Weights didn't generalize well
    END IF
END
```

**Complexity Analysis**:
- **Time**: O(I × T) where I = iterations, T = trajectory count
- **Space**: O(T) for trajectory storage

---

## 4. Vector Search Algorithms

### 4.1 HNSW Index Query

```
ALGORITHM: HNSWSearch
INPUT:
    queryVector (number[]): User/mood vector
    k (integer): Number of results to return
    ef (integer): Search accuracy parameter (default 100)
OUTPUT:
    results (ContentItem[]): Top k nearest neighbors

CONSTANTS:
    DEFAULT_EF = 100
    MAX_K = 100

BEGIN
    IF k > MAX_K THEN
        k ← MAX_K
    END IF

    // Initialize search
    entryPoint ← GetEntryPoint()  // Top layer node
    currentLevel ← GetTopLevel()
    visited ← SET()
    candidates ← PriorityQueue(maxSize: ef)
    results ← PriorityQueue(maxSize: k)

    // Phase 1: Greedy search to bottom layer
    WHILE currentLevel > 0 DO
        nearest ← GreedySearch(queryVector, entryPoint, 1, currentLevel, visited)
        entryPoint ← nearest[0]
        currentLevel ← currentLevel - 1
    END WHILE

    // Phase 2: Search bottom layer with ef parameter
    candidates.add(entryPoint, Distance(queryVector, entryPoint.vector))
    visited.add(entryPoint)

    WHILE candidates IS NOT EMPTY DO
        current ← candidates.extractMin()

        IF current.distance > results.max().distance AND results.size >= ef THEN
            BREAK  // All remaining candidates are farther
        END IF

        // Explore neighbors
        FOR EACH neighbor IN current.neighbors[0] DO  // Layer 0
            IF neighbor NOT IN visited THEN
                visited.add(neighbor)
                distance ← Distance(queryVector, neighbor.vector)

                IF distance < results.max().distance OR results.size < ef THEN
                    candidates.add(neighbor, distance)
                    results.add(neighbor, distance)

                    IF results.size > ef THEN
                        results.extractMax()  // Remove farthest
                    END IF
                END IF
            END IF
        END FOR
    END FOR

    // Return top k results
    topK ← []
    WHILE results IS NOT EMPTY AND topK.length < k DO
        topK.append(results.extractMin())
    END FOR

    RETURN topK

ERROR_HANDLING:
    CATCH EmptyIndexError:
        RETURN []
    CATCH InvalidVectorError:
        LogError("Invalid query vector")
        RETURN []
END

SUBROUTINE: GreedySearch
INPUT:
    queryVector (number[])
    entryPoint (Node)
    numResults (integer)
    level (integer)
    visited (SET)
OUTPUT:
    nearest (Node[])

BEGIN
    nearest ← [entryPoint]
    visited.add(entryPoint)

    changed ← TRUE
    WHILE changed DO
        changed ← FALSE

        FOR EACH neighbor IN nearest[0].neighbors[level] DO
            IF neighbor NOT IN visited THEN
                visited.add(neighbor)

                distance ← Distance(queryVector, neighbor.vector)
                IF distance < Distance(queryVector, nearest[0].vector) THEN
                    nearest ← [neighbor]
                    changed ← TRUE
                END IF
            END IF
        END FOR
    END WHILE

    RETURN nearest
END
```

**Complexity Analysis**:
- **Time**: O(log n) average case with HNSW structure
  - Worst case: O(n) if graph degenerates
- **Space**: O(ef + k) for search structures

### 4.2 Causal Recall Utility Search

```
ALGORITHM: CausalRecallSearch
INPUT:
    emotionalState (UniversalEmotionalState): User state
    userId (string): User identifier
    k (integer): Number of results
OUTPUT:
    results (ContentItem[]): Utility-ranked results

CONSTANTS:
    DEFAULT_ALPHA = 0.4
    DEFAULT_BETA = 0.5
    DEFAULT_GAMMA = 0.1
    CANDIDATE_POOL_SIZE = 100

BEGIN
    // Step 1: Get larger candidate pool via vector search
    queryVector ← GenerateMoodVector(emotionalState)
    candidates ← HNSWSearch(queryVector, CANDIDATE_POOL_SIZE, ef: 150)

    // Step 2: Get learned weights
    weights ← QueryLearnedWeights(emotionalState, userId)
    IF weights IS NULL THEN
        alpha ← DEFAULT_ALPHA
        beta ← DEFAULT_BETA
        gamma ← DEFAULT_GAMMA
    ELSE
        alpha ← weights.alpha
        beta ← weights.beta
        gamma ← weights.gamma
    END IF

    // Step 3: Compute utility for each candidate
    utilityScores ← []

    FOR EACH candidate IN candidates DO
        // Similarity component
        similarity ← candidate.similarity  // From HNSW search

        // Causal uplift component
        uplift ← QueryCausalUplift({
            intervention: "recommend_" + candidate.id,
            outcome: "watch_completion",
            userContext: {
                emotionalState: emotionalState,
                userId: userId
            }
        })

        IF uplift IS NULL THEN
            // Estimate from similar interventions
            uplift ← EstimateUpliftFromSimilar(candidate, emotionalState)
        END IF

        // Latency component
        latency ← NormalizeLatency(candidate.loadTime)

        // Pattern boost from Skills
        patternBoost ← QueryPatternBoost(emotionalState, candidate)

        // Compute utility
        utility ← (
            alpha × similarity +
            beta × uplift +
            patternBoost
        ) - gamma × latency

        // Apply constraints
        constraintMultiplier ← ApplyConstraints(candidate, emotionalState)
        finalUtility ← utility × constraintMultiplier

        utilityScores.append({
            content: candidate,
            utility: finalUtility,
            components: {
                similarity: similarity,
                uplift: uplift,
                latency: latency,
                patternBoost: patternBoost
            }
        })
    END FOR

    // Step 4: Sort by utility (descending)
    utilityScores.sortByDescending(utility)

    // Step 5: Return top k
    results ← utilityScores.slice(0, k).map(item => item.content)

    RETURN results
END

SUBROUTINE: EstimateUpliftFromSimilar
INPUT:
    content (ContentItem)
    emotionalState (UniversalEmotionalState)
OUTPUT:
    estimatedUplift (number)

BEGIN
    // Find similar content with known causal effects
    similarContent ← FindSimilarContent(content, limit: 20)

    uplifts ← []
    FOR EACH similar IN similarContent DO
        knownUplift ← QueryCausalUplift({
            intervention: "recommend_" + similar.id,
            outcome: "watch_completion",
            context: emotionalState
        })

        IF knownUplift IS NOT NULL THEN
            // Weight by similarity
            weight ← CosineSimilarity(content.vector, similar.vector)
            uplifts.append({
                uplift: knownUplift,
                weight: weight
            })
        END IF
    END FOR

    IF uplifts IS EMPTY THEN
        RETURN 0.5  // Neutral estimate
    END IF

    // Weighted average
    totalWeight ← SUM(uplifts.map(u => u.weight))
    estimatedUplift ← SUM(uplifts.map(u => u.uplift × u.weight)) / totalWeight

    RETURN estimatedUplift
END
```

**Complexity Analysis**:
- **Time**: O(c log n + c log m) where:
  - c = candidate pool size
  - n = catalog size
  - m = causal graph size
- **Space**: O(c) for candidate storage

### 4.3 GNN Attention Query Expansion

```
ALGORITHM: GNNQueryExpansion
INPUT:
    emotionalState (UniversalEmotionalState): User state
    userId (string): User identifier
    numHeads (integer): Attention heads (default 8)
OUTPUT:
    expandedCandidates (ContentItem[]): GNN-enhanced results

CONSTANTS:
    NUM_HEADS = 8
    NEIGHBOR_DEPTH = 2
    NEIGHBOR_LIMIT = 20
    ATTENTION_DROPOUT = 0.1

BEGIN
    // Step 1: Get user node and similar users from graph
    userNode ← GetUserNode(userId)
    similarUsers ← FindSimilarUsers(userNode, limit: NEIGHBOR_LIMIT)

    // Step 2: Build attention context
    attentionContext ← []
    FOR EACH similarUser IN similarUsers DO
        // Get what similar users liked in similar emotional states
        likedContent ← QueryUserHistory({
            userId: similarUser.id,
            emotionalState: SimilarTo(emotionalState, tolerance: 0.2),
            outcome: "positive"
        })

        attentionContext.append({
            user: similarUser,
            content: likedContent,
            similarity: CosineSimilarity(userNode.vector, similarUser.vector)
        })
    END FOR

    // Step 3: Multi-head attention
    queryVector ← GenerateMoodVector(emotionalState)
    headOutputs ← []

    FOR head ← 1 TO NUM_HEADS DO
        // Project query with head-specific weights
        headQuery ← ProjectVector(queryVector, head)

        attentionScores ← []
        FOR EACH ctx IN attentionContext DO
            FOR EACH content IN ctx.content DO
                // Compute attention score
                key ← content.vector
                value ← content.vector

                score ← DotProduct(headQuery, key) / SQRT(key.length)

                // Weight by user similarity
                score ← score × ctx.similarity

                attentionScores.append({
                    content: content,
                    score: score
                })
            END FOR
        END FOR

        // Softmax normalization
        attentionScores ← Softmax(attentionScores)

        // Apply dropout
        attentionScores ← ApplyDropout(attentionScores, ATTENTION_DROPOUT)

        headOutputs.append(attentionScores)
    END FOR

    // Step 4: Combine head outputs
    combinedScores ← MAP()
    FOR EACH headOutput IN headOutputs DO
        FOR EACH item IN headOutput DO
            IF item.content.id IN combinedScores THEN
                combinedScores[item.content.id].score += item.score
            ELSE
                combinedScores[item.content.id] ← item
            END IF
        END FOR
    END FOR

    // Average scores across heads
    FOR EACH contentId, item IN combinedScores DO
        item.score ← item.score / NUM_HEADS
    END FOR

    // Step 5: Sort and return
    expandedCandidates ← SortByDescending(combinedScores.values, score)

    RETURN expandedCandidates

ERROR_HANDLING:
    CATCH UserNotFoundError:
        RETURN []  // New user, no graph neighbors
    CATCH GraphQueryError:
        LogError("GNN query failed")
        RETURN []  // Fallback to vector-only search
END
```

**Complexity Analysis**:
- **Time**: O(h × d × |N| × |C|) where:
  - h = number of heads (8)
  - d = vector dimensions
  - |N| = neighbor count
  - |C| = content per neighbor
- **Space**: O(h × |N| × |C|) for attention scores

### 4.4 Result Diversification

```
ALGORITHM: DiversifyResults
INPUT:
    candidates (ScoredContent[]): Ranked candidates
    k (integer): Number of diverse results
OUTPUT:
    diversified (ContentItem[]): Diversified selection

CONSTANTS:
    DIVERSITY_WEIGHT = 0.3
    MIN_SIMILARITY_GAP = 0.2

BEGIN
    IF candidates.length <= k THEN
        RETURN candidates.map(c => c.content)
    END IF

    diversified ← []
    remaining ← candidates.copy()

    // Always take the top result
    diversified.append(remaining[0])
    remaining.remove(0)

    // Iteratively select diverse results
    WHILE diversified.length < k AND remaining IS NOT EMPTY DO
        maxDiversityScore ← -INFINITY
        selectedIndex ← -1

        FOR i ← 0 TO remaining.length - 1 DO
            candidate ← remaining[i]

            // Compute diversity score
            minSimilarity ← INFINITY
            FOR EACH selected IN diversified DO
                similarity ← CosineSimilarity(
                    candidate.content.vector,
                    selected.content.vector
                )
                minSimilarity ← MIN(minSimilarity, similarity)
            END FOR

            diversity ← 1 - minSimilarity

            // Combine utility and diversity
            diversityScore ← (
                (1 - DIVERSITY_WEIGHT) × candidate.utility +
                DIVERSITY_WEIGHT × diversity
            )

            IF diversityScore > maxDiversityScore THEN
                maxDiversityScore ← diversityScore
                selectedIndex ← i
            END IF
        END FOR

        // Add most diverse candidate
        diversified.append(remaining[selectedIndex])
        remaining.remove(selectedIndex)
    END WHILE

    RETURN diversified.map(item => item.content)
END
```

**Complexity Analysis**:
- **Time**: O(k² × d) where k = result count, d = vector dimensions
- **Space**: O(k) for selected results

---

## 5. ReasoningBank Operations

### 5.1 Trajectory Storage

```
ALGORITHM: StoreTrajectory
INPUT:
    trajectory (Trajectory): Session outcome data
OUTPUT:
    stored (boolean): Success status

DATA_STRUCTURE:
    Trajectory {
        userId: string
        timestamp: number
        emotionalState: UniversalEmotionalState
        recommendation: ContentItem
        outcome: {
            watched: boolean
            completionRate: number
            rating: number (optional)
            refinementRequested: boolean
        }
        context: {
            processingTime: number
            alternativesShown: number
            skillUsed: string (optional)
        }
    }

BEGIN
    // Step 1: Compute verdict (success/failure)
    verdict ← JudgeOutcome(trajectory)

    // Step 2: Extract pattern features
    patternFeatures ← ExtractPatternFeatures(trajectory)

    // Step 3: Store in ReasoningBank
    trajectoryRecord ← {
        id: GenerateUUID(),
        trajectory: trajectory,
        verdict: verdict,
        patternFeatures: patternFeatures,
        timestamp: GetCurrentTime()
    }

    success ← ReasoningBank.Store(trajectoryRecord)

    IF NOT success THEN
        RETURN FALSE
    END IF

    // Step 4: Update real-time indices
    UpdateIndices(trajectoryRecord)

    // Step 5: Trigger pattern detection if threshold reached
    trajectoryCount ← ReasoningBank.Count()
    IF trajectoryCount % 100 == 0 THEN
        TriggerPatternDetection()
    END IF

    RETURN TRUE
END

SUBROUTINE: JudgeOutcome
INPUT: trajectory (Trajectory)
OUTPUT: verdict (Verdict)

BEGIN
    verdict ← {
        success: FALSE,
        confidenceScore: 0,
        reasoning: ""
    }

    // Success criteria
    completionThreshold ← 0.7  // 70% completion

    IF trajectory.outcome.watched AND
       trajectory.outcome.completionRate >= completionThreshold THEN
        verdict.success ← TRUE
        verdict.confidenceScore ← trajectory.outcome.completionRate
        verdict.reasoning ← "High completion rate"
    ELSE IF trajectory.outcome.rating >= 4 THEN
        verdict.success ← TRUE
        verdict.confidenceScore ← trajectory.outcome.rating / 5
        verdict.reasoning ← "Positive rating"
    ELSE IF NOT trajectory.outcome.watched THEN
        verdict.success ← FALSE
        verdict.confidenceScore ← 0.9
        verdict.reasoning ← "Content not watched"
    ELSE IF trajectory.outcome.completionRate < 0.3 THEN
        verdict.success ← FALSE
        verdict.confidenceScore ← 0.8
        verdict.reasoning ← "Abandoned early"
    ELSE
        // Ambiguous outcome
        verdict.success ← FALSE
        verdict.confidenceScore ← 0.5
        verdict.reasoning ← "Incomplete viewing"
    END IF

    RETURN verdict
END

SUBROUTINE: ExtractPatternFeatures
INPUT: trajectory (Trajectory)
OUTPUT: features (Map)

BEGIN
    features ← MAP()

    // Temporal features
    features["day_of_week"] ← trajectory.timestamp.dayOfWeek
    features["time_of_day"] ← BucketTimeOfDay(trajectory.timestamp.hour)
    features["is_weekend"] ← IsWeekend(trajectory.timestamp)

    // Emotional features
    features["mood_category"] ← CategorizeMood(trajectory.emotionalState)
    features["energy_level"] ← BucketEnergy(trajectory.emotionalState.energy)
    features["primary_need"] ← GetPrimaryNeed(trajectory.emotionalState.needs)

    // Content features
    features["genre"] ← trajectory.recommendation.genre
    features["runtime_bucket"] ← BucketRuntime(trajectory.recommendation.runtime)
    features["language"] ← trajectory.recommendation.language

    // Context features
    features["device"] ← trajectory.emotionalState.context.device
    features["social"] ← trajectory.emotionalState.context.social

    // Skill used
    IF trajectory.context.skillUsed IS NOT NULL THEN
        features["skill"] ← trajectory.context.skillUsed
    END IF

    RETURN features
END
```

**Complexity Analysis**:
- **Time**: O(f) where f = feature count
- **Space**: O(f) for feature storage

### 5.2 Pattern Query

```
ALGORITHM: QueryPatterns
INPUT:
    emotionalState (UniversalEmotionalState): Current user state
    userId (string): User identifier
    minConfidence (number): Minimum pattern confidence (default 0.7)
OUTPUT:
    patterns (Pattern[]): Matching learned patterns

BEGIN
    // Step 1: Extract query features
    queryFeatures ← ExtractPatternFeatures({
        emotionalState: emotionalState,
        timestamp: GetCurrentTime()
    })

    // Step 2: Query ReasoningBank for similar trajectories
    similarTrajectories ← ReasoningBank.Query({
        features: queryFeatures,
        similarityThreshold: 0.8,
        limit: 100
    })

    IF similarTrajectories IS EMPTY THEN
        RETURN []
    END IF

    // Step 3: Group by outcome patterns
    patternGroups ← MAP()

    FOR EACH trajectory IN similarTrajectories DO
        patternKey ← GeneratePatternKey(trajectory.patternFeatures)

        IF patternKey NOT IN patternGroups THEN
            patternGroups[patternKey] ← {
                trajectories: [],
                successCount: 0,
                totalCount: 0
            }
        END IF

        patternGroups[patternKey].trajectories.append(trajectory)
        patternGroups[patternKey].totalCount += 1

        IF trajectory.verdict.success THEN
            patternGroups[patternKey].successCount += 1
        END IF
    END FOR

    // Step 4: Compute pattern confidence and extract strategies
    patterns ← []

    FOR EACH patternKey, group IN patternGroups DO
        IF group.totalCount < 5 THEN
            CONTINUE  // Insufficient evidence
        END IF

        confidence ← group.successCount / group.totalCount

        IF confidence >= minConfidence THEN
            pattern ← {
                features: ParsePatternKey(patternKey),
                confidence: confidence,
                evidenceCount: group.totalCount,
                successRate: confidence,
                strategy: ExtractStrategy(group.trajectories)
            }

            patterns.append(pattern)
        END IF
    END FOR

    // Step 5: Sort by confidence
    patterns.sortByDescending(confidence)

    RETURN patterns
END

SUBROUTINE: ExtractStrategy
INPUT: trajectories (Trajectory[])
OUTPUT: strategy (Strategy)

BEGIN
    strategy ← {
        preferredGenres: MAP(),
        preferredRuntimes: [],
        boostFactors: MAP()
    }

    // Aggregate preferences from successful trajectories
    FOR EACH trajectory IN trajectories DO
        IF trajectory.verdict.success THEN
            genre ← trajectory.recommendation.genre
            IF genre IN strategy.preferredGenres THEN
                strategy.preferredGenres[genre] += 1
            ELSE
                strategy.preferredGenres[genre] ← 1
            END IF

            strategy.preferredRuntimes.append(trajectory.recommendation.runtime)
        END IF
    END FOR

    // Normalize genre preferences
    totalSuccesses ← SUM(strategy.preferredGenres.values)
    FOR EACH genre, count IN strategy.preferredGenres DO
        strategy.boostFactors[genre] ← count / totalSuccesses
    END FOR

    // Compute preferred runtime range
    IF strategy.preferredRuntimes IS NOT EMPTY THEN
        strategy.runtimeRange ← [
            Percentile(strategy.preferredRuntimes, 25),
            Percentile(strategy.preferredRuntimes, 75)
        ]
    END IF

    RETURN strategy
END
```

**Complexity Analysis**:
- **Time**: O(T log T) where T = trajectory count
- **Space**: O(T) for trajectory storage

### 5.3 Skill Consolidation

```
ALGORITHM: ConsolidateSkill
INPUT:
    patterns (Pattern[]): Discovered patterns
    minEvidenceCount (integer): Minimum trajectories (default 50)
OUTPUT:
    skill (Skill): Consolidated strategy OR NULL

CONSTANTS:
    MIN_EVIDENCE = 50
    MIN_SUCCESS_RATE = 0.85
    CONSOLIDATION_THRESHOLD = 0.9

BEGIN
    // Step 1: Validate pattern quality
    IF patterns IS EMPTY THEN
        RETURN NULL
    END IF

    totalEvidence ← SUM(patterns.map(p => p.evidenceCount))
    IF totalEvidence < MIN_EVIDENCE THEN
        RETURN NULL  // Insufficient data
    END IF

    // Step 2: Compute weighted average success rate
    weightedSuccessRate ← 0
    FOR EACH pattern IN patterns DO
        weight ← pattern.evidenceCount / totalEvidence
        weightedSuccessRate += weight × pattern.successRate
    END FOR

    IF weightedSuccessRate < MIN_SUCCESS_RATE THEN
        RETURN NULL  // Not reliable enough
    END IF

    // Step 3: Merge strategies
    consolidatedStrategy ← {
        trigger: {},
        actions: {},
        constraints: []
    }

    // Extract common trigger conditions
    commonFeatures ← FindCommonFeatures(patterns)
    consolidatedStrategy.trigger ← commonFeatures

    // Merge boost factors (weighted by evidence)
    boostFactors ← MAP()
    FOR EACH pattern IN patterns DO
        weight ← pattern.evidenceCount / totalEvidence

        FOR EACH genre, boost IN pattern.strategy.boostFactors DO
            IF genre IN boostFactors THEN
                boostFactors[genre] += weight × boost
            ELSE
                boostFactors[genre] ← weight × boost
            END IF
        END FOR
    END FOR

    consolidatedStrategy.actions.boostFactors ← boostFactors

    // Step 4: Validate on holdout set
    holdoutTrajectories ← GetHoldoutTrajectories(commonFeatures, count: 50)
    validationScore ← ValidateStrategy(consolidatedStrategy, holdoutTrajectories)

    IF validationScore < CONSOLIDATION_THRESHOLD THEN
        RETURN NULL  // Doesn't generalize
    END IF

    // Step 5: Create skill
    skill ← {
        id: GenerateSkillId(),
        name: GenerateSkillName(consolidatedStrategy.trigger),
        trigger: consolidatedStrategy.trigger,
        strategy: consolidatedStrategy.actions,
        successRate: validationScore,
        evidenceCount: totalEvidence,
        consolidatedFrom: patterns.length,
        createdAt: GetCurrentTime(),
        lastValidated: GetCurrentTime()
    }

    // Step 6: Store in Skill Library
    SkillLibrary.Store(skill)

    RETURN skill
END

SUBROUTINE: FindCommonFeatures
INPUT: patterns (Pattern[])
OUTPUT: commonFeatures (Map)

BEGIN
    // Count feature occurrences
    featureCounts ← MAP()

    FOR EACH pattern IN patterns DO
        FOR EACH feature, value IN pattern.features DO
            key ← feature + ":" + value
            IF key IN featureCounts THEN
                featureCounts[key] += pattern.evidenceCount
            ELSE
                featureCounts[key] ← pattern.evidenceCount
            END IF
        END FOR
    END FOR

    // Select features present in >80% of evidence
    totalEvidence ← SUM(patterns.map(p => p.evidenceCount))
    threshold ← 0.8 × totalEvidence

    commonFeatures ← MAP()
    FOR EACH key, count IN featureCounts DO
        IF count >= threshold THEN
            [feature, value] ← SplitKey(key)
            commonFeatures[feature] ← value
        END IF
    END FOR

    RETURN commonFeatures
END
```

**Complexity Analysis**:
- **Time**: O(P × F + H) where:
  - P = pattern count
  - F = features per pattern
  - H = holdout validation size
- **Space**: O(P × F) for pattern storage

---

## 6. Nightly Learner Pipeline

### 6.1 Pattern Discovery

```
ALGORITHM: DiscoverNewPatterns
INPUT:
    startDate (Date): Analysis window start
    endDate (Date): Analysis window end
OUTPUT:
    newPatterns (Pattern[]): Discovered patterns

CONSTANTS:
    MIN_PATTERN_SUPPORT = 20  // Minimum occurrences
    MIN_PATTERN_CONFIDENCE = 0.75
    MAX_PATTERNS_PER_RUN = 50

BEGIN
    // Step 1: Retrieve recent trajectories
    trajectories ← ReasoningBank.QueryByDateRange(startDate, endDate)

    IF trajectories.length < 100 THEN
        LogInfo("Insufficient data for pattern discovery")
        RETURN []
    END IF

    // Step 2: Extract all feature combinations
    featureCombinations ← GenerateFeatureCombinations(trajectories)

    // Step 3: Mine frequent patterns
    frequentPatterns ← []

    FOR EACH combination IN featureCombinations DO
        // Count support
        matching ← trajectories.filter(t => MatchesFeatures(t, combination))

        IF matching.length >= MIN_PATTERN_SUPPORT THEN
            successCount ← matching.filter(t => t.verdict.success).length
            confidence ← successCount / matching.length

            IF confidence >= MIN_PATTERN_CONFIDENCE THEN
                pattern ← {
                    features: combination,
                    support: matching.length,
                    confidence: confidence,
                    successRate: confidence,
                    evidenceTrajectories: matching.map(t => t.id)
                }

                frequentPatterns.append(pattern)
            END IF
        END IF
    END FOR

    // Step 4: Filter redundant patterns
    nonRedundantPatterns ← RemoveRedundantPatterns(frequentPatterns)

    // Step 5: Validate on holdout
    validatedPatterns ← []

    FOR EACH pattern IN nonRedundantPatterns DO
        holdoutScore ← ValidateOnHoldout(pattern)

        IF holdoutScore >= 0.7 THEN
            pattern.validationScore ← holdoutScore
            validatedPatterns.append(pattern)
        END IF
    END FOR

    // Step 6: Rank by novelty and confidence
    rankedPatterns ← RankByNovelty(validatedPatterns)

    // Return top patterns
    RETURN rankedPatterns.slice(0, MAX_PATTERNS_PER_RUN)
END

SUBROUTINE: GenerateFeatureCombinations
INPUT: trajectories (Trajectory[])
OUTPUT: combinations (Set<Map>)

BEGIN
    // Extract unique features
    allFeatures ← MAP()

    FOR EACH trajectory IN trajectories DO
        FOR EACH feature, value IN trajectory.patternFeatures DO
            IF feature NOT IN allFeatures THEN
                allFeatures[feature] ← SET()
            END IF
            allFeatures[feature].add(value)
        END FOR
    END FOR

    // Generate combinations (up to 4 features)
    combinations ← SET()
    featureKeys ← allFeatures.keys()

    // Single features
    FOR EACH key IN featureKeys DO
        FOR EACH value IN allFeatures[key] DO
            combinations.add({key: value})
        END FOR
    END FOR

    // Pairs
    FOR i ← 0 TO featureKeys.length - 2 DO
        FOR j ← i + 1 TO featureKeys.length - 1 DO
            FOR EACH val1 IN allFeatures[featureKeys[i]] DO
                FOR EACH val2 IN allFeatures[featureKeys[j]] DO
                    combinations.add({
                        [featureKeys[i]]: val1,
                        [featureKeys[j]]: val2
                    })
                END FOR
            END FOR
        END FOR
    END FOR

    // Triples and quads (similar logic)
    // ... (omitted for brevity)

    RETURN combinations
END
```

**Complexity Analysis**:
- **Time**: O(T × C + C log C) where:
  - T = trajectory count
  - C = combination count (exponential in feature count)
- **Space**: O(C) for combination storage

### 6.2 Weight Optimization

```
ALGORITHM: OptimizeFormulaWeights
INPUT:
    trajectories (Trajectory[]): Recent outcomes
OUTPUT:
    optimizedWeights ({alpha, beta, gamma}): New weights

BEGIN
    // Step 1: Partition into train/validation sets
    shuffled ← Shuffle(trajectories)
    splitIndex ← FLOOR(0.8 × shuffled.length)

    trainSet ← shuffled.slice(0, splitIndex)
    validationSet ← shuffled.slice(splitIndex)

    // Step 2: Learn weights using gradient descent
    learnedWeights ← LearnFormulaWeights(trainSet, validationSet)

    IF learnedWeights IS NULL THEN
        LogWarning("Weight learning failed, keeping current weights")
        RETURN NULL
    END IF

    // Step 3: Compare against current weights
    currentWeights ← GetCurrentWeights()

    currentPerformance ← EvaluateWeights(currentWeights, validationSet)
    newPerformance ← EvaluateWeights(learnedWeights, validationSet)

    improvement ← newPerformance - currentPerformance

    // Step 4: Decide whether to update
    IF improvement > 0.02 THEN  // 2% improvement threshold
        LogInfo("Updating weights", {
            oldWeights: currentWeights,
            newWeights: learnedWeights,
            improvement: improvement
        })

        UpdateWeights(learnedWeights)
        RETURN learnedWeights
    ELSE
        LogInfo("Keeping current weights", {improvement: improvement})
        RETURN NULL
    END IF
END

SUBROUTINE: EvaluateWeights
INPUT:
    weights ({alpha, beta, gamma})
    testSet (Trajectory[])
OUTPUT:
    performance (number)

BEGIN
    totalError ← 0

    FOR EACH trajectory IN testSet DO
        // Predict outcome
        predictedUtility ← (
            weights.alpha × trajectory.similarity +
            weights.beta × trajectory.causalUplift -
            weights.gamma × trajectory.latency
        )

        // Actual outcome
        actualUtility ← trajectory.outcome.completionRate

        // Squared error
        error ← (predictedUtility - actualUtility)
        totalError += error × error
    END FOR

    // Return R² score (higher is better)
    meanActual ← MEAN(testSet.map(t => t.outcome.completionRate))

    totalVariance ← 0
    FOR EACH trajectory IN testSet DO
        diff ← trajectory.outcome.completionRate - meanActual
        totalVariance += diff × diff
    END FOR

    rSquared ← 1 - (totalError / totalVariance)

    RETURN rSquared
END
```

**Complexity Analysis**:
- **Time**: O(I × T) where I = iterations, T = trajectory count
- **Space**: O(T) for dataset storage

### 6.3 Skill Pruning

```
ALGORITHM: PruneSkills
INPUT:
    None
OUTPUT:
    prunedCount (integer): Number of skills removed

CONSTANTS:
    VALIDATION_WINDOW_DAYS = 30
    MIN_SUCCESS_RATE = 0.8
    REVALIDATION_FREQUENCY = 7  // Days

BEGIN
    allSkills ← SkillLibrary.GetAll()
    prunedCount ← 0

    FOR EACH skill IN allSkills DO
        daysSinceValidation ← DaysBetween(skill.lastValidated, GetCurrentDate())

        // Revalidate if needed
        IF daysSinceValidation >= REVALIDATION_FREQUENCY THEN
            validationScore ← RevalidateSkill(skill)

            IF validationScore IS NULL THEN
                // Insufficient data to validate
                CONTINUE
            END IF

            skill.successRate ← validationScore
            skill.lastValidated ← GetCurrentDate()
            SkillLibrary.Update(skill)

            // Prune if performance degraded
            IF validationScore < MIN_SUCCESS_RATE THEN
                LogInfo("Pruning underperforming skill", {
                    skillId: skill.id,
                    successRate: validationScore
                })

                SkillLibrary.Delete(skill.id)
                prunedCount += 1
            END IF
        END IF
    END FOR

    RETURN prunedCount
END

SUBROUTINE: RevalidateSkill
INPUT: skill (Skill)
OUTPUT: validationScore (number) OR NULL

BEGIN
    // Get recent trajectories matching skill trigger
    endDate ← GetCurrentDate()
    startDate ← AddDays(endDate, -30)

    matchingTrajectories ← ReasoningBank.Query({
        features: skill.trigger,
        dateRange: [startDate, endDate]
    })

    IF matchingTrajectories.length < 10 THEN
        RETURN NULL  // Insufficient data
    END IF

    // Count how many succeeded when skill was applied
    successCount ← 0

    FOR EACH trajectory IN matchingTrajectories DO
        IF trajectory.context.skillUsed == skill.id THEN
            IF trajectory.verdict.success THEN
                successCount += 1
            END IF
        END IF
    END FOR

    appliedCount ← matchingTrajectories.filter(
        t => t.context.skillUsed == skill.id
    ).length

    IF appliedCount < 5 THEN
        RETURN NULL  // Not applied enough
    END IF

    validationScore ← successCount / appliedCount

    RETURN validationScore
END
```

**Complexity Analysis**:
- **Time**: O(S × T) where S = skill count, T = trajectories per skill
- **Space**: O(T) for trajectory queries

### 6.4 A/B Test Proposal Generation

```
ALGORITHM: GenerateABTests
INPUT:
    newPatterns (Pattern[]): Recently discovered patterns
    optimizedWeights ({alpha, beta, gamma}): New weight proposal
OUTPUT:
    abTests (ABTest[]): Proposed experiments

CONSTANTS:
    TEST_DURATION_DAYS = 14
    MIN_SAMPLE_SIZE = 100
    SIGNIFICANCE_LEVEL = 0.05

BEGIN
    abTests ← []

    // Test 1: New pattern as skill
    FOR EACH pattern IN newPatterns DO
        IF pattern.confidence > 0.85 AND pattern.evidenceCount > 50 THEN
            test ← {
                id: GenerateUUID(),
                name: "Pattern: " + GeneratePatternName(pattern),
                hypothesis: "Applying pattern boosts success rate",
                control: "Standard matching",
                treatment: "Apply pattern boost",
                pattern: pattern,
                duration: TEST_DURATION_DAYS,
                sampleSize: MIN_SAMPLE_SIZE,
                metrics: ["success_rate", "completion_rate"],
                status: "proposed"
            }

            abTests.append(test)
        END IF
    END FOR

    // Test 2: Optimized weights
    IF optimizedWeights IS NOT NULL THEN
        test ← {
            id: GenerateUUID(),
            name: "Optimized formula weights",
            hypothesis: "New weights improve prediction accuracy",
            control: "Current weights",
            treatment: "Optimized weights",
            weights: optimizedWeights,
            duration: TEST_DURATION_DAYS,
            sampleSize: MIN_SAMPLE_SIZE × 2,  // Larger for weight tests
            metrics: ["prediction_error", "success_rate"],
            status: "proposed"
        }

        abTests.append(test)
    END IF

    // Test 3: Diversity parameter tuning
    currentDiversity ← GetCurrentDiversityWeight()
    proposedDiversity ← currentDiversity × 1.2  // 20% increase

    test ← {
        id: GenerateUUID(),
        name: "Increased diversity weight",
        hypothesis: "More diversity improves long-term engagement",
        control: "Diversity = " + currentDiversity,
        treatment: "Diversity = " + proposedDiversity,
        parameter: "diversity_weight",
        value: proposedDiversity,
        duration: TEST_DURATION_DAYS × 2,  // Longer for behavioral tests
        sampleSize: MIN_SAMPLE_SIZE,
        metrics: ["return_rate", "exploration_rate"],
        status: "proposed"
    }

    abTests.append(test)

    RETURN abTests
END
```

**Complexity Analysis**:
- **Time**: O(P) where P = pattern count
- **Space**: O(P) for test storage

---

## 7. Self-Healing Algorithm

### 7.1 Health Metric Monitoring

```
ALGORITHM: MonitorHealth
INPUT:
    None (runs continuously)
OUTPUT:
    healthReport (HealthReport): Current system health

CONSTANTS:
    METRIC_WINDOW_HOURS = 24
    BASELINE_WINDOW_DAYS = 7
    ALERT_THRESHOLDS = {
        matchSatisfaction: 0.85,
        processingTime: 3000,
        errorRate: 0.05,
        successRate: 0.8
    }

BEGIN
    currentTime ← GetCurrentTime()
    windowStart ← AddHours(currentTime, -METRIC_WINDOW_HOURS)

    // Step 1: Collect current metrics
    recentTrajectories ← ReasoningBank.QueryByDateRange(windowStart, currentTime)

    currentMetrics ← {
        matchSatisfaction: 0,
        avgProcessingTime: 0,
        errorRate: 0,
        successRate: 0,
        sampleSize: recentTrajectories.length
    }

    IF recentTrajectories.length == 0 THEN
        RETURN {status: "unknown", reason: "No recent data"}
    END IF

    // Calculate metrics
    satisfactionSum ← 0
    processingTimeSum ← 0
    successCount ← 0
    errorCount ← 0

    FOR EACH trajectory IN recentTrajectories DO
        IF trajectory.outcome.rating IS NOT NULL THEN
            satisfactionSum += trajectory.outcome.rating
        END IF

        processingTimeSum += trajectory.context.processingTime

        IF trajectory.verdict.success THEN
            successCount += 1
        END IF

        IF trajectory.error IS NOT NULL THEN
            errorCount += 1
        END IF
    END FOR

    currentMetrics.matchSatisfaction ← satisfactionSum / recentTrajectories.length / 5
    currentMetrics.avgProcessingTime ← processingTimeSum / recentTrajectories.length
    currentMetrics.errorRate ← errorCount / recentTrajectories.length
    currentMetrics.successRate ← successCount / recentTrajectories.length

    // Step 2: Compare against baseline
    baselineStart ← AddDays(currentTime, -BASELINE_WINDOW_DAYS)
    baselineEnd ← AddDays(currentTime, -1)
    baselineTrajectories ← ReasoningBank.QueryByDateRange(baselineStart, baselineEnd)

    baselineMetrics ← CalculateMetrics(baselineTrajectories)

    // Step 3: Detect degradation
    degradations ← []

    IF currentMetrics.matchSatisfaction < ALERT_THRESHOLDS.matchSatisfaction THEN
        degradation ← {
            metric: "matchSatisfaction",
            current: currentMetrics.matchSatisfaction,
            baseline: baselineMetrics.matchSatisfaction,
            threshold: ALERT_THRESHOLDS.matchSatisfaction,
            severity: "high"
        }
        degradations.append(degradation)
    END IF

    IF currentMetrics.avgProcessingTime > ALERT_THRESHOLDS.processingTime THEN
        degradations.append({
            metric: "processingTime",
            current: currentMetrics.avgProcessingTime,
            baseline: baselineMetrics.avgProcessingTime,
            threshold: ALERT_THRESHOLDS.processingTime,
            severity: "medium"
        })
    END IF

    IF currentMetrics.errorRate > ALERT_THRESHOLDS.errorRate THEN
        degradations.append({
            metric: "errorRate",
            current: currentMetrics.errorRate,
            baseline: baselineMetrics.errorRate,
            threshold: ALERT_THRESHOLDS.errorRate,
            severity: "high"
        })
    END IF

    IF currentMetrics.successRate < ALERT_THRESHOLDS.successRate THEN
        degradations.append({
            metric: "successRate",
            current: currentMetrics.successRate,
            baseline: baselineMetrics.successRate,
            threshold: ALERT_THRESHOLDS.successRate,
            severity: "high"
        })
    END IF

    // Step 4: Generate health report
    healthReport ← {
        timestamp: currentTime,
        status: degradations.length > 0 ? "degraded" : "healthy",
        currentMetrics: currentMetrics,
        baselineMetrics: baselineMetrics,
        degradations: degradations,
        sampleSize: recentTrajectories.length
    }

    RETURN healthReport
END
```

**Complexity Analysis**:
- **Time**: O(T) where T = trajectories in window
- **Space**: O(T) for trajectory storage

### 7.2 Degradation Detection and Auto-Healing

```
ALGORITHM: AutoHeal
INPUT:
    healthReport (HealthReport): Current health status
OUTPUT:
    healingActions (Action[]): Actions taken

CONSTANTS:
    MAX_HEALING_ATTEMPTS = 3
    VALIDATION_PERIOD_DAYS = 30
    ROLLBACK_WINDOW_DAYS = 7

BEGIN
    IF healthReport.status == "healthy" THEN
        RETURN []  // No action needed
    END IF

    healingActions ← []

    // Decision tree for healing
    FOR EACH degradation IN healthReport.degradations DO
        action ← NULL

        SWITCH degradation.metric:
            CASE "matchSatisfaction":
                action ← HealMatchSatisfaction(degradation)
            CASE "processingTime":
                action ← HealProcessingTime(degradation)
            CASE "errorRate":
                action ← HealErrorRate(degradation)
            CASE "successRate":
                action ← HealSuccessRate(degradation)
        END SWITCH

        IF action IS NOT NULL THEN
            // Execute healing action
            success ← ExecuteHealing(action)

            IF success THEN
                action.status ← "executed"
                action.timestamp ← GetCurrentTime()

                // Schedule validation
                ScheduleValidation({
                    action: action,
                    validationDate: AddDays(GetCurrentDate(), VALIDATION_PERIOD_DAYS)
                })

                healingActions.append(action)
            ELSE
                LogError("Healing action failed", action)
            END IF
        END IF
    END FOR

    RETURN healingActions
END

SUBROUTINE: HealMatchSatisfaction
INPUT: degradation (Degradation)
OUTPUT: action (HealingAction)

BEGIN
    // Diagnose cause
    possibleCauses ← DiagnoseMatchSatisfaction()

    IF "weights_drifted" IN possibleCauses THEN
        // Rollback to proven weights
        provenWeights ← GetProvenWeights(daysAgo: ROLLBACK_WINDOW_DAYS)

        action ← {
            type: "rollback_weights",
            reason: "Match satisfaction degraded",
            previousState: GetCurrentWeights(),
            newState: provenWeights,
            validationMetric: "matchSatisfaction",
            targetValue: 0.85
        }

        RETURN action

    ELSE IF "skills_underperforming" IN possibleCauses THEN
        // Disable recent skills
        recentSkills ← SkillLibrary.GetRecent(days: 7)

        action ← {
            type: "disable_skills",
            reason: "Recent skills may be degrading performance",
            affectedSkills: recentSkills.map(s => s.id),
            validationMetric: "matchSatisfaction",
            targetValue: 0.85
        }

        RETURN action

    ELSE IF "catalog_stale" IN possibleCauses THEN
        // Trigger catalog refresh
        action ← {
            type: "refresh_catalog",
            reason: "Content vectors may be stale",
            validationMetric: "matchSatisfaction",
            targetValue: 0.85
        }

        RETURN action
    END IF

    RETURN NULL  // Unknown cause
END

SUBROUTINE: DiagnoseMatchSatisfaction
OUTPUT: causes (string[])

BEGIN
    causes ← []

    // Check weight stability
    weightHistory ← GetWeightHistory(days: 14)
    weightVariance ← CalculateVariance(weightHistory)

    IF weightVariance > 0.1 THEN
        causes.append("weights_drifted")
    END IF

    // Check skill performance
    recentSkills ← SkillLibrary.GetRecent(days: 7)
    FOR EACH skill IN recentSkills DO
        IF skill.successRate < 0.8 THEN
            causes.append("skills_underperforming")
            BREAK
        END IF
    END FOR

    // Check catalog freshness
    lastCatalogUpdate ← GetLastCatalogUpdate()
    daysSinceUpdate ← DaysBetween(lastCatalogUpdate, GetCurrentDate())

    IF daysSinceUpdate > 14 THEN
        causes.append("catalog_stale")
    END IF

    RETURN causes
END

SUBROUTINE: ExecuteHealing
INPUT: action (HealingAction)
OUTPUT: success (boolean)

BEGIN
    TRY:
        SWITCH action.type:
            CASE "rollback_weights":
                UpdateWeights(action.newState)
                LogInfo("Rolled back to proven weights", action)
                RETURN TRUE

            CASE "disable_skills":
                FOR EACH skillId IN action.affectedSkills DO
                    SkillLibrary.Disable(skillId)
                END FOR
                LogInfo("Disabled underperforming skills", action)
                RETURN TRUE

            CASE "refresh_catalog":
                TriggerCatalogRefresh()
                LogInfo("Triggered catalog refresh", action)
                RETURN TRUE

            CASE "increase_exploration":
                config ← GetRecommendationConfig()
                config.explorationRate ← config.explorationRate × 1.5
                UpdateConfig(config)
                LogInfo("Increased exploration rate", action)
                RETURN TRUE

            DEFAULT:
                LogWarning("Unknown healing action type", action.type)
                RETURN FALSE
        END SWITCH

    CATCH error:
        LogError("Healing execution failed", error)
        RETURN FALSE
END
```

**Complexity Analysis**:
- **Time**: O(D + S) where D = diagnosis steps, S = skill count
- **Space**: O(1) for action execution

### 7.3 Rollback Mechanism

```
ALGORITHM: ValidateAndRollback
INPUT:
    validationTask (ValidationTask): Scheduled validation
OUTPUT:
    decision ("keep" | "rollback"): Outcome

CONSTANTS:
    SUCCESS_THRESHOLD = 0.9

BEGIN
    action ← validationTask.action

    // Step 1: Measure current performance
    currentMetrics ← MonitorHealth().currentMetrics
    targetMetric ← action.validationMetric
    targetValue ← action.targetValue

    actualValue ← currentMetrics[targetMetric]

    // Step 2: Compare against target
    IF actualValue >= targetValue THEN
        // Healing was successful
        LogInfo("Validation passed, keeping changes", {
            action: action,
            targetValue: targetValue,
            actualValue: actualValue
        })

        RETURN "keep"

    ELSE
        // Healing failed, rollback
        LogWarning("Validation failed, rolling back", {
            action: action,
            targetValue: targetValue,
            actualValue: actualValue
        })

        success ← RollbackAction(action)

        IF success THEN
            RETURN "rollback"
        ELSE
            LogError("Rollback failed, manual intervention required")
            AlertOperators({
                severity: "critical",
                message: "Auto-rollback failed",
                action: action
            })
            RETURN "rollback"  // Attempted but may have failed
        END IF
    END IF
END

SUBROUTINE: RollbackAction
INPUT: action (HealingAction)
OUTPUT: success (boolean)

BEGIN
    TRY:
        SWITCH action.type:
            CASE "rollback_weights":
                // Restore previous weights
                UpdateWeights(action.previousState)
                RETURN TRUE

            CASE "disable_skills":
                // Re-enable skills
                FOR EACH skillId IN action.affectedSkills DO
                    SkillLibrary.Enable(skillId)
                END FOR
                RETURN TRUE

            CASE "refresh_catalog":
                // No rollback needed, catalog refresh is additive
                RETURN TRUE

            CASE "increase_exploration":
                // Restore previous config
                config ← GetRecommendationConfig()
                config.explorationRate ← config.explorationRate / 1.5
                UpdateConfig(config)
                RETURN TRUE
        END SWITCH

    CATCH error:
        LogError("Rollback failed", error)
        RETURN FALSE
END
```

**Complexity Analysis**:
- **Time**: O(1) for rollback operations
- **Space**: O(1)

---

## 8. Agent Orchestration

### 8.1 Parallel Fan-Out Logic

```
ALGORITHM: OrchestrateFanOut
INPUT:
    emotionalState (UniversalEmotionalState): User state
    userId (string): User identifier
OUTPUT:
    agentResults (Map<AgentType, Result>): Aggregated results

CONSTANTS:
    AGENT_TIMEOUT = 2000  // ms
    REQUIRED_AGENTS = ["catalog", "match"]
    OPTIONAL_AGENTS = ["trend", "gnn"]

BEGIN
    // Step 1: Initialize agent tasks
    agentTasks ← MAP()

    agentTasks["intent"] ← {
        agent: IntentAgent,
        input: {quizAnswers: emotionalState.source, context: emotionalState.context},
        priority: "high",
        timeout: AGENT_TIMEOUT
    }

    agentTasks["catalog"] ← {
        agent: CatalogAgent,
        input: {emotionalState: emotionalState, userId: userId},
        priority: "high",
        timeout: AGENT_TIMEOUT
    }

    agentTasks["trend"] ← {
        agent: TrendAgent,
        input: {emotionalState: emotionalState},
        priority: "medium",
        timeout: AGENT_TIMEOUT
    }

    agentTasks["gnn"] ← {
        agent: GNNAgent,
        input: {emotionalState: emotionalState, userId: userId},
        priority: "medium",
        timeout: AGENT_TIMEOUT
    }

    agentTasks["match"] ← {
        agent: MatchAgent,
        input: {emotionalState: emotionalState, userId: userId},
        priority: "high",
        timeout: AGENT_TIMEOUT,
        dependsOn: ["catalog", "trend", "gnn"]  // Waits for others
    }

    // Step 2: Execute in parallel with dependency resolution
    agentResults ← MAP()
    errors ← MAP()

    PARALLEL:
        // Independent agents run immediately
        FOR EACH agentType IN ["intent", "catalog", "trend", "gnn"] DO
            TRY:
                result ← ExecuteAgentWithTimeout(
                    agentTasks[agentType].agent,
                    agentTasks[agentType].input,
                    agentTasks[agentType].timeout
                )
                agentResults[agentType] ← result

            CATCH TimeoutError:
                errors[agentType] ← "timeout"
                LogWarning("Agent timeout", agentType)

            CATCH error:
                errors[agentType] ← error
                LogError("Agent error", agentType, error)
        END FOR
    END PARALLEL

    // Step 3: Execute dependent agents
    // Wait for catalog, trend, gnn (match agent needs their results)
    WAIT_FOR agentResults["catalog"] OR errors["catalog"]

    TRY:
        // Aggregate inputs for match agent
        matchInput ← {
            emotionalState: emotionalState,
            userId: userId,
            candidates: agentResults.get("catalog", []),
            trendingBoosts: agentResults.get("trend", {}),
            gnnResults: agentResults.get("gnn", [])
        }

        matchResult ← ExecuteAgentWithTimeout(
            agentTasks["match"].agent,
            matchInput,
            agentTasks["match"].timeout
        )

        agentResults["match"] ← matchResult

    CATCH error:
        errors["match"] ← error
        LogError("Match agent failed", error)
    END TRY

    // Step 4: Check required agents completed
    FOR EACH required IN REQUIRED_AGENTS DO
        IF required NOT IN agentResults THEN
            THROW Error("Required agent failed: " + required)
        END IF
    END FOR

    // Step 5: Log optional failures
    FOR EACH optional IN OPTIONAL_AGENTS DO
        IF optional IN errors THEN
            LogWarning("Optional agent failed", optional, errors[optional])
        END IF
    END FOR

    RETURN agentResults

ERROR_HANDLING:
    CATCH Error AS e:
        LogError("Orchestration failed", e)
        THROW e  // Propagate to caller for fallback handling
END

SUBROUTINE: ExecuteAgentWithTimeout
INPUT:
    agent (Agent)
    input (any)
    timeout (number)
OUTPUT:
    result (any)

BEGIN
    startTime ← GetCurrentTime()

    // Execute agent with timeout
    promise ← agent.Execute(input)

    WAIT_FOR promise OR TIMEOUT(timeout):
        IF TIMEOUT_OCCURRED THEN
            THROW TimeoutError("Agent exceeded timeout")
        ELSE
            result ← promise.value
        END IF
    END WAIT

    elapsedTime ← GetCurrentTime() - startTime

    LogMetric("agent_execution_time", {
        agent: agent.name,
        duration: elapsedTime
    })

    RETURN result
END
```

**Complexity Analysis**:
- **Time**: O(max(T_agents)) - parallel execution, limited by slowest agent
- **Space**: O(A × R) where A = agent count, R = result size per agent

### 8.2 Result Aggregation

```
ALGORITHM: AggregateAgentResults
INPUT:
    agentResults (Map<AgentType, Result>): Results from all agents
    emotionalState (UniversalEmotionalState): User state
OUTPUT:
    finalRecommendation (Recommendation): Aggregated result

BEGIN
    // Step 1: Extract results
    catalogCandidates ← agentResults.get("catalog", [])
    trendingBoosts ← agentResults.get("trend", {})
    gnnResults ← agentResults.get("gnn", [])
    matchScores ← agentResults.get("match", [])

    // Step 2: Merge candidates (deduplicate)
    allCandidates ← MAP()  // contentId -> ContentItem

    FOR EACH candidate IN catalogCandidates DO
        allCandidates[candidate.id] ← candidate
    END FOR

    FOR EACH candidate IN gnnResults DO
        IF candidate.id NOT IN allCandidates THEN
            allCandidates[candidate.id] ← candidate
        END IF
    END FOR

    // Step 3: Combine scores
    combinedScores ← []

    FOR EACH contentId, content IN allCandidates DO
        // Get match score
        matchItem ← matchScores.find(item => item.contentId == contentId)
        matchScore ← matchItem ? matchItem.score : 0

        // Get trending boost
        trendingBoost ← trendingBoosts.get(contentId, 0)

        // Get GNN score
        gnnItem ← gnnResults.find(item => item.id == contentId)
        gnnScore ← gnnItem ? gnnItem.score : 0

        // Weighted combination
        finalScore ← (
            0.6 × matchScore +       // Match engine is primary
            0.2 × trendingBoost +    // Trending as boost
            0.2 × gnnScore           // GNN as boost
        )

        combinedScores.append({
            content: content,
            finalScore: finalScore,
            components: {
                matchScore: matchScore,
                trendingBoost: trendingBoost,
                gnnScore: gnnScore
            }
        })
    END FOR

    // Step 4: Sort by final score
    combinedScores.sortByDescending(finalScore)

    // Step 5: Diversify alternatives
    IF combinedScores.length > 0 THEN
        topPick ← combinedScores[0]
        alternatives ← DiversifyResults(combinedScores.slice(1), k: 3)

        finalRecommendation ← {
            topPick: topPick.content,
            matchScore: topPick.finalScore,
            alternatives: alternatives,
            scoreBreakdown: topPick.components,
            reasoning: GenerateReasoning(topPick, emotionalState)
        }

        RETURN finalRecommendation
    ELSE
        THROW Error("No candidates available")
    END IF
END

SUBROUTINE: GenerateReasoning
INPUT:
    topPick (ScoredContent)
    emotionalState (UniversalEmotionalState)
OUTPUT:
    reasoning (string)

BEGIN
    reasons ← []

    // Analyze score components
    IF topPick.components.matchScore > 0.8 THEN
        reasons.append("Highly matched to your preferences")
    END IF

    IF topPick.components.trendingBoost > 0.1 THEN
        reasons.append("Popular with viewers right now")
    END IF

    IF topPick.components.gnnScore > 0.7 THEN
        reasons.append("Loved by viewers similar to you")
    END IF

    // Analyze emotional alignment
    primaryNeed ← GetPrimaryNeed(emotionalState.needs)
    IF topPick.content.satisfiesNeeds[primaryNeed] > 0.8 THEN
        reasons.append("Perfect for your " + primaryNeed + " mood")
    END IF

    // Construct reasoning text
    IF reasons.length > 0 THEN
        RETURN JOIN(reasons, " • ")
    ELSE
        RETURN "Recommended based on your preferences"
    END IF
END
```

**Complexity Analysis**:
- **Time**: O(C log C) where C = total candidate count
- **Space**: O(C) for candidate storage

### 8.3 Error Handling and Retry

```
ALGORITHM: RobustAgentExecution
INPUT:
    agent (Agent)
    input (any)
    options (ExecutionOptions): {maxRetries, timeout, fallback}
OUTPUT:
    result (any) OR fallback value

CONSTANTS:
    DEFAULT_MAX_RETRIES = 2
    BACKOFF_MULTIPLIER = 1.5

BEGIN
    maxRetries ← options.maxRetries OR DEFAULT_MAX_RETRIES
    timeout ← options.timeout

    FOR attempt ← 1 TO maxRetries + 1 DO
        TRY:
            // Adjust timeout for retries
            currentTimeout ← timeout × POWER(BACKOFF_MULTIPLIER, attempt - 1)

            result ← ExecuteAgentWithTimeout(agent, input, currentTimeout)

            // Validate result
            IF ValidateAgentResult(agent, result) THEN
                LogInfo("Agent succeeded", {
                    agent: agent.name,
                    attempt: attempt
                })
                RETURN result
            ELSE
                THROW Error("Invalid agent result")
            END IF

        CATCH TimeoutError AS e:
            LogWarning("Agent timeout", {
                agent: agent.name,
                attempt: attempt,
                timeout: currentTimeout
            })

            IF attempt <= maxRetries THEN
                CONTINUE  // Retry
            ELSE
                // Max retries exceeded
                IF options.fallback IS NOT NULL THEN
                    LogWarning("Using fallback for agent", agent.name)
                    RETURN options.fallback
                ELSE
                    THROW e  // Propagate error
                END IF
            END IF

        CATCH Error AS e:
            LogError("Agent error", {
                agent: agent.name,
                attempt: attempt,
                error: e
            })

            // Determine if retryable
            IF IsRetryableError(e) AND attempt <= maxRetries THEN
                // Exponential backoff
                WAIT(100 × POWER(2, attempt - 1))  // ms
                CONTINUE
            ELSE
                // Non-retryable or max retries
                IF options.fallback IS NOT NULL THEN
                    RETURN options.fallback
                ELSE
                    THROW e
                END IF
            END IF
    END FOR
END

SUBROUTINE: IsRetryableError
INPUT: error (Error)
OUTPUT: retryable (boolean)

BEGIN
    retryableTypes ← [
        "NetworkError",
        "TimeoutError",
        "ServiceUnavailableError",
        "RateLimitError"
    ]

    RETURN error.type IN retryableTypes
END

SUBROUTINE: ValidateAgentResult
INPUT:
    agent (Agent)
    result (any)
OUTPUT:
    valid (boolean)

BEGIN
    // Type-specific validation
    SWITCH agent.type:
        CASE "catalog":
            RETURN IsArray(result) AND result.length > 0

        CASE "match":
            RETURN IsArray(result) AND result.length > 0 AND
                   result.every(item => item.score IS NOT NULL)

        CASE "trend":
            RETURN IsObject(result)

        CASE "gnn":
            RETURN IsArray(result)

        DEFAULT:
            RETURN result IS NOT NULL
    END SWITCH
END
```

**Complexity Analysis**:
- **Time**: O(R × T) where R = retry count, T = agent execution time
- **Space**: O(1) constant overhead

---

## 9. Data Structures

### 9.1 Core Data Types

```
DATA_STRUCTURE: UniversalEmotionalState {
    // Emotional dimensions (VAD model)
    energy: number         // 0-1: Low to high energy
    valence: number        // -1 to 1: Negative to positive
    arousal: number        // 0-1: Calm to excited

    // Cognitive state
    cognitiveCapacity: number  // 0-1: Mental bandwidth

    // Psychological needs (normalized)
    needs: {
        comfort: number
        escape: number
        stimulation: number
        connection: number
        growth: number
        catharsis: number
        joy: number
        relaxation: number
        meaning: number
        beauty: number
    }

    // Context
    context: {
        time: {
            hour: number
            dayOfWeek: string
            isWeekend: boolean
        }
        device: "mobile" | "tablet" | "desktop" | "tv"
        social: "alone" | "partner" | "family" | "friends"
        location: string
    }

    // Learned constraints
    constraints: Constraint[]

    timestamp: number
}

DATA_STRUCTURE: ContentItem {
    id: string
    title: string
    description: string

    // Vector representations
    vector: number[]              // 768D content embedding
    emotionalSignature: number[]  // 128D emotional profile

    // Metadata
    genre: string[]
    runtime: number               // minutes
    language: string
    maturityRating: string
    releaseYear: number

    // Engagement patterns
    engagementPattern: {
        attentionCurve: number[]
        avgCompletionRate: number
        bingeability: number
    }

    // Need satisfaction
    satisfiesNeeds: {
        comfort: number
        escape: number
        // ... (all psychological needs)
    }

    // Performance
    loadTime: number              // ms
}

DATA_STRUCTURE: Trajectory {
    id: string
    userId: string
    timestamp: number

    // Input state
    emotionalState: UniversalEmotionalState

    // Recommendation
    recommendation: ContentItem
    similarity: number            // Vector similarity
    causalUplift: number          // From Causal Memory Graph
    latency: number               // Processing time

    // Outcome
    outcome: {
        watched: boolean
        completionRate: number    // 0-1
        rating: number            // 1-5 (optional)
        refinementRequested: boolean
    }

    // Verdict
    verdict: {
        success: boolean
        confidenceScore: number
        reasoning: string
    }

    // Context
    context: {
        processingTime: number
        alternativesShown: number
        skillUsed: string
    }

    // Features for pattern learning
    patternFeatures: Map<string, any>
}

DATA_STRUCTURE: Pattern {
    features: Map<string, any>    // Trigger conditions
    support: number                // Occurrence count
    confidence: number             // Success probability
    successRate: number            // Actual success rate
    evidenceTrajectories: string[] // Trajectory IDs
    strategy: Strategy
    validationScore: number
}

DATA_STRUCTURE: Strategy {
    preferredGenres: Map<string, number>
    runtimeRange: [number, number]
    boostFactors: Map<string, number>
    penaltyFactors: Map<string, number>
}

DATA_STRUCTURE: Skill {
    id: string
    name: string

    // Trigger conditions
    trigger: Map<string, any>

    // Strategy to apply
    strategy: Strategy

    // Performance metrics
    successRate: number
    evidenceCount: number
    consolidatedFrom: number       // Pattern count

    // Timestamps
    createdAt: number
    lastValidated: number

    // Composability
    composableWith: string[]       // Other skill IDs
}

DATA_STRUCTURE: HealingAction {
    type: "rollback_weights" | "disable_skills" | "refresh_catalog" | "increase_exploration"
    reason: string

    previousState: any
    newState: any

    validationMetric: string
    targetValue: number

    status: "proposed" | "executed" | "validated" | "rolled_back"
    timestamp: number
}
```

### 9.2 Index Structures

```
DATA_STRUCTURE: HNSWIndex {
    // Hierarchical graph structure
    layers: Layer[]
    entryPoint: Node

    // Parameters
    M: number                      // Max connections per node
    efConstruction: number         // Construction-time accuracy
    levelMultiplier: number        // Layer probability

    // Metadata
    dimension: number
    distanceFunction: "cosine" | "euclidean" | "dot"
}

DATA_STRUCTURE: Layer {
    level: number
    nodes: Node[]
}

DATA_STRUCTURE: Node {
    id: string
    vector: number[]
    neighbors: Map<number, Node[]>  // level -> neighbors
    metadata: ContentItem
}

DATA_STRUCTURE: ReasoningBankIndex {
    // Trajectory storage
    trajectories: Map<string, Trajectory>

    // Pattern indices
    featureIndex: Map<string, string[]>    // feature -> trajectory IDs
    outcomeIndex: Map<boolean, string[]>   // success -> trajectory IDs
    timeIndex: BTree<number, string[]>     // timestamp -> trajectory IDs

    // Aggregations
    patternCache: Map<string, Pattern>
}

DATA_STRUCTURE: SkillLibrary {
    skills: Map<string, Skill>

    // Trigger index for fast lookup
    triggerIndex: TrieNode

    // Performance tracking
    performanceHistory: Map<string, PerformanceRecord[]>
}

DATA_STRUCTURE: TrieNode {
    children: Map<string, TrieNode>
    skills: string[]               // Skill IDs at this node
    isTerminal: boolean
}
```

---

## 10. Complexity Analysis Summary

### 10.1 Time Complexity Table

| Algorithm | Best Case | Average Case | Worst Case | Notes |
|-----------|-----------|--------------|------------|-------|
| **GetRecommendation** | O(log n) | O(log n + c) | O(n) | c = candidates |
| **ExtractIntent** | O(1) | O(log m) | O(m) | m = episodes |
| **StaticMatchScore** | O(d) | O(d) | O(d) | d = dimensions |
| **UtilityBasedMatchScore** | O(d + log m) | O(d + log m + log s) | O(d + m + s) | s = skills |
| **HNSWSearch** | O(log n) | O(log n) | O(n) | With good graph |
| **CausalRecallSearch** | O(c log n) | O(c log n + c log m) | O(c × n) | c = candidates |
| **GNNQueryExpansion** | O(h × d × \|N\|) | O(h × d × \|N\| × \|C\|) | O(h × d × \|N\| × \|C\|) | h = heads |
| **StoreTrajectory** | O(f) | O(f) | O(f) | f = features |
| **QueryPatterns** | O(T) | O(T log T) | O(T²) | T = trajectories |
| **ConsolidateSkill** | O(P × F) | O(P × F + H) | O(P × F + H) | P = patterns, H = holdout |
| **LearnFormulaWeights** | O(I × T) | O(I × T) | O(I × T) | I = iterations |
| **MonitorHealth** | O(T) | O(T) | O(T) | T = trajectories |
| **OrchestrateFanOut** | O(max(T_agents)) | O(max(T_agents)) | O(Σ T_agents) | Parallel vs serial |

### 10.2 Space Complexity Table

| Data Structure | Space Complexity | Notes |
|----------------|------------------|-------|
| **UniversalEmotionalState** | O(1) | Fixed structure |
| **ContentItem** | O(d) | d = vector dimensions |
| **Trajectory** | O(f) | f = feature count |
| **HNSWIndex** | O(n × M × L) | n = nodes, M = connections, L = layers |
| **ReasoningBankIndex** | O(T × f) | T = trajectories, f = features |
| **SkillLibrary** | O(S × F) | S = skills, F = features per skill |
| **Pattern** | O(f + E) | f = features, E = evidence IDs |

### 10.3 System-Wide Performance Targets

| Metric | Target | Actual (Expected) |
|--------|--------|-------------------|
| **End-to-end recommendation** | < 60 seconds | ~3-5 seconds |
| **Vector search (HNSW)** | < 100ms | ~10-50ms |
| **Pattern query** | < 200ms | ~50-150ms |
| **Trajectory storage** | < 50ms | ~10-30ms |
| **Nightly learner (1M trajectories)** | < 1 hour | ~20-40 minutes |
| **Self-healing detection** | < 5 minutes | ~1-3 minutes |
| **Weight optimization** | < 10 minutes | ~5-8 minutes |

---

## Appendices

### A. Error Handling Guidelines

All algorithms follow these error handling principles:

1. **Graceful Degradation**: Prefer fallback to partial results over complete failure
2. **Explicit Logging**: Log all errors with context for debugging
3. **Retry Logic**: Retry transient failures with exponential backoff
4. **Validation**: Validate inputs and outputs at boundaries
5. **Circuit Breakers**: Disable failing components automatically

### B. Optimization Opportunities

Future optimization areas:

1. **Caching**: Cache frequent pattern queries and skill lookups
2. **Quantization**: Reduce vector dimensions for faster search (AgentDB support)
3. **Batch Processing**: Batch multiple user requests for efficiency
4. **Index Pruning**: Remove stale entries from HNSW index
5. **Lazy Loading**: Load content metadata on-demand

### C. Testing Strategy

Each algorithm should be tested with:

1. **Unit Tests**: Test individual subroutines in isolation
2. **Integration Tests**: Test algorithm chains end-to-end
3. **Performance Tests**: Verify complexity bounds hold
4. **Chaos Tests**: Test error handling and recovery
5. **A/B Tests**: Validate learned improvements in production

---

**END OF PSEUDOCODE DOCUMENTATION**

This pseudocode provides the algorithmic foundation for implementing the Universal Content Discovery Platform. All algorithms are designed for:

- **Clarity**: Step-by-step logic that can be directly translated to code
- **Efficiency**: Analyzed complexity with optimization considerations
- **Robustness**: Comprehensive error handling and fallback strategies
- **Scalability**: Designed to handle millions of users and content items
- **Learnability**: Self-improving through ReasoningBank and AgentDB v2.0

**Next Steps**:
1. Review pseudocode with engineering team
2. Begin implementation in TypeScript (Architecture phase)
3. Create unit tests based on subroutines
4. Implement MVP with static formulas first
5. Add learning capabilities in Phase 2
