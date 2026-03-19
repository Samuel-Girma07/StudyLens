# StudyLens - Complete Project Context

**Backup Date:** 2026-03-17 13:45:05
**Status:** Working Version - All Fixes Applied

---

## Project Overview

**StudyLens** is an AI-powered learning resource platform built with:
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM + SQLite
- **Auth:** NextAuth.js v4
- **Design:** Glossy Brutalist (Electric Cyan #00FFFF, Electric Lime #CCFF00)

---

## External APIs (8 Sources - All Operational)

| # | Source | Type | Auth | Rate Limit |
|---|--------|------|------|------------|
| 1 | YouTube | `youtube` | API Key | 10,000/day |
| 2 | Open Library | `openlibrary` | None | Unlimited |
| 3 | Wikipedia | `wikipedia` | None | Unlimited |
| 4 | ArXiv | `arxiv` | None | Unlimited |
| 5 | Gutenberg | `gutenberg` | None | Unlimited |
| 6 | Hacker News | `hackernews` | None | Unlimited |
| 7 | Dev.to | `devto` | None | Unlimited |
| 8 | GitHub | `github` | PAT | 5,000/hour |

---

## Environment Variables

```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
NEXTAUTH_SECRET=studylens-super-secret-key-for-development-2024
NEXTAUTH_URL=http://localhost:3000
YOUTUBE_API_KEY=AIzaSyAdqjyMZoOHADrmcymaMcOIYTqkK3Squhs
GITHUB_TOKEN=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
```

---

## Pages Structure

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing (unauth) / Dashboard (auth) | Partial |
| `/browse` | Browse all resources | No |
| `/saved` | User's saved resources | Yes |
| `/for-you` | AI recommendations | Yes |
| `/analytics` | Learning analytics | Yes |
| `/profile` | User profile & settings | Yes |
| `/onboarding` | Preference setup wizard | Yes |
| `/resource/[id]` | Resource detail page | No |
| `/auth/signin` | Sign in page | No |
| `/auth/signup` | Sign up page | No |

---

## Database Schema

### Core Tables
- **User** - User accounts (email, name, password)
- **UserProfile** - Learning preferences (subjects, formats, experience)
- **Resource** - Curated resources (title, description, type, subject)
- **UserInteraction** - User actions (rating, saved, viewed)

### Cache Tables (for external APIs)
- YouTubeCache, OpenLibraryCache, WikipediaCache, ArxivCache
- GutenbergCache, HackerNewsCache, DevToCache, GitHubCache

---

## Key Features

### 1. Smart Resource Distribution
- Round-robin interleaving for fair distribution across all 8 API sources
- Users see diverse results from all sources on the first page

### 2. AI-Powered Recommendations
- Personalized suggestions based on:
  - Selected subjects
  - Preferred formats
  - Past interactions (likes/dislikes)
  - Experience level

### 3. User Interactions
- Like/Dislike resources
- Save for later
- View tracking

### 4. Learning Dashboard
- Time-based greeting
- Stats overview (views, likes, saved, streak)
- Continue learning section
- Recent activity feed
- Trending resources

---

## Fixes Applied (All Sessions)

### HIGH Priority (4 Fixed)
1. ✅ Dead Filter button on /browse (removed)
2. ✅ Dead Filter button on /saved (removed)
3. ✅ Dead "New Collection" button (removed)
4. ✅ Wrong filter labels (corrected)

### MEDIUM Priority (5 Fixed)
1. ✅ Dead Privacy/Terms links in footer (removed)
2. ✅ Unused Lucide icon imports (cleaned up)
3. ✅ Fake hardcoded stats (replaced with accurate info)
4. ✅ Type safety - `any` types (fixed with proper Prisma types)
5. ✅ Console.error review (verified OK)

### LOW Priority (5 Addressed)
1. ✅ aria-pressed on onboarding toggles (added)
2. ✅ Avatar button accessible name (added aria-label)
3. ✅ Search input label (added aria-label)
4. 📝 JSON as strings (documented, no change needed)
5. 📝 User.image field (designed for OAuth, no change needed)

---

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Landing/Dashboard
│   ├── browse/page.tsx       # Browse resources
│   ├── saved/page.tsx        # Saved resources
│   ├── for-you/page.tsx      # Recommendations
│   ├── analytics/page.tsx    # Analytics
│   ├── profile/page.tsx      # User profile
│   ├── onboarding/page.tsx   # Setup wizard
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── api/
│   │   ├── resources/route.ts        # Main resource API
│   │   ├── recommendations/route.ts  # AI recommendations
│   │   ├── dashboard/route.ts        # Dashboard data
│   │   ├── profile/route.ts          # Profile data
│   │   └── saved/route.ts            # Saved resources
│   └── auth/
│       ├── signin/page.tsx
│       └── signup/page.tsx
├── components/
│   ├── shared/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── app-layout.tsx
│   │   └── providers.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── constants.ts          # Types, names, colors
│   ├── external-apis.ts      # 8 external API functions
│   ├── db.ts                 # Prisma client
│   ├── auth.ts               # NextAuth config
│   └── session.ts            # Session helpers
└── middleware.ts             # Auth middleware
```

---

## Restore Instructions

1. Copy all files from backup to project root
2. Copy database.backup to `db/custom.db`
3. Run `bun run db:generate`
4. Restart dev server

```bash
BACKUP_DIR="/home/z/my-project/backups/working-version-20260317-134505"
cp -r "$BACKUP_DIR/src/"* /home/z/my-project/src/
cp "$BACKUP_DIR/.env" /home/z/my-project/
cp "$BACKUP_DIR/prisma/schema.prisma" /home/z/my-project/prisma/
cp "$BACKUP_DIR/database.backup" /home/z/my-project/db/custom.db
bun run db:generate
```

---

## Current Status

- **Lint:** ✅ Passes (only font warning)
- **All Pages:** ✅ 200 OK
- **Dev Server:** ✅ Running on port 3000
- **All APIs:** ✅ Operational
- **Database:** ✅ SQLite working

---

## Demo Account

- Email: demo@studylens.com
- Password: demo123

---

## Notes

- External resources (YouTube, GitHub, etc.) cannot be saved/rated
- Only database resources support full interactions
- Smart interleaving ensures diverse first-page results
- Subject mapping handles various API category formats
