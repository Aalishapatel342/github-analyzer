# GitScope — GitHub Profile Analyzer

A sleek, dark-themed GitHub profile analyzer built with vanilla HTML, CSS, and JavaScript. Analyzes any GitHub user's profile including languages, repositories, contribution activity, and generates an AI-powered developer profile using Claude.

## Features

- **Profile Overview** — avatar, bio, location, company, blog, Twitter
- **Key Metrics** — repos, stars, forks, followers at a glance
- **Language Breakdown** — most-used languages ranked by repo count with GitHub colors
- **Top Repositories** — highest-starred repos with descriptions and stats
- **AI Developer Profile** — Claude generates a personalized 3-4 sentence insight
- **Activity Chart** — repo activity across the last 12 months
- **Keyboard Shortcuts** — press `/` to focus search, `Enter` to analyze
- **URL Params** — share links like `index.html?user=torvalds`
- **Responsive** — works on mobile, tablet, and desktop

## Tech Stack

- Pure HTML + CSS + JavaScript (no build step, no framework)
- GitHub REST API v3 (public, no auth required for basic usage)
- Anthropic Claude API (for AI developer profiles)

## Project Structure

```
github-analyzer/
├── index.html          # Main page
├── css/
│   └── style.css       # All styles (dark terminal aesthetic)
├── js/
│   ├── colors.js       # GitHub language color palette
│   ├── github.js       # GitHub API fetching & data processing
│   ├── ai.js           # Claude AI integration
│   ├── render.js       # DOM rendering functions
│   └── app.js          # Main controller & event handling
├── assets/
│   └── favicon.svg     # Site icon
└── README.md
```

## Setup & Running

### Option 1 — Open directly (simplest)
Just open `index.html` in your browser. No server needed for most features.

> **Note**: The AI Developer Profile feature requires the Anthropic API. If running locally without a proxy, this feature will show an error — everything else works fine.

### Option 2 — Local server (recommended)
```bash
# Python
python3 -m http.server 8080

# Node.js (if you have npx)
npx serve .

# Then open: http://localhost:8080
```

### Option 3 — Deploy to GitHub Pages
1. Push this folder to a GitHub repo
2. Go to **Settings → Pages → Source → main branch**
3. Your analyzer will be live at `https://yourusername.github.io/github-analyzer/`

## GitHub API Rate Limits

The GitHub API allows **60 requests/hour** without authentication. Each analyze click uses **2 requests** (user + repos). To get 5,000/hour:

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) (no scopes needed for public data)
2. In `js/github.js`, add it to the headers:
```js
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  Authorization: 'Bearer YOUR_TOKEN_HERE',  // add this line
};
```

## Anthropic API

The AI feature calls the Anthropic API directly from the browser. This works in the Claude.ai artifact environment. For a standalone deployment, you'll need a backend proxy to keep your API key secure.

### Simple Node.js proxy (optional)
```js
// proxy.js
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('.'));

app.post('/api/ai', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  });
  res.json(await response.json());
});

app.listen(3000);
```
Then update `AI_URL` in `js/ai.js` to `/api/ai`.

## Customization

- **Colors**: Edit CSS variables in `css/style.css` under `:root`
- **Suggestion chips**: Edit the `sugg-chip` buttons in `index.html`
- **Repo limit**: Change `getTopRepos(repos, 5)` in `js/app.js`
- **Language limit**: Change `.slice(0, 10)` in `js/app.js`
- **AI prompt**: Customize the prompt in `js/ai.js`

## License
MIT — free to use, modify, and deploy.
"# github-analyzer" 
"# github-analyzer" 
