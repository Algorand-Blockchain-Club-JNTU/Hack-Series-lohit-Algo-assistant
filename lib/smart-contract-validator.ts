/**
 * Enhanced validator for Algorand smart contracts
 */

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: string
  message: string
  line?: number
}

export interface ValidationWarning {
  type: string
  message: string
  line?: number
}

/**
 * Validates an Algorand smart contract written in PyTeal
 * @param code The PyTeal code to validate
 * @returns Validation result with errors and warnings
 */
export function validateSmartContract(code: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Split code into lines for line-specific errors
  const lines = code.split("\n")

  // Check for imports
  if (!code.includes("from pyteal import") && !code.includes("import pyteal")) {
    errors.push({
      type: "missing_import",
      message: "Missing PyTeal import statement",
    })
  }

  // Check for type conversion issues
  if (code.includes("Itob(") && !code.includes("Btoi(")) {
    const itobMatches = [...code.matchAll(/Itob\s*$$\s*([^)]+)\s*$$/g)]
    for (const match of itobMatches) {
      const arg = match[1].trim()
      if (arg.includes("Txn.application_args") && !arg.includes("Btoi")) {
        errors.push({
          type: "missing_type_conversion",
          message: `Missing Btoi conversion for application argument: ${arg}`,
        })
      }
      if (arg.includes("LoopCurrentValue()") || arg.includes("i")) {
        warnings.push({
          type: "potential_type_issue",
          message: `Check if ${arg} is properly converted to integer before using Itob`,
        })
      }
    }
  }

  // Check for For loop issues
  if (code.includes("For(") && code.includes("Txn.application_args")) {
    const forLoopMatches = [...code.matchAll(/For\s*$$\s*[^,]+,\s*([^,]+),\s*[^)]+\s*$$/g)]
    for (const match of forLoopMatches) {
      const endCondition = match[1].trim()
      if (endCondition.includes("Txn.application_args") && !endCondition.includes("Btoi")) {
        errors.push({
          type: "for_loop_type_error",
          message: `For loop end condition uses application argument without Btoi conversion: ${endCondition}`,
        })
      }
    }
  }

  // Check for OptIn handling
  if (
    code.includes("App.localPut") &&
    code.includes("OnComplete.OptIn") &&
    (code.includes("Reject()") || !code.includes("Approve()"))
  ) {
    const optInLine = lines.findIndex((line) => line.includes("OnComplete.OptIn"))
    if (optInLine >= 0) {
      const nextLines = lines.slice(optInLine, optInLine + 5).join("\n")
      if (nextLines.includes("Reject()")) {
        errors.push({
          type: "optin_rejection",
          message: "Contract rejects OptIn transactions but uses local state. OptIn should be approved.",
          line: optInLine,
        })
      }
    }
  }

  // Check for local state access without opt-in check
  if (code.includes("App.localGet") && !code.includes("App.optedIn")) {
    warnings.push({
      type: "missing_optin_check",
      message: "Contract accesses local state without checking if the account has opted in",
    })
  }

  // Check for inconsistent state key management
  const globalPutMatches = [...code.matchAll(/App\.globalPut\s*\(\s*([^,]+),/g)]
  const keyTypes = new Set<string>()

  for (const match of globalPutMatches) {
    const key = match[1].trim()
    if (key.startsWith("Bytes(")) {
      keyTypes.add("bytes")
    } else if (key.startsWith("Itob(")) {
      keyTypes.add("itob")
    } else if (key.includes('"') || key.includes("'")) {
      keyTypes.add("string")
    }
  }

  if (keyTypes.size > 1) {
    warnings.push({
      type: "inconsistent_key_types",
      message: "Contract uses inconsistent types for state keys. Consider standardizing on one approach.",
    })
  }

  // Check for proper error handling
  if (code.includes("Assert(") && !code.includes("Try") && !code.includes("Seq([")) {
    warnings.push({
      type: "basic_error_handling",
      message:
        "Contract uses basic error handling with Assert. Consider using Seq with Try for more robust error handling.",
    })
  }

  // Check for schema definition and usage
  if (
    (code.includes("GlobalStateSchema") || code.includes("LocalStateSchema")) &&
    !code.includes("on_complete=algosdk.future.transaction.OnComplete")
  ) {
    warnings.push({
      type: "schema_definition",
      message:
        "Contract defines state schemas but doesn't show how to use them in the application creation transaction",
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Attempts to fix common smart contract errors automatically
 * @param code The PyTeal code to fix
 * @param validationResult The validation result from validateSmartContract
 * @returns Fixed code if possible, or original code with comments indicating issues
 */
export function autoFixSmartContract(code: string, validationResult: ValidationResult): string {
  let fixedCode = code

  // Fix missing imports
  if (validationResult.errors.some((e) => e.type === "missing_import")) {
    fixedCode = "from pyteal import *\n\n" + fixedCode
  }

  // Fix missing type conversions
  if (validationResult.errors.some((e) => e.type === "missing_type_conversion")) {
    fixedCode = fixedCode.replace(/Itob\s*$$\s*(Txn\.application_args\[\d+\])\s*$$/g, "Itob(Btoi($1))")
  }

  // Fix For loop issues
  if (validationResult.errors.some((e) => e.type === "for_loop_type_error")) {
    fixedCode = fixedCode.replace(
      /(For\s*$$\s*[^,]+,\s*)(Txn\.application_args\[\d+\])(\s*,\s*[^)]+\s*$$)/g,
      "$1Btoi($2)$3",
    )
  }

  // Fix OptIn rejection
  if (validationResult.errors.some((e) => e.type === "optin_rejection")) {
    fixedCode = fixedCode.replace(
      /\[Txn\.on_completion$$$$ == OnComplete\.OptIn,\s*Reject$$$$\]/g,
      "[Txn.on_completion() == OnComplete.OptIn, Approve()]",
    )
  }

  // Add comments for issues that can't be automatically fixed
  let commentedIssues = ""

  validationResult.errors.forEach((error) => {
    if (!["missing_import", "missing_type_conversion", "for_loop_type_error", "optin_rejection"].includes(error.type)) {
      commentedIssues += `# ERROR: ${error.message}\n`
    }
  })

  validationResult.warnings.forEach((warning) => {
    commentedIssues += `# WARNING: ${warning.message}\n`
  })

  if (commentedIssues) {
    fixedCode = commentedIssues + "\n" + fixedCode
  }

  return fixedCode
}
