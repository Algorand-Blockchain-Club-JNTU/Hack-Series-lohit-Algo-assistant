/**
 * PyTeal code validator to catch common errors before presenting to users
 */

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  type: string
  message: string
  line?: number
  code?: string
}

interface ValidationWarning {
  type: string
  message: string
  line?: number
  code?: string
}

/**
 * Validates PyTeal code for common errors and best practices
 * @param code The PyTeal code to validate
 * @returns Validation result with errors and warnings
 */
export function validatePyTealCode(code: string): ValidationResult {
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

  // Check for ABI imports if using ABI
  if (code.includes("abi.") && !code.includes("from pyteal import abi")) {
    errors.push({
      type: "missing_abi_import",
      message: "Using ABI features without importing abi from pyteal",
    })
  }

  // Check for global state access patterns
  if (code.includes("App.globalGet") || code.includes("App.globalPut")) {
    // Check for string/bytes keys
    const globalStatePattern = /App\.global(Get|Put)\s*\(\s*([^,)]+)/g
    let match

    while ((match = globalStatePattern.exec(code)) !== null) {
      const key = match[2].trim()
      if (!key.startsWith("Bytes(") && !key.startsWith('"') && !key.startsWith("'")) {
        errors.push({
          type: "invalid_global_state_key",
          message: `Global state key should be Bytes() or string literal, found: ${key}`,
          code: match[0],
        })
      }
    }
  }

  // Check for initialization in on_create
  if (code.includes("on_creation") || code.includes("on_create")) {
    if (!code.includes("App.globalPut") && !code.includes("app_global_put")) {
      warnings.push({
        type: "missing_initialization",
        message: "On-creation logic may be missing state initialization",
      })
    }
  }

  // Check for double voting prevention in voting contracts
  if (code.toLowerCase().includes("vote") && code.includes("App.globalPut")) {
    if (!code.includes("App.localGet") && !code.includes("app_local_get")) {
      warnings.push({
        type: "missing_double_vote_prevention",
        message: "Voting contract may be missing double-vote prevention using local state",
      })
    }
  }

  // Check for router method handlers if using ABI router
  if (code.includes("Router(") || code.includes("router =")) {
    const routerAddPattern = /router\s*\.\s*add_method_handler\s*\(/g
    if (!routerAddPattern.test(code)) {
      errors.push({
        type: "missing_router_handlers",
        message: "Router is defined but no method handlers are added",
      })
    }
  }

  // Check for approval and clear state programs
  if (!code.includes("approval_program") && !code.includes("clear_state_program")) {
    warnings.push({
      type: "missing_programs",
      message: "Code may be missing approval_program or clear_state_program definitions",
    })
  }

  // Check for compilation
  if (!code.includes("compileTeal(") && !code.includes("compile(")) {
    warnings.push({
      type: "missing_compilation",
      message: "Code may be missing compileTeal() call to generate TEAL code",
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Attempts to fix common PyTeal errors automatically
 * @param code The PyTeal code to fix
 * @param validationResult The validation result from validatePyTealCode
 * @returns Fixed code if possible, or original code with comments indicating issues
 */
export function autoFixPyTealCode(code: string, validationResult: ValidationResult): string {
  let fixedCode = code

  // Add missing imports
  if (validationResult.errors.some((e) => e.type === "missing_import")) {
    fixedCode = "from pyteal import *\n\n" + fixedCode
  }

  // Add missing ABI imports
  if (
    validationResult.errors.some((e) => e.type === "missing_abi_import") &&
    !fixedCode.includes("from pyteal import abi")
  ) {
    if (fixedCode.includes("from pyteal import *")) {
      // Already has wildcard import, no need to add abi specifically
    } else if (fixedCode.includes("import pyteal")) {
      fixedCode = fixedCode.replace("import pyteal", "import pyteal\nfrom pyteal import abi")
    } else {
      fixedCode = "from pyteal import abi\n" + fixedCode
    }
  }

  // Add comments for issues that can't be automatically fixed
  let commentedIssues = ""

  validationResult.errors.forEach((error) => {
    if (!["missing_import", "missing_abi_import"].includes(error.type)) {
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
