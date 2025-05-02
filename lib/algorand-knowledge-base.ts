/**
 * Comprehensive Algorand Knowledge Base
 * Contains references to documentation, tools, and resources for Algorand development
 * Updated with latest Algorand smart contract standards and best practices
 */

export interface ResourceLink {
  title: string
  url: string
  description: string
  category: string
}

export const algorandResources: ResourceLink[] = [
  // Official Documentation
  {
    title: "Algorand Developer Documentation",
    url: "https://developer.algorand.org/docs/",
    description: "Official documentation for Algorand blockchain development",
    category: "documentation",
  },
  {
    title: "PyTeal Documentation",
    url: "https://pyteal.readthedocs.io/en/latest/",
    description: "Documentation for PyTeal, a Python language binding for Algorand Smart Contracts",
    category: "documentation",
  },
  {
    title: "Algorand Smart Contracts (ASC1)",
    url: "https://developer.algorand.org/docs/get-details/dapps/avm/",
    description: "Documentation for Algorand Smart Contracts and the AVM",
    category: "documentation",
  },
  {
    title: "Algorand Standard Assets (ASA)",
    url: "https://developer.algorand.org/docs/get-details/asa/",
    description: "Documentation for creating and managing Algorand Standard Assets",
    category: "documentation",
  },
  {
    title: "Algorand APIs",
    url: "https://developer.algorand.org/docs/rest-apis/",
    description: "Documentation for Algorand REST APIs",
    category: "documentation",
  },
  {
    title: "Algorand SDKs",
    url: "https://developer.algorand.org/docs/sdks/",
    description: "Documentation for Algorand Software Development Kits",
    category: "documentation",
  },
  {
    title: "Algorand AVM 1.1",
    url: "https://developer.algorand.org/docs/get-details/dapps/avm/teal/specification/",
    description: "Latest specification for the Algorand Virtual Machine (AVM) 1.1",
    category: "documentation",
  },
  {
    title: "TEAL v8 Documentation",
    url: "https://developer.algorand.org/docs/get-details/dapps/avm/teal/opcodes/",
    description: "Documentation for TEAL version 8 opcodes and features",
    category: "documentation",
  },

  // Development Tools
  {
    title: "AlgoKit Documentation",
    url: "https://developer.algorand.org/docs/get-details/algokit/",
    description: "Documentation for AlgoKit, the Algorand development kit",
    category: "tools",
  },
  {
    title: "Beaker Framework",
    url: "https://beaker.algo.xyz/",
    description: "Framework for building Algorand applications with PyTeal",
    category: "tools",
  },
  {
    title: "AlgoBuilder",
    url: "https://github.com/scale-it/algo-builder",
    description: "Development framework for Algorand blockchain",
    category: "tools",
  },
  {
    title: "Reach Language",
    url: "https://developer.algorand.org/docs/get-details/dapps/reach/",
    description: "Documentation for Reach, a domain-specific language for building dApps",
    category: "tools",
  },
  {
    title: "Algorand Sandbox",
    url: "https://github.com/algorand/sandbox",
    description: "Development environment for Algorand blockchain",
    category: "tools",
  },
  {
    title: "Dappflow IDE",
    url: "https://dappflow.org/",
    description: "Integrated development environment for Algorand dApps",
    category: "tools",
  },
  {
    title: "AlgoKit Templates",
    url: "https://github.com/algorandfoundation/algokit-templates",
    description: "Official templates for AlgoKit to jumpstart Algorand development",
    category: "tools",
  },
  {
    title: "Algorand DevTools",
    url: "https://developer.algorand.org/tools/",
    description: "Collection of developer tools for Algorand blockchain development",
    category: "tools",
  },

  // Smart Contract Resources
  {
    title: "Smart Contract Guidelines",
    url: "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/guidelines/",
    description: "Guidelines for developing smart contracts on Algorand",
    category: "smart-contracts",
  },
  {
    title: "ABI (Application Binary Interface)",
    url: "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/ABI/",
    description: "Documentation for Algorand's Application Binary Interface",
    category: "smart-contracts",
  },
  {
    title: "Smart Signature Specifications",
    url: "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/smartsigs/",
    description: "Specifications for Algorand Smart Signatures",
    category: "smart-contracts",
  },
  {
    title: "Inner Transactions",
    url: "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/innertx/",
    description: "Documentation for inner transactions in Algorand smart contracts",
    category: "smart-contracts",
  },
  {
    title: "Box Storage",
    url: "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/box-storage/",
    description: "Documentation for box storage in Algorand smart contracts",
    category: "smart-contracts",
  },
  {
    title: "Contract-to-Contract Calls",
    url: "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/contract-to-contract/",
    description: "Documentation for contract-to-contract calls in Algorand",
    category: "smart-contracts",
  },
  {
    title: "PyTeal v0.22.0",
    url: "https://pyteal.readthedocs.io/en/latest/versions.html",
    description: "Latest PyTeal version documentation with new features",
    category: "smart-contracts",
  },

  // Standards and ARCs
  {
    title: "ARC-0001 (Overall Standards Process)",
    url: "https://arc.algorand.foundation/ARCs/arc-0001",
    description: "Algorand Request for Comments (ARC) process",
    category: "standards",
  },
  {
    title: "ARC-0003 (ASA Metadata)",
    url: "https://arc.algorand.foundation/ARCs/arc-0003",
    description: "Standard for ASA metadata",
    category: "standards",
  },
  {
    title: "ARC-0004 (ASA Config Transactions)",
    url: "https://arc.algorand.foundation/ARCs/arc-0004",
    description: "Standard for ASA configuration transactions",
    category: "standards",
  },
  {
    title: "ARC-0019 (NFT Standard)",
    url: "https://arc.algorand.foundation/ARCs/arc-0019",
    description: "Standard for Non-Fungible Tokens on Algorand",
    category: "standards",
  },
  {
    title: "ARC-0020 (Algorand Fungible Token)",
    url: "https://arc.algorand.foundation/ARCs/arc-0020",
    description: "Standard for Fungible Tokens on Algorand",
    category: "standards",
  },
  {
    title: "ARC-0069 (NFT Metadata Standard)",
    url: "https://arc.algorand.foundation/ARCs/arc-0069",
    description: "Standard for NFT metadata on Algorand",
    category: "standards",
  },
  {
    title: "ARC-0072 (NFT Semi-Fungible Support)",
    url: "https://arc.algorand.foundation/ARCs/arc-0072",
    description: "Standard for semi-fungible tokens on Algorand",
    category: "standards",
  },
  {
    title: "ARC-0200 (Algorand Fungible Token Standard)",
    url: "https://arc.algorand.foundation/ARCs/arc-0200",
    description: "Latest standard for fungible tokens on Algorand",
    category: "standards",
  },
  {
    title: "ARC-0018 (Application Metadata)",
    url: "https://arc.algorand.foundation/ARCs/arc-0018",
    description: "Standard for application metadata on Algorand",
    category: "standards",
  },
  {
    title: "Complete ARCs Repository",
    url: "https://github.com/algorandfoundation/ARCs",
    description: "Repository of all Algorand Request for Comments",
    category: "standards",
  },

  // Example Projects and Repositories
  {
    title: "Algorand Official Examples",
    url: "https://github.com/algorand/smart-contracts",
    description: "Official examples of Algorand smart contracts",
    category: "examples",
  },
  {
    title: "Awesome Algorand (Community Resources)",
    url: "https://github.com/aorumbayev/awesome-algorand",
    description: "Curated list of Algorand resources",
    category: "examples",
  },
  {
    title: "AlgoDEA Plugin Examples",
    url: "https://github.com/algorand/java-algorand-sdk/tree/develop/examples",
    description: "Examples for AlgoDEA plugin",
    category: "examples",
  },
  {
    title: "TinyMan DEX Code",
    url: "https://github.com/tinymanorg",
    description: "Code for TinyMan decentralized exchange",
    category: "examples",
  },
  {
    title: "AlgoFi Code Examples",
    url: "https://github.com/Algofiorg",
    description: "Code examples from AlgoFi",
    category: "examples",
  },
  {
    title: "Pera Wallet Integration",
    url: "https://github.com/perawallet",
    description: "Integration examples for Pera Wallet",
    category: "examples",
  },
  {
    title: "AlgoKit Templates",
    url: "https://github.com/algorandfoundation/algokit-templates",
    description: "Official templates for AlgoKit projects",
    category: "examples",
  },
  {
    title: "Beaker Examples",
    url: "https://github.com/algorand-devrel/beaker",
    description: "Example smart contracts using the Beaker framework",
    category: "examples",
  },

  // Security Resources
  {
    title: "Algorand Smart Contract Security Best Practices",
    url: "https://developer.algorand.org/articles/algorand-smart-contract-security-best-practices/",
    description: "Best practices for secure smart contract development",
    category: "security",
  },
  {
    title: "Common Exploits and Vulnerabilities",
    url: "https://developer.algorand.org/tutorials/writing-secure-smart-contracts/",
    description: "Common exploits and vulnerabilities in Algorand smart contracts",
    category: "security",
  },
  {
    title: "Security Auditing Tools",
    url: "https://github.com/crytic/slither-algorand",
    description: "Tools for auditing Algorand smart contracts",
    category: "security",
  },
  {
    title: "Algorand Smart Contract Audit Checklist",
    url: "https://developer.algorand.org/articles/smart-contract-security-audit-checklist/",
    description: "Comprehensive checklist for auditing Algorand smart contracts",
    category: "security",
  },
  {
    title: "Secure TEAL Development",
    url: "https://developer.algorand.org/articles/secure-teal-development/",
    description: "Guidelines for secure TEAL development",
    category: "security",
  },

  // Advanced Topics
  {
    title: "State Proofs",
    url: "https://developer.algorand.org/docs/get-details/algorand_consensus/",
    description: "Documentation for Algorand state proofs",
    category: "advanced",
  },
  {
    title: "Algorand Virtual Machine (AVM)",
    url: "https://developer.algorand.org/docs/get-details/dapps/avm/",
    description: "Documentation for the Algorand Virtual Machine",
    category: "advanced",
  },
  {
    title: "Layer-1 Interoperability",
    url: "https://developer.algorand.org/docs/get-details/interoperability/",
    description: "Documentation for Layer-1 interoperability",
    category: "advanced",
  },
  {
    title: "Atomic Transfers",
    url: "https://developer.algorand.org/docs/get-details/atomic_transfers/",
    description: "Documentation for Algorand atomic transfers",
    category: "advanced",
  },
  {
    title: "Rekeying",
    url: "https://developer.algorand.org/docs/get-details/accounts/rekey/",
    description: "Documentation for Algorand account rekeying",
    category: "advanced",
  },
  {
    title: "Algorand Performance",
    url: "https://developer.algorand.org/docs/get-details/algorand_consensus/performance/",
    description: "Documentation for Algorand performance characteristics",
    category: "advanced",
  },
  {
    title: "AVM 1.1 Features",
    url: "https://developer.algorand.org/articles/avm-1.1-stateful-smart-contract-features/",
    description: "Overview of new features in AVM 1.1 for stateful smart contracts",
    category: "advanced",
  },

  // Community Resources
  {
    title: "Algorand Foundation Forum",
    url: "https://forum.algorand.org/",
    description: "Official forum for the Algorand community",
    category: "community",
  },
  {
    title: "Algorand Discord",
    url: "https://discord.com/invite/algorand",
    description: "Official Discord server for the Algorand community",
    category: "community",
  },
  {
    title: "Algorand StackExchange",
    url: "https://algorand.stackexchange.com/",
    description: "StackExchange for Algorand questions and answers",
    category: "community",
  },
  {
    title: "Algorand Reddit",
    url: "https://www.reddit.com/r/AlgorandOfficial/",
    description: "Official Reddit community for Algorand",
    category: "community",
  },
  {
    title: "Algorand Developer Portal",
    url: "https://developer.algorand.org/",
    description: "Central hub for Algorand developers",
    category: "community",
  },

  // Learning Platforms
  {
    title: "Algorand Developer Academy",
    url: "https://developer.algorand.org/academy/",
    description: "Educational resources for Algorand developers",
    category: "learning",
  },
  {
    title: "Algorand Tutorials",
    url: "https://developer.algorand.org/tutorials/",
    description: "Tutorials for Algorand development",
    category: "learning",
  },
  {
    title: "Algorand Education Program",
    url: "https://www.algorand.foundation/education",
    description: "Educational program from the Algorand Foundation",
    category: "learning",
  },
  {
    title: "Algorand University",
    url: "https://www.algorand.foundation/university-program",
    description: "University program for Algorand education",
    category: "learning",
  },
  {
    title: "PyTeal Tutorials",
    url: "https://developer.algorand.org/tutorials/?tags=pyteal",
    description: "Tutorials specifically for PyTeal development",
    category: "learning",
  },

  // Ecosystem Tools
  {
    title: "Indexer API",
    url: "https://developer.algorand.org/docs/rest-apis/indexer/",
    description: "Documentation for the Algorand Indexer API",
    category: "ecosystem",
  },
  {
    title: "AlgoExplorer API",
    url: "https://algoexplorer.io/api-dev/v2",
    description: "API for AlgoExplorer",
    category: "ecosystem",
  },
  {
    title: "NFT/ASA Explorers",
    url: "https://www.nftexplorer.app/",
    description: "Explorers for NFTs and ASAs on Algorand",
    category: "ecosystem",
  },
  {
    title: "Governance API",
    url: "https://governance.algorand.foundation/api/documentation/",
    description: "API for Algorand governance",
    category: "ecosystem",
  },
  {
    title: "Algorand Wallet Connect",
    url: "https://developer.algorand.org/docs/get-details/walletconnect/",
    description: "Documentation for integrating WalletConnect with Algorand",
    category: "ecosystem",
  },
  {
    title: "Algorand Mobile Wallet SDKs",
    url: "https://developer.algorand.org/docs/sdks/#mobile-sdks",
    description: "SDKs for developing mobile wallets for Algorand",
    category: "ecosystem",
  },
]

/**
 * Get resources by category
 * @param category The category to filter by
 * @returns Array of resources in the specified category
 */
export function getResourcesByCategory(category: string): ResourceLink[] {
  return algorandResources.filter((resource) => resource.category === category)
}

/**
 * Search resources by query
 * @param query The search query
 * @returns Array of resources matching the query
 */
export function searchResources(query: string): ResourceLink[] {
  const lowerQuery = query.toLowerCase()
  return algorandResources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(lowerQuery) || resource.description.toLowerCase().includes(lowerQuery),
  )
}

/**
 * Get relevant resources based on a user query
 * @param query The user query
 * @returns Array of relevant resources
 */
export function getRelevantResources(query: string): ResourceLink[] {
  const lowerQuery = query.toLowerCase()

  // Define keywords for each category
  const categoryKeywords: Record<string, string[]> = {
    documentation: ["docs", "documentation", "guide", "manual", "reference", "specification", "avm", "teal"],
    tools: [
      "tool",
      "framework",
      "sdk",
      "kit",
      "ide",
      "environment",
      "algokit",
      "beaker",
      "reach",
      "sandbox",
      "devtools",
    ],
    "smart-contracts": [
      "smart contract",
      "contract",
      "asc",
      "asc1",
      "pyteal",
      "teal",
      "abi",
      "box",
      "inner",
      "stateful",
    ],
    standards: ["standard", "arc", "token standard", "nft standard", "specification", "arc-0200", "arc-0018"],
    examples: ["example", "sample", "demo", "repository", "code", "project", "template", "boilerplate"],
    security: ["security", "audit", "vulnerability", "exploit", "best practice", "secure", "checklist"],
    advanced: ["advanced", "state proof", "avm", "interoperability", "atomic", "consensus", "rekey", "performance"],
    community: ["community", "forum", "discord", "reddit", "stack", "discussion", "portal"],
    learning: ["learn", "tutorial", "academy", "education", "course", "university"],
    ecosystem: ["ecosystem", "indexer", "explorer", "governance", "api", "wallet", "connect", "mobile"],
  }

  // Determine relevant categories based on the query
  const relevantCategories = Object.entries(categoryKeywords)
    .filter(([_, keywords]) => keywords.some((keyword) => lowerQuery.includes(keyword)))
    .map(([category, _]) => category)

  // If no specific categories are identified, return a mix of resources
  if (relevantCategories.length === 0) {
    // Return a mix of documentation, examples, and tools
    return [
      ...getResourcesByCategory("documentation").slice(0, 2),
      ...getResourcesByCategory("examples").slice(0, 2),
      ...getResourcesByCategory("tools").slice(0, 2),
    ]
  }

  // Return resources from the relevant categories
  let relevantResources: ResourceLink[] = []
  relevantCategories.forEach((category) => {
    relevantResources = [...relevantResources, ...getResourcesByCategory(category).slice(0, 3)]
  })

  return relevantResources.slice(0, 5) // Limit to 5 resources
}

/**
 * Get best practices for Algorand smart contract development
 * @returns Array of best practices
 */
export function getSmartContractBestPractices(): string[] {
  return [
    "Always validate inputs and check for edge cases",
    "Use global and local storage efficiently to minimize costs",
    "Implement proper authorization checks for sensitive operations",
    "Keep contracts simple and modular for better security and maintainability",
    "Use the latest TEAL version (v8+) for access to the newest features and optimizations",
    "Implement comprehensive testing, including unit tests and integration tests",
    "Consider gas optimization techniques to reduce transaction costs",
    "Use clear and consistent naming conventions for better readability",
    "Document your code thoroughly with comments explaining the logic",
    "Follow established patterns and standards (ARCs) when applicable",
    "Implement proper error handling and reporting",
    "Use PyTeal or Beaker for more complex contracts",
    "Be mindful of the opcode budget limit for TEAL programs",
    "Use atomic transfers for complex operations involving multiple transactions",
    "Implement proper upgrade mechanisms for contracts that may need updates",
    "Use box storage for larger data requirements instead of global/local state",
    "Leverage ABI for better interoperability between contracts",
    "Implement proper access control using contract accounts",
    "Use inner transactions for contract-initiated actions",
    "Consider using contract-to-contract calls for modular architecture",
    "Implement proper event logging using note fields",
    "Use ARC-0018 for application metadata",
    "Implement proper asset validation for ASA operations",
    "Use safe math operations to prevent overflow/underflow",
    "Consider using AlgoKit templates for standardized contract structures",
  ]
}

/**
 * Get common security vulnerabilities in Algorand smart contracts
 * @returns Array of security vulnerabilities
 */
export function getSecurityVulnerabilities(): { issue: string; mitigation: string }[] {
  return [
    {
      issue: "Insufficient authorization checks",
      mitigation: "Always verify that the sender is authorized to perform sensitive operations",
    },
    {
      issue: "Improper handling of Algos and ASAs",
      mitigation: "Verify asset transfers and payments with explicit checks",
    },
    {
      issue: "Logic errors in control flow",
      mitigation: "Thoroughly test all execution paths and edge cases",
    },
    {
      issue: "Reentrancy vulnerabilities",
      mitigation: "Update state before making external calls and use reentrancy guards",
    },
    {
      issue: "Integer overflow/underflow",
      mitigation: "Use safe math operations and check for overflow/underflow conditions",
    },
    {
      issue: "Improper storage management",
      mitigation: "Be careful with global and local storage limits and access patterns",
    },
    {
      issue: "Inadequate input validation",
      mitigation: "Validate all inputs and application arguments thoroughly",
    },
    {
      issue: "Insecure random number generation",
      mitigation: "Use secure sources of randomness like VRF (Verifiable Random Function)",
    },
    {
      issue: "Front-running vulnerabilities",
      mitigation: "Implement commit-reveal schemes or other front-running protections",
    },
    {
      issue: "Improper error handling",
      mitigation: "Handle errors gracefully and provide meaningful error messages",
    },
    {
      issue: "Unchecked return values from inner transactions",
      mitigation: "Always check return values from inner transactions and handle failures",
    },
    {
      issue: "Improper box storage management",
      mitigation: "Properly create, manage, and delete boxes to avoid storage leaks",
    },
    {
      issue: "Unchecked contract-to-contract calls",
      mitigation: "Validate responses from contract-to-contract calls and handle failures",
    },
    {
      issue: "Improper handling of ABI method calls",
      mitigation: "Validate ABI method calls and handle encoding/decoding properly",
    },
    {
      issue: "Lack of upgrade mechanism",
      mitigation: "Implement a secure upgrade mechanism for contracts that may need updates",
    },
  ]
}

/**
 * Get common dApp architecture patterns for Algorand
 * @returns Array of architecture patterns
 */
export function getDAppArchitecturePatterns(): { pattern: string; description: string }[] {
  return [
    {
      pattern: "Frontend + Smart Contract",
      description: "Simple architecture with a frontend directly interacting with smart contracts",
    },
    {
      pattern: "Frontend + Backend + Smart Contract",
      description: "Architecture with a backend server mediating between frontend and blockchain",
    },
    {
      pattern: "Indexer-Enhanced Architecture",
      description: "Using Algorand Indexer to efficiently query blockchain data",
    },
    {
      pattern: "Multi-Contract Architecture",
      description: "Using multiple interconnected smart contracts for complex applications",
    },
    {
      pattern: "Stateless + Stateful Hybrid",
      description: "Combining stateless smart signatures with stateful applications",
    },
    {
      pattern: "Event-Driven Architecture",
      description: "Using note fields or state changes as events to trigger off-chain processes",
    },
    {
      pattern: "Layer-2 Enhanced Architecture",
      description: "Using Layer-2 solutions for scalability while settling on Algorand",
    },
    {
      pattern: "Cross-Chain Architecture",
      description: "Interacting with multiple blockchains through bridges or oracles",
    },
    {
      pattern: "Contract-to-Contract Architecture",
      description: "Using contract-to-contract calls for modular and composable applications",
    },
    {
      pattern: "Box Storage Architecture",
      description: "Leveraging box storage for data-intensive applications",
    },
    {
      pattern: "ABI-Compliant Architecture",
      description: "Using ABI for standardized contract interfaces and interoperability",
    },
    {
      pattern: "AlgoKit Template-Based Architecture",
      description: "Using AlgoKit templates for standardized application structure",
    },
  ]
}

/**
 * Get testing strategies for Algorand smart contracts
 * @returns Array of testing strategies
 */
export function getTestingStrategies(): { strategy: string; description: string }[] {
  return [
    {
      strategy: "Unit Testing",
      description: "Testing individual functions and components in isolation",
    },
    {
      strategy: "Integration Testing",
      description: "Testing interactions between multiple components",
    },
    {
      strategy: "End-to-End Testing",
      description: "Testing the entire application flow from user interface to blockchain",
    },
    {
      strategy: "Sandbox Testing",
      description: "Using Algorand Sandbox for local development and testing",
    },
    {
      strategy: "Testnet Deployment",
      description: "Deploying and testing on Algorand TestNet before MainNet",
    },
    {
      strategy: "Fuzz Testing",
      description: "Testing with random or unexpected inputs to find edge cases",
    },
    {
      strategy: "Security Auditing",
      description: "Using security tools and manual review to find vulnerabilities",
    },
    {
      strategy: "Performance Testing",
      description: "Testing for performance bottlenecks and optimization opportunities",
    },
    {
      strategy: "Scenario Testing",
      description: "Testing specific user scenarios and workflows",
    },
    {
      strategy: "AlgoKit Testing",
      description: "Using AlgoKit's built-in testing framework for comprehensive testing",
    },
    {
      strategy: "Beaker Testing",
      description: "Using Beaker's testing utilities for PyTeal contracts",
    },
    {
      strategy: "Contract-to-Contract Testing",
      description: "Testing interactions between multiple contracts",
    },
    {
      strategy: "Box Storage Testing",
      description: "Testing box storage operations and limits",
    },
    {
      strategy: "ABI Compliance Testing",
      description: "Testing ABI method calls and responses",
    },
  ]
}

/**
 * Get the latest Algorand development tools and frameworks
 * @returns Array of development tools
 */
export function getLatestDevelopmentTools(): { tool: string; description: string; url: string }[] {
  return [
    {
      tool: "AlgoKit",
      description: "The official Algorand development kit for building and testing applications",
      url: "https://github.com/algorandfoundation/algokit-cli",
    },
    {
      tool: "Beaker",
      description: "Framework for building and testing Algorand applications with PyTeal",
      url: "https://github.com/algorand-devrel/beaker",
    },
    {
      tool: "PyTeal",
      description: "Python language binding for Algorand Smart Contracts",
      url: "https://github.com/algorand/pyteal",
    },
    {
      tool: "AlgoKit Templates",
      description: "Official templates for AlgoKit to jumpstart Algorand development",
      url: "https://github.com/algorandfoundation/algokit-templates",
    },
    {
      tool: "Algorand Sandbox",
      description: "Development environment for Algorand blockchain",
      url: "https://github.com/algorand/sandbox",
    },
    {
      tool: "Dappflow",
      description: "Integrated development environment for Algorand dApps",
      url: "https://dappflow.org/",
    },
    {
      tool: "AlgoExplorer",
      description: "Block explorer for Algorand blockchain",
      url: "https://algoexplorer.io/",
    },
    {
      tool: "Algorand JS SDK",
      description: "JavaScript SDK for Algorand blockchain development",
      url: "https://github.com/algorand/js-algorand-sdk",
    },
    {
      tool: "Algorand Python SDK",
      description: "Python SDK for Algorand blockchain development",
      url: "https://github.com/algorand/py-algorand-sdk",
    },
    {
      tool: "Algorand Go SDK",
      description: "Go SDK for Algorand blockchain development",
      url: "https://github.com/algorand/go-algorand-sdk",
    },
    {
      tool: "Algorand Java SDK",
      description: "Java SDK for Algorand blockchain development",
      url: "https://github.com/algorand/java-algorand-sdk",
    },
    {
      tool: "Algorand Indexer",
      description: "Indexer for querying Algorand blockchain data",
      url: "https://github.com/algorand/indexer",
    },
  ]
}
