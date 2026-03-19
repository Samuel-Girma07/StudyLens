# Dashboard Design Plan - StudyLens

## Overview

The current `/` (Browse) page shows resources for authenticated users, but it lacks the characteristics of a proper **dashboard**. This document outlines a new Dashboard page design that serves as the **central hub** for users after login.

---

## Current Page Structure

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` (guest) | Marketing hero, features, CTA |
| Browse | `/` (auth) | Resource grid with search/filters |
| For You | `/for-you` | AI recommendations |
| Analytics | `/analytics` | Detailed learning stats |
| Saved | `/saved` | Saved resources |
| Profile | `/profile` | User settings |

---

## Proposed Changes

### Option A: New Dashboard Route (Recommended)

Create a dedicated `/dashboard` route that becomes the **default landing page** for authenticated users.

**Route Structure:**
- `/` (guest) → Landing Page
- `/` (auth) → **Redirect to `/dashboard`**
- `/dashboard` → **New Dashboard Page**
- `/browse` → Browse Resources (move current Browse component here)

### Option B: Replace Home with Dashboard

Keep `/` as dashboard and move Browse to `/browse`.

---

## Dashboard Components

### 1. Welcome Header Section
```
┌──────────────────────────────────────────────────────────────┐
│  [AI] / Welcome                                              │
│                                                              │
│  Good morning, Alex! ──────────────────────────────────────  │
│  │                                                          │
│  │  Ready to continue your learning journey?                │
│  │  You've been active for 5 days in a row! 🔥              │
│  │                                                          │
│  └──────────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Time-based greeting (Good morning/afternoon/evening)
- User's first name
- Motivational message or streak indicator
- Tag: "AI" or "Dashboard"

---

### 2. Quick Stats Row (4 Cards)
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ [👁️ Views]  │ │ [👍 Likes]  │ │ [📌 Saved]  │ │ [🔥 Streak] │
│             │ │             │ │             │ │             │
│     42      │ │     18      │ │      7      │ │     5       │
│  Resources  │ │  Given      │ │  For later  │ │  Day streak │
│  viewed     │ │             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Design:**
- Compact cards with icons
- Accent colors: Cyan for views/saved, Lime for likes, Orange for streak
- Brutalist shadow on icons
- Monospace labels

---

### 3. Continue Learning Section
```
┌──────────────────────────────────────────────────────────────┐
│  [▶️] Continue Learning                      [View All →]    │
│  ─────────────────────────────────────────────────────────── │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  [IMG]   │ │  [IMG]   │ │  [IMG]   │ │  [IMG]   │        │
│  │          │ │          │ │          │ │          │        │
│  │ React    │ │ Python   │ │ Calculus │ │ ML Basics│        │
│  │ Basics   │ │ for Data │ │ I        │ │          │        │
│  │          │ │          │ │          │ │          │        │
│  │ [━━━━░░] │ │ [██████]  │ │ [██░░░░] │ │ [████░░] │        │
│  │  60%     │ │  100%     │ │  30%     │ │  75%     │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Horizontal scroll or grid of recently viewed resources
- Progress indicator (if tracking is added)
- "View All" link to full history
- Resource cards with thumbnail, title, subject tag

---

### 4. AI Recommendations Preview
```
┌──────────────────────────────────────────────────────────────┐
│  [✨] Recommended For You                    [See All →]     │
│  ─────────────────────────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [IMG]  │ Based on your interest in Programming          ││
│  │        │                                                ││
│  │        │  "Advanced React Patterns"                     ││
│  │        │  by John Doe • Video • 95% match               ││
│  │        │  [👍] [📌] [Open →]                            ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [IMG]  │ Perfect for your experience level              ││
│  │        │                                                ││
│  │        │  "Data Science Fundamentals"                   ││
│  │        │  by Jane Smith • Book • 88% match              ││
│  │        │  [👍] [📌] [Open →]                            ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- 2-3 featured recommendations (not full grid)
- AI reason badge (e.g., "Based on your interests")
- Match percentage
- Quick actions (like, save, open)
- "See All" link to `/for-you`

---

### 5. Quick Actions Grid
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  [📚]       │ │  [📌]       │ │  [📊]       │ │  [⚙️]       │
│  Browse     │ │  Saved      │ │  Analytics  │ │  Profile    │
│  All        │ │  Resources  │ │  & Stats    │ │  Settings   │
│  Resources  │ │             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Elements:**
- 4 large action buttons
- Icon + label
- Hover effects with accent colors
- Direct navigation to key pages

---

### 6. Learning Goals Progress (Optional Enhancement)
```
┌──────────────────────────────────────────────────────────────┐
│  [🎯] Weekly Goals                                           │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  Resources Viewed    [████████░░] 8/10                      │
│  New Subjects        [████░░░░░░] 2/5                       │
│  Time Spent          [██████░░░░] 4h/6h                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 7. Recent Activity Feed
```
┌──────────────────────────────────────────────────────────────┐
│  [🕐] Recent Activity                                        │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  👍 Liked "Introduction to Machine Learning" • 2h ago       │
│  📌 Saved "Python Data Structures" • 5h ago                 │
│  👁️ Viewed "React Hooks Tutorial" • Yesterday               │
│  ✅ Completed "JavaScript Basics" • 2 days ago              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Timeline of recent actions
- Icons for action types
- Timestamps
- Clickable resource names

---

### 8. Trending This Week (Optional)
```
┌──────────────────────────────────────────────────────────────┐
│  [📈] Trending This Week                                     │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  1. [AI] ChatGPT Prompt Engineering Guide    [👍 234]       │
│  2. [CODE] Building REST APIs with Node.js   [👍 189]       │
│  3. [MATH] Linear Algebra for ML             [👍 156]       │
│  4. [DATA] SQL Mastery Course                [👍 142]       │
│  5. [WEB] Next.js 14 Complete Guide          [👍 128]       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Visual Design - Glossy Brutalist Style

### Color Usage
| Element | Color |
|---------|-------|
| Primary accent | Electric Cyan `#00FFFF` |
| Secondary accent | Electric Lime `#CCFF00` |
| Warning/Streak | Orange `#F97316` |
| Background | Dark `#050505`, `#0a0a0a` |
| Text | White, Slate-300, Slate-500 |

### Typography
| Element | Style |
|---------|-------|
| Page Title | Fraunces Serif, Italic, Black, 7xl-8xl |
| Section Headers | Fraunces Serif, Bold, 2xl |
| Labels | JetBrains Mono, Uppercase, Tracking-wide |
| Body | Inter, Regular |

### Components Style
- **Cards**: Glass panels with `bg-[#0a0a0a]`, border `white/10`
- **Icons**: Material Symbols Outlined
- **Buttons**: Brutalist shadows `4px 4px 0px #CCFF00`
- **Tags**: Zero border-radius, accent backgrounds
- **Progress bars**: Accent colors, zero border-radius

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│  HEADER (sticky)                                               │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WELCOME SECTION (full width)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                                  │
│  │STAT│ │STAT│ │STAT│ │STAT│  <- Quick Stats Row             │
│  └────┘ └────┘ └────┘ └────┘                                  │
│                                                                │
│  ┌──────────────────────┐ ┌───────────────────────┐           │
│  │  CONTINUE LEARNING   │ │  QUICK ACTIONS       │           │
│  │  (horizontal scroll) │ │  (2x2 grid)          │           │
│  └──────────────────────┘ └───────────────────────┘           │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI RECOMMENDATIONS (featured cards)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────┐ ┌───────────────────────┐           │
│  │  RECENT ACTIVITY     │ │  TRENDING/GOALS      │           │
│  │  (timeline)          │ │  (optional)          │           │
│  └──────────────────────┘ └───────────────────────┘           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  FOOTER (sticky bottom)                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## Required API Endpoints

### Dashboard Data API
```
GET /api/dashboard

Response:
{
  "user": {
    "name": "Alex",
    "avatar": null
  },
  "greeting": "Good morning",
  "stats": {
    "views": 42,
    "likes": 18,
    "saved": 7,
    "streak": 5
  },
  "continueLearning": [
    {
      "id": "...",
      "title": "React Basics",
      "subject": "programming",
      "progress": 0.6,
      "thumbnail": null
    }
  ],
  "recommendations": [
    {
      "id": "...",
      "title": "Advanced React Patterns",
      "author": "John Doe",
      "type": "video",
      "matchPercentage": 95,
      "reason": "Based on your interest in Programming"
    }
  ],
  "recentActivity": [
    {
      "type": "like",
      "resourceTitle": "Introduction to Machine Learning",
      "resourceId": "...",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "trending": [
    {
      "id": "...",
      "title": "ChatGPT Prompt Engineering",
      "likeCount": 234
    }
  ]
}
```

---

## Implementation Steps

### Phase 1: Route Structure
1. Create `/app/dashboard/page.tsx`
2. Create `/app/browse/page.tsx` (move Browse component)
3. Update middleware to redirect authenticated `/` to `/dashboard`
4. Update navigation links

### Phase 2: Dashboard Components
1. Welcome Section component
2. Quick Stats component
3. Continue Learning carousel
4. Quick Actions grid
5. Recommendations Preview
6. Recent Activity feed
7. Optional: Goals/Trending sections

### Phase 3: API Layer
1. Create `/api/dashboard/route.ts`
2. Aggregate data from existing endpoints
3. Add caching if needed

### Phase 4: Polish
1. Loading states with skeletons
2. Error handling
3. Empty states
4. Animations/transitions
5. Mobile responsiveness

---

## Summary

The new Dashboard will be:
- **Action-oriented**: Quick access to key features
- **Personalized**: Greeting, recommendations, progress
- **Informative**: Stats, activity, goals at a glance
- **Consistent**: Same Glossy Brutalist design as other pages
- **Distinct**: Different purpose from Browse (overview vs. exploration)

This separates concerns clearly:
- **Dashboard** = "What's my status? What should I do?"
- **Browse** = "Let me explore and find resources"
