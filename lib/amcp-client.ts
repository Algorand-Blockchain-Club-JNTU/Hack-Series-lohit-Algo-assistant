/**
 * Algorand Model Context Protocol (AMCP) Client
 * Developed based on goplausible's implementation
 */

import type { AIServiceOptions } from "./types"
import { getSmartContractBestPractices } from "./algorand-knowledge-base"
import {
  templateExists,
  getTemplateFeatures,
  getTemplateComplexity,
  getTemplateCode,
  getTemplateDescription,
} from "./pyteal-templates-helper"

// AMCP Protocol version
const PROTOCOL_VERSION = "1.0.0"

// AMCP Context Types
export enum AMCPContextType {
  BLOCKCHAIN_STATE = "blockchain_state",
  ACCOUNT_INFO = "account_info",
  TRANSACTION_HISTORY = "transaction_history",
  SMART_CONTRACT = "smart_contract",
  ASA_INFO = "asa_info",
  DEVELOPER_DOCS = "developer_docs",
  SMART_CONTRACT_TEMPLATE = "smart_contract_template",
}

// AMCP Context interface
export interface AMCPContext {
  type: AMCPContextType
  data: any
  timestamp: string
  source?: string
}

// AMCP Request interface
export interface AMCPRequest {
  query: string
  contexts?: AMCPContext[]
  options?: {
    maxContexts?: number
    priorityTypes?: AMCPContextType[]
    excludeTypes?: AMCPContextType[]
  }
}

// AMCP Response interface
export interface AMCPResponse {
  enhancedQuery: string
  contexts: AMCPContext[]
  metadata: {
    protocolVersion: string
    processingTime: number
    contextCount: number
  }
}

/**
 * AMCP Client for enhancing AI queries with Algorand-specific context
 */
export class AMCPClient {
  private apiEndpoint: string
  private apiKey?: string
  private contexts: AMCPContext[] = []

  constructor(apiEndpoint = "/api/amcp", apiKey?: string) {
    this.apiEndpoint = apiEndpoint
    this.apiKey = apiKey
  }

  /**
   * Enhance a query with Algorand-specific context
   * @param query The user's original query
   * @param walletInfo Optional wallet information to include in context
   * @param options Additional options for context retrieval
   * @returns Enhanced query with relevant Algorand context
   */
  async enhanceQuery(
    query: string,
    walletInfo?: AIServiceOptions["walletInfo"],
    options?: AMCPRequest["options"],
  ): Promise<AMCPResponse> {
    try {
      // In a production environment, this would call an actual AMCP service
      // For now, we'll simulate the response with relevant Algorand context

      // Start timing for processing time calculation
      const startTime = Date.now()

      // Build initial contexts array
      this.contexts = []

      // Add wallet context if available
      if (walletInfo?.connected && walletInfo.address) {
        this.contexts.push({
          type: AMCPContextType.ACCOUNT_INFO,
          data: {
            address: walletInfo.address,
            balance: walletInfo.balance || 0,
            network: walletInfo.network || "TestNet",
            assets: walletInfo.assets || [],
          },
          timestamp: new Date().toISOString(),
          source: "wallet-connection",
        })
      }

      // Add blockchain state context
      this.contexts.push({
        type: AMCPContextType.BLOCKCHAIN_STATE,
        data: {
          currentRound: 28000000 + Math.floor(Math.random() * 10000),
          lastBlock: Date.now(),
          totalTransactions: 150000000 + Math.floor(Math.random() * 1000000),
          totalAccounts: 3500000 + Math.floor(Math.random() * 100000),
          totalAssets: 1200000 + Math.floor(Math.random() * 10000),
          totalApps: 180000 + Math.floor(Math.random() * 5000),
        },
        timestamp: new Date().toISOString(),
        source: "algorand-indexer-simulation",
      })

      // Analyze query to determine relevant context types
      const lowerQuery = query.toLowerCase()

      // Add smart contract context if query is about smart contracts
      if (
        lowerQuery.includes("smart contract") ||
        lowerQuery.includes("pyteal") ||
        lowerQuery.includes("teal") ||
        lowerQuery.includes("application") ||
        lowerQuery.includes("stateful") ||
        lowerQuery.includes("stateless")
      ) {
        // Enhanced smart contract context with more specific information
        const smartContractContext: AMCPContext = {
          type: AMCPContextType.SMART_CONTRACT,
          data: {
            latestTEALVersion: 8,
            recommendedPyTealVersion: "0.22.0",
            bestPractices: getSmartContractBestPractices().slice(0, 5),
            commonPatterns: [
              "Escrow accounts",
              "Stateful counters",
              "Asset transfer authorization",
              "Voting systems",
              "Multisignature wallets",
            ],
            stateManagement: {
              global: {
                maxSize: "64 key-value pairs",
                maxKeySize: "64 bytes",
                maxValueSize: "128 bytes for bytes, 8 bytes for uint",
              },
              local: {
                maxSize: "16 key-value pairs per account",
                maxKeySize: "64 bytes",
                maxValueSize: "128 bytes for bytes, 8 bytes for uint",
              },
            },
            securityConsiderations: [
              "Always validate inputs",
              "Use proper error handling",
              "Avoid reentrancy vulnerabilities",
              "Consider transaction fee implications",
              "Test thoroughly with different scenarios",
            ],
          },
          timestamp: new Date().toISOString(),
          source: "algorand-developer-docs",
        }

        this.contexts.push(smartContractContext)

        // Check for specific contract types
        if (
          lowerQuery.includes("voting") ||
          lowerQuery.includes("vote") ||
          lowerQuery.includes("ballot") ||
          lowerQuery.includes("election")
        ) {
          // Add voting-specific template context
          const templateName = "voting"

          // Use our helper functions to get template information
          if (templateExists(templateName)) {
            const templateDescription = getTemplateDescription(templateName) || "A voting smart contract"
            const templateFeatures = getTemplateFeatures(templateName) || []
            const templateComplexity = getTemplateComplexity(templateName) || "medium"
            const templateCode = getTemplateCode(templateName) || ""

            this.contexts.push({
              type: AMCPContextType.SMART_CONTRACT_TEMPLATE,
              data: {
                templateName,
                description: templateDescription,
                keyFeatures: templateFeatures,
                complexity: templateComplexity,
                bestPractices: [
                  "Always validate candidate indices",
                  "Check if users have already voted",
                  "Ensure users have opted in before voting",
                  "Use proper key naming conventions for state",
                  "Include clear documentation for deployment and usage",
                ],
                templateCode: templateCode.substring(0, 500) + "...", // Include a preview
              },
              timestamp: new Date().toISOString(),
              source: "algorand-smart-contract-templates",
            })
          }
        }
      }

      // Add ASA context if query is about tokens or assets
      if (
        lowerQuery.includes("asa") ||
        lowerQuery.includes("asset") ||
        lowerQuery.includes("token") ||
        lowerQuery.includes("nft")
      ) {
        this.contexts.push({
          type: AMCPContextType.ASA_INFO,
          data: {
            standardTypes: ["Fungible Token", "Non-Fungible Token (NFT)", "Fractional NFT"],
            latestStandards: ["ARC-3", "ARC-19", "ARC-69"],
            bestPractices: [
              "Use ARC-3 for NFTs with metadata",
              "Implement clawback for regulated assets",
              "Consider freeze address for compliance",
              "Use reserve address for controlled distribution",
            ],
            asaParameters: {
              total: "Total supply of the asset",
              decimals: "Number of decimals for display purposes",
              defaultFrozen: "Whether accounts should start frozen by default",
              unitName: "Short name for the asset (e.g., 'ALGO')",
              assetName: "Full name for the asset (e.g., 'Algorand')",
              url: "URL for more information about the asset",
              metadataHash: "Hash of the metadata for the asset",
              manager: "Address that can change asset configuration",
              reserve: "Address holding reserve units of the asset",
              freeze: "Address that can freeze/unfreeze the asset",
              clawback: "Address that can clawback the asset",
            },
          },
          timestamp: new Date().toISOString(),
          source: "algorand-developer-docs",
        })
      }

      // Add developer docs context for general development questions
      if (
        lowerQuery.includes("develop") ||
        lowerQuery.includes("code") ||
        lowerQuery.includes("implement") ||
        lowerQuery.includes("build") ||
        lowerQuery.includes("create")
      ) {
        this.contexts.push({
          type: AMCPContextType.DEVELOPER_DOCS,
          data: {
            sdks: [
              { name: "JavaScript", version: "2.5.0", url: "https://github.com/algorand/js-algorand-sdk" },
              { name: "Python", version: "2.0.0", url: "https://github.com/algorand/py-algorand-sdk" },
              { name: "Java", version: "2.0.0", url: "https://github.com/algorand/java-algorand-sdk" },
              { name: "Go", version: "0.0.1", url: "https://github.com/algorand/go-algorand-sdk" },
            ],
            tools: [
              { name: "Algorand Sandbox", description: "Local development environment" },
              { name: "PyTeal", description: "Python library for generating TEAL programs" },
              { name: "Beaker", description: "Smart contract development framework" },
              { name: "AlgoKit", description: "Algorand development kit" },
            ],
            networks: [
              { name: "MainNet", description: "Production Algorand network" },
              { name: "TestNet", description: "Testing network with free tokens" },
              { name: "BetaNet", description: "Preview of upcoming features" },
            ],
            documentation: {
              developer_portal: "https://developer.algorand.org/",
              docs: "https://developer.algorand.org/docs/",
              pyteal_docs: "https://pyteal.readthedocs.io/en/latest/",
              beaker_docs: "https://beaker.algo.xyz/",
              algokit_docs: "https://github.com/algorandfoundation/algokit-cli",
            },
          },
          timestamp: new Date().toISOString(),
          source: "algorand-developer-portal",
        })
      }

      // Apply options if provided
      if (options) {
        // Filter by priority types
        if (options.priorityTypes && options.priorityTypes.length > 0) {
          this.contexts.sort((a, b) => {
            const aIndex = options.priorityTypes!.indexOf(a.type)
            const bIndex = options.priorityTypes!.indexOf(b.type)
            if (aIndex === -1 && bIndex === -1) return 0
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1
            return aIndex - bIndex
          })
        }

        // Exclude specified types
        if (options.excludeTypes && options.excludeTypes.length > 0) {
          this.contexts = this.contexts.filter((context) => !options.excludeTypes!.includes(context.type))
        }

        // Limit to max contexts
        if (options.maxContexts && options.maxContexts > 0 && this.contexts.length > options.maxContexts) {
          this.contexts = this.contexts.slice(0, options.maxContexts)
        }
      }

      // Calculate processing time
      const processingTime = Date.now() - startTime

      // Construct enhanced query with context
      const contextualInfo = this.contexts
        .map((ctx) => {
          switch (ctx.type) {
            case AMCPContextType.ACCOUNT_INFO:
              return `User wallet: ${ctx.data.address} (${ctx.data.balance / 1000000} ALGO on ${ctx.data.network})`
            case AMCPContextType.BLOCKCHAIN_STATE:
              return `Current Algorand state: Round ${ctx.data.currentRound}`
            case AMCPContextType.SMART_CONTRACT:
              return `Latest TEAL version: ${ctx.data.latestTEALVersion}, PyTeal: ${ctx.data.recommendedPyTealVersion}`
            case AMCPContextType.SMART_CONTRACT_TEMPLATE:
              return `Relevant template: ${ctx.data.templateName} - ${ctx.data.description}`
            case AMCPContextType.ASA_INFO:
              return `Relevant ASA standards: ${ctx.data.latestStandards.join(", ")}`
            case AMCPContextType.DEVELOPER_DOCS:
              return `Available SDKs: ${ctx.data.sdks.map((sdk: any) => `${sdk.name} v${sdk.version}`).join(", ")}`
            default:
              return ""
          }
        })
        .filter(Boolean)
        .join("; ")

      const enhancedQuery = `${query}\n\nAlgorand Context: ${contextualInfo}`

      return {
        enhancedQuery,
        contexts: this.contexts,
        metadata: {
          protocolVersion: PROTOCOL_VERSION,
          processingTime,
          contextCount: this.contexts.length,
        },
      }
    } catch (error) {
      console.error("AMCP enhancement failed:", error)
      // Return original query if enhancement fails
      return {
        enhancedQuery: query,
        contexts: [],
        metadata: {
          protocolVersion: PROTOCOL_VERSION,
          processingTime: 0,
          contextCount: 0,
        },
      }
    }
  }

  /**
   * Get relevant documentation based on query
   * @param query The user's query
   * @returns Relevant documentation snippets
   */
  async getRelevantDocs(query: string): Promise<AMCPContext | null> {
    try {
      // This would typically call a vector database or documentation search API
      // For now, we'll return simulated documentation based on keywords

      const lowerQuery = query.toLowerCase()

      if (lowerQuery.includes("pyteal")) {
        return {
          type: AMCPContextType.DEVELOPER_DOCS,
          data: {
            title: "PyTeal Documentation",
            content:
              "PyTeal is a Python language binding for Algorand Smart Contracts (ASC1s). PyTeal allows developers to express smart contract logic using Python and compile it to TEAL code.",
            url: "https://pyteal.readthedocs.io/en/latest/",
            version: "0.22.0",
            examples: [
              {
                name: "Simple Counter",
                description: "A simple counter that can be incremented and read",
                url: "https://pyteal.readthedocs.io/en/latest/examples.html#counter",
              },
              {
                name: "Atomic Swap",
                description: "An atomic swap contract for trading assets",
                url: "https://pyteal.readthedocs.io/en/latest/examples.html#atomic-swap",
              },
            ],
          },
          timestamp: new Date().toISOString(),
          source: "algorand-developer-docs",
        }
      }

      if (lowerQuery.includes("asa") || lowerQuery.includes("asset")) {
        return {
          type: AMCPContextType.DEVELOPER_DOCS,
          data: {
            title: "Algorand Standard Assets",
            content:
              "Algorand Standard Assets (ASA) provide a standardized, Layer-1 mechanism to represent any type of asset on the Algorand blockchain.",
            url: "https://developer.algorand.org/docs/get-details/asa/",
            version: "current",
            examples: [
              {
                name: "Create an ASA",
                description: "How to create an Algorand Standard Asset",
                url: "https://developer.algorand.org/docs/get-details/asa/#creating-an-asset",
              },
              {
                name: "Transfer an ASA",
                description: "How to transfer an Algorand Standard Asset",
                url: "https://developer.algorand.org/docs/get-details/asa/#transferring-an-asset",
              },
            ],
          },
          timestamp: new Date().toISOString(),
          source: "algorand-developer-docs",
        }
      }

      if (lowerQuery.includes("voting") || lowerQuery.includes("vote")) {
        return {
          type: AMCPContextType.DEVELOPER_DOCS,
          data: {
            title: "Voting Smart Contracts on Algorand",
            content:
              "Voting smart contracts on Algorand typically use global state to track candidates and vote counts, and local state to track whether users have voted.",
            url: "https://developer.algorand.org/solutions/",
            version: "current",
            examples: [
              {
                name: "Simple Voting Contract",
                description: "A simple voting contract with multiple candidates",
                url: "https://developer.algorand.org/solutions/",
              },
            ],
            bestPractices: [
              "Use global state to track vote counts",
              "Use local state to prevent double voting",
              "Validate candidate indices",
              "Require users to opt in before voting",
              "Consider voting periods with time constraints",
            ],
          },
          timestamp: new Date().toISOString(),
          source: "algorand-developer-docs",
        }
      }

      return null
    } catch (error) {
      console.error("Failed to get relevant docs:", error)
      return null
    }
  }

  /**
   * Get relevant smart contract template based on query
   * @param query The user's query
   * @returns Relevant smart contract template
   */
  async getRelevantTemplate(query: string): Promise<AMCPContext | null> {
    try {
      const lowerQuery = query.toLowerCase()

      // Determine template type from query
      let templateType = ""

      if (lowerQuery.includes("voting") || lowerQuery.includes("vote") || lowerQuery.includes("ballot")) {
        templateType = "voting"
      } else if (lowerQuery.includes("auction") || lowerQuery.includes("bid")) {
        templateType = "auction"
      } else if (lowerQuery.includes("escrow") || lowerQuery.includes("lock")) {
        templateType = "escrow"
      } else if (lowerQuery.includes("token") || lowerQuery.includes("asa")) {
        templateType = "token"
      }

      if (!templateType || !templateExists(templateType)) return null

      // Get template information using our helper functions
      const templateDescription = getTemplateDescription(templateType) || "Smart contract template"
      const templateFeatures = getTemplateFeatures(templateType) || []
      const templateComplexity = getTemplateComplexity(templateType) || "medium"
      const templateCode = getTemplateCode(templateType) || ""

      return {
        type: AMCPContextType.SMART_CONTRACT_TEMPLATE,
        data: {
          templateName: templateType,
          description: templateDescription,
          keyFeatures: templateFeatures,
          complexity: templateComplexity,
          bestPractices: [
            "Follow Algorand security best practices",
            "Validate all inputs",
            "Use proper state management",
            "Include clear documentation",
            "Test thoroughly before deployment",
          ],
          code: templateCode,
        },
        timestamp: new Date().toISOString(),
        source: "algorand-smart-contract-templates",
      }
    } catch (error) {
      console.error("Failed to get relevant template:", error)
      return null
    }
  }
}

// Export singleton instance
export const amcpClient = new AMCPClient()
