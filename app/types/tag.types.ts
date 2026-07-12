export type TagCategory = 'candidates' | 'jobs' | 'sources'

export interface TagItem {
  id: string
  name: string
  /** candidates: candidate count. jobs/sources: primary count column. */
  count1: number
  /** jobs only: job templates count. */
  count2?: number
}

export type TagsByCategory = Record<TagCategory, TagItem[]>
