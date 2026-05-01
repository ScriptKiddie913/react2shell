# The Trump of Spades - CTF Challenge Specification

## Project Overview
- **Project Name**: Trump of Spades (Online Multiplayer Card Game CTF)
- **Type**: Web CTF Challenge / Vulnerable Application
- **Core Functionality**: A trick-taking card game platform with hidden vulnerabilities leading to RCE
- **Target Users**: CTF players (medium difficulty)
- **Flag**: `STN_AI{R34CT3D_T0_SH3LL}`

## Vulnerability Chain

### Entry Point: React Source Leak
- Source maps enabled in production build
- Hidden component: `AdminReplayDebugger.jsx` bundled but not directly accessible
- Hardcoded API route in source: `/api/replay/import`

### Attack Surface: Game Replay Feature
- Replay import functionality accepts JSON game states
- Backend uses EJS template rendering with user-supplied `metadata.template`
- Client controls the template field directly

### Escalation: SSTI → RCE
- EJS template engine used unsafely: `ejs.render(metadata.template, data)`
- Player can access: `global.process.env.FLAG`
- No sandboxing on template rendering

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **State Management**: Zustand
- **Backend**: Next.js API Routes (Serverless Functions)
- **Template Engine**: EJS
- **Deployment**: Vercel

## Architecture

```
/app
├── page.tsx                    # Main game lobby
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
├── components/
│   ├── GameLobby.tsx           # Game creation/joining
│   ├── CardTable.tsx           # Active game table
│   ├── TrumpSelector.tsx       # Trump card selection
│   ├── ReplayViewer.tsx         # Replay system (vulnerable entry)
│   ├── AdminReplayDebugger.jsx  # Hidden admin component (in bundle)
│   └── ScoreBoard.tsx           # Player rankings
├── api/
│   ├── replay/
│   │   └── import.ts           # VULNERABLE: Replay import endpoint
│   ├── game/
│   │   ├── create.ts           # Game creation
│   │   ├── join.ts             # Game joining
│   │   └── state.ts            # Game state
│   └── admin/
│       └── debug.ts           # Hidden admin API (discovered via source)
├── stores/
│   └── gameStore.ts           # Zustand game state
└── lib/
    └── gameLogic.ts            # Card game logic

.vercel/
└── env                        # Environment variables (FLAG)

next.config.js                  # Source maps enabled (vulnerability)
```

## Game Features (Realistic Frontend)

1. **Lobby System**: Create/join games with room codes
2. **Card Dealing**: Server-side dealt cards
3. **Trump Selection**: Choose trump suit (Spades-themed)
4. **Replay Viewer**: Upload/import game replays
5. **Admin Panel**: Hidden "Trump Analyzer" debug tool

## Visual Design

### Color Palette
- **Primary**: `#1a1a2e` (Deep navy)
- **Secondary**: `#16213e` (Dark blue)
- **Accent**: `#e94560` (Card red)
- **Trump**: `#0f3460` (Spades black)
- **Gold**: `#f5c518` (Victory gold)
- **Text**: `#eaeaea` (Light gray)

### Typography
- **Headings**: "Playfair Display" (elegant card game feel)
- **Body**: "Source Sans Pro"
- **Monospace**: "Fira Code" (for debug/admin)

### Layout
- Card table centered with felt-texture background
- Player panels on sides
- Trump indicator prominently displayed
- Chat/replay panel in drawer

## Vulnerability Implementation Details

### 1. Source Map Exposure
```javascript
// next.config.js
const nextConfig = {
  productionBrowserSourceMaps: true,  // EXPOSED IN SOURCE
}
```

### 2. Hidden Admin Component
```javascript
// AdminReplayDebugger.jsx
// Bundled but not rendered directly
// Contains admin API endpoint references
const ADMIN_API = '/api/admin/debug';
```

### 3. SSTI Vulnerability
```typescript
// api/replay/import.ts
import ejs from 'ejs';

export async function POST(request) {
  const { metadata } = await request.json();
  
  // VULNERABLE: Unsafe template rendering
  const rendered = ejs.render(metadata.template, {
    player: currentPlayer,
    game: gameState
  });
  
  return Response.json({ result: rendered });
}
```

### 4. Environment Variable
```
FLAG=STN_AI{R34CT3D_T0_SH3LL}
```

## Difficulty Tuning

### Hints (Subtle)
- Source map comment in main bundle: `//# sourceMappingURL=`
- Replay UI hint: "Advanced players use custom templates"
- Error message hint: "Template rendering failed"
- JS comment: "// TODO: sandbox template input"

### Not Obvious
- No obvious "SSTI" or "RCE" keywords
- Template field named "template" not obvious initially
- Needs React devtools/bundle analysis

## Acceptance Criteria

1. ✅ App loads as legitimate card game
2. ✅ Source maps exposed in production build
3. ✅ Hidden admin component in bundle
4. ✅ Replay import endpoint accepts arbitrary JSON
5. ✅ EJS renders user-supplied template unsafely
6. ✅ Flag retrievable via SSTI payload
7. ✅ Vercel-deployable (serverless compatible)
8. ✅ No external dependencies beyond package.json
