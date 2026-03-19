# StudyLens - Complete Project Context
## Backup Created: 2026-03-16 23:45:29

---

## 🎯 Project Overview

**StudyLens** is a comprehensive learning resource platform built with:
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM with SQLite
- **Auth**: NextAuth.js v4
- **Design**: Glossy Brutalist (Electric Cyan #00FFFF, Electric Lime #CCFF00)

---

## 📊 External APIs Integrated (8 Sources)

| # | Source | Type | Badge Color | API Key Required | Status |
|---|--------|------|-------------|------------------|--------|
| 1 | **YouTube** | `youtube` | Red | ✅ Yes | Working |
| 2 | **Open Library** | `openlibrary` | Orange | ❌ No | Working |
| 3 | **Wikipedia** | `wikipedia` | Blue | ❌ No | Working |
| 4 | **ArXiv** | `arxiv` | Purple | ❌ No | Working |
| 5 | **Project Gutenberg** | `gutenberg` | Emerald | ❌ No | Working |
| 6 | **Hacker News** | `hackernews` | Amber | ❌ No | Working |
| 7 | **Dev.to** | `devto` | Slate | ❌ No | Working |
| 8 | **GitHub** | `github` | Dark Gray | ✅ Yes | Working |

---

## 🔑 Environment Variables

```env
DATABASE_URL=file:/home/z/my-project/db/custom.db

# NextAuth.js Configuration
NEXTAUTH_SECRET=studylens-super-secret-key-for-development-2024
NEXTAUTH_URL=http://localhost:3000

# YouTube API Key
YOUTUBE_API_KEY=AIzaSyAdqjyMZoOHADrmcymaMcOIYTqkK3Squhs

# GitHub Personal Access Token (for repository search)
GITHUB_TOKEN=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
```

---

## 📁 Key Files Modified

### 1. `prisma/schema.prisma`
- Added cache tables for all external APIs
- Models: YouTubeCache, OpenLibraryCache, WikipediaCache, ArxivCache, GutenbergCache, HackerNewsCache, DevToCache, GitHubCache

### 2. `src/lib/external-apis.ts`
- Contains all API fetch functions
- Functions: fetchOpenLibraryBooks, fetchWikipediaArticles, fetchArxivPapers, fetchGutenbergBooks, fetchHackerNewsStories, fetchDevToArticles, fetchGitHubRepos
- Exports: languageColors (GitHub language color mapping)
- Helper: fetchWithTimeout (with header support for Wikipedia User-Agent)

### 3. `src/lib/constants.ts`
- Type definitions and mappings
- allTypes: ["book", "article", "video", "youtube", "openlibrary", "wikipedia", "arxiv", "gutenberg", "hackernews", "devto", "github"]
- externalTypes: ["youtube", "openlibrary", "wikipedia", "arxiv", "gutenberg", "hackernews", "devto", "github"]
- typeNames, typeIcons for UI display

### 4. `src/app/api/resources/route.ts`
- Main API route for fetching resources
- Smart interleaving function for fair distribution
- Round-robin algorithm: YouTube → GitHub → Dev.to → Hacker News → Open Library → Wikipedia → ArXiv
- 3 results per API (increased from 2)

### 5. `src/app/browse/page.tsx`
- Browse page UI with external resource support
- GitHub-specific UI: language badge with color, stars, forks
- External resource badges and icons

---

## 🔄 Smart Resource Distribution Algorithm

```typescript
// Round-robin interleaving for fair distribution
function interleaveResources(
  dbResources: unknown[],
  sourceArrays: { name: string; items: unknown[] }[]
): unknown[] {
  const result: unknown[] = []
  const maxLength = Math.max(dbResources.length, ...sourceArrays.map(s => s.items.length))
  
  // First, add database resources (highest priority - curated content)
  result.push(...dbResources)
  
  // Then interleave external sources in round-robin fashion
  for (let i = 0; i < maxLength; i++) {
    for (const source of sourceArrays) {
      if (source.items[i]) {
        result.push(source.items[i])
      }
    }
  }
  
  return result
}
```

---

## 🎨 GitHub UI Features

When displaying GitHub repositories:
1. **Language Badge** - Colored dot + language name (e.g., 🔵 Python, 🟡 JavaScript)
2. **Stars Count** - ⭐ 194,198
3. **Forks Count** - 🍴 75,250
4. **Owner Avatar** - Shown as thumbnail
5. **"View on GitHub"** - Action button

### Language Colors (from external-apis.ts):
```typescript
export const languageColors: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#239120",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  // ... and more
}
```

---

## 📊 Example Search Results

For "machine learning" search (20 results):
```
 1. [youtube     ] Machine Learning for Everybody – Full Course
 2. [github      ] tensorflow/tensorflow
 3. [devto       ] I Think a Lot of Developers Are Quietly Grieving
 4. [hackernews  ] Machine Learning Crash Course
 5. [openlibrary ] Why Machines Learn
 6. [wikipedia   ] Machine learning
 7. [arxiv       ] Changing Data Sources in the Age of Machine L
 8. [youtube     ] Machine Learning | What Is Machine Learning?
 9. [github      ] huggingface/transformers
10. [devto       ] Meme Monday
11. [hackernews  ] Machine Learning 101 slidedeck
12. [openlibrary ] The Time Machine
13. [wikipedia   ] Attention (machine learning)
14. [arxiv       ] DOME: Recommendations for supervised machine
15. [youtube     ] Machine Learning Explained in 100 Seconds
16. [github      ] microsoft/ML-For-Beginners
...
```

---

## 🛠️ Commands to Restore

If anything breaks, restore files from backup:

```bash
BACKUP_DIR="/home/z/my-project/backups/github-integration-complete-20260316-234529"

# Restore all files
cp "$BACKUP_DIR/env.backup" /home/z/my-project/.env
cp "$BACKUP_DIR/schema.prisma" /home/z/my-project/prisma/schema.prisma
cp "$BACKUP_DIR/external-apis.ts" /home/z/my-project/src/lib/external-apis.ts
cp "$BACKUP_DIR/constants.ts" /home/z/my-project/src/lib/constants.ts
cp "$BACKUP_DIR/resources-route.ts" /home/z/my-project/src/app/api/resources/route.ts
cp "$BACKUP_DIR/browse-page.tsx" /home/z/my-project/src/app/browse/page.tsx

# Regenerate Prisma client and push schema
cd /home/z/my-project
bun run db:push
```

---

## 🧪 Testing Commands

```bash
# Test GitHub API specifically
curl -s "http://localhost:3000/api/resources?q=machine+learning&type=github&limit=3"

# Test all external APIs together
curl -s "http://localhost:3000/api/resources?q=javascript&limit=20"

# Check fair distribution
curl -s "http://localhost:3000/api/resources?q=python&limit=20" | python3 -c "
import sys, json
data = json.load(sys.stdin)
types = {}
for r in data['resources']:
    types[r['type']] = types.get(r['type'], 0) + 1
print('Source distribution:')
for k, v in sorted(types.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v}')
"
```

---

## 📝 Important Notes

1. **Wikipedia API** requires User-Agent header (implemented in fetchWithTimeout)
2. **GitHub API** has 10 req/min limit without token, 5,000 req/hour with token
3. **ArXiv API** returns XML (custom parser implemented)
4. **Gutenberg API** URL is `gutendex.com` (not `gutendx.com`)
5. **All cache tables** have 24-hour expiration

---

## 🔧 Project Structure

```
/home/z/my-project/
├── .env                          # Environment variables (API keys)
├── prisma/
│   └── schema.prisma             # Database schema with cache tables
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── resources/
│   │   │       └── route.ts      # Main API with interleaving
│   │   └── browse/
│   │       └── page.tsx          # Browse page UI
│   └── lib/
│       ├── constants.ts          # Types, icons, names
│       └── external-apis.ts      # All API fetch functions
├── backups/
│   └── github-integration-complete-20260316-234529/
│   ├── PROJECT_CONTEXT.md        # This file
│   ├── env.backup
│   ├── schema.prisma
│   ├── external-apis.ts
│   ├── constants.ts
│   ├── resources-route.ts
│   └── browse-page.tsx
└── dev.log                       # Development server logs
```

---

## ✅ Completed Tasks

1. ✅ Integrated 8 external APIs (YouTube, Open Library, Wikipedia, ArXiv, Gutenberg, Hacker News, Dev.to, GitHub)
2. ✅ Added cache tables for all APIs
3. ✅ Implemented smart round-robin interleaving for fair distribution
4. ✅ Created GitHub-specific UI with language colors, stars, forks
5. ✅ Added User-Agent header for Wikipedia API
6. ✅ Increased results per API from 2 to 3
7. ✅ All APIs tested and working
8. ✅ Backup created

---

## 🚀 Next Steps (Future Enhancements)

1. Consider adding Crossref API for academic papers (business/economics coverage)
2. Add user preferences for preferred sources
3. Implement source-specific filtering on browse page
4. Add loading skeletons for each source type
5. Implement error boundaries for individual API failures

---

**Backup Created By**: AI Assistant
**Date**: March 16, 2026
**Status**: All systems operational
