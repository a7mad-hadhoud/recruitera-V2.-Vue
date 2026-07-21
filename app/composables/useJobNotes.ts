// Job notes — fixture today. When the API lands, replace with a Vue Query
// call keyed by jobId and a useMutation for add/edit/delete (invalidate
// ['notes', jobId] + ['activity', jobId] since a note adds an activity row).

export type NoteVisibility = 'everyone' | 'admins' | 'me'

export interface JobNote {
  id: string
  jobId: string
  userName: string
  userInitials: string
  text: string
  visibility: NoteVisibility
  createdAt: string   // human string for now ("just now" / "an hour ago")
}

// Module-scope so notes added on /jobs/j1 don't disappear when the route
// re-mounts within the same tab.
const store = ref<JobNote[]>([])
let seq = 0
const nextId = () => `n${++seq}`

export function useJobNotes(jobId: string) {
  const notes = computed(() => store.value.filter(n => n.jobId === jobId))

  function addNote(text: string, visibility: NoteVisibility) {
    const clean = text.trim()
    if (!clean) return
    store.value = [
      ...store.value,
      { id: nextId(), jobId, userName: 'Amr Hammad', userInitials: 'AH', text: clean, visibility, createdAt: 'just now' },
    ]
  }
  function editNote(id: string, text: string) {
    store.value = store.value.map(n => n.id === id ? { ...n, text } : n)
  }
  function removeNote(id: string) {
    store.value = store.value.filter(n => n.id !== id)
  }

  return { notes, addNote, editNote, removeNote }
}
