import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If user is authenticated but hasn't completed onboarding
    // redirect them to onboarding (unless they're already there or on public routes)
    if (
      token &&
      token.hasCompletedOnboarding === false &&
      !pathname.startsWith("/onboarding") &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require authentication
        const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/browse"]
        const isPublicRoute = publicRoutes.includes(pathname) ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/seed") ||
          pathname.startsWith("/api/resources") ||
          pathname.startsWith("/api/youtube") ||
          pathname.startsWith("/resource/")

        // Allow access to public routes for everyone
        if (isPublicRoute) return true

        // Require authentication for all other routes
        return !!token
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
