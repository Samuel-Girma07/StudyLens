import React from "react"

export function NoteEditor({ note, onSave, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-50">
      <div className="bg-slate-900 p-6 w-full max-w-lg rounded border border-white/10">
        <h3 className="text-xl font-bold mb-4">{note ? "Edit Note" : "New Note"}</h3>
        <p className="text-slate-400 mb-6">Note Editor Stub Integration</p>
        <div className="flex gap-4 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 rounded">Cancel</button>
          <button onClick={() => onSave(note)} className="px-4 py-2 bg-accent-cyan text-black rounded">Save</button>
        </div>
      </div>
    </div>
  )
}
