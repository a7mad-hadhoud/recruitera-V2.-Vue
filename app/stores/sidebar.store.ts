import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', () => {
  const isOpen = ref(true)
  const isMobile = ref(false)
  function toggle() { isOpen.value = !isOpen.value }
  function close() { isOpen.value = false }
  function open() { isOpen.value = true }
  return { isOpen, isMobile, toggle, close, open }
})
