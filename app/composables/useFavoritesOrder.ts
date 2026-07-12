import { useLocalStorage } from '@vueuse/core'

/**
 * Persisted user-defined order for the Favorites list on the Candidates page.
 * Stored by favorite key. Unknown/new keys always appear at the end in their
 * catalog order so future additions don't get lost.
 */
export function useFavoritesOrder(defaultKeys: string[]) {
  const order = useLocalStorage<string[]>(
    'recruitera:candidates:favorites-order',
    [...defaultKeys],
  )

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return
    const arr = order.value.slice()
    const [item] = arr.splice(from, 1)
    if (item === undefined) return
    arr.splice(to, 0, item)
    order.value = arr
  }

  function applyOrder<T extends { key: string }>(items: T[]): T[] {
    const map = new Map(items.map(i => [i.key, i]))
    const ordered: T[] = []
    for (const key of order.value) {
      const it = map.get(key)
      if (it) { ordered.push(it); map.delete(key) }
    }
    // Append any items whose key was added AFTER the user set an order.
    for (const it of map.values()) ordered.push(it)
    return ordered
  }

  return { order, move, applyOrder }
}
