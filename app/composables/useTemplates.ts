import { useQuery } from '@tanstack/vue-query'
import type { ApplicationFormsResponse, BenefitsTemplatesResponse, EmailTemplate, EmailTemplatesResponse, EvaluationFormsResponse, JobTemplatesResponse, OfferTemplatesResponse, PipelineTemplatesResponse, QuestionnaireFormsResponse, ReferralTemplatesResponse, WhatsAppTemplatesResponse } from '~/types'

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

export function useApplicationForms() {
  return useQuery({
    queryKey: ['templates', 'application-forms'],
    queryFn: async () => {
      const res = await fetch('/api/templates/application-forms')
      if (!res.ok) throw new Error('Failed to fetch application forms')
      return res.json() as Promise<ApplicationFormsResponse>
    },
  })
}

export function useEvaluationForms() {
  return useQuery({
    queryKey: ['templates', 'evaluation-forms'],
    queryFn: async () => {
      const res = await fetch('/api/templates/evaluation-forms')
      if (!res.ok) throw new Error('Failed to fetch evaluation forms')
      return res.json() as Promise<EvaluationFormsResponse>
    },
  })
}

export function useQuestionnaireForms() {
  return useQuery({
    queryKey: ['templates', 'questionnaire-forms'],
    queryFn: async () => {
      const res = await fetch('/api/templates/questionnaire-forms')
      if (!res.ok) throw new Error('Failed to fetch questionnaire forms')
      return res.json() as Promise<QuestionnaireFormsResponse>
    },
  })
}

export function useBenefitsTemplates() {
  return useQuery({
    queryKey: ['templates', 'benefits'],
    queryFn: async () => {
      const res = await fetch('/api/templates/benefits')
      if (!res.ok) throw new Error('Failed to fetch benefits templates')
      return res.json() as Promise<BenefitsTemplatesResponse>
    },
  })
}

export function usePipelineTemplates() {
  return useQuery({
    queryKey: ['templates', 'pipeline'],
    queryFn: async () => {
      const res = await fetch('/api/templates/pipeline')
      if (!res.ok) throw new Error('Failed to fetch pipeline templates')
      return res.json() as Promise<PipelineTemplatesResponse>
    },
  })
}

export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: ['templates', 'whatsapp'],
    queryFn: async () => {
      const res = await fetch('/api/templates/whatsapp')
      if (!res.ok) throw new Error('Failed to fetch WhatsApp templates')
      return res.json() as Promise<WhatsAppTemplatesResponse>
    },
  })
}

export function useJobTemplates() {
  return useQuery({
    queryKey: ['templates', 'job-templates'],
    queryFn: async () => {
      const res = await fetch('/api/templates/job-templates')
      if (!res.ok) throw new Error('Failed to fetch job templates')
      return res.json() as Promise<JobTemplatesResponse>
    },
  })
}

export function useReferralQuestions() {
  return useQuery({
    queryKey: ['templates', 'referral-questions'],
    queryFn: async () => {
      const res = await fetch('/api/templates/referral-questions')
      if (!res.ok) throw new Error('Failed to fetch referral question templates')
      return res.json() as Promise<ReferralTemplatesResponse>
    },
  })
}

export function useOfferTemplates() {
  return useQuery({
    queryKey: ['templates', 'offer'],
    queryFn: async () => {
      const res = await fetch('/api/templates/offer')
      if (!res.ok) throw new Error('Failed to fetch offer templates')
      return res.json() as Promise<OfferTemplatesResponse>
    },
  })
}
