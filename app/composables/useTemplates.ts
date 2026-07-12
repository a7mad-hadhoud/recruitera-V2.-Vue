import { useQuery } from '@tanstack/vue-query'
import type { EmailTemplate, EmailTemplatesResponse } from '~/types'

export function useEmailTemplates() {
  return useQuery({
    queryKey: ['templates', 'email'],
    queryFn: async () => {
      const res = await fetch('/api/templates/email')
      if (!res.ok) throw new Error('Failed to fetch email templates')
      return res.json() as Promise<EmailTemplatesResponse>
    },
  })
}

export function useEmailTemplate(id: import('vue').Ref<string | null>) {
  return useQuery({
    queryKey: ['template', 'email', id],
    queryFn: async () => {
      if (!id.value) return null
      const res = await fetch(`/api/templates/email/${id.value}`)
      if (!res.ok) throw new Error('Failed to fetch template')
      return res.json() as Promise<EmailTemplate>
    },
    enabled: () => !!id.value,
  })
}
