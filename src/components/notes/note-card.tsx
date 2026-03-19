import React from "react"

export function NoteCard({ note, onEdit, onDelete, onTogglePin }: any) {
  return (
    <div className="border border-white/10 p-4 rounded bg-white/5">
      <h4 className="font-bold text-lg mb-2">{note.title || "Untitled Note"}</h4>
      <p className="text-sm text-slate-400 mb-4 truncate">{note.content}</p>
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-xs bg-slate-800 px-2 py-1 rounded">Edit</button>
        <button onClick={onDelete} className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded">Delete</button>
        <button onClick={onTogglePin} className="text-xs bg-slate-800 px-2 py-1 rounded">
          {note.isPinned ? "Unpin" : "Pin"}
        </button>
      </div>
    </div>
  )
}
