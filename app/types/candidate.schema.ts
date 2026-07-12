import { z } from 'zod'

/** Save-search-as-favorite form. */
export const SaveSearchSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be under 60 characters')
    .trim(),
  shared: z.boolean().default(true),
})
export type SaveSearchInput = z.infer<typeof SaveSearchSchema>

/** Add-candidate form (used by the "+ Add candidates" flow when built). */
export const AddCandidateSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number').optional().or(z.literal('')),
  jobId: z.string().uuid('Invalid job ID').optional(),
})
export type AddCandidateInput = z.infer<typeof AddCandidateSchema>
