import Link from "next/link"
import { BookOpen, Rocket } from "lucide-react"
import { subjectNames, allSubjects } from "@/lib/constants"

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg accent-gradient flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StudyLens</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered learning resource recommendations. Find the perfect books, articles, and videos for your learning journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                  Explore Resources
                </Link>
              </li>
              <li>
                <Link href="/for-you" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                  For You
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                  Saved Resources
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              {allSubjects.map((subject) => (
                <li key={subject}>
                  <Link 
                    href={`/?subject=${subject}`} 
                    className="text-sm text-slate-400 hover:text-primary transition-colors"
                  >
                    {subjectNames[subject]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs uppercase tracking-wide text-white font-semibold mb-4">About</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              A portfolio project showcasing full-stack development with Next.js, Prisma, and AI-powered recommendations.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
              <Rocket className="w-4 h-4 text-primary" />
              <span>Built with modern technologies</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-8 pt-8 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} StudyLens. Crafted with precision.
          </p>
        </div>
      </div>
    </footer>
  )
}
