# StudyLens Project Memory

## Project Overview
StudyLens is a dark-themed learning resource recommendation platform with personalized recommendations, resource browsing, and learning analytics.

## Tech Stack
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Prisma ORM + SQLite
- **Auth**: NextAuth.js v4 (email/password only, NO OAuth)
- **State**: TanStack Query
- **Animation**: Framer Motion
- **External**: YouTube API (key: AIzaSyAdqjyMZoOHADrmcymaMcOIYTqkK3Squhs)

## Design Decisions
- **Navigation**: Both sidebar (desktop) + header (mobile)
- **Resource Detail**: Separate detail page with all info + external link (opens in new tab)
- **YouTube Videos**: Both Browse page and For You page, click opens YouTube directly
- **YouTube Search**: Context-aware (by resource title + user subjects)
- **Caching**: Cache YouTube results for performance
- **Error Handling**: Toast notifications + dedicated error pages
- **Empty States**: Illustration + message + CTA button
- **Post-Sign In Redirect**: Browse page (home)
- **Incomplete Onboarding**: Banner reminder + user can explore + get recommendations with defaults

## Development Phases

### Phase 1: Foundation & Database Setup ✅
- Created Prisma schema with User, UserProfile, Resource, UserInteraction, YouTubeCache models
- Created seed script with 62 realistic resources across 6 subjects
- Set up dark theme with warm orange accent (#ec5b13)
- Created BackgroundEffects, Providers, constants.ts

### Phase 2: Authentication System ✅
- Configured NextAuth.js with credentials provider
- Created sign in/up pages with form validation
- Created Header, Footer, AppLayout components
- Set up middleware for protected routes
- Demo account: demo@studylens.com / demo123

### Phase 3: Landing Page ✅
- Hero section with stats
- Features section
- CTA section
- Footer

### Phase 4: Onboarding Flow ✅
- 3-step onboarding: Subjects, Formats, Experience/Time
- OnboardingBanner component for users who skipped
- Sidebar navigation for desktop users
- /for-you page with personalized recommendations
- Recommendations API with content-based filtering
- Profile API with stats calculation

### Phase 5: Browse Resources Page ✅
- Resource detail page at /resource/[id]
- Like/dislike/save functionality
- YouTube API integration with caching
- Similar resources recommendations
- Pagination UI
- External link opens in new tab

### Phase 6: For You (Recommendations) Page ✅
- Personalized recommendations based on user preferences
- Content-based filtering algorithm
- Recommendation reason display
- Empty state with onboarding CTA

### Phase 7: Saved Resources Page ✅
- /saved page with grid view
- Remove saved functionality
- Pagination support
- Empty state with CTA
- Saved date display

### Phase 8: Analytics Page ✅
- Learning statistics (views, likes, dislikes, saved, streak)
- Subject distribution charts with progress bars
- Resource type distribution
- Learning profile display
- Recent activity section
- Onboarding CTA for incomplete profiles

### Phase 9: Profile Page ✅
- User profile display with avatar
- Stats summary (views, likes, saved, level)
- Learning profile preferences
- Quick actions navigation
- Edit preferences link

### Phase 10: Final Polish & Testing ✅
- All pages reviewed for consistency
- Loading skeletons implemented
- All API routes verified
- Lint checks passing
- Dev server running successfully

---

## 🎉 All Critical & Moderate Issues Fixed!

### Fixed Issues (12 Total):

**Critical (5):**
1. ✅ Auto-login after registration
2. ✅ Redirect new users to onboarding
3. ✅ Form validation feedback for name field
4. ✅ Disable continue button until selection
5. ✅ Show default value for time commitment

**Moderate (6):**
6. ✅ Footer category links work
7. ✅ Password strength indicator
8. ✅ Demo account auto-submit
9. ✅ Forgot password placeholder
10. ✅ Like count optimistic update
11. ✅ Share button fallback

**Additional (1):**
12. ✅ Remove dead social/privacy/terms links

### Remaining Minor Issues (Nice to Fix):
- Loading skeleton on Profile page
- Loading skeleton on Analytics page
- Loading skeleton on Saved page
- Session storage for banner dismissal
- View count tracking

## ⚠️ KNOWN ISSUE: Preview Not Working
**Symptom:** Website shows auth error, can't preview
**Cause:** Missing `NEXTAUTH_SECRET` in `.env` file
**Fix:** Add the following to `.env`:
```
NEXTAUTH_SECRET=studylens-super-secret-key-for-development-2024
NEXTAUTH_URL=http://localhost:3000
```
**Note:** The dev server needs to be restarted after adding these variables.

## File Structure
```
src/
├── app/
│   ├── page.tsx          # Combined landing + browse
│   ├── onboarding/       # Onboarding flow
│   ├── auth/             # Sign in/up pages
│   └── api/              # API routes
├── components/
│   ├── shared/           # Header, Footer, AppLayout, etc.
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── constants.ts      # Icon mappings, gradients, names
│   ├── db.ts             # Prisma client
│   └── session.ts        # Auth helpers
└── prisma/
    └── schema.prisma     # Database schema
```

## Key Constants
- **Subjects**: programming, mathematics, science, languages, history, business
- **Types**: book, article, video
- **Experience Levels**: beginner, intermediate, advanced
- **Time Commitments**: casual, moderate, intensive
- **Formats**: books, articles, videos
- **Primary Color**: #ec5b13 (warm orange)
