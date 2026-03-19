"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AppLayout } from "@/components/shared"
import { subjectNames, typeNames } from "@/lib/constants"
import { NoteEditor, NoteCard } from "@/components/notes"

// ============================================
// TYPES
// ============================================
interface Note {
  id: string
  title: string
  content: string
  tags: string
  color: string | null
  isPinned: boolean
  summary: string | null
  createdAt: string
  updatedAt: string
  resourceId: string | null
  resource?: {
    id: string
    title: string
    subject: string
    type: string
  } | null
}

// ============================================
// NOTES PAGE
// ============================================
export default function NotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch notes
  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      if (showPinnedOnly) params.set("pinned", "true")

      const response = await fetch(`/api/notes?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error)
      toast.error("Failed to load notes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchNotes()
    }
  }, [session, searchQuery, showPinnedOnly])

  // Handle create new note
  const handleCreateNote = () => {
    setEditingNote(null)
    setShowEditor(true)
  }

  // Handle edit note
  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setShowEditor(true)
  }

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Note deleted")
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
      }
    } catch (error) {
      toast.error("Failed to delete note")
    }
  }

  // Handle toggle pin
  const handleTogglePin = async (note: Note) => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      })
      if (response.ok) {
        const data = await response.json()
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? data.note : n))
        )
        toast.success(note.isPinned ? "Note unpinned" : "Note pinned")
      }
    } catch (error) {
      toast.error("Failed to update note")
    }
  }

  // Handle save from editor
  const handleSaveNote = (savedNote: Note) => {
    setShowEditor(false)
    setEditingNote(null)
    fetchNotes()
    toast.success(editingNote ? "Note updated" : "Note created")
  }

  // Filter notes by search
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.toLowerCase().includes(query)
    )
  })

  // Group notes by pinned status
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned)
  const otherNotes = filteredNotes.filter((n) => !n.isPinned)

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="size-12 border-2 border-accent-cyan border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header Section */}
      <header className="p-8 lg:p-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <nav className="flex gap-2 mb-4">
              <span className="font-mono text-[10px] text-accent-lime uppercase tracking-tighter bg-accent-lime/10 px-2 py-1 italic">Personal</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter px-2 py-1">/ Knowledge Base</span>
            </nav>
            <h2 className="font-serif text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] mb-4">
              My <span className="text-accent-lime">Notes</span>
            </h2>
            <p className="font-sans text-lg text-slate-400 max-w-md border-l-2 border-accent-cyan pl-6 py-2">
              Capture insights, organize learning, and let AI help you connect the dots.
            </p>
          </div>

          <button
            onClick={handleCreateNote}
            className="bg-accent-lime text-black px-8 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_#00FFFF] hover:bg-white transition-all flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Note
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="px-8 lg:px-12 pb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-cyan/50 font-sans text-sm"
            />
          </div>

          {/* Pinned Filter */}
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${
              showPinnedOnly
                ? "bg-accent-lime/20 border-accent-lime/50 text-accent-lime"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {showPinnedOnly ? "keep" : "keep_outline"}
            </span>
            Pinned Only
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section className="p-8 lg:p-12 pt-6 flex-1">
        {/* Empty State */}
        {!isLoading && notes.length === 0 && !showEditor && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              <div className="size-32 bg-accent-lime/5 border-2 border-dashed border-accent-lime flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-accent-lime font-thin">note_stack</span>
              </div>
              <div className="absolute -bottom-4 -right-4 size-16 bg-accent-cyan flex items-center justify-center shadow-[4px_4px_0px_#CCFF00]">
                <span className="material-symbols-outlined text-black font-black">edit_note</span>
              </div>
            </div>
            <h3 className="font-serif text-4xl font-black text-white italic mb-2">Empty Notebook</h3>
            <p className="font-mono text-sm text-slate-500 uppercase tracking-widest max-w-sm">
              Your knowledge base awaits. Create your first note to capture learning insights.
            </p>
            <button
              onClick={handleCreateNote}
              className="mt-8 bg-accent-lime text-black px-10 py-4 font-mono text-xs font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_#00FFFF] hover:bg-white transition-all"
            >
              Create First Note
            </button>
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && filteredNotes.length > 0 && (
          <>
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-accent-lime">keep</span>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400">Pinned Notes</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={() => handleEditNote(note)}
                      onDelete={() => handleDeleteNote(note.id)}
                      onTogglePin={() => handleTogglePin(note)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes Section */}
            {otherNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-slate-500">note_stack</span>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400">All Notes</h3>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={() => handleEditNote(note)}
                      onDelete={() => handleDeleteNote(note.id)}
                      onTogglePin={() => handleTogglePin(note)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results for Filter */}
            {filteredNotes.length === 0 && notes.length > 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-20 bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-slate-500">search_off</span>
                </div>
                <h3 className="font-serif text-2xl font-black text-white italic mb-2">No Results</h3>
                <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                  No notes match your search criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setShowPinnedOnly(false)
                  }}
                  className="mt-6 bg-accent-cyan/10 text-accent-cyan px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest border border-accent-cyan/30 hover:bg-accent-cyan hover:text-black transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Note Editor Modal */}
      {showEditor && (
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onClose={() => {
            setShowEditor(false)
            setEditingNote(null)
          }}
        />
      )}
    </AppLayout>
  )
}
