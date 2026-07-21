// Job referrals — per-source share links a recruiter can hand out
// (Facebook, LinkedIn, Wuzzuf, etc). Each carries a counter that increments
// when a candidate lands through that specific link.
//
// Fixture today; swap for a Vue Query call keyed by jobId when the API
// lands (see useJobs.ts note). addReferral / removeReferral become
// useMutation calls whose onSuccess invalidates ['referrals', jobId].

export interface JobReferral {
  id: string
  jobId: string
  name: string          // display name, e.g. "Careers page banner"
  sourceTag: string     // canonical source, e.g. "linkedin"
  referrals: number     // count of candidates from this specific link
  createdAt: string     // human string for now
  shareUrl: string
}

// Preset source tags shown in the "Add Referral" dropdown. When the API
// lands, replace with a call to the workspace source-tags settings.
export const REFERRAL_SOURCE_TAGS = [
  { value: 'linkedin',    label: 'LinkedIn' },
  { value: 'facebook',    label: 'Facebook' },
  { value: 'wuzzuf',      label: 'Wuzzuf' },
  { value: 'indeed',      label: 'Indeed' },
  { value: 'careers-site', label: 'Careers site' },
  { value: 'referral',    label: 'Employee referral' },
  { value: 'other',       label: 'Other' },
] as const

const store = ref<JobReferral[]>([])
let seq = 0
const nextId = () => `r${++seq}`

export function useJobReferrals(jobId: string) {
  const referrals = computed(() => store.value.filter(r => r.jobId === jobId))

  function addReferral(payload: { name: string; sourceTag: string }) {
    const name = payload.name.trim()
    const sourceTag = payload.sourceTag.trim()
    if (!name || !sourceTag) return null
    const referral: JobReferral = {
      id: nextId(),
      jobId,
      name,
      sourceTag,
      referrals: 0,
      createdAt: 'just now',
      shareUrl: `https://app.recruitera.ai/careers/${jobId}?src=${encodeURIComponent(sourceTag)}&ref=${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`,
    }
    store.value = [...store.value, referral]
    return referral
  }

  function removeReferral(id: string) {
    store.value = store.value.filter(r => r.id !== id)
  }

  return { referrals, addReferral, removeReferral }
}
