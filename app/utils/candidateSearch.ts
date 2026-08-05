/**
 * Semantic candidate search + keyword derivation.
 *
 * Powers two things:
 *   1. The `search` param of /api/candidates — boolean keywords (AND/OR) with
 *      synonym expansion (searching "recruiter" also finds "Talent Acquisition").
 *   2. The Keywords column — `candidateKeywords()` derives the continuous list
 *      of searchable terms shown per row, using the same synonym groups so the
 *      column literally previews what will match a candidate.
 *
 * Pure + framework-free so it runs in the mock handler today and can be lifted
 * into a real backend later unchanged.
 */

/**
 * Role synonym groups — expanded for BOTH search matching and the Keywords
 * column. Order matters for the column: distinctive synonyms should sit right
 * after morphological variants so the display picker skips the near-duplicates.
 * Keep entries lowercase.
 */
export const ROLE_SYNONYM_GROUPS: string[][] = [
  ['recruiter', 'recruiting', 'recruitment', 'talent acquisition', 'sourcer', 'headhunter', 'talent acquisition specialist', 'ta specialist', 'talent partner'],
  ['engineer', 'developer', 'dev', 'swe', 'software engineer', 'programmer', 'coder'],
  ['frontend', 'front-end', 'front end', 'ui engineer', 'react', 'vue', 'client-side'],
  ['backend', 'back-end', 'back end', 'server-side', 'api engineer'],
  ['fullstack', 'full-stack', 'full stack'],
  ['marketer', 'marketing', 'growth', 'demand generation', 'seo', 'content marketer'],
  ['designer', 'design', 'ux', 'ui', 'product designer', 'ux/ui', 'ui/ux'],
  ['data', 'analyst', 'analytics', 'data scientist', 'data analyst', 'bi'],
  ['product manager', 'pm', 'product owner', 'po'],
  ['project manager', 'program manager', 'delivery manager'],
  ['sales', 'account executive', 'ae', 'business development', 'bdr', 'sdr'],
]

/**
 * Seniority / modifier groups — expanded for SEARCH, but not treated as the
 * primary "role" when deriving the Keywords column (they're shown plainly).
 */
export const MODIFIER_SYNONYM_GROUPS: string[][] = [
  ['senior', 'sr', 'sr.', 'lead', 'principal', 'staff'],
  ['junior', 'jr', 'jr.', 'entry level', 'entry-level', 'graduate', 'associate'],
  ['manager', 'management', 'head', 'director', 'lead', 'team lead'],
]

/** Every group — used to build the search expansion map. */
export const SYNONYM_GROUPS: string[][] = [...ROLE_SYNONYM_GROUPS, ...MODIFIER_SYNONYM_GROUPS]

/** term (lowercase) → set of expanded variants (includes the term itself). */
const EXPANSION = (() => {
  const map = new Map<string, Set<string>>()
  for (const group of SYNONYM_GROUPS) {
    for (const member of group) {
      const set = map.get(member) ?? new Set<string>()
      for (const other of group) set.add(other)
      map.set(member, set)
    }
  }
  return map
})()

/** Expand a single phrase to itself + any synonyms. */
export function expandTerm(term: string): string[] {
  const t = term.trim().toLowerCase()
  if (!t) return []
  const variants = new Set<string>([t])
  const direct = EXPANSION.get(t)
  if (direct) for (const v of direct) variants.add(v)
  return [...variants]
}

/** Does a single phrase (with its synonyms) appear in the haystack? */
function termMatches(haystack: string, term: string): boolean {
  return expandTerm(term).some(v => haystack.includes(v))
}

const OR_SPLIT = /\s+or\s+|\s*\|\|\s*/i
const AND_SPLIT = /\s+and\s+|\s*&&\s*|\s*\+\s*/i

/**
 * Match a haystack against a boolean query.
 *   OR clauses (lowest precedence) → any clause matching wins.
 *   AND terms inside a clause → all must match.
 *   A term with no operator is a phrase, matched with synonym expansion.
 * Empty / whitespace query matches everything.
 */
export function matchesSearchQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hay = haystack.toLowerCase()

  const clauses = q.split(OR_SPLIT).map(c => c.trim()).filter(Boolean)
  return clauses.some((clause) => {
    const terms = clause.split(AND_SPLIT).map(t => t.trim()).filter(Boolean)
    if (!terms.length) return false
    return terms.every(term => termMatches(hay, term))
  })
}

/**
 * Build the searchable text blob for a candidate row.
 *
 * Deliberately name + the SAME keywords rendered in the Keywords column
 * (via candidateKeywords) — so search is what-you-see-is-what-matches.
 * We do NOT fold in raw talent-pool names: a pool called "Next recruitment
 * - Q3" would otherwise match a "recruiter" search for a candidate who isn't
 * a recruiter at all. Pools have their own filter. A generous cap keeps every
 * keyword searchable even though the column only shows the first 8.
 */
export function candidateHaystack(c: {
  name: string
  jobs?: { title: string }[]
  tags?: string[]
  sources?: string[]
  talentPools?: string[]
}): string {
  return [c.name, ...candidateKeywords(c, 50)].join(' ').toLowerCase()
}

// ─────────────────────────── Keyword derivation ───────────────────────────

const KW_STOP = new Set(['sample'])

/** 5-char alphanumeric stem — used to drop near-duplicate synonyms in the UI. */
function stem(s: string): string {
  return s.replace(/[^a-z0-9]/g, '').slice(0, 5)
}

function roleGroupFor(term: string): string[] | undefined {
  return ROLE_SYNONYM_GROUPS.find(g => g.includes(term))
}

/** Distinct display synonyms for a role term — drops stem-duplicate variants. */
function displaySynonyms(term: string, limit = 2): string[] {
  const group = roleGroupFor(term)
  if (!group) return []
  const seen = new Set([stem(term)])
  const out: string[] = []
  for (const m of group) {
    if (m === term) continue
    const st = stem(m)
    if (seen.has(st)) continue
    seen.add(st)
    out.push(m)
    if (out.length >= limit) break
  }
  return out
}

function cleanPhrase(s: string): string {
  return s
    .replace(/\(sample\)/gi, ' ')
    .replace(/[^a-z0-9 /+.-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Derive the continuous list of searchable keywords shown in the Keywords
 * column: role (expanded with a couple of distinct synonyms) + any seniority
 * words + tags + sources. Deduped, capped, ready to render inline.
 */
export function candidateKeywords(
  c: { jobs?: { title: string }[]; tags?: string[]; sources?: string[] },
  limit = 8,
): string[] {
  const out: string[] = []
  const push = (raw: string) => {
    const t = raw.trim().toLowerCase()
    if (!t || KW_STOP.has(t) || out.includes(t)) return
    out.push(t)
  }

  for (const j of c.jobs ?? []) {
    const phrase = cleanPhrase(j.title)
    if (!phrase) continue
    const words = phrase.split(' ')
    // Role = the full phrase if it's a known role, else the last known-role word.
    const role = roleGroupFor(phrase) ? phrase : [...words].reverse().find(w => roleGroupFor(w))
    if (role) {
      push(role)
      for (const syn of displaySynonyms(role)) push(syn)
      for (const w of words) if (w !== role && w.length > 2) push(w) // e.g. "senior"
    } else {
      for (const w of words) if (w.length > 2) push(w)
    }
  }

  for (const t of c.tags ?? []) push(t)
  for (const s of c.sources ?? []) push(s)

  return out.slice(0, limit)
}
