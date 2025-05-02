/**
 * Enhanced PyTeal code validator with additional checks for common errors
 */

import type { ValidationResult, ValidationError, ValidationWarning } from "./pyteal-validator"

/**
 * Enhanced validation for PyTeal code with additional checks
 * @param code The PyTeal code to validate
 * @returns Validation result with errors and warnings
 */
export function enhancedValidatePyTealCode(code: string): ValidationResult {
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

  // Check for proper state management
  if (code.includes("class GlobalState") || code.includes("class LocalState")) {
    if (!code.includes("App.globalPut") && !code.includes("App.globalGet")) {
      errors.push({
        type: "improper_state_management",
        message: "Using class-based state without proper App.globalPut/App.globalGet implementation",
      })
    }
  }

  // Check for dynamic arrays in state
  if (code.includes("DynamicArray") && (code.includes("GlobalState") || code.includes("App.globalPut"))) {
    warnings.push({
      type: "unsupported_data_structure",
      message:
        "Using DynamicArray with global state may not work as expected. Consider using a different approach for storing arrays in state.",
    })
  }

  // Check for proper ABI implementation
  if (code.includes("Router(") && code.includes("abi.")) {
    // Check for proper ABI method handlers
    if (!code.match(/@router\.method\s*\(/g)) {
      errors.push({
        type: "improper_abi_implementation",
        message: "Using Router without proper @router.method decorators",
      })
    }

    // Check for proper ABI return types
    const abiMethodPattern = /@router\.method\s*$$[^)]*$$\s*\n\s*def\s+([^(]+)$$([^)]*)$$(\s*->.*)?:/g
    let match
    while ((match = abiMethodPattern.exec(code)) !== null) {
      const methodName = match[1].trim()
      const returnType = match[3]

      if (!returnType && !code.includes(`return ${methodName}`)) {
        warnings.push({
          type: "missing_abi_return",
          message: `ABI method ${methodName} may be missing a return type or return statement`,
        })
      }
    }
  }

  // Check for proper state initialization in on_creation
  if (code.includes("on_creation") || code.includes("on_create") || code.includes("init_contract")) {
    if (!code.includes("App.globalPut") && !code.includes("app_global_put")) {
      warnings.push({
        type: "missing_state_initialization",
        message: "Initialization logic may be missing proper state initialization with App.globalPut",
      })
    }
  }

  // Check for proper state updates in voting logic
  if (code.toLowerCase().includes("vote") && !code.includes("App.globalGet") && !code.includes("App.globalPut")) {
    errors.push({
      type: "improper_state_update",
      message: "Voting logic is missing proper state updates with App.globalGet/App.globalPut",
    })
  }

  // Check for proper router configuration
  if (code.includes("Router(") && !code.includes("router.compile_program()")) {
    errors.push({
      type: "incomplete_router_setup",
      message: "Router is defined but router.compile_program() is missing",
    })
  }

  // Check for proper transaction type handling
  if (code.includes("Router(") && !code.includes("CallConfig.")) {
    warnings.push({
      type: "incomplete_transaction_handling",
      message: "Router may be missing proper transaction type handling with CallConfig",
    })
  }

  // Check for proper clear state program
  if (!code.includes("clear_state_program") && !code.includes("clear_program")) {
    warnings.push({
      type: "missing_clear_program",
      message: "Code may be missing clear state program definition",
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Attempts to fix common PyTeal errors automatically with enhanced fixes
 * @param code The PyTeal code to fix
 * @param validationResult The validation result from enhancedValidatePyTealCode
 * @returns Fixed code if possible, or original code with comments indicating issues
 */
export function enhancedAutoFixPyTealCode(code: string, validationResult: ValidationResult): string {
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

  // Fix improper state management
  if (validationResult.errors.some((e) => e.type === "improper_state_management")) {
    // This is a complex fix that would require rewriting the code
    // Add a comment to indicate the issue
    fixedCode =
      "# WARNING: This code uses improper state management. Consider using App.globalPut/App.globalGet instead of class-based state.\n" +
      fixedCode
  }

  // Fix unsupported data structures
  if (validationResult.warnings.some((w) => w.type === "unsupported_data_structure")) {
    // Add a comment to indicate the issue
    fixedCode =
      "# WARNING: This code uses DynamicArray with global state, which may not work as expected. Consider using a different approach for storing arrays in state.\n" +
      fixedCode
  }

  // Fix improper ABI implementation
  if (validationResult.errors.some((e) => e.type === "improper_abi_implementation")) {
    // Add a comment to indicate the issue
    fixedCode =
      "# WARNING: This code uses Router without proper @router.method decorators. Make sure to add proper method handlers.\n" +
      fixedCode
  }

  // Fix missing state initialization
  if (validationResult.warnings.some((w) => w.type === "missing_state_initialization")) {
    // Add a comment to indicate the issue
    fixedCode =
      "# WARNING: This code may be missing proper state initialization with App.globalPut. Make sure to initialize all global state variables.\n" +
      fixedCode
  }

  // Fix improper state updates
  if (validationResult.errors.some((e) => e.type === "improper_state_update")) {
    // Add a comment to indicate the issue
    fixedCode =
      "# WARNING: This code is missing proper state updates with App.globalGet/App.globalPut. Make sure to properly update state variables.\n" +
      fixedCode
  }

  // Fix incomplete router setup
  if (validationResult.errors.some((e) => e.type === "incomplete_router_setup")) {
    // Add a comment to indicate the issue
    fixedCode =
      "# WARNING: This code is missing router.compile_program(). Make sure to compile the router program.\n" + fixedCode
  }

  // Fix incomplete transaction handling
  if (validationResult.warnings.some((w) => w.type === "incomplete_transaction_handling")) {
    // Add a comment to indicate the issue
    fixedCode =
      "# WARNING: This code may be missing proper transaction type handling with CallConfig. Make sure to handle all necessary transaction types.\n" +
      fixedCode
  }

  // Fix missing clear program
  if (validationResult.warnings.some((w) => w.type === "missing_clear_program")) {
    // Add a comment to indicate the issue
    fixedCode =
      "# WARNING: This code may be missing clear state program definition. Make sure to define a clear state program.\n" +
      fixedCode
  }

  // Add comments for issues that can't be automatically fixed
  let commentedIssues = ""

  validationResult.errors.forEach((error) => {
    if (
      ![
        "missing_import",
        "missing_abi_import",
        "improper_state_management",
        "improper_state_update",
        "incomplete_router_setup",
      ].includes(error.type)
    ) {
      commentedIssues += `# ERROR: ${error.message}\n`
    }
  })

  validationResult.warnings.forEach((warning) => {
    if (
      ![
        "unsupported_data_structure",
        "missing_state_initialization",
        "incomplete_transaction_handling",
        "missing_clear_program",
      ].includes(warning.type)
    ) {
      commentedIssues += `# WARNING: ${warning.message}\n`
    }
  })

  if (commentedIssues) {
    fixedCode = commentedIssues + "\n" + fixedCode
  }

  return fixedCode
}
