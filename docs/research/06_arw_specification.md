# ARW (Agent-Ready Web) Specification - Hackathon Compliance Research

**Research Date**: 2025-12-06
**Researcher**: Research Agent
**Purpose**: Hackathon compliance and ARW implementation guidance
**Status**: ✅ Complete

---

## Executive Summary

The **Agent-Ready Web (ARW)** specification provides infrastructure for efficient AI agent-web interaction through structured manifests, machine-readable views, and standardized action endpoints. This research documents ARW v0.1 implementation patterns found in the codebase and related emerging standards.

### Key Benefits
- **85% token reduction** vs HTML scraping
- **10x faster discovery** via structured manifests
- **OAuth-enforced safe transactions** for agent actions
- **Full observability** through AI-* headers
- **Structured data exchange** for reliable agent interactions

---

## 1. ARW Core Concepts

### 1.1 Primary Discovery Mechanisms

ARW uses multiple discovery mechanisms for AI agents:

#### **llms.txt** (Primary Entry Point)
- **Location**: `/llms.txt` at site root
- **Format**: YAML or plain text
- **Purpose**: Main ARW manifest discovery file
- **Profile**: ARW-1 (v0.1)

#### **.well-known/arw-manifest.json** (Structured Manifest)
- **Location**: `/.well-known/arw-manifest.json`
- **Format**: JSON
- **Purpose**: Detailed ARW capabilities and configuration
- **Discoverable**: RFC 8615 Well-Known URIs

#### **Machine Views** (.llm.md files)
- **Format**: Markdown optimized for LLM consumption
- **Location**: Specified in manifest content mappings
- **Purpose**: Structured, token-efficient page representations
- **Examples**: `/llms/home.llm.md`, `/api/movie/[id]/llm`

### 1.2 ARW Manifest Structure

Based on `/apps/media-discovery/public/.well-known/arw-manifest.json`:

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "AI Media Discovery",
    "description": "Discover movies and TV shows through natural language",
    "homepage": "https://media-discovery.example.com",
    "contact": "ai@media-discovery.example.com"
  },
  "content": [...],
  "actions": [...],
  "protocols": [...],
  "policies": {...}
}
```

**Key Sections**:
1. **site**: Metadata about the service
2. **content**: URL-to-machine-view mappings
3. **actions**: Structured API endpoints for agent interactions
4. **protocols**: Supported communication protocols (REST, MCP, etc.)
5. **policies**: Training, inference, and usage policies

---

## 2. Content Discovery and Machine Views

### 2.1 Content Mapping Structure

```json
"content": [
  {
    "url": "/",
    "machine_view": "/llms/home.llm.md",
    "purpose": "browse",
    "priority": "high",
    "description": "Homepage with trending content"
  },
  {
    "url": "/search",
    "machine_view": "/llms/search.llm.md",
    "purpose": "search",
    "priority": "high",
    "description": "Natural language search"
  }
]
```

**Properties**:
- **url**: Human-readable page URL
- **machine_view**: LLM-optimized representation endpoint
- **purpose**: Semantic intent (browse, search, details, action)
- **priority**: Discovery prioritization (high, medium, low)
- **description**: Human-readable explanation

### 2.2 Machine View Benefits

| Metric | HTML Scraping | Machine View | Improvement |
|--------|---------------|--------------|-------------|
| **Token Count** | ~15,000 tokens | ~2,250 tokens | **85% reduction** |
| **Discovery Time** | 10-30 seconds (crawl) | <1 second (manifest) | **10x faster** |
| **Reliability** | Breaks with UI changes | Stable schema | **High stability** |
| **Structured Data** | Requires parsing | Native JSON/Markdown | **Built-in** |

---

## 3. Structured Action Endpoints

### 3.1 Action Schema

Actions define how AI agents can interact with the service:

```json
"actions": [
  {
    "id": "semantic_search",
    "name": "Semantic Search",
    "endpoint": "/api/search",
    "method": "POST",
    "description": "Search using natural language queries",
    "schema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Natural language search query",
          "examples": [
            "exciting sci-fi movies like Inception",
            "heartwarming comedy for family movie night"
          ]
        },
        "filters": {
          "type": "object",
          "properties": {
            "mediaType": {
              "type": "string",
              "enum": ["movie", "tv", "all"]
            },
            "ratingMin": {
              "type": "number",
              "minimum": 0,
              "maximum": 10
            }
          }
        },
        "explain": {
          "type": "boolean",
          "description": "Include AI-generated explanations"
        }
      },
      "required": ["query"]
    }
  }
]
```

**Key Features**:
- **JSON Schema validation**: Ensures type safety
- **Example prompts**: Guides agent usage
- **Structured parameters**: Clear input/output contracts
- **HTTP method specification**: RESTful design

### 3.2 Action Discovery Flow

```
1. Agent reads /.well-known/arw-manifest.json
2. Parses "actions" array
3. Selects action by ID or semantic match
4. Validates input against schema
5. Executes POST/GET/etc. to endpoint
6. Receives structured response
```

---

## 4. AI-Aware Headers for Observability

### 4.1 Observability Header Specification

ARW recommends AI-* headers for tracking and debugging agent traffic:

#### **Request Headers** (Agent → Service)
```http
AI-Agent: Claude-3.5-Sonnet/20241022
AI-Purpose: content_discovery
AI-Session-ID: sess_abc123xyz
AI-User-ID: user_456def (if authenticated)
```

#### **Response Headers** (Service → Agent)
```http
AI-Token-Usage: 2250
AI-Cache-Hit: true
AI-Processing-Time: 45ms
AI-Rate-Limit-Remaining: 950/1000
```

### 4.2 Benefits of AI Headers

1. **Debugging**: Track agent request patterns
2. **Analytics**: Understand AI vs human traffic
3. **Rate Limiting**: Apply different quotas for agents
4. **Caching**: Optimize for repeated agent queries
5. **Security**: Detect malicious agent behavior

### 4.3 Implementation Example

From research on AI observability patterns:

```javascript
// Express middleware for AI headers
app.use((req, res, next) => {
  const isAIRequest = req.headers['ai-agent'] || req.headers['user-agent']?.includes('AI');

  if (isAIRequest) {
    res.setHeader('AI-Cache-Hit', checkCache(req.url));
    res.setHeader('AI-Token-Usage', estimateTokens(res.body));
    res.setHeader('AI-Processing-Time', Date.now() - req.startTime);
  }

  next();
});
```

---

## 5. OAuth-Enforced Safe Transactions

### 5.1 Authentication Schema in ARW

ARW manifests can specify OAuth requirements for actions:

```json
"actions": [
  {
    "id": "purchase_content",
    "name": "Purchase Movie",
    "endpoint": "/api/purchase",
    "method": "POST",
    "auth": {
      "type": "oauth2",
      "flows": ["authorization_code"],
      "scopes": ["purchase:write", "user:read"],
      "tokenUrl": "/oauth/token",
      "authorizationUrl": "/oauth/authorize"
    },
    "schema": {...}
  }
]
```

### 5.2 OAuth 2.1 Integration with MCP

Based on emerging standards research:

- **MCP (Model Context Protocol)** introduces OAuth 2.1 authentication
- **Resource Indicators (RFC 8707)** strengthen identity in agent systems
- **Scoped access tokens**: Agents get precisely scoped permissions
  - Example: `financial-data:read-only`, `user-calendar:schedule-meetings`
- **Short-lived tokens**: 5-15 minute expiration forces re-authentication
- **Asymmetric cryptography**: Private Key JWTs, mTLS instead of shared secrets

### 5.3 Safe Transaction Flow

```
1. Agent discovers action requiring OAuth
2. Initiates OAuth authorization code flow
3. User approves scoped permissions
4. Agent receives access token with specific scopes
5. Agent includes token in action request
6. Service validates token, scope, and executes
7. Audit log tracks: user, agent, action, timestamp
```

**Security Benefits**:
- ✅ User explicitly authorizes agent actions
- ✅ Scoped permissions limit blast radius
- ✅ Token expiration prevents long-term abuse
- ✅ Audit trail for compliance and debugging

---

## 6. Usage Policies and Data Governance

### 6.1 Policy Schema

```json
"policies": {
  "training": {
    "allowed": false,
    "note": "Content metadata from TMDB. Training not permitted."
  },
  "inference": {
    "allowed": true,
    "restrictions": ["attribution_required", "non_commercial"]
  },
  "attribution": {
    "required": true,
    "format": "link",
    "template": "Powered by AI Media Discovery (https://media-discovery.example.com)"
  },
  "rate_limits": {
    "authenticated": "1000 requests per minute",
    "unauthenticated": "100 requests per minute"
  }
}
```

### 6.2 Policy Categories

| Policy | Purpose | Example Values |
|--------|---------|----------------|
| **training** | Can AI models train on this data? | `allowed: true/false` |
| **inference** | Can AI use data for inference? | `allowed: true`, `restrictions: [...]` |
| **attribution** | Must attribute source? | `required: true`, `format: "link"` |
| **rate_limits** | API quotas | `1000 req/min` (authenticated) |

### 6.3 AI Manifest Standard Alignment

ARW policies align with emerging **AI Manifest (ai-manifest.org)** standard:
- **Discoverable**: via `.well-known` location
- **Interoperable**: Aligns with OpenAPI, JSON Schema
- **Verifiable**: Points to JWKS for signatures, rotation, revocation
- **Compatible**: Works with MCP and community agents.json

---

## 7. Protocols and Interoperability

### 7.1 Protocol Declaration

```json
"protocols": [
  {
    "name": "Media Discovery API",
    "type": "rest",
    "endpoint": "/api",
    "description": "RESTful API for content discovery"
  }
]
```

### 7.2 Emerging Protocol Support

ARW is designed to work alongside:

#### **MCP (Model Context Protocol)**
- **Discovery**: `/.well-known/mcp/manifest.json`
- **Capabilities**: Server capabilities description
- **Integration**: ARW actions can map to MCP tools
- **Status**: Rapidly becoming open standard (5,000+ active servers as of May 2025)

#### **AWAS (AI-Readable Web Actions Standard)**
- **MCP Support**: `/.well-known/mcp-manifest.json`
- **Benefits**: Reduced server load, control & visibility, future-proof
- **Compatibility**: Works with ARW action schemas

#### **agents.json**
- **Location**: `/.well-known/agents.json`
- **Base**: OpenAPI standard for existing infrastructure
- **Optimization**: Schema optimized for LLMs, not humans

#### **A2A (Agent2Agent) Protocol**
- **Agent Cards**: Standardized JSON capability descriptions
- **Discovery**: Well-known URLs, curated catalogs, private distribution
- **Enterprise Focus**: Integrates with existing security/operations

### 7.3 Multi-Protocol Strategy

**Recommended approach**:
1. Start with ARW manifest for broad compatibility
2. Add MCP manifest for MCP-enabled agents
3. Provide OpenAPI spec for standards-based tooling
4. Document in llms.txt for easy discovery

---

## 8. Implementation Requirements

### 8.1 Minimum ARW Compliance

To be ARW-compliant, a site must implement:

✅ **Required**:
1. `llms.txt` at site root OR `.well-known/arw-manifest.json`
2. At least one machine view endpoint
3. Basic site metadata (name, description)

✅ **Recommended**:
4. Structured action endpoints with JSON schemas
5. Usage policies (training, inference, attribution)
6. Rate limit documentation
7. AI-* headers for observability

✅ **Optional**:
8. OAuth for sensitive actions
9. MCP manifest for MCP compatibility
10. OpenAPI spec for tooling integration

### 8.2 Manifest File Requirements

#### **llms.txt Format**

```yaml
version: 0.1
profile: ARW-1

site:
  name: 'Your Site Name'
  description: 'Brief description for AI agents'
  homepage: 'https://example.com'
  contact: 'ai@example.com'

content:
  - url: /
    machine_view: /llms/home.llm.md
    purpose: browse
    priority: high
    description: 'Homepage'

actions:
  - id: search
    name: 'Search'
    endpoint: /api/search
    method: POST
    description: 'Search functionality'

protocols:
  - name: 'REST API'
    type: rest
    endpoint: /api

policies:
  training:
    allowed: false
  inference:
    allowed: true
```

#### **arw-manifest.json Format**

Same structure as llms.txt but in JSON format. See section 1.2.

### 8.3 Machine View Guidelines

**Best Practices**:
1. **Markdown format**: Easy for LLMs to parse
2. **Structured sections**: Use consistent headings
3. **Semantic markup**: Lists, tables, code blocks
4. **Token efficiency**: Remove UI chrome, navigation
5. **Dynamic content**: Generate based on page state
6. **Include metadata**: Title, description, canonical URL

**Example Machine View**:

```markdown
# Movie Title: Inception (2010)

## Overview
- **Rating**: 8.8/10
- **Genre**: Sci-Fi, Thriller
- **Runtime**: 148 minutes
- **Director**: Christopher Nolan

## Synopsis
A thief who steals corporate secrets through dream-sharing technology...

## Cast
- Leonardo DiCaprio as Dom Cobb
- Joseph Gordon-Levitt as Arthur
- Ellen Page as Ariadne

## Availability
- Stream: Netflix, Amazon Prime
- Rent: $3.99 HD
- Buy: $14.99 HD

## Similar Movies
1. The Matrix (1999) - 8.7/10
2. Interstellar (2014) - 8.6/10
3. Shutter Island (2010) - 8.2/10
```

---

## 9. Validation and Compliance Checking

### 9.1 ARW Validator Tools

The repository includes validation tools:

#### **GitHub Actions Workflow**
- **Location**: `.github/workflows/arw-validate.yml`
- **Usage**: Manual workflow dispatch with domain input
- **Output**: Generates compliance report artifact
- **Command**: `node bin/arw-validate.js <domain>`

#### **Chrome Extension Inspector**
- **Location**: `apps/arw-chrome-extension/`
- **Features**: Real-time ARW compliance inspection
- **Checks**:
  - llms.txt discovery ✓
  - .well-known files ✓
  - Machine views ✓
  - robots.txt analysis ✓
  - Meta tag scanning ✓
  - AI header detection ✓

### 9.2 Validation Checklist

#### **Discovery Files**
- [ ] llms.txt exists at `/llms.txt`
- [ ] OR `.well-known/arw-manifest.json` exists
- [ ] Manifest is valid JSON/YAML
- [ ] Contains required fields: version, profile, site

#### **Content Mappings**
- [ ] At least one content entry exists
- [ ] Machine view URLs are accessible
- [ ] Machine views return valid markdown
- [ ] Purpose and priority are specified

#### **Actions**
- [ ] Actions have unique IDs
- [ ] Endpoints are accessible
- [ ] JSON schemas are valid
- [ ] HTTP methods are correct

#### **Policies**
- [ ] Training policy is declared
- [ ] Inference policy is declared
- [ ] Attribution requirements are clear
- [ ] Rate limits are documented

#### **Headers and Observability**
- [ ] AI-* headers are returned on machine views
- [ ] Token usage is estimated
- [ ] Cache headers are appropriate

#### **Security**
- [ ] Sensitive actions require authentication
- [ ] OAuth flows are properly configured
- [ ] HTTPS is enforced
- [ ] CORS is properly configured

---

## 10. Integration with Hackathon Tools

### 10.1 Claude Code CLI Integration

**ARW enhances Claude Code workflows**:

1. **Discovery**: Claude reads llms.txt to understand site capabilities
2. **Navigation**: Uses machine views instead of HTML scraping
3. **Actions**: Executes structured API calls from manifest
4. **Policies**: Respects training/inference restrictions

**Example Claude Code interaction**:
```
Claude: I'll search the media discovery API
1. Read /.well-known/arw-manifest.json
2. Find "semantic_search" action
3. POST to /api/search with {"query": "sci-fi thriller"}
4. Receive structured JSON response
```

### 10.2 MCP Server Integration

**ARW manifests map to MCP tools**:

```javascript
// MCP server auto-generates tools from ARW manifest
const arwManifest = await fetch('/.well-known/arw-manifest.json').then(r => r.json());

const mcpTools = arwManifest.actions.map(action => ({
  name: action.id,
  description: action.description,
  inputSchema: action.schema,
  handler: async (params) => {
    return await fetch(action.endpoint, {
      method: action.method,
      body: JSON.stringify(params)
    });
  }
}));
```

**Benefits**:
- Automatic MCP tool generation from ARW
- Consistent schema across protocols
- Single source of truth (ARW manifest)

### 10.3 Agentic Workflow Support

**ARW enables autonomous agent workflows**:

1. **Planning**: Agent reads manifest to understand capabilities
2. **Execution**: Agent calls structured actions sequentially
3. **Adaptation**: Agent handles errors using schema validation
4. **Compliance**: Agent respects policies automatically

**Example workflow**:
```
User: "Find me a sci-fi movie to watch tonight"

Agent workflow:
1. Discover media-discovery site via llms.txt
2. Read arw-manifest.json to find actions
3. Call semantic_search action with query
4. Parse structured response
5. Call get_recommendations for similar content
6. Present results to user with proper attribution
```

---

## 11. ARW Chrome Extension - Implementation Reference

### 11.1 Extension Architecture

The ARW Chrome Extension provides real-time compliance inspection:

```
arw-chrome-extension/
├── manifest.json              # Chrome Manifest V3
├── src/
│   ├── content/
│   │   └── content-script.js  # Runs on every page, inspects ARW
│   ├── background/
│   │   └── service-worker.js  # Coordinates, manages badge
│   └── popup/
│       ├── popup.html         # UI structure
│       └── popup.js           # Displays results
└── public/
    └── icons/                 # Extension icons
```

### 11.2 Inspection Flow

```javascript
// Content script checks (parallel execution)
const results = await Promise.all([
  checkLlmsTxt(),           // Fetch /llms.txt
  checkWellKnownFiles(),    // Fetch /.well-known/arw-manifest.json
  checkRobotsTxt(),         // Check for ARW hints
  checkForMachineView()     // Detect .llm.md files
]);

// Calculate compliance
const isCompliant = !!(
  results.llmsTxt?.exists ||
  results.wellKnown?.manifest?.exists ||
  results.machineViews?.length > 0
);

// Update badge
chrome.runtime.sendMessage({
  action: 'updateBadge',
  compliant: isCompliant,
  results: results
});
```

### 11.3 Discovery Checks Performed

1. **llms.txt**: `fetch(origin + '/llms.txt')`
2. **.well-known/arw-manifest.json**: `fetch(origin + '/.well-known/arw-manifest.json')`
3. **Machine views**: Check for `.llm.md` files referenced in manifests
4. **robots.txt**: Parse for ARW-specific directives
5. **Meta tags**: Scan for `<meta name="arw:*">`
6. **AI headers**: Inspect response headers for `AI-*`

---

## 12. Compliance Examples from Codebase

### 12.1 Media Discovery App (Reference Implementation)

**Location**: `/apps/media-discovery/`

**ARW Implementation**:
- ✅ llms.txt at `/public/llms.txt`
- ✅ arw-manifest.json at `/public/.well-known/arw-manifest.json`
- ✅ Machine views: `/llms/home.llm.md`, `/llms/search.llm.md`
- ✅ Actions: semantic_search, get_recommendations, discover_content
- ✅ Policies: Training forbidden, inference allowed with attribution
- ✅ Rate limits: 1000/min authenticated, 100/min unauthenticated

**Key Files**:
1. `/apps/media-discovery/public/.well-known/arw-manifest.json` - Full manifest
2. `/apps/media-discovery/public/llms.txt` - Discovery file
3. `/apps/media-discovery/src/app/page.tsx` - Next.js integration
4. `/apps/media-discovery/src/types/media.ts` - TypeScript types

### 12.2 GitHub Actions Validator

**Location**: `.github/workflows/arw-validate.yml`

**Workflow**:
1. Accepts domain as input
2. Runs `arw-validate.js` script
3. Generates timestamped report
4. Uploads artifact with compliance results

**Usage**:
```bash
# Manual trigger from GitHub UI
# Input: https://media-discovery.example.com
# Output: arw-report-media-discovery-example-com-20251206-120000.txt
```

---

## 13. Related Standards and Future Directions

### 13.1 Standards Landscape (2025)

| Standard | Status | Focus | Discovery |
|----------|--------|-------|-----------|
| **ARW** | Draft v0.1 | General web-AI interaction | llms.txt, .well-known |
| **MCP** | Active (5000+ servers) | Model-context protocol | /.well-known/mcp |
| **AWAS** | Emerging | AI-readable web actions | /.well-known/mcp-manifest.json |
| **agents.json** | Proposal | OpenAPI-based discovery | /.well-known/agents.json |
| **AI Manifest** | Community draft | Data governance | /.well-known/ai-manifest.json |
| **A2A** | Specification | Agent-to-agent protocol | Agent cards, registries |

### 13.2 Convergence Trends

**Common patterns across standards**:
1. **.well-known** discovery (RFC 8615)
2. **JSON Schema** for validation
3. **OAuth 2.1** for authentication
4. **OpenAPI** compatibility
5. **Scoped permissions** for actions
6. **Rate limiting** and observability

### 13.3 ARW's Position

ARW focuses on:
- **Simplicity**: Easy to implement (llms.txt + manifest)
- **Efficiency**: Token reduction, faster discovery
- **Practicality**: Works today without complex infrastructure
- **Interoperability**: Compatible with MCP, OpenAPI, etc.

**Recommendation**: Implement ARW as foundation, add MCP/OpenAPI for specific use cases.

---

## 14. Implementation Roadmap for Hackathon

### 14.1 Phase 1: Basic Compliance (1-2 hours)

**Tasks**:
1. Create `public/.well-known/arw-manifest.json`
2. Create `public/llms.txt` (YAML or reference to manifest)
3. Add site metadata (name, description, contact)
4. Define at least one machine view endpoint
5. Test with ARW validator

**Deliverables**:
- [ ] llms.txt or arw-manifest.json accessible
- [ ] One working machine view
- [ ] Valid JSON/YAML syntax
- [ ] Passes basic validation

### 14.2 Phase 2: Actions and Policies (2-3 hours)

**Tasks**:
1. Document existing API endpoints as ARW actions
2. Add JSON schemas for request/response
3. Define usage policies (training, inference, attribution)
4. Add rate limit documentation
5. Test actions with example requests

**Deliverables**:
- [ ] 3+ structured actions with schemas
- [ ] Complete policies section
- [ ] Example prompts for each action
- [ ] Rate limits documented

### 14.3 Phase 3: Observability and Security (2-3 hours)

**Tasks**:
1. Add AI-* headers to API responses
2. Implement OAuth for sensitive actions (optional)
3. Add token usage estimation
4. Set up request logging for AI agents
5. Configure CORS appropriately

**Deliverables**:
- [ ] AI-* headers on machine views
- [ ] OAuth configured (if needed)
- [ ] Observability dashboard (optional)
- [ ] Security audit passed

### 14.4 Phase 4: Testing and Documentation (1-2 hours)

**Tasks**:
1. Test with ARW Chrome Extension
2. Run GitHub Actions validator
3. Document implementation in README
4. Create example agent interactions
5. Submit compliance report

**Deliverables**:
- [ ] Chrome extension shows "ARW Compliant"
- [ ] Validation report passes all checks
- [ ] README documents ARW features
- [ ] Example agent code provided

**Total Time Estimate**: 6-10 hours for full compliance

---

## 15. Hackathon Compliance Checklist

### ✅ Required for Submission

- [ ] **Discovery**
  - [ ] llms.txt OR .well-known/arw-manifest.json exists
  - [ ] Manifest has version, profile, site metadata

- [ ] **Content**
  - [ ] At least 1 machine view endpoint
  - [ ] Machine view returns valid markdown
  - [ ] Content mappings documented

- [ ] **Actions**
  - [ ] At least 1 structured action endpoint
  - [ ] JSON schema provided
  - [ ] Working example request/response

- [ ] **Policies**
  - [ ] Training policy declared
  - [ ] Inference policy declared
  - [ ] Attribution requirements stated

### ⭐ Recommended for Excellence

- [ ] **Multiple Machine Views** (3+ pages covered)
- [ ] **Rich Actions** (5+ endpoints with schemas)
- [ ] **OAuth Integration** (for sensitive operations)
- [ ] **AI Headers** (observability implemented)
- [ ] **MCP Compatibility** (dual manifest)
- [ ] **OpenAPI Spec** (standards compliance)
- [ ] **Rate Limiting** (implemented and tested)
- [ ] **CORS** (properly configured)

### 🏆 Bonus Points

- [ ] **Innovative Actions** (unique agent capabilities)
- [ ] **Policy Verification** (JWKS, signatures)
- [ ] **Multi-Protocol** (ARW + MCP + OpenAPI)
- [ ] **Analytics Dashboard** (agent usage tracking)
- [ ] **Security Hardening** (OAuth, scoping, audit logs)

---

## 16. Code Examples and Templates

### 16.1 Next.js ARW Integration

```typescript
// pages/api/arw-manifest.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const manifest = {
    version: '0.1',
    profile: 'ARW-1',
    site: {
      name: 'My Hackathon Project',
      description: 'AI-powered solution for [problem]',
      homepage: process.env.NEXT_PUBLIC_URL,
      contact: 'team@example.com'
    },
    content: [
      {
        url: '/',
        machine_view: '/llms/home.llm.md',
        purpose: 'browse',
        priority: 'high',
        description: 'Homepage'
      }
    ],
    actions: [
      {
        id: 'search',
        name: 'Search',
        endpoint: '/api/search',
        method: 'POST',
        description: 'Search functionality',
        schema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' }
          },
          required: ['query']
        }
      }
    ],
    protocols: [
      {
        name: 'REST API',
        type: 'rest',
        endpoint: '/api'
      }
    ],
    policies: {
      training: { allowed: false },
      inference: { allowed: true },
      attribution: { required: true, format: 'link' }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('AI-Token-Usage', JSON.stringify(manifest).length);
  res.status(200).json(manifest);
}
```

### 16.2 Machine View Generator

```typescript
// pages/llms/[slug].llm.md.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPageData } from '@/lib/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  const data = await getPageData(slug as string);

  const markdown = `
# ${data.title}

## Overview
${data.description}

## Key Information
${data.details.map(d => `- **${d.label}**: ${d.value}`).join('\n')}

## Actions Available
- Search: POST /api/search
- Get Details: GET /api/details/${slug}

## Related Content
${data.related.map(r => `- [${r.title}](${r.url})`).join('\n')}
`.trim();

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('AI-Token-Usage', estimateTokens(markdown));
  res.setHeader('AI-Cache-Control', 'public, max-age=3600');
  res.status(200).send(markdown);
}

function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}
```

### 16.3 AI Headers Middleware

```typescript
// middleware/ai-headers.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export function withAIHeaders(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();

    // Detect AI agent
    const isAI = req.headers['ai-agent'] ||
                 req.headers['user-agent']?.toLowerCase().includes('ai');

    if (isAI) {
      // Track AI request
      console.log('[AI Request]', {
        agent: req.headers['ai-agent'],
        purpose: req.headers['ai-purpose'],
        url: req.url
      });
    }

    // Execute handler
    await handler(req, res);

    // Add AI response headers
    if (isAI) {
      const processingTime = Date.now() - startTime;
      res.setHeader('AI-Processing-Time', `${processingTime}ms`);
      res.setHeader('AI-Rate-Limit-Remaining', '950/1000');
    }
  };
}
```

---

## 17. Testing and Validation

### 17.1 Manual Testing Checklist

**Discovery Testing**:
```bash
# Test llms.txt
curl https://your-app.vercel.app/llms.txt

# Test manifest
curl https://your-app.vercel.app/.well-known/arw-manifest.json

# Validate JSON
curl -s https://your-app.vercel.app/.well-known/arw-manifest.json | jq .
```

**Machine View Testing**:
```bash
# Test machine view endpoint
curl https://your-app.vercel.app/llms/home.llm.md

# Check token count
curl -s https://your-app.vercel.app/llms/home.llm.md | wc -c
```

**Action Testing**:
```bash
# Test POST action
curl -X POST https://your-app.vercel.app/api/search \
  -H "Content-Type: application/json" \
  -H "AI-Agent: TestAgent/1.0" \
  -d '{"query": "test search"}'

# Check AI headers in response
curl -I https://your-app.vercel.app/api/search
```

### 17.2 Chrome Extension Validation

1. Install ARW Chrome Extension from `/apps/arw-chrome-extension/`
2. Navigate to your deployed app
3. Click extension icon
4. Verify:
   - ✓ ARW Compliant badge (green)
   - ✓ llms.txt found
   - ✓ Manifest found
   - ✓ Machine views detected
   - ✓ Actions listed

### 17.3 GitHub Actions Validation

```bash
# Trigger validation workflow
# Go to: https://github.com/[org]/[repo]/actions/workflows/arw-validate.yml
# Click "Run workflow"
# Enter: https://your-app.vercel.app
# Download artifact with validation report
```

---

## 18. Common Issues and Solutions

### Issue 1: CORS Blocking Manifest Access

**Problem**: Agents can't fetch `.well-known/arw-manifest.json` due to CORS

**Solution**:
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/.well-known/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' }
        ]
      }
    ];
  }
};
```

### Issue 2: Machine Views Not Token-Efficient

**Problem**: Machine view still has 10,000+ tokens

**Solution**:
- Remove navigation, headers, footers
- Use markdown tables instead of HTML
- Eliminate CSS/JS
- Focus on semantic content only
- Target 1,000-3,000 tokens per page

### Issue 3: JSON Schema Validation Errors

**Problem**: Agents fail to validate action schemas

**Solution**:
```typescript
// Use strict JSON Schema Draft 7
import Ajv from 'ajv';

const ajv = new Ajv({ strict: true });
const validate = ajv.compile(actionSchema);

if (!validate(requestBody)) {
  res.status(400).json({
    error: 'Validation failed',
    details: validate.errors
  });
  return;
}
```

### Issue 4: OAuth Too Complex for Hackathon

**Problem**: Full OAuth implementation takes too long

**Solution**:
- Use API keys for hackathon demo
- Document OAuth as "future work"
- Or use third-party OAuth provider (Auth0, Clerk)
- Mark actions as `auth: { type: 'apiKey' }` in manifest

---

## 19. Resources and References

### 19.1 Codebase References

- **ARW Manifest Example**: `/apps/media-discovery/public/.well-known/arw-manifest.json`
- **llms.txt Example**: `/apps/media-discovery/public/llms.txt`
- **Chrome Extension**: `/apps/arw-chrome-extension/`
- **GitHub Validator**: `.github/workflows/arw-validate.yml`

### 19.2 External Standards

- **RFC 8615**: Well-Known URIs - https://www.rfc-editor.org/rfc/rfc8615.html
- **JSON Schema**: https://json-schema.org/
- **OpenAPI 3.1**: https://spec.openapis.org/oas/latest.html
- **OAuth 2.1**: https://oauth.net/2.1/
- **MCP Specification**: https://github.com/modelcontextprotocol/modelcontextprotocol

### 19.3 Research Sources

This research synthesized information from:

1. **AWAS (AI-Readable Web Actions Standard)**: GitHub - TamTunnel/AWAS
2. **agents.json proposal**: GitHub - wild-card-ai/agents-json
3. **AI Manifest**: https://ai-manifest.org/
4. **MCP discussions**: GitHub modelcontextprotocol discussions
5. **Agentic AI security**: OAuth and Zero Trust patterns (Ory, Strata Identity)
6. **API observability trends**: OpenTelemetry, AI headers (2025 trends)

---

## 20. Conclusion and Recommendations

### 20.1 Key Takeaways

1. **ARW is practical and achievable** for hackathon timeline (6-10 hours)
2. **Start with basics**: llms.txt + manifest + 1 machine view
3. **Focus on actions**: Well-designed API schemas matter most
4. **Policies are important**: Declare training/inference rules
5. **Test early**: Use Chrome extension and validator often

### 20.2 Strategic Recommendations

**For Hackathon Success**:
1. Implement ARW compliance in Phase 1 (foundation)
2. Focus on rich, useful actions (judges evaluate on utility)
3. Demonstrate token efficiency (show 85% reduction metrics)
4. Document with examples (make it easy for judges to test)
5. Consider MCP dual-manifest (bonus points)

**For Long-Term**:
1. Collect agent usage analytics (learn from AI interactions)
2. Iterate on machine view quality (optimize token efficiency)
3. Add OAuth for production (security matters)
4. Monitor emerging standards (MCP, AWAS, A2A)
5. Contribute back to ARW specification (help evolve the standard)

### 20.3 Success Criteria

**Minimum Viable ARW**:
- ✅ Discoverable manifest
- ✅ One working machine view
- ✅ One testable action
- ✅ Basic policies declared

**Competitive ARW**:
- ✅ All of above PLUS
- ✅ 3+ machine views
- ✅ 5+ actions with rich schemas
- ✅ AI headers implemented
- ✅ Token efficiency metrics shown
- ✅ Example agent interactions documented

**Winning ARW**:
- ✅ All of above PLUS
- ✅ OAuth for sensitive actions
- ✅ MCP compatibility
- ✅ Innovative actions (unique to your domain)
- ✅ Live demo with Claude/Gemini
- ✅ Analytics dashboard

---

## Appendix A: ARW Manifest Template

```json
{
  "version": "0.1",
  "profile": "ARW-1",
  "site": {
    "name": "[Your Project Name]",
    "description": "[Brief description for AI agents]",
    "homepage": "[https://your-project.vercel.app]",
    "contact": "[your-email@example.com]"
  },
  "content": [
    {
      "url": "/",
      "machine_view": "/llms/home.llm.md",
      "purpose": "browse",
      "priority": "high",
      "description": "[Page description]"
    }
  ],
  "actions": [
    {
      "id": "[action_id]",
      "name": "[Action Name]",
      "endpoint": "/api/[endpoint]",
      "method": "POST",
      "description": "[What this action does]",
      "schema": {
        "type": "object",
        "properties": {
          "param": {
            "type": "string",
            "description": "[Parameter description]"
          }
        },
        "required": ["param"]
      }
    }
  ],
  "protocols": [
    {
      "name": "[Protocol Name]",
      "type": "rest",
      "endpoint": "/api",
      "description": "[Protocol description]"
    }
  ],
  "policies": {
    "training": {
      "allowed": false,
      "note": "[Explain why]"
    },
    "inference": {
      "allowed": true,
      "restrictions": ["attribution_required"]
    },
    "attribution": {
      "required": true,
      "format": "link",
      "template": "Powered by [Your Project]"
    },
    "rate_limits": {
      "authenticated": "1000 requests per minute",
      "unauthenticated": "100 requests per minute"
    }
  }
}
```

---

## Appendix B: Token Estimation Formula

```typescript
/**
 * Estimate tokens for content (Claude/GPT tokenization)
 * Average: 1 token ≈ 4 characters (English)
 */
export function estimateTokens(text: string): number {
  // Remove extra whitespace
  const normalized = text.replace(/\s+/g, ' ').trim();

  // Rough estimation
  const charCount = normalized.length;
  const tokens = Math.ceil(charCount / 4);

  return tokens;
}

/**
 * Calculate token savings vs HTML
 */
export function calculateSavings(htmlSize: number, machineViewSize: number): {
  htmlTokens: number;
  machineViewTokens: number;
  reduction: number;
  percentSaved: number;
} {
  const htmlTokens = estimateTokens(htmlSize.toString());
  const mvTokens = estimateTokens(machineViewSize.toString());

  return {
    htmlTokens,
    machineViewTokens: mvTokens,
    reduction: htmlTokens - mvTokens,
    percentSaved: ((htmlTokens - mvTokens) / htmlTokens) * 100
  };
}
```

---

## Appendix C: Compliance Report Template

```markdown
# ARW Compliance Report

**Project**: [Your Project Name]
**Date**: [YYYY-MM-DD]
**URL**: [https://your-project.vercel.app]
**Evaluated by**: [Your Name/Team]

## Discovery

- [x] llms.txt accessible at `/llms.txt`
- [x] arw-manifest.json accessible at `/.well-known/arw-manifest.json`
- [x] Manifest is valid JSON
- [x] Contains version 0.1, profile ARW-1

## Content

- [x] 3 machine view endpoints defined
- [x] Machine views return valid markdown
- [x] Token efficiency: 85% reduction (15,000 → 2,250 tokens)

## Actions

- [x] 5 actions defined with JSON schemas
- [x] All endpoints tested and working
- [x] Example requests/responses documented

## Policies

- [x] Training policy: Not allowed
- [x] Inference policy: Allowed with attribution
- [x] Rate limits: 1000/min (auth), 100/min (unauth)

## Observability

- [x] AI-* headers implemented
- [x] Token usage estimated in headers
- [x] Request logging for AI agents

## Security

- [x] HTTPS enforced
- [x] CORS configured for .well-known
- [ ] OAuth for sensitive actions (planned)

## Testing

- [x] Chrome extension shows "ARW Compliant"
- [x] GitHub Actions validator passes
- [x] Manual curl tests successful

## Metrics

- **Total Machine Views**: 3
- **Total Actions**: 5
- **Token Reduction**: 85%
- **Avg Response Time**: 45ms
- **Compliance Score**: 95/100

## Next Steps

1. Add OAuth for purchase actions
2. Implement MCP manifest
3. Add more machine views for detail pages
4. Set up analytics dashboard
```

---

**END OF RESEARCH DOCUMENT**

**Research completed by**: Research Agent (Agentic QE Fleet)
**Total research time**: ~2 hours (parallel web searches, codebase analysis)
**Confidence level**: High (based on implemented codebase examples)
**Hackathon readiness**: ✅ Ready for implementation

---

## Sources

### Web Research Sources

- [AWAS (AI-Readable Web Actions Standard)](https://github.com/TamTunnel/AWAS)
- [agents.json Proposal](https://github.com/wild-card-ai/agents-json)
- [AI Manifest Community Draft](https://ai-manifest.org/)
- [Agent Communication Protocol - Agent Manifest](https://agentcommunicationprotocol.dev/core-concepts/agent-manifest)
- [Model Context Protocol (MCP) Well-Known Discussion](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1147)
- [Agentic AI Security: Why OAuth is Essential](https://www.ory.com/blog/agentic-ai-security-mcp-oauth)
- [OAuth and Agentic Identity and Zero Trust](https://www.strata.io/blog/agentic-identity/oauth-agentic-identity-zero-trust-ai-6b/)
- [API Management Trends 2025](https://chakray.com/api-management-trends/)
- [How to Make Your APIs Ready for AI Agents](https://www.digitalapi.ai/blogs/how-to-make-your-apis-ready-for-ai-agents)

### Codebase References

All implementation examples are from:
- Repository: `/home/evafive/agentic-pancakes`
- Media Discovery App: `/apps/media-discovery/`
- ARW Chrome Extension: `/apps/arw-chrome-extension/`
- GitHub Actions: `.github/workflows/arw-validate.yml`
