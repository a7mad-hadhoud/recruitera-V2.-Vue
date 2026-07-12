import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const trialBannerVisible = ref(true)
  function dismissTrialBanner() { trialBannerVisible.value = false }
  return { trialBannerVisible, dismissTrialBanner }
})
