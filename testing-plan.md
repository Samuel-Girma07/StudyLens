# StudyLens Comprehensive Testing Plan

## Overview
This document outlines a thorough testing plan to verify every feature, button, link, and functionality as if a real user is using the application.

---

## Phase A: Authentication Flow Testing

### A1. Sign Up Page (`/auth/signup`)
- [ ] **A1.1** Page loads without errors
- [ ] **A1.2** "Sign In" link navigates to `/auth/signin`
- [ ] **A1.3** Logo link navigates to `/`
- [ ] **A1.4** Form validation:
  - [ ] A1.4.1 Empty name shows error
  - [ ] A1.4.2 Invalid email format shows error
  - [ ] A1.4.3 Short password (<6 chars) shows error
  - [ ] A1.4.4 Mismatched confirm password shows error
- [ ] **A1.5** Duplicate email registration shows error
- [ ] **A1.6** Successful registration redirects to home page
- [ ] **A1.7** New user is logged in after registration

### A2. Sign In Page (`/auth/signin`)
- [ ] **A2.1** Page loads without errors
- [ ] **A2.2** "Create account" link navigates to `/auth/signup`
- [ ] **A2.3** Logo link navigates to `/`
- [ ] **A2.4** Form validation:
  - [ ] A2.4.1 Empty email shows error
  - [ ] A2.4.2 Empty password shows error
- [ ] **A2.5** Invalid credentials shows error message
- [ ] **A2.6** Successful login redirects to home page
- [ ] **A2.7** Demo account login works (`demo@studylens.com` / `demo123`)

### A3. Sign Out
- [ ] **A3.1** Header dropdown shows user info
- [ ] **A3.2** "Sign out" button logs user out
- [ ] **A3.3** After sign out, user sees landing page
- [ ] **A3.4** Mobile menu sign out works

---

## Phase B: Landing Page Testing (Unauthenticated)

### B1. Hero Section
- [ ] **B1.1** "Get Started Free" button navigates to `/auth/signup`
- [ ] **B1.2** "Sign In" button navigates to `/auth/signin`
- [ ] **B1.3** Stats display correctly (10,000+ Resources, 5,000+ Users, etc.)

### B2. Features Section
- [ ] **B2.1** Four feature cards display correctly
- [ ] **B2.2** Cards have hover effects

### B3. CTA Section
- [ ] **B3.1** "Create Your Account" button navigates to `/auth/signup`

### B4. Footer
- [ ] **B4.1** Logo link navigates to `/`
- [ ] **B4.2** Quick Links:
  - [ ] B4.2.1 "Explore Resources" navigates to `/`
  - [ ] B4.2.2 "For You" navigates to `/for-you` (redirects to signin)
  - [ ] B4.2.3 "Saved Resources" navigates to `/saved` (redirects to signin)
  - [ ] B4.2.4 "Analytics" navigates to `/analytics` (redirects to signin)
- [ ] **B4.3** Category links navigate with subject filter
- [ ] **B4.4** Social links (Github, Twitter, Linkedin) - verify they exist
- [ ] **B4.5** Privacy/Terms/Contact links exist

---

## Phase C: Header Navigation Testing

### C1. Unauthenticated Header
- [ ] **C1.1** Logo displays and navigates to `/`
- [ ] **C1.2** "Sign In" button triggers sign-in flow
- [ ] **C1.3** "Get Started" button navigates to `/auth/signup`

### C2. Authenticated Header (Desktop)
- [ ] **C2.1** Logo navigates to `/`
- [ ] **C2.2** "Explore" link navigates to `/`
- [ ] **C2.3** "For You" link navigates to `/for-you`
- [ ] **C2.4** "Saved" link navigates to `/saved`
- [ ] **C2.5** Active state shows on current page
- [ ] **C2.6** User avatar dropdown:
  - [ ] C2.6.1 Shows user name and email
  - [ ] C2.6.2 "Profile" navigates to `/profile`
  - [ ] C2.6.3 "Saved Resources" navigates to `/saved`
  - [ ] C2.6.4 "Analytics" navigates to `/analytics`
  - [ ] C2.6.5 "Sign out" logs user out

### C3. Authenticated Header (Mobile)
- [ ] **C3.1** Hamburger menu opens mobile nav
- [ ] **C3.2** X button closes mobile nav
- [ ] **C3.3** All nav items work same as desktop
- [ ] **C3.4** Mobile nav shows Profile, Analytics, Sign out

---

## Phase D: Sidebar Navigation Testing (Desktop)

### D1. Sidebar Display
- [ ] **D1.1** Sidebar visible on authenticated pages (not auth/onboarding)
- [ ] **D1.2** All nav items display correctly:
  - [ ] D1.2.1 Browse (Compass icon) → `/`
  - [ ] D1.2.2 For You (Sparkles icon) → `/for-you`
  - [ ] D1.2.3 Saved (Bookmark icon) → `/saved`
  - [ ] D1.2.4 Analytics (BarChart3 icon) → `/analytics`
  - [ ] D1.2.5 Profile (User icon) → `/profile`
- [ ] **D1.3** Active state shows on current page with accent color
- [ ] **D1.4** Hover effects work on nav items
- [ ] **D1.5** Sidebar footer shows StudyLens branding

---

## Phase E: Onboarding Flow Testing

### E1. Onboarding Access
- [ ] **E1.1** New user is redirected to onboarding after sign up
- [ ] **E1.2** Onboarding accessible via `/onboarding`
- [ ] **E1.3** Skip button redirects to home page

### E2. Step 1: Subjects Selection
- [ ] **E2.1** Page loads with 6 subject options
- [ ] **E2.2** Subject cards are clickable and toggle selection
- [ ] **E2.3** At least one subject must be selected to proceed
- [ ] **E2.4** "Continue" button enables when subject selected
- [ ] **E2.5** "Skip for now" redirects to home
- [ ] **E2.6** Selected subjects show check mark

### E3. Step 2: Formats Selection
- [ ] **E3.1** Page loads with 3 format options (Books, Articles, Videos)
- [ ] **E3.2** Format cards are clickable and toggle selection
- [ ] **E3.3** At least one format must be selected
- [ ] **E3.4** "Continue" button enables when format selected
- [ ] **E3.5** "Back" button returns to Step 1
- [ ] **E3.6** Selected formats show check mark

### E4. Step 3: Experience & Time
- [ ] **E4.1** Experience level options display (Beginner, Intermediate, Advanced)
- [ ] **E4.2** Time commitment options display (Casual, Moderate, Intensive)
- [ ] **E4.3** Experience level can be selected
- [ ] **E4.4** Time commitment can be selected
- [ ] **E4.5** "Back" button returns to Step 2
- [ ] **E4.6** "Complete Setup" saves preferences
- [ ] **E4.7** Success toast shows after completion
- [ ] **E4.8** User is redirected to home page

### E5. Onboarding Banner
- [ ] **E5.1** Banner shows for users who skipped onboarding
- [ ] **E5.2** "Set Preferences" button navigates to `/onboarding`
- [ ] **E5.3** Dismiss button hides banner (for session)
- [ ] **E5.4** Banner doesn't show after completing onboarding

---

## Phase F: Browse Page Testing

### F1. Page Load
- [ ] **F1.1** Page loads without errors for authenticated user
- [ ] **F1.2** Resources display in grid layout
- [ ] **F1.3** Loading skeleton shows while fetching
- [ ] **F1.4** Resource count displays correctly

### F2. Search Functionality
- [ ] **F2.1** Search input accepts text
- [ ] **F2.2** Search button triggers search
- [ ] **F2.3** Results update based on search query
- [ ] **F2.4** Empty results show "No resources found" message
- [ ] **F2.5** Enter key triggers search

### F3. Filter Functionality
- [ ] **F3.1** Type filter (All Types, Books, Articles, Videos)
  - [ ] F3.1.1 Selecting "Books" filters to books only
  - [ ] F3.1.2 Selecting "Articles" filters to articles only
  - [ ] F3.1.3 Selecting "Videos" filters to videos only
  - [ ] F3.1.4 Selecting "All Types" shows all
- [ ] **F3.2** Subject filter (All Subjects + 6 subjects)
  - [ ] F3.2.1 Each subject filters correctly
  - [ ] F3.2.2 "All Subjects" shows all
- [ ] **F3.3** Sort options (Most Popular, Newest, Highest Rated)
  - [ ] F3.3.1 "Most Popular" sorts by views/likes
  - [ ] F3.3.2 "Newest" sorts by date
  - [ ] F3.3.3 "Highest Rated" sorts by likes
- [ ] **F3.4** "Clear filters" button appears when filters active
- [ ] **F3.5** "Clear filters" resets all filters

### F4. Resource Cards
- [ ] **F4.1** Thumbnail displays or gradient placeholder shows
- [ ] **F4.2** Title is clickable and navigates to detail page
- [ ] **F4.3** Author displays correctly
- [ ] **F4.4** Type badge displays (Book/Article/Video)
- [ ] **F4.5** Subject badge displays
- [ ] **F4.6** Description shows (truncated)
- [ ] **F4.7** Like button:
  - [ ] F4.7.1 Click likes the resource
  - [ ] F4.7.2 Button shows active state when liked
  - [ ] F4.7.3 Like count increments
  - [ ] F4.7.4 Clicking again un-likes
- [ ] **F4.8** Dislike button:
  - [ ] F4.8.1 Click dislikes the resource
  - [ ] F4.8.2 Button shows active state when disliked
  - [ ] F4.8.3 Clicking again removes dislike
- [ ] **F4.9** Save button:
  - [ ] F4.9.1 Click saves the resource
  - [ ] F4.9.2 Button changes to "Saved" state
  - [ ] F4.9.3 Toast notification shows "Saved!"
  - [ ] F4.9.4 Clicking again removes save

### F5. Pagination
- [ ] **F5.1** Pagination shows when > 12 resources
- [ ] **F5.2** "Previous" button works (disabled on page 1)
- [ ] **F5.3** "Next" button works (disabled on last page)
- [ ] **F5.4** Page number buttons work
- [ ] **F5.5** Current page is highlighted
- [ ] **F5.6** Page scroll to top on page change

---

## Phase G: Resource Detail Page Testing

### G1. Page Load
- [ ] **G1.1** Page loads with correct resource data
- [ ] **G1.2** Loading spinner shows while fetching
- [ ] **G1.3** "Resource not found" state for invalid ID
- [ ] **G1.4** "Back" button navigates to previous page

### G2. Resource Header
- [ ] **G2.1** Thumbnail displays correctly
- [ ] **G2.2** Type badge displays
- [ ] **G2.3** Subject badge displays
- [ ] **G2.4** Difficulty badge displays with correct color
- [ ] **G2.5** Title displays correctly
- [ ] **G2.6** Author displays correctly
- [ ] **G2.7** Date displays correctly

### G3. Action Buttons
- [ ] **G3.1** "Open Resource" button:
  - [ ] G3.1.1 Opens URL in new tab
  - [ ] G3.1.2 Has correct external link
- [ ] **G3.2** Like button works (same as browse page)
- [ ] **G3.3** Dislike button works
- [ ] **G3.4** Save button works
- [ ] **G3.5** Share button:
  - [ ] G3.5.1 Copies URL to clipboard
  - [ ] G3.5.2 Shows "Link copied" toast

### G4. Description Section
- [ ] **G4.1** Full description displays
- [ ] **G4.2** Tags display as clickable badges

### G5. Statistics Card
- [ ] **G5.1** View count displays
- [ ] **G5.2** Like count displays
- [ ] **G5.3** Subject with icon displays
- [ ] **G5.4** Type with icon displays

### G6. Related YouTube Videos
- [ ] **G6.1** Videos load (loading state shows)
- [ ] **G6.2** Videos display in grid
- [ ] **G6.3** Video thumbnail shows
- [ ] **G6.4** Video title shows
- [ ] **G6.5** Channel name shows
- [ ] **G6.6** Clicking video opens YouTube in new tab
- [ ] **G6.7** Hover shows play overlay

### G7. Similar Resources
- [ ] **G7.1** Similar resources display in sidebar
- [ ] **G7.2** Clicking similar resource navigates to its detail page
- [ ] **G7.3** Similar resources are from same subject

---

## Phase H: For You Page Testing

### H1. Page Load
- [ ] **H1.1** Page loads without errors
- [ ] **H1.2** Recommendations display based on preferences
- [ ] **H1.3** Loading state shows while fetching

### H2. No Profile Warning
- [ ] **H2.1** Warning card shows if onboarding not completed
- [ ] **H2.2** "Set Preferences" button navigates to `/onboarding`
- [ ] **H2.3** Warning doesn't show after onboarding complete

### H3. Recommendations
- [ ] **H3.1** Resource cards display correctly
- [ ] **H3.2** Recommendation reason shows below title
- [ ] **H3.3** All card interactions work (like, dislike, save)
- [ ] **H3.4** Clicking title navigates to detail page

### H4. Empty State
- [ ] **H4.1** Empty state shows when no recommendations
- [ ] **H4.2** "Browse Resources" button navigates to `/`

---

## Phase I: Saved Resources Page Testing

### I1. Page Load
- [ ] **I1.1** Page loads without errors
- [ ] **I1.2** Saved resources display in grid
- [ ] **I1.3** Loading state shows
- [ ] **I1.4** Total count displays

### I2. Empty State
- [ ] **I2.1** Empty state shows when no saved resources
- [ ] **I2.2** "Browse Resources" button navigates to `/`

### I3. Resource Cards
- [ ] **I3.1** Card displays same as browse page
- [ ] **I3.2** "Saved on" date displays
- [ ] **I3.3** Like/Dislike buttons work
- [ ] **I3.4** "Remove" button:
  - [ ] I3.4.1 Removes resource from saved
  - [ ] I3.4.2 Toast shows "Removed from saved"
  - [ ] I3.4.3 Resource disappears from list
  - [ ] I3.4.4 Total count decrements

### I4. Pagination
- [ ] **I4.1** Pagination works same as browse page

---

## Phase J: Analytics Page Testing

### J1. Page Load
- [ ] **J1.1** Page loads without errors
- [ ] **J1.2** All stats cards display

### J2. Stats Cards
- [ ] **J2.1** Views count displays correctly
- [ ] **J2.2** Likes count displays correctly
- [ ] **J2.3** Dislikes count displays correctly
- [ ] **J2.4** Saved count displays correctly
- [ ] **J2.5** Day streak displays correctly

### J3. Onboarding CTA
- [ ] **J3.1** CTA card shows if onboarding not complete
- [ ] **J3.2** "Set Preferences" button navigates to `/onboarding`

### J4. Subject Distribution
- [ ] **J4.1** Subject bars display with correct counts
- [ ] **J4.2** Progress bars animate
- [ ] **J4.3** Icons and names display correctly
- [ ] **J4.4** "No interactions yet" shows if no data

### J5. Type Distribution
- [ ] **J5.1** Type bars display with correct counts
- [ ] **J5.2** Progress bars animate
- [ ] **J5.3** "No interactions yet" shows if no data

### J6. Learning Profile
- [ ] **J6.1** Experience level displays
- [ ] **J6.2** Time commitment displays
- [ ] **J6.3** Preferred subjects display with colors
- [ ] **J6.4** Preferred formats display
- [ ] **J6.5** "Edit Preferences" navigates to `/onboarding`

### J7. Recent Activity
- [ ] **J7.1** Recent resources display (up to 5)
- [ ] **J7.2** Thumbnails display correctly
- [ ] **J7.3** Clicking resource navigates to detail page
- [ ] **J7.4** "View All" navigates to `/`

---

## Phase K: Profile Page Testing

### K1. Page Load
- [ ] **K1.1** Page loads without errors
- [ ] **K1.2** User info displays correctly

### K2. Profile Card
- [ ] **K2.1** Avatar shows user initial
- [ ] **K2.2** Name displays correctly
- [ ] **K2.3** Email displays correctly
- [ ] **K2.4** Member since date displays
- [ ] **K2.5** "Edit Profile" navigates to `/onboarding`

### K3. Stats Overview
- [ ] **K3.1** Resources Viewed count
- [ ] **K3.2** Liked count
- [ ] **K3.3** Saved count
- [ ] **K3.4** Level displays

### K4. Learning Profile
- [ ] **K4.1** Experience level displays
- [ ] **K4.2** Time commitment displays
- [ ] **K4.3** Preferred subjects display with icons
- [ ] **K4.4** Preferred formats display
- [ ] **K4.5** "Complete Setup" button shows if not complete

### K5. Quick Actions
- [ ] **K5.1** "View Saved Resources" → `/saved`
- [ ] **K5.2** "View Analytics" → `/analytics`
- [ ] **K5.3** "Get Recommendations" → `/for-you`
- [ ] **K5.4** "Edit Preferences" → `/onboarding`

---

## Phase L: Footer Testing

### L1. Footer Display
- [ ] **L1.1** Footer displays on all pages
- [ ] **L1.2** Footer sticks to bottom when content is short
- [ ] **L1.3** Footer is pushed down when content is long

### L2. Footer Links
- [ ] **L2.1** Logo navigates to `/`
- [ ] **L2.2** Quick Links work:
  - [ ] L2.2.1 Explore Resources → `/`
  - [ ] L2.2.2 For You → `/for-you`
  - [ ] L2.2.3 Saved Resources → `/saved`
  - [ ] L2.2.4 Analytics → `/analytics`
- [ ] **L2.3** Category links work with subject filter
- [ ] **L2.4** Social links exist
- [ ] **L2.5** Privacy/Terms/Contact links exist

---

## Phase M: Error Handling Testing

### M1. API Errors
- [ ] **M1.1** Network error shows toast notification
- [ ] **M1.2** 401 errors redirect to sign in
- [ ] **M1.3** 404 errors show appropriate message
- [ ] **M1.4** 500 errors show error message

### M2. Form Errors
- [ ] **M2.1** Validation errors display inline
- [ ] **M2.2** Submit button disabled during loading

### M3. Protected Routes
- [ ] **M3.1** Unauthenticated access to `/for-you` redirects to sign in
- [ ] **M3.2** Unauthenticated access to `/saved` redirects to sign in
- [ ] **M3.3** Unauthenticated access to `/analytics` redirects to sign in
- [ ] **M3.4** Unauthenticated access to `/profile` redirects to sign in
- [ ] **M3.5** After sign in, redirects back to intended page

---

## Phase N: Responsive Design Testing

### N1. Mobile (< 768px)
- [ ] **N1.1** Header shows hamburger menu
- [ ] **N1.2** Mobile menu opens/closes
- [ ] **N1.3** Sidebar hidden
- [ ] **N1.4** Resource grid shows 1 column
- [ ] **N1.5** All buttons are touch-friendly (44px+)
- [ ] **N1.6** Forms are usable
- [ ] **N1.7** No horizontal scroll

### N2. Tablet (768px - 1024px)
- [ ] **N2.1** Header navigation shows
- [ ] **N2.2** Sidebar hidden
- [ ] **N2.3** Resource grid shows 2 columns

### N3. Desktop (> 1024px)
- [ ] **N3.1** Sidebar visible
- [ ] **N3.2** Resource grid shows 3 columns
- [ ] **N3.3** User dropdown in header

---

## Phase O: Accessibility Testing

### O1. Keyboard Navigation
- [ ] **O1.1** All interactive elements focusable
- [ ] **O1.2** Tab order is logical
- [ ] **O1.3** Focus visible on all elements
- [ ] **O1.4** Escape closes modals/dropdowns

### O2. Screen Reader
- [ ] **O2.1** Images have alt text
- [ ] **O2.2** Buttons have accessible labels
- [ ] **O2.3** Form inputs have labels
- [ ] **O2.4** Page structure uses semantic HTML

---

## Phase P: Performance Testing

### P1. Load Times
- [ ] **P1.1** Initial page load < 3 seconds
- [ ] **P1.2** Navigation between pages is smooth
- [ ] **P1.3** Images load properly
- [ ] **P1.4** No layout shift during load

### P2. API Response
- [ ] **P2.1** Resources API responds quickly
- [ ] **P2.2** Recommendations API responds quickly
- [ ] **P2.3** YouTube videos load asynchronously

---

## Test Summary Template

| Phase | Total Tests | Passed | Failed | Notes |
|-------|------------|--------|--------|-------|
| A - Auth | 22 | | | |
| B - Landing | 12 | | | |
| C - Header | 19 | | | |
| D - Sidebar | 10 | | | |
| E - Onboarding | 26 | | | |
| F - Browse | 35 | | | |
| G - Resource Detail | 31 | | | |
| H - For You | 12 | | | |
| I - Saved | 12 | | | |
| J - Analytics | 22 | | | |
| K - Profile | 18 | | | |
| L - Footer | 10 | | | |
| M - Errors | 13 | | | |
| N - Responsive | 12 | | | |
| O - A11y | 8 | | | |
| P - Performance | 7 | | | |
| **TOTAL** | **271** | | | |

---

## Execution Priority

1. **High Priority** (Critical paths):
   - Phase A: Authentication
   - Phase F: Browse Page
   - Phase G: Resource Detail
   - Phase I: Saved Resources

2. **Medium Priority** (User features):
   - Phase E: Onboarding
   - Phase H: For You
   - Phase J: Analytics
   - Phase K: Profile

3. **Lower Priority** (Polish):
   - Phase B: Landing Page
   - Phase C/D: Navigation
   - Phase L: Footer
   - Phase M-P: Error/Responsive/A11y/Performance
