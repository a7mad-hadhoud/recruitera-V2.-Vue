export interface BlocklistEntry {
  id: string
  name: string
  email: string | null
  nationalId: string | null
  reason: string
  blockedOn: string
}

export interface BlocklistResponse {
  data: BlocklistEntry[]
  total: number
}
