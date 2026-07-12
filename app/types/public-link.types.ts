export interface PublicLink {
  id: string
  name: string
  candidates: string[]
  expiresOn: string | null
  guestReviews: number
  guestTeamNotes: number
  showInfo: string[]
  allow: string[]
}
