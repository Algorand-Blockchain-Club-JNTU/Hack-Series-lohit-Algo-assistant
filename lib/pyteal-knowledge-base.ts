/**
 * Comprehensive knowledge base for PyTeal development
 */

export interface PyTealConcept {
  id: string
  name: string
  description: string
  examples: string[]
  relatedConcepts: string[]
  documentation: string
}

export const pytealConcepts: Record<string, PyTealConcept> = {
  globalState: {
    id: "global-state",
    name: "Global State",
    description:
      "Global state variables are stored in the application's global key/value store. They are accessible by all users of the application.",
    examples: [
      'App.globalPut(Bytes("Counter"), Int(0))',
      'App.globalGet(Bytes("Creator"))',
      'App.globalDel(Bytes("TemporaryValue"))',
    ],
    relatedConcepts: ["local-state", "state-schema", "storage-costs"],
    documentation: "https://developer.algorand.org/docs/get-details/dapps/avm/teal/specification/#state-access",
  },

  localState: {
    id: "local-state",
    name: "Local State",
    description:
      "Local state variables are stored per-account that has opted into the application. They allow tracking user-specific data.",
    examples: [
      'App.localPut(Txn.sender(), Bytes("HasVoted"), Int(1))',
      'App.localGet(Txn.sender(), Bytes("Balance"))',
      'App.localDel(Txn.sender(), Bytes("TemporaryFlag"))',
    ],
    relatedConcepts: ["global-state", "opt-in", "state-schema"],
    documentation: "https://developer.algorand.org/docs/get-details/dapps/avm/teal/specification/#state-access",
  },

  abiRouter: {
    id: "abi-router",
    name: "ABI Router",
    description:
      "The ABI Router simplifies handling method calls in smart contracts by routing calls to the appropriate handler based on the ABI method selector.",
    examples: ['router = Router("my-contract")', "router.add_method_handler(my_method)", "return router.compile()"],
    relatedConcepts: ["abi-method", "method-signature", "contract-interface"],
    documentation: "https://pyteal.readthedocs.io/en/latest/abi.html",
  },

  innerTransactions: {
    id: "inner-transactions",
    name: "Inner Transactions",
    description:
      "Inner transactions allow a smart contract to create and submit new transactions as part of its execution.",
    examples: [
      "InnerTxnBuilder.Begin()",
      "InnerTxnBuilder.SetFields({TxnField.type_enum: TxnType.Payment, TxnField.amount: Int(1000000), TxnField.receiver: Txn.sender()})",
      "InnerTxnBuilder.Submit()",
    ],
    relatedConcepts: ["atomic-transfers", "transaction-fees", "asset-transfer"],
    documentation: "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/#inner-transactions",
  },

  boxStorage: {
    id: "box-storage",
    name: "Box Storage",
    description:
      "Box storage provides a way to store larger amounts of data associated with an application, beyond the limits of global and local state.",
    examples: [
      'Box.create(Bytes("my_box"), Int(100))',
      'Box.put(Bytes("my_box"), Bytes("Hello, world!"))',
      'stored_data = Box.get(Bytes("my_box"))',
    ],
    relatedConcepts: ["global-state", "storage-costs", "data-structures"],
    documentation: "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/#box-storage",
  },

  assetTransfer: {
    id: "asset-transfer",
    name: "Asset Transfer",
    description:
      "Asset transfers involve sending Algorand Standard Assets (ASAs) between accounts, which can be controlled by smart contracts.",
    examples: [
      "InnerTxnBuilder.Begin()",
      "InnerTxnBuilder.SetFields({TxnField.type_enum: TxnType.AssetTransfer, TxnField.xfer_asset: asset_id, TxnField.asset_amount: Int(100), TxnField.asset_receiver: receiver})",
      "InnerTxnBuilder.Submit()",
    ],
    relatedConcepts: ["asa", "inner-transactions", "asset-freeze"],
    documentation: "https://developer.algorand.org/docs/get-details/asa/",
  },

  contractSecurity: {
    id: "contract-security",
    name: "Contract Security",
    description: "Security best practices for PyTeal smart contracts to prevent vulnerabilities and exploits.",
    examples: [
      'Assert(Txn.sender() == App.globalGet(Bytes("Creator")))',
      "Assert(Gtxn[1].type_enum() == TxnType.Payment)",
      'Assert(App.localGet(Txn.sender(), Bytes("HasVoted")) == Int(0))',
    ],
    relatedConcepts: ["input-validation", "access-control", "reentrancy"],
    documentation: "https://developer.algorand.org/articles/algorand-smart-contract-security-best-practices/",
  },

  stateSchema: {
    id: "state-schema",
    name: "State Schema",
    description:
      "State schemas define the maximum number of integer and byte slice values that can be stored in global and local state.",
    examples: ["GlobalStateSchema(num_uints=2, num_byte_slices=3)", "LocalStateSchema(num_uints=1, num_byte_slices=0)"],
    relatedConcepts: ["global-state", "local-state", "storage-costs"],
    documentation:
      "https://developer.algorand.org/docs/get-details/dapps/smart-contracts/apps/#on-chain-storage-and-state-schema",
  },

  abiMethod: {
    id: "abi-method",
    name: "ABI Method",
    description:
      "ABI methods define the interface for interacting with smart contracts, including parameter and return types.",
    examples: [
      "@ABIReturnSubroutine\ndef add(a: abi.Uint64, b: abi.Uint64, *, output: abi.Uint64) -> Expr:\n    return output.set(a.get() + b.get())",
    ],
    relatedConcepts: ["abi-router", "method-signature", "contract-interface"],
    documentation: "https://pyteal.readthedocs.io/en/latest/abi.html",
  },

  atomicTransfers: {
    id: "atomic-transfers",
    name: "Atomic Transfers",
    description:
      "Atomic transfers allow multiple transactions to be submitted as a group, where either all succeed or all fail.",
    examples: ["Gtxn[0].sender() == Gtxn[1].sender()", "Global.group_size() == Int(2)"],
    relatedConcepts: ["transaction-groups", "inner-transactions", "escrow"],
    documentation: "https://developer.algorand.org/docs/get-details/atomic_transfers/",
  },
}

/**
 * Get a PyTeal concept by ID
 * @param id The concept ID
 * @returns The concept or undefined if not found
 */
export function getConcept(id: string): PyTealConcept | undefined {
  return pytealConcepts[id]
}

/**
 * Get all PyTeal concepts
 * @returns Array of all concepts
 */
export function getAllConcepts(): PyTealConcept[] {
  return Object.values(pytealConcepts)
}

/**
 * Find concepts related to a query
 * @param query The search query
 * @returns Array of matching concepts
 */
export function findRelevantConcepts(query: string): PyTealConcept[] {
  const lowerQuery = query.toLowerCase()
  const matches: PyTealConcept[] = []

  Object.values(pytealConcepts).forEach((concept) => {
    // Check name and description
    if (concept.name.toLowerCase().includes(lowerQuery) || concept.description.toLowerCase().includes(lowerQuery)) {
      matches.push(concept)
      return
    }

    // Check examples
    for (const example of concept.examples) {
      if (example.toLowerCase().includes(lowerQuery)) {
        matches.push(concept)
        return
      }
    }
  })

  return matches
}

/**
 * Get common PyTeal errors and their solutions
 * @returns Array of error objects with descriptions and solutions
 */
export function getCommonPyTealErrors(): Array<{ error: string; description: string; solution: string }> {
  return [
    {
      error: "invalid global state key",
      description: "Using a variable directly as a key for global state instead of Bytes() or a string literal",
      solution: 'Use Bytes() to wrap string keys, e.g., App.globalPut(Bytes("Counter"), Int(1))',
    },
    {
      error: "cannot use NamedTuple as state key",
      description: "Attempting to use a NamedTuple object as a key for global or local state",
      solution: "Define string constants for state keys instead of using NamedTuple",
    },
    {
      error: "router method handler missing output parameter",
      description: "ABI method handlers require an output parameter",
      solution: "Add an output parameter to your method, e.g., def my_method(*, output: abi.Uint64)",
    },
    {
      error: "missing initialization in on_creation",
      description: "Contract creation logic doesn't initialize global state variables",
      solution: "Add App.globalPut() calls in your on_creation logic to initialize all state variables",
    },
    {
      error: "double voting vulnerability",
      description: "Voting contract doesn't prevent users from voting multiple times",
      solution: 'Use local state to track who has voted, e.g., App.localPut(Txn.sender(), Bytes("Voted"), Int(1))',
    },
    {
      error: "missing opt-in check",
      description: "Contract tries to write local state without checking if user has opted in",
      solution: "Add a check for opt-in status or handle OptIn transaction type",
    },
    {
      error: "incorrect transaction group validation",
      description: "Contract doesn't properly validate all transactions in a group",
      solution: "Validate all relevant fields of each transaction in the group",
    },
    {
      error: "missing asset transfer validation",
      description: "Contract doesn't validate asset ID when handling asset transfers",
      solution: "Add Assert(Gtxn[i].xfer_asset() == expected_asset_id)",
    },
    {
      error: "insufficient authorization checks",
      description: "Contract doesn't verify the sender is authorized for sensitive operations",
      solution: 'Add checks like Assert(Txn.sender() == App.globalGet(Bytes("Creator")))',
    },
    {
      error: "missing error handling",
      description: "Contract doesn't handle potential error conditions",
      solution: "Add Assert() statements to validate inputs and state before performing operations",
    },
  ]
}
