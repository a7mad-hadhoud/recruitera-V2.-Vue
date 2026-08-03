import { Folder, Megaphone, Package } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { TalentPool, TalentPoolCategory } from '~/types'

/**
 * One colour + icon per pool category, shared by the row icon tile and the
 * category pill so the two never drift apart.
 */
export const POOL_CATEGORY: Record<TalentPoolCategory, {
  label: string
  icon: Component
  bg: string
  text: string
}> = {
  general: {
    label: 'General',
    icon: Package,
    bg: 'var(--brand-category-general-bg)',
    text: 'var(--brand-category-general-text)',
  },
  department: {
    label: 'Department',
    icon: Folder,
    bg: 'var(--brand-category-department-bg)',
    text: 'var(--brand-category-department-text)',
  },
  event: {
    label: 'Event',
    icon: Megaphone,
    bg: 'var(--brand-category-event-bg)',
    text: 'var(--brand-category-event-text)',
  },
}

/** The line under the category pill: the department or event this pool belongs to. */
export function poolCategoryDetail(p: TalentPool): string {
  if (p.category === 'department') return p.department ?? ''
  if (p.category === 'event') return p.event ?? ''
  return 'General Application'
}
