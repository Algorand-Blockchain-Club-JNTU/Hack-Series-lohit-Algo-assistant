import { GoogleGenerativeAI } from "@google/generative-ai"
import type { AIServiceOptions } from "./types"
import { validateAndCorrectResponse } from "./response-validator"
import { findMatchingExample, getAlgorandExample } from "./algorand-examples"
// Import the AMCP client at the top of the file
import { amcpClient, AMCPContextType } from "./amcp-client"
// Import the knowledge base
import {
  getRelevantResources,
  getSmartContractBestPractices,
  getSecurityVulnerabilities,
  getDAppArchitecturePatterns,
  getTestingStrategies,
} from "./algorand-knowledge-base"
import type { AttachedFile } from "@/components/file-attachment"
import { processAttachedFiles } from "@/lib/file-processor"

// Initialize Google Generative AI if API key is available
let genAI: GoogleGenerativeAI | null = null
try {
  if (typeof window !== "undefined") {
    // Use the public API key for client-side operations
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (apiKey) {
      genAI = new GoogleGenerativeAI(apiKey)
    }
  }
} catch (error) {
  console.error("Failed to initialize Google Generative AI:", error)
}

/**
 * Determines if a query is explicitly requesting smart contract code
 * @param query The user query
 * @returns Boolean indicating if smart contract code is being requested
 */
function isRequestingSmartContract(query: string): boolean {
  const lowerQuery = query.toLowerCase()

  // Check for explicit requests for code or smart contracts
  const codeRequestPatterns = [
    /create a .* (smart contract|contract)/i,
    /write a .* (smart contract|contract)/i,
    /generate a .* (smart contract|contract)/i,
    /implement a .* (smart contract|contract)/i,
    /code for .* (smart contract|contract)/i,
    /example of .* (smart contract|contract)/i,
    /how (do|to|can) I (write|create|implement|code|build)/i,
    /show me .* code/i,
    /provide .* code/i,
    /give me .* code/i,
    /sample code/i,
    /code sample/i,
    /implementation of/i,
    /pyteal (code|example|implementation)/i,
    /teal (code|example|implementation)/i,
  ]

  return codeRequestPatterns.some((pattern) => pattern.test(query))
}

/**
 * Determines the specific type of smart contract being requested
 * @param query The user query
 * @returns The type of smart contract or null if not specific
 */
function getSmartContractType(query: string): string | null {
  const lowerQuery = query.toLowerCase()

  if (
    lowerQuery.includes("voting") ||
    lowerQuery.includes("vote") ||
    lowerQuery.includes("ballot") ||
    lowerQuery.includes("election")
  ) {
    return "voting"
  }

  if (lowerQuery.includes("auction") || lowerQuery.includes("bid") || lowerQuery.includes("highest bidder")) {
    return "auction"
  }

  if (lowerQuery.includes("escrow") || lowerQuery.includes("lock") || lowerQuery.includes("time lock")) {
    return "escrow"
  }

  if (lowerQuery.includes("token") || lowerQuery.includes("asa") || lowerQuery.includes("asset")) {
    return "token"
  }

  if (lowerQuery.includes("nft") || lowerQuery.includes("non-fungible") || lowerQuery.includes("collectible")) {
    return "nft"
  }

  if (lowerQuery.includes("dao") || lowerQuery.includes("governance") || lowerQuery.includes("proposal")) {
    return "dao"
  }

  return null
}

// Function to fetch response from backend API with file attachment support
export async function fetchWebSearchResponse(
  query: string,
  walletInfo?: AIServiceOptions["walletInfo"],
  files?: AttachedFile[],
): Promise<string> {
  try {
    // Process file attachments if any
    let fileContext = ""
    if (files && files.length > 0) {
      try {
        const { textContent, metadata } = await processAttachedFiles(files)
        fileContext = `\n\nFILE CONTEXT:\n${metadata}\n${textContent}`
      } catch (error) {
        console.error("Error processing file attachments:", error)
      }
    }

    // Combine the user's message with file context
    const queryWithFileContext = query + fileContext

    // Determine if this is a smart contract request and what type
    const isSmartContractRequest = isRequestingSmartContract(query)
    const smartContractType = getSmartContractType(query)

    // Set up AMCP options based on query analysis
    const amcpOptions: any = {
      maxContexts: 5,
      priorityTypes: [],
    }

    // Prioritize context types based on query content
    if (isSmartContractRequest) {
      amcpOptions.priorityTypes = [
        AMCPContextType.SMART_CONTRACT_TEMPLATE,
        AMCPContextType.SMART_CONTRACT,
        AMCPContextType.DEVELOPER_DOCS,
      ]
    } else if (
      query.toLowerCase().includes("asa") ||
      query.toLowerCase().includes("asset") ||
      query.toLowerCase().includes("token")
    ) {
      amcpOptions.priorityTypes = [AMCPContextType.ASA_INFO, AMCPContextType.DEVELOPER_DOCS]
    } else if (walletInfo?.connected) {
      amcpOptions.priorityTypes = [
        AMCPContextType.ACCOUNT_INFO,
        AMCPContextType.BLOCKCHAIN_STATE,
        AMCPContextType.DEVELOPER_DOCS,
      ]
    } else {
      amcpOptions.priorityTypes = [AMCPContextType.DEVELOPER_DOCS, AMCPContextType.BLOCKCHAIN_STATE]
    }

    // Enhance the query with Algorand-specific context using AMCP
    const amcpResponse = await amcpClient.enhanceQuery(queryWithFileContext, walletInfo, amcpOptions)

    // Get relevant resources from the knowledge base
    const relevantResources = getRelevantResources(query)

    // Prepare resource information to include in the query
    let resourceInfo = ""
    if (relevantResources.length > 0) {
      resourceInfo =
        "\n\nRELEVANT RESOURCES:\n" +
        relevantResources.map((resource) => `- ${resource.title}: ${resource.description} (${resource.url})`).join("\n")
    }

    // Add specialized knowledge based on query content
    let specializedKnowledge = ""

    // Add smart contract best practices if query is about smart contracts
    if (
      isRequestingSmartContract(query) &&
      (query.toLowerCase().includes("smart contract") ||
        query.toLowerCase().includes("pyteal") ||
        query.toLowerCase().includes("teal"))
    ) {
      const bestPractices = getSmartContractBestPractices()
      specializedKnowledge +=
        "\n\nSMART CONTRACT BEST PRACTICES:\n" +
        bestPractices
          .slice(0, 5)
          .map((practice) => `- ${practice}`)
          .join("\n")
    }

    // Add security information if query is about security
    if (
      query.toLowerCase().includes("security") ||
      query.toLowerCase().includes("vulnerability") ||
      query.toLowerCase().includes("exploit") ||
      query.toLowerCase().includes("secure")
    ) {
      const vulnerabilities = getSecurityVulnerabilities()
      specializedKnowledge +=
        "\n\nSECURITY CONSIDERATIONS:\n" +
        vulnerabilities
          .slice(0, 3)
          .map((v) => `- ${v.issue}: ${v.mitigation}`)
          .join("\n")
    }

    // Add dApp architecture patterns if query is about architecture or design
    if (
      query.toLowerCase().includes("architecture") ||
      query.toLowerCase().includes("design") ||
      query.toLowerCase().includes("dapp") ||
      query.toLowerCase().includes("structure")
    ) {
      const patterns = getDAppArchitecturePatterns()
      specializedKnowledge +=
        "\n\nDAPP ARCHITECTURE PATTERNS:\n" +
        patterns
          .slice(0, 3)
          .map((p) => `- ${p.pattern}: ${p.description}`)
          .join("\n")
    }

    // Add testing strategies if query is about testing
    if (
      query.toLowerCase().includes("test") ||
      query.toLowerCase().includes("debug") ||
      query.toLowerCase().includes("quality")
    ) {
      const strategies = getTestingStrategies()
      specializedKnowledge +=
        "\n\nTESTING STRATEGIES:\n" +
        strategies
          .slice(0, 3)
          .map((s) => `- ${s.strategy}: ${s.description}`)
          .join("\n")
    }

    // Use the enhanced query for the API call, including resources and specialized knowledge
    const enhancedQueryWithResources = amcpResponse.enhancedQuery + resourceInfo + specializedKnowledge

    // Add template information for smart contract requests if available
    let templateInfo = ""
    if (isSmartContractRequest && smartContractType) {
      const templateContext = await amcpClient.getRelevantTemplate(smartContractType)
      if (templateContext && templateContext.data) {
        templateInfo =
          `\n\nRELEVANT TEMPLATE: ${templateContext.data.templateName}\n` +
          `Description: ${templateContext.data.description}\n` +
          `Key Features:\n${templateContext.data.keyFeatures?.map((f) => `- ${f}`).join("\n") || ""}\n` +
          `Best Practices:\n${templateContext.data.bestPractices?.map((p) => `- ${p}`).join("\n") || ""}\n` +
          `\nTemplate Code Reference:\n\`\`\`python\n${
            templateContext.data.code ? templateContext.data.code.substring(0, 500) + "..." : "No code available"
          }\n\`\`\``
      }
    }

    const finalEnhancedQuery = enhancedQueryWithResources + templateInfo

    // Log the enhanced query for debugging
    console.log("Enhanced query with AMCP context:", finalEnhancedQuery)

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: finalEnhancedQuery,
        walletInfo,
        amcpContexts: amcpResponse.contexts,
        hasFileAttachments: files && files.length > 0,
      }),
    })

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error("Error fetching web search response:", error)
    throw error
  }
}

// Function to simulate AI response on the client side (for offline mode)
export async function simulateAIResponse(query: string, files?: AttachedFile[]): Promise<string> {
  // Process file attachments if any
  let fileContext = ""
  if (files && files.length > 0) {
    try {
      const { textContent, metadata } = await processAttachedFiles(files)
      fileContext = `\n\nFILE CONTEXT:\n${metadata}\n${textContent}`
    } catch (error) {
      console.error("Error processing file attachments:", error)
    }
  }

  // Combine the user's message with file context
  const queryWithFileContext = query + fileContext

  // Try to use Google Generative AI if available
  if (genAI) {
    try {
      console.log("Using client-side Gemini model...")

      // Determine if this is a smart contract request and what type
      const isSmartContractRequest = isRequestingSmartContract(query)
      const smartContractType = getSmartContractType(query)

      // Set up AMCP options based on query analysis
      const amcpOptions: any = {
        maxContexts: 5,
        priorityTypes: [],
      }

      // Prioritize context types based on query content
      if (isSmartContractRequest) {
        amcpOptions.priorityTypes = [
          AMCPContextType.SMART_CONTRACT_TEMPLATE,
          AMCPContextType.SMART_CONTRACT,
          AMCPContextType.DEVELOPER_DOCS,
        ]
      } else if (
        query.toLowerCase().includes("asa") ||
        query.toLowerCase().includes("asset") ||
        query.toLowerCase().includes("token")
      ) {
        amcpOptions.priorityTypes = [AMCPContextType.ASA_INFO, AMCPContextType.DEVELOPER_DOCS]
      } else {
        amcpOptions.priorityTypes = [AMCPContextType.DEVELOPER_DOCS, AMCPContextType.BLOCKCHAIN_STATE]
      }

      // Enhance the query with Algorand-specific context using AMCP
      const amcpResponse = await amcpClient.enhanceQuery(queryWithFileContext, undefined, amcpOptions)

      // Get relevant resources from the knowledge base
      const relevantResources = getRelevantResources(query)

      // Prepare resource information to include in the query
      let resourceInfo = ""
      if (relevantResources.length > 0) {
        resourceInfo =
          "\n\nRELEVANT RESOURCES:\n" +
          relevantResources
            .map((resource) => `- ${resource.title}: ${resource.description} (${resource.url})`)
            .join("\n")
      }

      // Add specialized knowledge based on query content
      let specializedKnowledge = ""

      // Add smart contract best practices if query is about smart contracts
      if (
        isRequestingSmartContract(query) &&
        (query.toLowerCase().includes("smart contract") ||
          query.toLowerCase().includes("pyteal") ||
          query.toLowerCase().includes("teal"))
      ) {
        const bestPractices = getSmartContractBestPractices()
        specializedKnowledge +=
          "\n\nSMART CONTRACT BEST PRACTICES:\n" +
          bestPractices
            .slice(0, 5)
            .map((practice) => `- ${practice}`)
            .join("\n")
      }

      // Add security information if query is about security
      if (
        query.toLowerCase().includes("security") ||
        query.toLowerCase().includes("vulnerability") ||
        query.toLowerCase().includes("exploit") ||
        query.toLowerCase().includes("secure")
      ) {
        const vulnerabilities = getSecurityVulnerabilities()
        specializedKnowledge +=
          "\n\nSECURITY CONSIDERATIONS:\n" +
          vulnerabilities
            .slice(0, 3)
            .map((v) => `- ${v.issue}: ${v.mitigation}`)
            .join("\n")
      }

      // Add dApp architecture patterns if query is about architecture or design
      if (
        query.toLowerCase().includes("architecture") ||
        query.toLowerCase().includes("design") ||
        query.toLowerCase().includes("dapp") ||
        query.toLowerCase().includes("structure")
      ) {
        const patterns = getDAppArchitecturePatterns()
        specializedKnowledge +=
          "\n\nDAPP ARCHITECTURE PATTERNS:\n" +
          patterns
            .slice(0, 3)
            .map((p) => `- ${p.pattern}: ${p.description}`)
            .join("\n")
      }

      // Add testing strategies if query is about testing
      if (
        query.toLowerCase().includes("test") ||
        query.toLowerCase().includes("debug") ||
        query.toLowerCase().includes("quality")
      ) {
        const strategies = getTestingStrategies()
        specializedKnowledge +=
          "\n\nTESTING STRATEGIES:\n" +
          strategies
            .slice(0, 3)
            .map((s) => `- ${s.strategy}: ${s.description}`)
            .join("\n")
      }

      const enhancedQuery = amcpResponse.enhancedQuery + resourceInfo + specializedKnowledge

      // Add template information for smart contract requests if available
      let templateInfo = ""
      if (isSmartContractRequest && smartContractType) {
        const templateContext = await amcpClient.getRelevantTemplate(smartContractType)
        if (templateContext && templateContext.data) {
          templateInfo =
            `\n\nRELEVANT TEMPLATE: ${templateContext.data.templateName}\n` +
            `Description: ${templateContext.data.description}\n` +
            `Key Features:\n${templateContext.data.keyFeatures.map((f) => `- ${f}`).join("\n")}\n` +
            `Best Practices:\n${templateContext.data.bestPractices.map((p) => `- ${p}`).join("\n")}\n` +
            `\nTemplate Code Reference:\n\`\`\`python\n${templateContext.data.code.substring(0, 500)}...\n\`\`\``
        }
      }

      const finalEnhancedQuery = enhancedQuery + templateInfo

      // Try with gemini-1.5-pro-latest as the primary model
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-pro-latest",
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
          },
        })

        const prompt = `
You are AlgoAssist, an expert AI assistant specializing in Algorand blockchain development, with a focus on smart contract development and decentralized applications (dApps).

CRITICAL INSTRUCTIONS:
- Only provide PyTeal or TEAL code when the user explicitly asks for a smart contract or code example
- Do not generate smart contract code for general questions about Algorand concepts
- When asked to create smart contracts, ONLY provide PyTeal or TEAL code
- For dApps, provide code that uses Algorand SDKs (JavaScript, Python, Go, etc.)
- Use code blocks with appropriate language tags (e.g. \`\`\`python, \`\`\`teal)
- Explain Algorand-specific concepts thoroughly
- If you don't know something, say so rather than making up information
- Format your responses using markdown

RESPONSE GUIDELINES:
- For general questions about Algorand concepts, provide clear explanations without code unless specifically requested
- Only generate smart contract code when the user explicitly asks for it
- When generating code, follow these guidelines:
  - Use PyTeal for high-level contract development
  - Use TEAL for low-level or optimized contracts
  - Reference Algorand's stateful smart contract model
  - Explain global and local state usage
  - Include proper approval and clear programs
  - Follow Algorand best practices for security and efficiency
  - Always prioritize security and best practices in your code
  - Include comments that explain the logic and purpose of key code sections
  - Provide explanations of gas optimization techniques used
  - Consider edge cases and potential vulnerabilities
  - For dApp designs, explain architecture choices and integration points
  - Include testing strategies for any code that you generate

USER QUESTION: ${finalEnhancedQuery}
`
        const result = await model.generateContent(prompt)
        const response = result.response.text()

        // Validate and correct the response if needed
        const { response: validatedResponse, wasModified } = await validateAndCorrectResponse(query, response)

        if (wasModified) {
          console.log("Response was modified to ensure Algorand compatibility")
        }

        return validatedResponse
      } catch (proError) {
        console.warn("Error with primary model, trying fallback model:", proError)

        // Try with gemini-1.0-pro as fallback (older stable version)
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-1.0-pro",
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
            },
          })

          const prompt = `
You are AlgoAssist, an expert AI assistant specializing in Algorand blockchain development, with a focus on smart contract development and decentralized applications (dApps).

CRITICAL INSTRUCTIONS:
- Only provide PyTeal or TEAL code when the user explicitly asks for a smart contract or code example
- Do not generate smart contract code for general questions about Algorand concepts
- When asked to create smart contracts, ONLY provide PyTeal or TEAL code
- For dApps, provide code that uses Algorand SDKs (JavaScript, Python, Go, etc.)
- Use code blocks with appropriate language tags (e.g. \`\`\`python, \`\`\`teal)
- Explain Algorand-specific concepts thoroughly
- If you don't know something, say so rather than making up information
- Format your responses using markdown

RESPONSE GUIDELINES:
- For general questions about Algorand concepts, provide clear explanations without code unless specifically requested
- Only generate smart contract code when the user explicitly asks for it
- When generating code, follow these guidelines:
  - Use PyTeal for high-level contract development
  - Use TEAL for low-level or optimized contracts
  - Reference Algorand's stateful smart contract model
  - Explain global and local state usage
  - Include proper approval and clear programs
  - Follow Algorand best practices for security and efficiency
  - Always prioritize security and best practices in your code
  - Include comments that explain the logic and purpose of key code sections
  - Provide explanations of gas optimization techniques used
  - Consider edge cases and potential vulnerabilities
  - For dApp designs, explain architecture choices and integration points
  - Include testing strategies for any code that you generate

USER QUESTION: ${finalEnhancedQuery}
`

          const result = await model.generateContent(prompt)
          const response = result.response.text()

          // Validate and correct the response if needed
          const { response: validatedResponse, wasModified } = await validateAndCorrectResponse(query, response)

          if (wasModified) {
            console.log("Response was modified to ensure Algorand compatibility")
          }

          return validatedResponse
        } catch (fallbackError) {
          console.error("Error with fallback model:", fallbackError)
          throw fallbackError
        }
      }
    } catch (error) {
      console.error("Error using Google Generative AI:", error)
      // Fall back to predefined responses
    }
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Check if we have a matching example for this query
  const exampleKey = findMatchingExample(query)
  if (exampleKey) {
    const example = getAlgorandExample(exampleKey)
    if (example) {
      return `Here's an example of ${example.title} for Algorand:

\`\`\`python
${example.code}
\`\`\`

${example.explanation}`
    }
  }

  // If there are file attachments, acknowledge them in the response
  if (files && files.length > 0) {
    return `I've analyzed the ${files.length} file(s) you've attached. 

${files.map((file, index) => `File ${index + 1}: ${file.name} (${file.type || "unknown type"})`).join("\n")}

Since I'm currently in offline mode, I can't provide a detailed analysis of these files. When you're back online, I'll be able to analyze the content and provide specific feedback or improvements.

In the meantime, if you have specific questions about Algorand development, smart contracts, or dApps that don't require analyzing the attached files, I can still try to help with those.`
  }

  // Simple keyword-based responses for offline mode
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("smart contract") || lowerQuery.includes("pyteal")) {
    // Only provide code if explicitly requested
    if (isRequestingSmartContract(query)) {
      return 'Algorand smart contracts are written in PyTeal, which is a Python language binding for Algorand\'s smart contract language, TEAL (Transaction Execution Approval Language).\n\nHere\'s a simple PyTeal example:\n\n```python\nfrom pyteal import *\n\ndef approval_program():\n    # Define global variables\n    global_owner = Bytes("owner")\n    global_counter = Bytes("counter")\n    \n    # On creation, set up the contract\n    on_creation = Seq([\n        # Set the creator as the owner\n        App.globalPut(global_owner, Txn.sender()),\n        # Initialize counter to 0\n        App.globalPut(global_counter, Int(0)),\n        Return(Int(1))\n    ])\n    \n    # Increment counter operation\n    increment = Seq([\n        App.globalPut(global_counter, App.globalGet(global_counter) + Int(1)),\n        Return(Int(1))\n    ])\n    \n    # Read counter operation\n    read_counter = Return(App.globalGet(global_counter))\n    \n    # Handle each possible application call\n    program = Cond(\n        [Txn.application_id() == Int(0), on_creation],\n        [Txn.application_args[0] == Bytes("increment"), increment],\n        [Txn.application_args[0] == Bytes("read"), read_counter]\n    )\n    \n    return program\n\ndef clear_state_program():\n    return Return(Int(1))\n\nif __name__ == "__main__":\n    with open("approval.teal", "w") as f:\n        compiled = compileTeal(approval_program(), Mode.Application, version=6)\n        f.write(compiled)\n    \n    with open("clear_state.teal", "w") as f:\n        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)\n        f.write(compiled)\n```\n\nThis simple counter contract demonstrates key concepts like global state, approval and clear state programs, and handling different application calls.\n\n*Note: I\'m in offline mode with limited information.*'
    } else {
      // Provide conceptual explanation without code
      return "Algorand smart contracts are programs that run on the Algorand blockchain. They come in two forms:\n\n1. **Stateful Smart Contracts**: These are applications that can store state on the blockchain. They consist of two programs - an approval program and a clear state program.\n\n2. **Stateless Smart Contracts**: These are logic signatures (LogicSigs) that approve transactions without storing state.\n\nAlgorand smart contracts are written in TEAL (Transaction Execution Approval Language) or more commonly in PyTeal, which is a Python library that generates TEAL code.\n\nKey features of Algorand smart contracts include:\n- Fast execution with low transaction fees\n- Deterministic behavior with no gas fees\n- Support for atomic transfers (multiple transactions as one unit)\n- Global and local state storage\n- Ability to call other smart contracts\n\nIf you'd like to see code examples or implement a specific smart contract, please let me know.\n\n*Note: I'm in offline mode with limited information.*"
    }
  }

  if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
    return "Hello! I'm your Algorand assistant specializing in smart contract development and dApps. I'm currently in offline mode, so my capabilities are limited. What would you like to know about Algorand development?"
  }

  if (lowerQuery.includes("algorand")) {
    return "Algorand is a blockchain platform that aims to create a transparent system where everyone can achieve success through decentralized projects and applications. It was founded by Turing Award-winning MIT professor Silvio Micali.\n\nAlgorand is known for its Pure Proof-of-Stake consensus mechanism, fast finality (transactions finalize in ~4.5 seconds), and carbon-negative approach.\n\n*Note: I'm in offline mode with limited information.*"
  }

  if (lowerQuery.includes("dapp") || lowerQuery.includes("decentralized app")) {
    return "Algorand dApps (decentralized applications) typically consist of smart contracts deployed on the Algorand blockchain and a frontend interface for users to interact with those contracts.\n\nTo build a dApp on Algorand, you'll need:\n\n1. **Smart Contracts**: Written in PyTeal/TEAL and deployed to the Algorand blockchain\n2. **Frontend**: Web or mobile interface using JavaScript/TypeScript with Algorand SDKs\n3. **Wallet Integration**: Connection to Algorand wallets like MyAlgo, AlgoSigner, or WalletConnect\n\nPopular tools for Algorand dApp development include:\n- AlgoKit: Algorand's development kit\n- Beaker: Framework for building Algorand applications with PyTeal\n- Reach: Domain-specific language for building dApps\n\n*Note: I'm in offline mode with limited information.*"
  }

  if (lowerQuery.includes("wallet") || lowerQuery.includes("connect")) {
    return "To connect an Algorand wallet in your dApp, you can use libraries like WalletConnect, MyAlgo Connect, or PeraConnect. These allow users to sign transactions securely.\n\nHere's a basic example using PeraConnect:\n\n```javascript\nimport { PeraWalletConnect } from '@perawallet/connect';\n\n// Create the PeraWalletConnect instance\nconst peraWallet = new PeraWalletConnect();\n\n// Connect to the wallet\nasync function connectWallet() {\n  try {\n    const accounts = await peraWallet.connect();\n    console.log('Connected accounts:', accounts);\n    return accounts[0]; // Return the first account\n  } catch (error) {\n    console.error('Error connecting to wallet:', error);\n  }\n}\n\n// Disconnect from the wallet\nfunction disconnectWallet() {\n  peraWallet.disconnect();\n  console.log('Disconnected from wallet');\n}\n```\n\n*Note: I'm in offline mode with limited information.*"
  }

  if (lowerQuery.includes("asa") || lowerQuery.includes("asset") || lowerQuery.includes("token")) {
    return "Algorand Standard Assets (ASAs) are Algorand's built-in token standard, similar to ERC-20 on Ethereum but with native protocol support.\n\nHere's how to create an ASA using the JavaScript SDK:\n\n```javascript\nconst algosdk = require('algosdk');\n\nasync function createAsset(client, creator) {\n  // Define asset parameters\n  const assetParams = {\n    total: 1000000, // Total supply\n    decimals: 2, // Decimal precision\n    defaultFrozen: false, // Whether accounts should start frozen\n    unitName: 'MYASA',\n    assetName: 'My Algorand Standard Asset',\n    url: 'https://example.com',\n    manager: creator,\n    reserve: creator,\n    freeze: creator,\n    clawback: creator\n  };\n\n  // Create the asset creation transaction\n  const txn = algosdk.makeAssetCreateTxnWithSuggestedParams(\n    creator,\n    undefined,\n    assetParams.total,\n    assetParams.decimals,\n    assetParams.defaultFrozen,\n    assetParams.manager,\n    assetParams.reserve,\n    assetParams.freeze,\n    assetParams.clawback,\n    assetParams.unitName,\n    assetParams.assetName,\n    assetParams.url,\n    undefined,\n    await client.getTransactionParams()\n  );\n\n  // Sign and submit the transaction\n  // ... (code to sign and submit)\n}\n```\n\n*Note: I'm in offline mode with limited information.*"
  }

  // Default response for other queries
  return `I'm your Algorand development assistant, currently in offline mode with limited capabilities. 

I can provide general information about:
- Algorand blockchain concepts
- Smart contract development with PyTeal/TEAL
- Algorand Standard Assets (ASAs)
- dApp development
- Wallet integration

For more specific or detailed responses, please try again when you're online.

*Note: I'm in offline mode with limited information.*`
}

/**
 * Personalizes a response based on wallet information
 * @param response The original response
 * @param walletInfo The user's wallet information
 * @returns Personalized response
 */
export function personalizeResponse(response: string, walletInfo?: AIServiceOptions["walletInfo"]): string {
  if (!walletInfo?.connected) return response

  // Add personalized greeting based on wallet info
  const personalizedGreeting = `\n\n---\n\n*Responding to wallet ${walletInfo.address?.substring(0, 6)}...${walletInfo.address?.substring(
    walletInfo.address.length - 4,
  )} with ${(walletInfo.algo_balance ? walletInfo.algo_balance / 1000000 : 0).toFixed(2)} ALGO on ${
    walletInfo.network || "Algorand"
  }*`

  return response + personalizedGreeting
}

/**
 * Enhances a user prompt with additional context and guidance
 * @param prompt The original user prompt
 * @returns Enhanced prompt with additional context
 */
export function enhancePrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  // Base enhancement with best practices
  let enhancement = prompt

  // Add specificity for general questions
  if (prompt.length < 20 || prompt.endsWith("?")) {
    enhancement += "\n\nPlease provide a detailed explanation with examples where appropriate."
  }

  // Add security considerations for smart contract requests
  if (lowerPrompt.includes("smart contract") || lowerPrompt.includes("pyteal") || lowerPrompt.includes("code")) {
    enhancement +=
      "\n\nPlease ensure the solution follows Algorand security best practices, includes proper input validation, and handles edge cases. Include comments explaining key sections of the code."
  }

  // Add gas optimization for performance-related questions
  if (lowerPrompt.includes("performance") || lowerPrompt.includes("optimize") || lowerPrompt.includes("efficient")) {
    enhancement += "\n\nPlease focus on gas optimization techniques and performance best practices for Algorand."
  }

  // Add testing considerations
  if (lowerPrompt.includes("implement") || lowerPrompt.includes("create") || lowerPrompt.includes("develop")) {
    enhancement += "\n\nPlease include testing strategies and potential edge cases to consider."
  }

  return enhancement
}
