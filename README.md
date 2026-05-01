# 🎴 The Trump of Spades - CTF Challenge

## Challenge Overview

A medium-difficulty web CTF challenge themed around an online multiplayer trick-taking card game. The application appears as a legitimate card game platform but contains a chain of vulnerabilities leading from frontend analysis to environment variable exfiltration.

**Flag:** `STN_AI{R34CT3D_T0_SH3LL}`

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **State Management**: Zustand
- **Backend**: Next.js API Routes (Serverless)
- **Template Engine**: EJS
- **Deployment**: Vercel

---

## 🔥 Vulnerability Chain

### 1. React Source Leak (Entry Point)
- Source maps are enabled in production build (`.map` files generated)
- A hidden admin component `AdminReplayDebugger.jsx` is bundled but not rendered directly
- Contains hardcoded API route references: `/api/replay/import`

### 2. Game Replay Feature (Attack Surface)
- Replay import accepts JSON game states
- `metadata.template` field is passed to template renderer

### 3. SSTI → RCE
- Backend uses EJS unsafely: `ejs.render(metadata.template, data)`
- Player can inject template code to access `global.process.env.FLAG`

---

## 💡 Hint System

If players get stuck, provide these progressive hints:

### Hint 1: Source Map Discovery
> The production build includes source maps. Check the network tab for `.map` files or look at the main JS bundle for source references.

### Hint 2: Hidden Admin Component
> There's a "Trump Analyzer" component hidden in the bundle. Look for admin API endpoints in the JavaScript.

### Hint 3: Template Field
> The replay system accepts a `metadata.template` field. Try injecting template syntax to see what happens.

### Hint 4: Environment Access
> In the EJS template, you can access process globals. Try `<%= process.env.FLAG %>` or equivalent to read the flag.

---

## 📋 Intended Solve Path

1. **Inspect React app** → Find source maps in network tab
2. **Discover hidden replay import feature** → Look at admin component references
3. **Analyze replay JSON structure** → Find `metadata.template` field
4. **Inject SSTI payload** → Send customized JSON with template:
   ```json
   {
     "players": ["Alice", "Bob"],
     "moves": [],
     "metadata": {
       "template": "<%= process.env.FLAG %>"
     }
   }
   ```
5. **Extract flag** → Receive flag in response

---

## 🏁 Deployment (Vercel)

### Environment Variables
Set in Vercel dashboard:
- `FLAG` = `STN_AI{R34CT3D_T0_SH3LL}`

### Deploy
```bash
npm install
npm run build
vercel deploy --prod
```

Or connect repository to Vercel for automatic deployment.

---

## 🎮 Game Features

- **Lobby System**: Create/join games with 4-character room codes
- **Card Dealing**: Server-managed deck distribution
- **Trump Selection**: Choose your dominant suit (Spades, Hearts, Clubs, Diamonds)
- **Replay Viewer**: Import/export game replays
- **Admin Panel**: Hidden "Trump Analyzer" debug tool (bundled but not rendered)

---

## ⚠️ Misconfigurations

- Source maps exposed in production
- No sandboxing on template rendering
- API routes not properly secured
- Debug error messages leak stack traces

---

## 📝 Author Writeup

### Exploitation Walkthrough

1. **Initial Reconnaissance**
   - Build the app and deploy to Vercel
   - Open browser DevTools → Network tab
   - Observe `.map` files being loaded with JS bundles

2. **Source Map Analysis**
   - Download main JS bundle source map
   - Search for "AdminReplayDebugger" or "API"
   - Find `/api/replay/import` and `/api/admin/debug` endpoints

3. **Replay Import Discovery**
   - Go to Replay viewer feature
   - Intercept request to `/api/replay/import`
   - Notice `metadata.template` field is accepted

4. **SSTI Injection**
   - Send request with template payload:
   ```json
   {
     "players": ["test"],
     "moves": [],
     "metadata": {
       "template": "<%= global.process.env.FLAG %>"
     }
   }
   ```
   - The server renders the EJS template
   - Flag is returned in response!

5. **Alternative**
   - Use admin debug endpoint `/api/admin/debug`
   - Send `{"command": "env"}` to try direct environment access
   
---

## 🔧 Files Structure

```
/app
├── page.tsx                    # Main game lobby
├── layout.tsx                  # Root layout
├── globals.css                 # Card game styling
├── components/
│   ├── GameLobby.tsx           # Create/join games
│   ├── CardTable.tsx           # Active card table
│   ├── ReplayViewer.tsx       # Replay import feature
│   ├── AdminReplayDebugger.tsx  # Hidden admin (bundled)
│   └── ScoreBoard.tsx           # Player rankings
├── api/
│   ├── replay/
│   │   └── import.ts           # VULNERABLE endpoint
│   └── admin/
│       └── debug.ts           # Hidden debug API
├── stores/
│   └── gameStore.ts           # Zustand state
└── lib/
    └── gameLogic.ts          # Card game logic
```

---

## ✅ Acceptance Criteria

- [x] App loads as legitimate card game
- [x] Source maps exposed in production build
- [x] Hidden admin component in bundle
- [x] Replay import accepts arbitrary JSON
- [x] EJS renders user template unsafely
- [x] Flag retrievable via SSTI payload
- [x] Vercel-deployable

---

## ⚙️ Troubleshooting

### Build Errors
If you see module errors, install dependencies:
```bash
npm install
```

### TypeScript Errors
These are just IDE warnings - the project builds and runs correctly.

### Vercel Deployment
Make sure to set the `FLAG` environment variable in Vercel dashboard before deploying.

---

Good luck and happy hacking! 🎴
