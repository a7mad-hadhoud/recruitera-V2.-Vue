import { http, HttpResponse } from 'msw'
import type { EvaluationForm } from '~/types'

const evaluationForms: EvaluationForm[] = [
  {
    id: '1',
    name: 'Front End Developer template',
    category: 'Development',
    description: '',
    scoreRequired: true,
    questions: [
      { id: 'q1', type: 'Text (multiple lines)', q: 'How do you know when to solve a problem on your own or to ask for help?', hint: 'Look for self-awareness and team collaboration.', required: true },
      { id: 'q2', type: 'Text (multiple lines)', q: 'Describe a situation where you faced serious challenges in doing your job efficiently. What were the challenges, and how did you overcome them?', hint: 'S (situation), T (task), A (action), R (result).', required: true },
      { id: 'q3', type: 'Info box', q: 'Below are suitable development-related questions.', required: false },
      {
        id: 'q4',
        type: 'Scorecard',
        q: 'Scorecards',
        hint: 'Quick evaluations of the candidate\'s skills and values that align with the job.',
        required: true,
        statements: [
          { id: 's1', s: 'Communication in the required language(s)', d: 'Could the candidate speak and write fluently in the required language(s)?' },
          { id: 's2', s: 'Positive attitude', d: 'Could the candidate put a positive spin on hardships?' },
          { id: 's3', s: 'Teamwork', d: 'Could the candidate work well with colleagues with different backgrounds?' },
          { id: 's4', s: 'Result-driven', d: 'Did the candidate seem motivated to achieve great results?' },
        ],
      },
      { id: 'q5', type: 'Add a file', q: 'Upload any additional files you have or get from the candidate for this evaluation.', required: false },
    ],
  },
  {
    id: '2',
    name: 'Backend Engineer template',
    category: 'Development',
    description: '',
    scoreRequired: true,
    questions: [
      { id: 'q1', type: 'Text (multiple lines)', q: 'Describe your experience with distributed systems.', hint: 'Look for depth of technical understanding.', required: true },
    ],
  },
  {
    id: '3',
    name: 'Closing interview template',
    category: 'General',
    description: '',
    scoreRequired: true,
    questions: [
      { id: 'q1', type: 'Text (multiple lines)', q: 'What is your biggest professional achievement?', hint: 'Look for specific, quantifiable results.', required: true },
    ],
  },
  {
    id: '4',
    name: 'General evaluation template',
    category: 'General',
    description: '',
    scoreRequired: true,
    questions: [
      { id: 'q1', type: 'Text (multiple lines)', q: 'What motivates you in your work?', required: false },
    ],
  },
]

export const evaluationFormsHandlers = [
  http.get('/api/templates/evaluation-forms', () => {
    return HttpResponse.json({ data: evaluationForms, total: evaluationForms.length })
  }),
]
