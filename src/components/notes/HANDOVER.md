I'll perform a complete, fresh read of the entire codebase now. Let me systematically examine everything.
The NoteEditor and NoteCard components **DO exist**. Let me continue reading all key files to provide a complete handover document:
Now I have a complete picture of the codebase. Let me compile the complete handover document:

---

# 📋 PROJECT HANDOVER DOCUMENT: StudyLens

## 1. PROJECT ARCHITECTURE & ROUTING

### Tech Stack
| Layer | Technology |
|-------|-------------|
| Framework | Next.js 16.1.1 (App Router, Turbopack) |
| Language | TypeScript |
| Database | SQLite via Prisma ORM |
| Auth | NextAuth.js v4 (Credentials provider) |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI primitives (shadcn/ui pattern) |
| AI | NVIDIA AI API (Llama 3.1 405B) |
| Spaced Repetition | ts-fsrs (FSRS-5 algorithm) |

### Core Architecture

**Data Flow:**
```
User Action → Page Component (Client) → API Route (Server) → Prisma → SQLite → Response
                                      ↘ External API → Cache Table → Response
```

**Key Architectural Patterns:**
1. **Server Components by Default** - Pages fetch data via API routes
2. **Client Components for Interactivity** - `"use client"` directive for stateful UI
3. **Route Groups** - Auth routes separated, protected by middleware
4. **API Response Caching** - External API results cached in dedicated tables (24h TTL)

### Routing Structure

| Path | Page | Protected | Description |
|------|------|-----------|-------------|
| `/` | Dashboard/Landing | Conditional | Dashboard if auth, Landing if not |
| `/browse` | Browse Resources | ❌ Public | Search resources from all sources |
| `/for-you` | AI Recommendations | ✅ Auth | Personalized suggestions |
| `/saved` | Saved Resources | ✅ Auth | Bookmarked items |
| `/review` | Review Inbox | ✅ Auth | Spaced repetition queue |
| `/review/history` | Review History | ✅ Auth | Past reviews |
| `/analytics` | Learning Analytics | ✅ Auth | Stats and progress |
| `/notes` | Personal Notes | ✅ Auth | Knowledge base |
| `/tutor` | AI Tutor | ✅ Auth | Chat interface |
| `/profile` | User Profile | ✅ Auth | Settings |
| `/onboarding` | Preferences Setup | ✅ Auth | First-time setup |
| `/resource/[id]` | Resource Detail | ❌ Public | Single resource view |
| `/auth/signin` | Sign In | ❌ Public | Login form |
| `/auth/signup` | Sign Up | ❌ Public | Registration form |

### External APIs (8 Sources)

| Source | Type | Auth Required | Cache Table |
|--------|------|---------------|-------------|
| YouTube | youtube | API Key | YouTubeCache |
| Open Library | openlibrary | None | OpenLibraryCache |
| Wikipedia | wikipedia | None | WikipediaCache |
| ArXiv | arxiv | None | ArxivCache |
| Project Gutenberg | gutenberg | None | GutenbergCache |
| Hacker News | hackernews | None | HackerNewsCache |
| Dev.to | devto | None | DevToCache |
| GitHub | github | PAT | GitHubCache |

**Data Merging:** Round-robin interleaving algorithm ensures fair distribution across sources.

---

## 2. THE NOTEEDITOR AND NOTECARD COMPONENTS

### ✅ CLARIFICATION: These components EXIST in the codebase!

**Files Verified Present:**
- `/src/components/notes/note-editor.tsx` (399 lines)
- `/src/components/notes/note-card.tsx` (281 lines)
- `/src/components/notes/index.ts` (exports both)

### NoteEditor Component

**Location:** `src/components/notes/note-editor.tsx`

**Props:**
```typescript
interface NoteEditorProps {
  note: Note | null        // null = create mode, object = edit mode
  onSave: (savedNote: Note) => void
  onClose: () => void
}
```

**Features:**
- Modal overlay with backdrop click-to-close
- Form validation (title + content required)
- Color picker (cyan, lime, orange, purple, pink, white)
- Tag input (comma-separated, parsed as JSON array)
- Resource linking (dropdown select from database)
- Keyboard shortcuts (Esc to close, Cmd+S to save)
- Loading state with spinner

### NoteCard Component

**Location:** `src/components/notes/note-card.tsx`

**Props:**
```typescript
interface NoteCardProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
}
```

**Features:**
- Displays title, truncated content (200 chars), tags
- Pin indicator (top-right corner)
- Linked resource display (with subject/type badges)
- AI summary display (if available)
- Relative timestamp ("2 hours ago")
- Action buttons: Edit, Pin/Unpin, Delete
- Delete confirmation dialog (AlertDialog)
- Color-coded borders and accents

---

## 3. ENVIRONMENT VARIABLES

### Required Variables

```env
# Database
DATABASE_URL=file:/path/to/your/database.db

# NextAuth.js (REQUIRED for authentication)
NEXTAUTH_SECRET=your-random-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# YouTube Data API (OPTIONAL - enables YouTube search)
YOUTUBE_API_KEY=your-youtube-api-key

# GitHub Personal Access Token (OPTIONAL - increases rate limit from 10/min to 5000/hour)
GITHUB_TOKEN=ghp_your-personal-access-token

# NVIDIA AI API (REQUIRED for AI Tutor feature)
NVIDIA_API_KEY=nvapi-your-nvidia-api-key
```

### What Each Variable Connects To

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | SQLite | Main database connection |
| `NEXTAUTH_SECRET` | NextAuth.js | JWT signing key |
| `NEXTAUTH_URL` | NextAuth.js | Base URL for callbacks |
| `YOUTUBE_API_KEY` | Google/YouTube | Search YouTube videos |
| `GITHUB_TOKEN` | GitHub API | Search GitHub repositories |
| `NVIDIA_API_KEY` | NVIDIA AI | Llama 3.1 405B for AI Tutor |

### ⚠️ Current Issue
The `.env` file in the codebase only contains:
```
DATABASE_URL=file:/home/z/my-project/db/custom.db
```
**This will cause `NO_SECRET` errors!** Add the missing variables to run the project.

---

## 4. KNOWN INCOMPLETE FEATURES

### A. External Resource Interactions (Partially Implemented)

**What Works:**
- External resources display in browse page
- Links open in new tabs to external URLs

**What Doesn't Work Yet:**
- Browse page (`/browse`) still hides bookmark/like buttons for external resources
- Uses old pattern: `{!isExternal && (...)}` to hide buttons
- Users see toast: "YouTube resources cannot be saved"

**What EXISTS to Fix This:**
- `/api/resources/external/save/route.ts` - Fully implemented POST/DELETE
- `/api/resources/external/rate/route.ts` - Fully implemented POST
- Creates Resource records with `externalId` and `externalUrl` fields
- Creates UserInteraction and ReviewCard records

**Fix Required:** Update `src/app/browse/page.tsx` to:
1. Import `externalTypes` from constants
2. Show bookmark/like buttons for external resources
3. Call `/api/resources/external/save` and `/api/resources/external/rate` for external items
4. Pass full resource data in request body

### B. Notes AI Summary Field

**Status:** Field exists but never populated

**Schema:**
```prisma
model Note {
  summary String?  // AI-generated 1-2 sentence summary
}
```

**Missing:** No code generates summaries. Would require NVIDIA API integration to auto-summarize note content.

### C. User Image Field

**Status:** Field exists but never populated

**Schema:**
```prisma
model User {
  image String?
}
```

**Missing:** No OAuth integration or image upload. Working as designed for future expansion.

### D. Resource Detail Page External Handling

**Location:** `/resource/[id]/page.tsx`

**Issue:** Does not handle external resources (IDs like `yt-xxx`, `gh-xxx`)

**Current Behavior:** Will fail to find resource in database

**Fix Required:** 
- Check if `id` starts with external prefix
- If external, either:
  - Redirect to `externalUrl`
  - Or fetch from cache/create temporary Resource object

### E. TypeScript Type Safety Issues

**Location:** `src/app/api/notes/route.ts:22`

```typescript
const where: any = {  // ← Uses `any` type
  userId: user.id,
}
```

**Should be:**
```typescript
import { Prisma } from "@prisma/client"
const where: Prisma.NoteWhereInput = {
  userId: user.id,
}
```

### F. Missing Tutor Page Entry Point

**Status:** Route exists (`/tutor`) but not in sidebar navigation

**Files Exist:**
- `src/app/tutor/page.tsx`
- `src/components/tutor/tutor-chat.tsx`
- `src/components/tutor/index.ts`

**Missing:** Add to `sidebarItems` in `src/components/shared/app-layout.tsx`

---

## 5. DATABASE SCHEMA SUMMARY

### Core Tables

| Table | Purpose |
|-------|---------|
| `User` | User accounts (credentials auth) |
| `UserProfile` | Learning preferences (subjects, formats, etc.) |
| `Resource` | Learning content (books, videos, articles) |
| `UserInteraction` | Likes, saves, views per user/resource |
| `ReviewCard` | FSRS spaced repetition state |
| `ReviewLog` | Review history for analytics |
| `Note` | Personal knowledge base |
| `TutorConversation` | AI chat sessions |
| `TutorMessage` | Individual chat messages |

### Cache Tables (8)

Each external API has its own cache table:
- `YouTubeCache`, `OpenLibraryCache`, `WikipediaCache`, `ArxivCache`
- `GutenbergCache`, `HackerNewsCache`, `DevToCache`, `GitHubCache`

---

## 6. QUICK START GUIDE

```bash
# 1. Install dependencies
bun install

# 2. Set up environment variables
cp .env.example .env  # Then edit with your values

# 3. Initialize database
bun run db:push

# 4. Run development server
bun run dev

# 5. Open http://localhost:3000
```

---

## 7. FILE STRUCTURE REFERENCE

```
src/
├── app/
│   ├── api/
│   │   ├── analytics/route.ts
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── dashboard/route.ts
│   │   ├── notes/[id]/route.ts
│   │   ├── notes/route.ts
│   │   ├── profile/onboarding/route.ts
│   │   ├── profile/route.ts
│   │   ├── recommendations/route.ts
│   │   ├── resources/[id]/rate/route.ts
│   │   ├── resources/[id]/route.ts
│   │   ├── resources/[id]/save/route.ts
│   │   ├── resources/external/rate/route.ts
│   │   ├── resources/external/save/route.ts
│   │   ├── resources/route.ts
│   │   ├── review/[id]/route.ts
│   │   ├── review/history/route.ts
│   │   ├── review/route.ts
│   │   ├── saved/route.ts
│   │   └── tutor/route.ts
│   ├── auth/
│   ├── browse/page.tsx
│   ├── for-you/page.tsx
│   ├── notes/page.tsx
│   ├── onboarding/page.tsx
│   ├── profile/page.tsx
│   ├── resource/[id]/page.tsx
│   ├── review/
│   │   ├── page.tsx
│   │   └── history/page.tsx
│   ├── saved/page.tsx
│   ├── tutor/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── notes/
│   │   ├── note-card.tsx
│   │   ├── note-editor.tsx
│   │   └── index.ts
│   ├── shared/
│   │   ├── app-layout.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── onboarding-banner.tsx
│   │   ├── providers.tsx
│   │   └── index.ts
│   ├── tutor/
│   │   ├── tutor-chat.tsx
│   │   └── index.ts
│   └── ui/ (shadcn components)
├── lib/
│   ├── auth.ts
│   ├── constants.ts
│   ├── db.ts
│   ├── external-apis.ts
│   ├── fsrs.ts
│   ├── nvidia-ai.ts
│   ├── session.ts
│   ├── stats.ts
│   └── utils.ts
└── middleware.ts
```

---

**End of Handover Document**