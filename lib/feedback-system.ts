/**
 * Feedback system for PyTeal code generation
 */

export interface CodeFeedback {
  id: string
  query: string
  code: string
  rating: number // 1-5 scale
  issues: string[]
  suggestions: string[]
  timestamp: string
  userId?: string
  templateId?: string
}

// In-memory storage for feedback (in a real app, this would be a database)
const feedbackStore: CodeFeedback[] = []

/**
 * Submit feedback for generated PyTeal code
 * @param feedback The feedback object
 * @returns The submitted feedback with ID
 */
export function submitFeedback(feedback: Omit<CodeFeedback, "id" | "timestamp">): CodeFeedback {
  const id = `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const timestamp = new Date().toISOString()

  const newFeedback: CodeFeedback = {
    ...feedback,
    id,
    timestamp,
  }

  // Store the feedback
  feedbackStore.push(newFeedback)

  // In a real app, you would save this to a database
  console.log("Feedback submitted:", newFeedback)

  return newFeedback
}

/**
 * Get all feedback
 * @returns Array of all feedback
 */
export function getAllFeedback(): CodeFeedback[] {
  return [...feedbackStore]
}

/**
 * Get feedback for a specific template
 * @param templateId The template ID
 * @returns Array of feedback for the template
 */
export function getTemplateFeedback(templateId: string): CodeFeedback[] {
  return feedbackStore.filter((feedback) => feedback.templateId === templateId)
}

/**
 * Get average rating for a template
 * @param templateId The template ID
 * @returns Average rating or null if no feedback
 */
export function getTemplateAverageRating(templateId: string): number | null {
  const feedback = getTemplateFeedback(templateId)

  if (feedback.length === 0) {
    return null
  }

  const sum = feedback.reduce((total, item) => total + item.rating, 0)
  return sum / feedback.length
}

/**
 * Get common issues for a template
 * @param templateId The template ID
 * @returns Map of issues and their frequency
 */
export function getTemplateCommonIssues(templateId: string): Map<string, number> {
  const feedback = getTemplateFeedback(templateId)
  const issueCount = new Map<string, number>()

  feedback.forEach((item) => {
    item.issues.forEach((issue) => {
      const count = issueCount.get(issue) || 0
      issueCount.set(issue, count + 1)
    })
  })

  return issueCount
}

/**
 * Analyze feedback to identify improvement opportunities
 * @returns Analysis of feedback
 */
export function analyzeFeedback(): {
  lowRatedTemplates: string[]
  commonIssues: Map<string, number>
  improvementSuggestions: string[]
} {
  // Find templates with low ratings
  const templateRatings = new Map<string, { total: number; count: number }>()

  feedbackStore.forEach((feedback) => {
    if (feedback.templateId) {
      const current = templateRatings.get(feedback.templateId) || { total: 0, count: 0 }
      templateRatings.set(feedback.templateId, {
        total: current.total + feedback.rating,
        count: current.count + 1,
      })
    }
  })

  const lowRatedTemplates: string[] = []

  templateRatings.forEach((rating, templateId) => {
    const average = rating.total / rating.count
    if (average < 3.5) {
      lowRatedTemplates.push(templateId)
    }
  })

  // Collect common issues
  const issueCount = new Map<string, number>()

  feedbackStore.forEach((feedback) => {
    feedback.issues.forEach((issue) => {
      const count = issueCount.get(issue) || 0
      issueCount.set(issue, count + 1)
    })
  })

  // Collect improvement suggestions
  const suggestions = new Set<string>()

  feedbackStore.forEach((feedback) => {
    feedback.suggestions.forEach((suggestion) => {
      suggestions.add(suggestion)
    })
  })

  return {
    lowRatedTemplates,
    commonIssues: issueCount,
    improvementSuggestions: Array.from(suggestions),
  }
}
