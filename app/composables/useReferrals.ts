// Employee referrals — scoped to what's observable in the UI without a real
// pipeline/Smart-Distribution backend (see docs/superpowers/specs/2026-08-06-
// career-site-public-design.md). Tracks Referral Form submissions; "Copy my
// referral link" is a generated URL only (no second visitor to click it here).

export interface Referral {
  id: string
  jobId: string
  jobTitle: string
  mode: 'Form' | 'Link'
  candidateName: string
  referrerEmail: string
  status: 'Submitted' | 'Reviewing' | 'Interviewing' | 'Hired' | 'Bonus Paid' | 'Ineligible'
  createdAt: string
}

const store = ref<Referral[]>([])
let seq = 0

export function useReferrals() {
  function forEmployee(email: string) {
    return computed(() => store.value.filter(r => r.referrerEmail === email))
  }
  function addFormReferral(payload: { jobId: string, jobTitle: string, candidateName: string, referrerEmail: string }) {
    const referral: Referral = {
      id: `ref${++seq}`,
      jobId: payload.jobId,
      jobTitle: payload.jobTitle,
      mode: 'Form',
      candidateName: payload.candidateName,
      referrerEmail: payload.referrerEmail,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    }
    store.value = [referral, ...store.value]
    return referral
  }
  function referralLink(jobId: string, employeeEmail: string) {
    const token = employeeEmail.split('@')[0]
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/careers/jobs/${jobId}?ref=${encodeURIComponent(token ?? 'employee')}`
  }
  return { forEmployee, addFormReferral, referralLink }
}
