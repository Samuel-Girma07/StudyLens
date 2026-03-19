import { 
  Code, 
  Calculator, 
  FlaskConical, 
  Languages, 
  History, 
  Briefcase,
  BookOpen,
  FileText,
  Video,
  Youtube,
  Library,
  Globe,
  GraduationCap,
  BookMarked,
  Newspaper,
  Rss,
  Book,
  PlayCircle,
  Github,
  type LucideIcon
} from "lucide-react"

// Subject icons mapping
export const subjectIcons: Record<string, LucideIcon> = {
  programming: Code,
  mathematics: Calculator,
  science: FlaskConical,
  languages: Languages,
  history: History,
  business: Briefcase,
}

// Type icons mapping
export const typeIcons: Record<string, LucideIcon> = {
  book: BookOpen,
  article: FileText,
  video: Video,
  youtube: Youtube,
  openlibrary: Library,
  wikipedia: Globe,
  arxiv: GraduationCap,
  gutenberg: BookMarked,
  hackernews: Rss,
  devto: Newspaper,
  github: Github,
}

// Subject gradient colors
export const subjectGradients: Record<string, string> = {
  programming: "from-blue-500 to-cyan-500",
  mathematics: "from-emerald-500 to-green-500",
  science: "from-purple-500 to-violet-500",
  languages: "from-orange-500 to-amber-500",
  history: "from-rose-500 to-pink-500",
  business: "from-teal-500 to-cyan-500",
}

// Subject background colors (for cards without images)
export const subjectBgColors: Record<string, string> = {
  programming: "bg-gradient-to-br from-blue-600/20 to-cyan-600/20",
  mathematics: "bg-gradient-to-br from-emerald-600/20 to-green-600/20",
  science: "bg-gradient-to-br from-purple-600/20 to-violet-600/20",
  languages: "bg-gradient-to-br from-orange-600/20 to-amber-600/20",
  history: "bg-gradient-to-br from-rose-600/20 to-pink-600/20",
  business: "bg-gradient-to-br from-teal-600/20 to-cyan-600/20",
}

// Difficulty colors
export const difficultyColors: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  expert: "text-purple-400 bg-purple-400/10 border-purple-400/20",
}

// Subject display names
export const subjectNames: Record<string, string> = {
  programming: "Programming",
  mathematics: "Mathematics",
  science: "Science",
  languages: "Languages",
  history: "History",
  business: "Business",
}

// Type display names
export const typeNames: Record<string, string> = {
  book: "Book",
  article: "Article",
  video: "Video",
  youtube: "YouTube",
  openlibrary: "Open Library",
  wikipedia: "Wikipedia",
  arxiv: "ArXiv",
  gutenberg: "Project Gutenberg",
  hackernews: "Hacker News",
  devto: "Dev.to",
  github: "GitHub",
}

// Experience level icons
import { Baby, TrendingUp, Brain } from "lucide-react"

export const experienceIcons: Record<string, LucideIcon> = {
  beginner: Baby,
  intermediate: TrendingUp,
  advanced: Brain,
}

// Experience level display names
export const experienceNames: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

// Experience level descriptions
export const experienceDescriptions: Record<string, string> = {
  beginner: "Starting fresh with foundational concepts",
  intermediate: "Building on existing knowledge base",
  advanced: "Mastering complex and specialized topics",
}

// Time commitment icons
import { Coffee, Clock, Zap } from "lucide-react"

export const timeIcons: Record<string, LucideIcon> = {
  casual: Coffee,
  moderate: Clock,
  intensive: Zap,
}

// Time commitment display names
export const timeNames: Record<string, string> = {
  casual: "Casual",
  moderate: "Moderate",
  intensive: "Intensive",
}

// Time commitment descriptions
export const timeDescriptions: Record<string, string> = {
  casual: "15 min/day - Perfect for busy schedules",
  moderate: "45 min/day - Balanced learning approach",
  intensive: "2+ hrs/day - Maximum learning velocity",
}

// Format icons
export const formatIcons: Record<string, LucideIcon> = {
  books: Book,
  articles: Newspaper,
  videos: PlayCircle,
}

// Format display names
export const formatNames: Record<string, string> = {
  books: "Books",
  articles: "Articles",
  videos: "Videos",
}

// Format descriptions
export const formatDescriptions: Record<string, string> = {
  books: "In-depth study with structured chapters and comprehensive theory",
  articles: "Quick insights and bite-sized learnings from curated web content",
  videos: "Visual learning with interactive tutorials and dynamic demonstrations",
}

// All subjects list
export const allSubjects = ["programming", "mathematics", "science", "languages", "history", "business"]

// All types list (includes external APIs for filtering)
export const allTypes = ["book", "article", "video", "youtube", "openlibrary", "wikipedia", "arxiv", "gutenberg", "hackernews", "devto", "github"]

// Database types only (for API queries that only hit the database)
export const dbTypes = ["book", "article", "video"]

// External API types (not stored in database)
export const externalTypes = ["youtube", "openlibrary", "wikipedia", "arxiv", "gutenberg", "hackernews", "devto", "github"]

// All experience levels
export const allExperienceLevels = ["beginner", "intermediate", "advanced"]

// All time commitments
export const allTimeCommitments = ["casual", "moderate", "intensive"]

// All formats
export const allFormats = ["books", "articles", "videos"]

// Difficulty display names
export const difficultyNames: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
}
