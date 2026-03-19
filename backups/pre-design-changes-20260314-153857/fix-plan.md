# StudyLens Fix Plan

**Total Issues:** 18
**Critical:** 5 | **Moderate:** 8 | **Minor:** 5

---

## 🔴 CRITICAL FIXES (Priority 1)

### Fix 1: Auto-Login After Registration

**Issue:** User is redirected to sign-in page instead of being automatically logged in after registration.

**Files to Modify:**
- `/src/app/auth/signup/page.tsx`

**Implementation:**
```typescript
// After successful registration (line ~65), replace:
toast.success("Account created successfully! Please sign in.")
router.push("/auth/signin")

// With:
// Auto sign-in the user after registration
const result = await signIn("credentials", {
  email: formData.email,
  password: formData.password,
  redirect: false,
})

if (result?.ok) {
  toast.success("Account created successfully!")
  router.push("/onboarding")
} else {
  toast.success("Account created! Please sign in.")
  router.push("/auth/signin")
}
```

**Also need to:**
- Import `signIn` from `next-auth/react` at the top

---

### Fix 2: Redirect New Users to Onboarding

**Issue:** New users land on browse page instead of being directed to onboarding.

**Files to Modify:**
- `/src/app/auth/signin/page.tsx`
- `/src/middleware.ts`

**Implementation:**

**Option A - Middleware approach:**
```typescript
// In middleware.ts, modify the authorized callback:
authorized: ({ token, req }) => {
  // ... existing code ...
  
  // If new user without onboarding, let middleware handle redirect
  return !!token
}

// Add redirect logic after authentication:
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect new users to onboarding
    if (
      token &&
      !token.hasCompletedOnboarding &&
      !pathname.startsWith("/onboarding") &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }

    return NextResponse.next()
  },
  // ... rest of config
)
```

**Option B - Sign-in page approach (simpler):**
```typescript
// In signin page, after successful login:
if (result?.ok) {
  // Check if user needs onboarding
  const profileRes = await fetch("/api/profile")
  const profileData = await profileRes.json()
  
  toast.success("Signed in successfully!")
  
  if (!profileData.profile?.onboardingCompleted) {
    router.push("/onboarding")
  } else {
    router.push(callbackUrl)
  }
  router.refresh()
}
```

---

### Fix 3: Add Form Validation Feedback for Name Field

**Issue:** Name field uses browser default validation instead of custom error messages.

**Files to Modify:**
- `/src/app/auth/signup/page.tsx`

**Implementation:**
```typescript
// Add state for validation errors:
const [errors, setErrors] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
})

// Add validation function:
const validateName = (name: string) => {
  if (!name.trim()) {
    return "Name is required"
  }
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters"
  }
  return ""
}

// Update input with error display:
<div className="space-y-2">
  <Label htmlFor="name">Full Name</Label>
  <div className="relative">
    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
    <Input
      id="name"
      type="text"
      placeholder="John Doe"
      value={formData.name}
      onChange={(e) => {
        setFormData({ ...formData, name: e.target.value })
        setErrors(prev => ({ ...prev, name: validateName(e.target.value) }))
      }}
      onBlur={() => setErrors(prev => ({ ...prev, name: validateName(formData.name) }))}
      className={`pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 ${
        errors.name ? "border-red-500" : "focus:border-primary"
      }`}
    />
  </div>
  {errors.name && (
    <p className="text-xs text-red-400 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {errors.name}
    </p>
  )}
</div>

// Add validation before submit:
if (!formData.name.trim() || formData.name.trim().length < 2) {
  setErrors(prev => ({ ...prev, name: validateName(formData.name) }))
  return
}
```

---

### Fix 4: Disable Continue Button Until Selection Made

**Issue:** Continue button is always enabled, clicking without selection shows error toast.

**Files to Modify:**
- `/src/app/onboarding/page.tsx`

**Implementation:**
```typescript
// Step 1 Continue button - add disabled prop:
<Button
  onClick={handleNext}
  disabled={selectedSubjects.length === 0}
  className="accent-gradient shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
>
  Continue
  <ArrowRight className="w-4 h-4 ml-2" />
</Button>

// Step 2 Continue button:
<Button
  onClick={handleNext}
  disabled={selectedFormats.length === 0}
  className="accent-gradient shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
>
  Continue
  <ArrowRight className="w-4 h-4 ml-2" />
</Button>

// Remove toast errors from handleNext since button is now disabled:
const handleNext = () => {
  if (currentStep < totalSteps) {
    setCurrentStep(prev => prev + 1)
  }
}
```

---

### Fix 5: Show Default Value for Time Commitment

**Issue:** Time commitment defaults to "moderate" silently without user knowing.

**Files to Modify:**
- `/src/app/onboarding/page.tsx`

**Implementation:**
```typescript
// Set default value on initial load:
useEffect(() => {
  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setSelectedSubjects(data.profile.subjects)
          setSelectedFormats(data.profile.formats)
          setSelectedExperience(data.profile.experienceLevel)
          setSelectedTime(data.profile.timeCommitment || "moderate") // Ensure default
        }
      }
    } catch (error) {
      console.error("Failed to load preferences:", error)
    }
  }
  loadPreferences()
}, [])

// Add "Recommended" badge to moderate option:
{allTimeCommitments.map((time) => {
  const Icon = timeIcons[time]
  const isSelected = selectedTime === time
  const isRecommended = time === "moderate"
  return (
    <button
      key={time}
      type="button"
      onClick={() => setSelectedTime(time)}
      className={cn(
        "relative p-4 rounded-xl border transition-all text-left",
        isSelected
          ? "border-primary/50 bg-primary/5"
          : isRecommended && !selectedTime
          ? "border-primary/30 bg-primary/5" // Highlight recommended
          : "border-white/10 hover:border-primary/30"
      )}
    >
      {isRecommended && !selectedTime && (
        <span className="absolute top-2 right-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
          Recommended
        </span>
      )}
      {/* ... rest of button content */}
    </button>
  )
})}
```

---

## 🟠 MODERATE FIXES (Priority 2)

### Fix 6: Make Footer Category Links Work

**Issue:** Footer links like `/?subject=programming` don't filter resources because BrowsePage doesn't read URL params.

**Files to Modify:**
- `/src/app/page.tsx` (BrowsePage component)

**Implementation:**
```typescript
// Add useSearchParams import:
import { useSearchParams } from "next/navigation"

// In BrowsePage component:
function BrowsePage() {
  const searchParams = useSearchParams()
  
  // Initialize filters from URL params:
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all")
  const [subjectFilter, setSubjectFilter] = useState(searchParams.get("subject") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular")
  
  // Add effect to sync URL params with state:
  useEffect(() => {
    const urlSubject = searchParams.get("subject")
    const urlType = searchParams.get("type")
    const urlSort = searchParams.get("sort")
    
    if (urlSubject && urlSubject !== subjectFilter) {
      setSubjectFilter(urlSubject)
    }
    if (urlType && urlType !== typeFilter) {
      setTypeFilter(urlType)
    }
    if (urlSort && urlSort !== sortBy) {
      setSortBy(urlSort)
    }
  }, [searchParams])
  
  // ... rest of component
}
```

---

### Fix 7: Fix Social Links in Footer

**Issue:** Social links are dead (`href="#"`).

**Files to Modify:**
- `/src/components/shared/footer.tsx`

**Implementation Options:**

**Option A - Remove social links:**
```typescript
// Remove the social links div entirely, or replace with:
{/* Social links - placeholder for future */}
```

**Option B - Use real links (if available):**
```typescript
<div className="flex gap-3">
  <a 
    href="https://github.com/yourusername/studylens" 
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-colors"
  >
    <Github className="w-5 h-5" />
  </a>
  {/* Remove Twitter/LinkedIn or add real links */}
</div>
```

**Option C - Make them clear placeholders:**
```typescript
// Add tooltip or aria-label indicating coming soon:
<a 
  href="#"
  onClick={(e) => e.preventDefault()}
  className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-colors cursor-not-allowed opacity-50"
  aria-label="Coming soon"
>
  <Github className="w-5 h-5" />
</a>
```

---

### Fix 8: Fix Privacy/Terms/Contact Links

**Issue:** Footer legal links are dead.

**Files to Modify:**
- `/src/components/shared/footer.tsx`

**Implementation Options:**

**Option A - Create simple pages:**
Create `/src/app/privacy/page.tsx`, `/src/app/terms/page.tsx`, `/src/app/contact/page.tsx`

**Option B - Remove links:**
```typescript
// Remove the bottom bar links or replace with:
<p className="text-sm text-slate-500 text-center">
  © {new Date().getFullYear()} StudyLens. All rights reserved.
</p>
```

**Option C - Link to sections on same page (scroll):**
```typescript
<a href="#privacy" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy</a>
```

---

### Fix 9: Add Password Strength Indicator

**Issue:** No visual indication of password strength.

**Files to Modify:**
- `/src/app/auth/signup/page.tsx`

**Implementation:**
```typescript
// Add password strength calculation:
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: "Weak", color: "text-red-400" }
  if (score <= 2) return { score, label: "Fair", color: "text-amber-400" }
  if (score <= 3) return { score, label: "Good", color: "text-yellow-400" }
  return { score, label: "Strong", color: "text-emerald-400" }
}

const passwordStrength = getPasswordStrength(formData.password)

// Add strength indicator below password field:
{formData.password && (
  <div className="flex items-center gap-2 mt-1">
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all ${
          passwordStrength.score <= 1 ? "bg-red-400 w-1/4" :
          passwordStrength.score <= 2 ? "bg-amber-400 w-2/4" :
          passwordStrength.score <= 3 ? "bg-yellow-400 w-3/4" :
          "bg-emerald-400 w-full"
        }`}
      />
    </div>
    <span className={`text-xs ${passwordStrength.color}`}>
      {passwordStrength.label}
    </span>
  </div>
)}
```

---

### Fix 10: Demo Button Auto-Submit or Clear Indication

**Issue:** Demo button fills form but doesn't make it clear user needs to click Sign In.

**Files to Modify:**
- `/src/app/auth/signin/page.tsx`

**Implementation Options:**

**Option A - Auto-submit:**
```typescript
<Button
  type="button"
  variant="outline"
  className="w-full h-12 border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
  onClick={async () => {
    setFormData({
      email: "demo@studylens.com",
      password: "demo123",
    })
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = document.querySelector('form')
      form?.requestSubmit()
    }, 100)
  }}
>
  Sign in with Demo Account
</Button>
```

**Option B - Clear indication:**
```typescript
<Button
  type="button"
  variant="outline"
  className="w-full h-12 border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
  onClick={() => {
    setFormData({
      email: "demo@studylens.com",
      password: "demo123",
    })
    toast.info("Demo credentials filled - click Sign In to continue")
  }}
>
  Fill Demo Credentials
</Button>
```

---

### Fix 11: Add Forgot Password Option

**Issue:** No password reset functionality.

**Files to Modify:**
- Create new: `/src/app/auth/forgot-password/page.tsx`
- Create new: `/src/app/api/auth/forgot-password/route.ts`
- Modify: `/src/app/auth/signin/page.tsx`

**Implementation:**

This is a larger feature. For now, add a placeholder:

```typescript
// In signin page, add below password field:
<div className="flex justify-end">
  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
    Forgot password?
  </Link>
</div>

// Create a simple forgot-password page that says "coming soon" or
// implements basic email reset functionality
```

**Note:** Full implementation requires email service setup. Recommend marking as "Phase 2" feature.

---

### Fix 12: Optimistic UI Update for Like Count

**Issue:** Like count requires full page refresh.

**Files to Modify:**
- `/src/app/page.tsx` (BrowsePage)
- `/src/app/for-you/page.tsx`
- `/src/app/saved/page.tsx`

**Implementation:**
```typescript
const handleRate = async (resourceId: string, rating: 1 | -1) => {
  // Get current state
  const currentResource = resources.find(r => r.id === resourceId)
  const currentRating = currentResource?.userInteraction?.rating
  
  // Optimistic update
  setResources(prev => prev.map(r => {
    if (r.id !== resourceId) return r
    
    let newLikeCount = r.likeCount
    if (currentRating === rating) {
      // Removing rating
      if (rating === 1) newLikeCount = Math.max(0, r.likeCount - 1)
    } else if (currentRating === 1) {
      // Changing from like to dislike
      newLikeCount = Math.max(0, r.likeCount - 1)
    } else if (rating === 1) {
      // Adding like
      newLikeCount = r.likeCount + 1
    }
    
    return {
      ...r,
      likeCount: newLikeCount,
      userInteraction: {
        ...r.userInteraction!,
        rating: currentRating === rating ? null : rating,
      },
    }
  }))
  
  // API call
  try {
    const response = await fetch(`/api/resources/${resourceId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    })
    if (!response.ok) {
      // Revert on error
      fetchResources(pagination.page)
    }
  } catch {
    // Revert on error
    fetchResources(pagination.page)
  }
}
```

---

### Fix 13: Add Clipboard Fallback for Share

**Issue:** navigator.clipboard may not work in non-HTTPS contexts.

**Files to Modify:**
- `/src/app/resource/[id]/page.tsx`

**Implementation:**
```typescript
const handleShare = async () => {
  if (!resource) return
  
  const url = window.location.href
  
  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard!")
      return
    } catch {
      // Fall through to fallback
    }
  }
  
  // Fallback for older browsers / non-HTTPS
  try {
    const textArea = document.createElement("textarea")
    textArea.value = url
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand("copy")
    document.body.removeChild(textArea)
    toast.success("Link copied to clipboard!")
  } catch {
    toast.error("Failed to copy link")
  }
}
```

---

## 🟡 MINOR FIXES (Priority 3)

### Fix 14: Add Loading Skeleton to Profile Page

**Files to Modify:**
- `/src/app/profile/page.tsx`

**Implementation:**
```typescript
// Replace spinner with skeleton:
if (status === "loading" || isLoading) {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile skeleton */}
          <Card className="glass-panel border-white/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 animate-pulse">
                <div className="w-24 h-24 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="h-6 bg-white/10 rounded w-48" />
                  <div className="h-4 bg-white/10 rounded w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-panel border-white/5">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-white/10 mx-auto mb-2" />
                  <div className="h-6 bg-white/10 rounded w-12 mx-auto" />
                  <div className="h-3 bg-white/10 rounded w-16 mx-auto mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
```

---

### Fix 15: Add Loading Skeleton to Analytics Page

**Files to Modify:**
- `/src/app/analytics/page.tsx`

**Implementation:**
Similar skeleton pattern for stats cards and charts.

---

### Fix 16: Add Loading Skeleton to Saved Page

**Files to Modify:**
- `/src/app/saved/page.tsx`

**Implementation:**
Use the same skeleton cards as browse page.

---

### Fix 17: Use localStorage for Banner Dismissal

**Issue:** Banner reappears in new tab because sessionStorage is tab-specific.

**Files to Modify:**
- `/src/components/shared/onboarding-banner.tsx`

**Implementation:**
```typescript
// Change from sessionStorage to localStorage:
const [dismissed, setDismissed] = useState(() => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("onboarding-banner-dismissed") === "true"
})

const handleDismiss = () => {
  setShowBanner(false)
  setDismissed(true)
  localStorage.setItem("onboarding-banner-dismissed", "true")
}

// Also add an expiration (optional):
// Clear after 7 days so user is reminded again
const DISMISSAL_EXPIRY_DAYS = 7

const handleDismiss = () => {
  setShowBanner(false)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + DISMISSAL_EXPIRY_DAYS)
  localStorage.setItem("onboarding-banner-dismissed", expiryDate.toISOString())
}
```

---

### Fix 18: Track Unique Views for Resource View Count

**Issue:** View count increments on every page refresh.

**Files to Modify:**
- `/src/app/api/resources/[id]/route.ts`

**Implementation:**
```typescript
// Option A: Session-based (simpler)
// Only increment if not viewed in this session
const viewSessionKey = `viewed-${id}`
const sessionCookie = request.cookies.get(viewSessionKey)

if (!sessionCookie) {
  // Increment view count
  await db.resource.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })
  
  // Set a cookie/response header to track
}

// Option B: Time-based (per user)
// Track in UserInteraction when last viewed
if (user) {
  const interaction = await db.userInteraction.findUnique({
    where: { userId_resourceId: { userId: user.id, resourceId: id } },
  })
  
  // Only increment if not viewed in last 24 hours
  const lastViewed = interaction?.updatedAt
  const hoursSinceView = lastViewed 
    ? (Date.now() - new Date(lastViewed).getTime()) / (1000 * 60 * 60)
    : Infinity
  
  if (hoursSinceView > 24) {
    await db.resource.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
  }
}
```

---

## IMPLEMENTATION ORDER

### Phase 1: Critical Fixes (Day 1)
1. Fix 1 - Auto-login after registration
2. Fix 2 - Redirect to onboarding
3. Fix 3 - Form validation feedback
4. Fix 4 - Disable continue button
5. Fix 5 - Time commitment default

### Phase 2: Moderate Fixes (Day 2)
6. Fix 6 - Footer category links (BROKEN - high visibility)
7. Fix 7 - Social links
8. Fix 8 - Privacy/Terms links
9. Fix 9 - Password strength
10. Fix 10 - Demo button
11. Fix 11 - Forgot password (can defer to Phase 3)
12. Fix 12 - Optimistic UI
13. Fix 13 - Clipboard fallback

### Phase 3: Minor Fixes (Day 3)
14. Fix 14-16 - Loading skeletons
15. Fix 17 - localStorage for banner
16. Fix 18 - Unique view tracking

---

## ESTIMATED EFFORT

| Fix # | Effort | Risk |
|-------|--------|------|
| 1 | Small | Low |
| 2 | Medium | Medium |
| 3 | Small | Low |
| 4 | Small | Low |
| 5 | Small | Low |
| 6 | Medium | Low |
| 7 | Small | Low |
| 8 | Small | Low |
| 9 | Medium | Low |
| 10 | Small | Low |
| 11 | Large | Medium |
| 12 | Medium | Low |
| 13 | Small | Low |
| 14-16 | Small | Low |
| 17 | Small | Low |
| 18 | Medium | Low |

**Total Estimated Time:** 2-3 days for all fixes
