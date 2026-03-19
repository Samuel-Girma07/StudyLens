import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function Footer() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  // Hide footer on auth pages and onboarding
  if (pathname.startsWith("/auth") || pathname.startsWith("/onboarding")) {
    return null
  }
  
  // If user is logged in, show minimal footer
  if (session) {
    return (
      <footer className="border-t border-white/5 bg-[#0a0a0a] py-6 px-12 mt-auto">
        <div className="flex justify-between items-center">
          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
            © {new Date().getFullYear()} StudyLens
          </p>
          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
            Learning without limits
          </p>
        </div>
      </footer>
    )
  }

  // Landing page footer
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-accent-cyan flex items-center justify-center border-2 border-accent-lime shadow-[1px_1px_0px_#CCFF00]">
            <span className="material-symbols-outlined text-black text-sm font-bold">menu_book</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            © {new Date().getFullYear()} StudyLens
          </span>
        </div>
        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
          Learning without limits
        </p>
      </div>
    </footer>
  )
}
