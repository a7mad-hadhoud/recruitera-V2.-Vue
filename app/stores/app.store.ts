import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useAppStore = defineStore('app', () => {
  // Trial banner dismissal persists across visits — otherwise the same
  // "Sample data active" strip re-appears every session, which is noise
  // once a user has already acknowledged it.
  const trialBannerDismissed = useLocalStorage('recruitera:trial-banner-dismissed', false)
  const trialBannerVisible = computed(() => !trialBannerDismissed.value)
  function dismissTrialBanner() { trialBannerDismissed.value = true }
  return { trialBannerVisible, dismissTrialBanner }
})
