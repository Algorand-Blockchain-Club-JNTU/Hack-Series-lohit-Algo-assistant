/**
 * System for collecting and preparing data for fine-tuning the AI model
 */

export interface FineTuningExample {
  id: string
  query: string
  response: string
  quality: "high" | "medium" | "low"
  tags: string[]
  source: "template" | "feedback" | "manual" | "generated"
  timestamp: string
}

// In-memory storage for fine-tuning examples (in a real app, this would be a database)
const fineTuningExamples: FineTuningExample[] = []

/**
 * Add a new example for fine-tuning
 * @param example The example to add
 * @returns The added example with ID
 */
export function addFineTuningExample(example: Omit<FineTuningExample, "id" | "timestamp">): FineTuningExample {
  const id = `example_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const timestamp = new Date().toISOString()

  const newExample: FineTuningExample = {
    ...example,
    id,
    timestamp,
  }

  // Store the example
  fineTuningExamples.push(newExample)

  // In a real app, you would save this to a database
  console.log("Fine-tuning example added:", newExample)

  return newExample
}

/**
 * Get all fine-tuning examples
 * @returns Array of all examples
 */
export function getAllFineTuningExamples(): FineTuningExample[] {
  return [...fineTuningExamples]
}

/**
 * Get high-quality examples for fine-tuning
 * @returns Array of high-quality examples
 */
export function getHighQualityExamples(): FineTuningExample[] {
  return fineTuningExamples.filter((example) => example.quality === "high")
}

/**
 * Generate fine-tuning dataset in JSONL format
 * @param examples The examples to include in the dataset
 * @returns JSONL string
 */
export function generateFineTuningDataset(examples: FineTuningExample[]): string {
  return examples
    .map((example) => {
      // Format for OpenAI fine-tuning
      const formattedExample = {
        messages: [
          {
            role: "system",
            content: "You are an expert Algorand smart contract developer specializing in PyTeal.",
          },
          {
            role: "user",
            content: example.query,
          },
          {
            role: "assistant",
            content: example.response,
          },
        ],
      }

      return JSON.stringify(formattedExample)
    })
    .join("\n")
}

/**
 * Convert template to fine-tuning example
 * @param templateId The template ID
 * @param query A sample query for this template
 * @returns A fine-tuning example
 */
export function templateToFineTuningExample(templateId: string, query: string): FineTuningExample | null {
  // Import here to avoid circular dependencies
  const { getTemplate } = require("./pyteal-templates-enhanced")

  const template = getTemplate(templateId)

  if (!template) {
    return null
  }

  // Create a response that includes the template code
  const response = `
Here's a ${template.name} for Algorand using PyTeal:

\`\`\`python
${template.code}
\`\`\`

This contract implements ${template.description.toLowerCase()}. It uses PyTeal version ${template.pytealVersion} and includes the following features:
${template.features.map((feature) => `- ${feature}`).join("\n")}

The code follows Algorand best practices and includes proper error handling and authorization checks.
  `.trim()

  return {
    id: `template_${templateId}_${Date.now()}`,
    query,
    response,
    quality: "high",
    tags: ["template", ...template.features],
    source: "template",
    timestamp: new Date().toISOString(),
  }
}

/**
 * Generate synthetic examples for fine-tuning
 * @param count Number of examples to generate
 * @returns Array of generated examples
 */
export async function generateSyntheticExamples(count: number): Promise<FineTuningExample[]> {
  const examples: FineTuningExample[] = []

  // This would typically use the AI to generate examples
  // For now, we'll create some simple examples

  const queryTemplates = [
    "Create a smart contract for {purpose}",
    "How do I implement {feature} in PyTeal?",
    "Write a PyTeal contract that {action}",
    "Can you show me an example of {concept} in PyTeal?",
    "I need a {type} contract for Algorand",
  ]

  const purposes = [
    "voting",
    "token sales",
    "NFT marketplace",
    "escrow",
    "staking rewards",
    "DAO governance",
    "decentralized exchange",
    "lottery",
    "time-locked funds",
  ]

  const features = [
    "global state",
    "local state",
    "inner transactions",
    "atomic transfers",
    "asset transfers",
    "ABI methods",
    "box storage",
    "stateless contracts",
  ]

  const actions = [
    "manages user votes",
    "handles token sales",
    "transfers assets securely",
    "implements a marketplace",
    "tracks user participation",
    "distributes rewards",
  ]

  const concepts = [
    "asset creation",
    "atomic transfers",
    "stateful applications",
    "ARC standards",
    "box storage",
    "inner transactions",
  ]

  const types = ["voting", "token sale", "NFT", "escrow", "staking", "governance"]

  for (let i = 0; i < count; i++) {
    // Generate a random query
    const queryTemplate = queryTemplates[Math.floor(Math.random() * queryTemplates.length)]
    let query = queryTemplate

    if (query.includes("{purpose}")) {
      query = query.replace("{purpose}", purposes[Math.floor(Math.random() * purposes.length)])
    }

    if (query.includes("{feature}")) {
      query = query.replace("{feature}", features[Math.floor(Math.random() * features.length)])
    }

    if (query.includes("{action}")) {
      query = query.replace("{action}", actions[Math.floor(Math.random() * actions.length)])
    }

    if (query.includes("{concept}")) {
      query = query.replace("{concept}", concepts[Math.floor(Math.random() * concepts.length)])
    }

    if (query.includes("{type}")) {
      query = query.replace("{type}", types[Math.floor(Math.random() * types.length)])
    }

    // For a real implementation, you would use the AI to generate a response
    // For now, we'll use a placeholder
    const response = `This would be a high-quality response for: ${query}`

    examples.push({
      id: `synthetic_${i}_${Date.now()}`,
      query,
      response,
      quality: "medium",
      tags: ["synthetic"],
      source: "generated",
      timestamp: new Date().toISOString(),
    })
  }

  return examples
}

/**
 * Prepare fine-tuning job configuration
 * @param datasetPath Path to the dataset file
 * @returns Fine-tuning job configuration
 */
export function prepareFineTuningJob(datasetPath: string): any {
  return {
    training_file: datasetPath,
    model: "gpt-4o",
    hyperparameters: {
      n_epochs: 3,
      batch_size: 4,
      learning_rate_multiplier: 0.1,
    },
    suffix: "pyteal-expert-" + new Date().toISOString().split("T")[0],
  }
}
