/**
 * Enhanced testing system for PyTeal contracts
 */

import { enhancedValidatePyTealCode } from "./pyteal-validator-enhanced"

export interface EnhancedTestResult {
  id: string
  code: string
  timestamp: string
  passed: boolean
  validationErrors: any[]
  validationWarnings: any[]
  securityIssues: SecurityIssue[]
  stateManagementIssues: StateManagementIssue[]
  abiIssues: ABIIssue[]
  performance: PerformanceMetrics
}

export interface SecurityIssue {
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  location?: {
    line: number
    column: number
  }
  recommendation: string
}

export interface StateManagementIssue {
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  recommendation: string
}

export interface ABIIssue {
  type: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
  recommendation: string
}

export interface PerformanceMetrics {
  opcodeCost: number
  stateSize: number
  complexity: number
}

/**
 * Run enhanced automated tests on PyTeal code
 * @param code The PyTeal code to test
 * @returns Test results
 */
export async function runEnhancedAutomatedTests(code: string): Promise<EnhancedTestResult> {
  const id = `test_${Date.now()}`
  const timestamp = new Date().toISOString()

  // Run enhanced validation
  const validationResult = enhancedValidatePyTealCode(code)

  // Check for security issues
  const securityIssues = checkSecurityIssues(code)

  // Check for state management issues
  const stateManagementIssues = checkStateManagementIssues(code)

  // Check for ABI issues
  const abiIssues = checkABIIssues(code)

  // Calculate performance metrics
  const performance = calculatePerformanceMetrics(code)

  // Determine if the test passed
  const passed =
    validationResult.isValid &&
    securityIssues.filter((issue) => issue.severity === "high" || issue.severity === "critical").length === 0 &&
    stateManagementIssues.filter((issue) => issue.severity === "high" || issue.severity === "critical").length === 0 &&
    abiIssues.filter((issue) => issue.severity === "high" || issue.severity === "critical").length === 0

  return {
    id,
    code,
    timestamp,
    passed,
    validationErrors: validationResult.errors,
    validationWarnings: validationResult.warnings,
    securityIssues,
    stateManagementIssues,
    abiIssues,
    performance,
  }
}

/**
 * Check for security issues in PyTeal code
 * @param code The PyTeal code to check
 * @returns Array of security issues
 */
function checkSecurityIssues(code: string): SecurityIssue[] {
  const issues: SecurityIssue[] = []

  // Check for missing authorization
  if (code.includes("App.globalPut") && !code.includes("Txn.sender()") && !code.includes("Global.creator_address()")) {
    issues.push({
      type: "missing_authorization",
      severity: "critical",
      description: "The contract allows state modifications without proper authorization checks",
      recommendation:
        "Add authorization checks like 'Assert(Txn.sender() == App.globalGet(Bytes(\"Creator\")))' before sensitive operations",
    })
  }

  // Check for unchecked user input
  if (code.includes("Txn.application_args") && !code.includes("Assert(Txn.application_args.length()")) {
    issues.push({
      type: "unchecked_input",
      severity: "high",
      description: "The contract uses application arguments without checking their existence",
      recommendation: "Add length checks for application arguments before accessing them",
    })
  }

  // Check for missing asset ID validation in asset transfers
  if (code.includes("AssetTransfer") && !code.includes("Assert(Gtxn[") && !code.includes("Assert(Txn.assets[")) {
    issues.push({
      type: "missing_asset_validation",
      severity: "high",
      description: "Asset transfers without proper asset ID validation",
      recommendation: "Validate asset IDs in transactions with Assert statements",
    })
  }

  // Check for potential integer overflow
  if ((code.includes("+") || code.includes("*")) && !code.includes("SafeAdd") && !code.includes("SafeMul")) {
    issues.push({
      type: "potential_overflow",
      severity: "medium",
      description: "Potential integer overflow in arithmetic operations",
      recommendation: "Use SafeAdd, SafeSub, SafeMul, or SafeDiv for arithmetic operations",
    })
  }

  // Check for missing opt-in validation
  if (code.includes("App.localPut") && !code.includes("OptIn")) {
    issues.push({
      type: "missing_optin_check",
      severity: "medium",
      description: "Local state operations without checking for opt-in",
      recommendation: "Add checks to ensure users have opted in before accessing local state",
    })
  }

  return issues
}

/**
 * Check for state management issues in PyTeal code
 * @param code The PyTeal code to check
 * @returns Array of state management issues
 */
function checkStateManagementIssues(code: string): StateManagementIssue[] {
  const issues: StateManagementIssue[] = []

  // Check for class-based state without proper App.globalPut/App.globalGet
  if (
    (code.includes("class GlobalState") || code.includes("class LocalState")) &&
    (!code.includes("App.globalPut") || !code.includes("App.globalGet"))
  ) {
    issues.push({
      type: "improper_state_class",
      severity: "critical",
      description: "Using class-based state without proper App.globalPut/App.globalGet implementation",
      recommendation: "Use App.globalPut/App.globalGet for state management instead of class-based state",
    })
  }

  // Check for dynamic arrays in state
  if (code.includes("DynamicArray") && (code.includes("GlobalState") || code.includes("App.globalPut"))) {
    issues.push({
      type: "unsupported_data_structure",
      severity: "high",
      description: "Using DynamicArray with global state, which is not directly supported by Algorand",
      recommendation: "Use a different approach for storing arrays in state, such as key prefixes with indices",
    })
  }

  // Check for missing state initialization
  if (
    (code.includes("on_creation") || code.includes("on_create") || code.includes("init_contract")) &&
    !code.includes("App.globalPut") &&
    !code.includes("app_global_put")
  ) {
    issues.push({
      type: "missing_state_initialization",
      severity: "high",
      description: "Initialization logic is missing proper state initialization with App.globalPut",
      recommendation: "Initialize all global state variables with App.globalPut in the initialization logic",
    })
  }

  // Check for direct state access without Bytes for keys
  const globalGetPattern = /App\.globalGet\s*\(\s*([^,)]+)/g
  let match
  while ((match = globalGetPattern.exec(code)) !== null) {
    const key = match[1].trim()
    if (!key.startsWith("Bytes(") && !key.startsWith('"') && !key.startsWith("'") && !key.includes("Concat(")) {
      issues.push({
        type: "invalid_state_key",
        severity: "high",
        description: `Using invalid key for state access: ${key}`,
        recommendation: 'Use Bytes() for state keys, e.g., App.globalGet(Bytes("key"))',
      })
    }
  }

  // Check for missing local state validation
  if (code.includes("App.localGet") && !code.includes("App.optedIn")) {
    issues.push({
      type: "missing_optin_validation",
      severity: "medium",
      description: "Accessing local state without checking if the account has opted in",
      recommendation: "Add App.optedIn check before accessing local state",
    })
  }

  return issues
}

/**
 * Check for ABI issues in PyTeal code
 * @param code The PyTeal code to check
 * @returns Array of ABI issues
 */
function checkABIIssues(code: string): ABIIssue[] {
  const issues: ABIIssue[] = []

  // Check if using ABI
  if (code.includes("abi.") || code.includes("Router(")) {
    // Check for proper ABI imports
    if (!code.includes("from pyteal import abi") && !code.includes("from pyteal import *")) {
      issues.push({
        type: "missing_abi_import",
        severity: "critical",
        description: "Using ABI features without importing abi from pyteal",
        recommendation: "Add 'from pyteal import abi' or 'from pyteal import *' at the top of the file",
      })
    }

    // Check for proper router setup
    if (code.includes("Router(") && !code.includes("router.compile_program()")) {
      issues.push({
        type: "incomplete_router_setup",
        severity: "critical",
        description: "Router is defined but router.compile_program() is missing",
        recommendation: "Add router.compile_program() to compile the router program",
      })
    }

    // Check for proper method handlers
    if (code.includes("Router(") && !code.match(/@router\.method\s*\(/g)) {
      issues.push({
        type: "missing_method_handlers",
        severity: "high",
        description: "Router is defined but no method handlers are added",
        recommendation: "Add method handlers with @router.method decorator",
      })
    }

    // Check for proper transaction type handling
    if (code.includes("Router(") && !code.includes("CallConfig.")) {
      issues.push({
        type: "missing_transaction_handling",
        severity: "medium",
        description: "Router is missing proper transaction type handling",
        recommendation: "Add proper transaction type handling with CallConfig",
      })
    }

    // Check for proper return types
    const abiMethodPattern = /@router\.method\s*$$[^)]*$$\s*\n\s*def\s+([^(]+)$$([^)]*)$$(\s*->.*)?:/g
    let match
    while ((match = abiMethodPattern.exec(code)) !== null) {
      const methodName = match[1].trim()
      const returnType = match[3]

      if (!returnType && !code.includes(`return ${methodName}`)) {
        issues.push({
          type: "missing_return_type",
          severity: "medium",
          description: `ABI method ${methodName} is missing a return type or return statement`,
          recommendation: "Add a return type or return statement to the ABI method",
        })
      }
    }

    // Check for proper output parameter
    if (code.includes("@router.method") && !code.includes("*, output:")) {
      issues.push({
        type: "missing_output_parameter",
        severity: "medium",
        description: "ABI methods are missing output parameters",
        recommendation: "Add output parameters to ABI methods, e.g., def method(*, output: abi.Uint64)",
      })
    }
  }

  return issues
}

/**
 * Calculate performance metrics for PyTeal code
 * @param code The PyTeal code to analyze
 * @returns Performance metrics
 */
function calculatePerformanceMetrics(code: string): PerformanceMetrics {
  // This is a simplified implementation
  // In a real system, you would compile the code to TEAL and analyze it

  // Estimate opcode cost based on code length and complexity
  const opcodeCost = Math.min(700, Math.floor(code.length / 10))

  // Estimate state size based on global and local state usage
  const globalStateCount = (code.match(/App\.globalPut/g) || []).length
  const localStateCount = (code.match(/App\.localPut/g) || []).length
  const stateSize = globalStateCount * 64 + localStateCount * 16

  // Estimate complexity based on control flow
  const condCount = (code.match(/Cond\(/g) || []).length
  const ifCount = (code.match(/If\(/g) || []).length
  const forCount = (code.match(/For\(/g) || []).length
  const complexity = condCount * 5 + ifCount * 3 + forCount * 10

  return {
    opcodeCost,
    stateSize,
    complexity,
  }
}

/**
 * Generate an enhanced test report for a PyTeal contract
 * @param result The enhanced test result
 * @returns HTML report
 */
export function generateEnhancedTestReport(result: EnhancedTestResult): string {
  const passedClass = result.passed ? "text-green-500" : "text-red-500"
  const passedText = result.passed ? "PASSED" : "FAILED"

  let report = `
    <div class="test-report">
      <h2 class="text-xl font-bold mb-4">PyTeal Contract Test Report</h2>
      
      <div class="mb-4">
        <span class="font-medium">Status:</span> 
        <span class="${passedClass} font-bold">${passedText}</span>
      </div>
      
      <div class="mb-4">
        <span class="font-medium">Timestamp:</span> 
        <span>${new Date(result.timestamp).toLocaleString()}</span>
      </div>
      
      <h3 class="text-lg font-medium mb-2">Validation</h3>
  `

  if (result.validationErrors.length === 0 && result.validationWarnings.length === 0) {
    report += `<p class="text-green-500 mb-4">No validation issues found</p>`
  } else {
    if (result.validationErrors.length > 0) {
      report += `
        <div class="mb-4">
          <h4 class="font-medium text-red-500">Errors (${result.validationErrors.length})</h4>
          <ul class="list-disc pl-5">
      `

      result.validationErrors.forEach((error) => {
        report += `<li class="text-red-400">${error.message}</li>`
      })

      report += `</ul></div>`
    }

    if (result.validationWarnings.length > 0) {
      report += `
        <div class="mb-4">
          <h4 class="font-medium text-yellow-500">Warnings (${result.validationWarnings.length})</h4>
          <ul class="list-disc pl-5">
      `

      result.validationWarnings.forEach((warning) => {
        report += `<li class="text-yellow-400">${warning.message}</li>`
      })

      report += `</ul></div>`
    }
  }

  report += `<h3 class="text-lg font-medium mb-2">State Management</h3>`

  if (result.stateManagementIssues.length === 0) {
    report += `<p class="text-green-500 mb-4">No state management issues found</p>`
  } else {
    report += `
      <div class="mb-4">
        <ul class="list-disc pl-5">
    `

    result.stateManagementIssues.forEach((issue) => {
      const severityClass =
        issue.severity === "critical"
          ? "text-red-600"
          : issue.severity === "high"
            ? "text-red-500"
            : issue.severity === "medium"
              ? "text-yellow-500"
              : "text-yellow-400"

      report += `
        <li class="mb-2">
          <div class="font-medium">${issue.type} <span class="${severityClass}">(${issue.severity})</span></div>
          <div>${issue.description}</div>
          <div class="text-green-500">Recommendation: ${issue.recommendation}</div>
        </li>
      `
    })

    report += `</ul></div>`
  }

  report += `<h3 class="text-lg font-medium mb-2">ABI Implementation</h3>`

  if (result.abiIssues.length === 0) {
    report += `<p class="text-green-500 mb-4">No ABI implementation issues found</p>`
  } else {
    report += `
      <div class="mb-4">
        <ul class="list-disc pl-5">
    `

    result.abiIssues.forEach((issue) => {
      const severityClass =
        issue.severity === "critical"
          ? "text-red-600"
          : issue.severity === "high"
            ? "text-red-500"
            : issue.severity === "medium"
              ? "text-yellow-500"
              : "text-yellow-400"

      report += `
        <li class="mb-2">
          <div class="font-medium">${issue.type} <span class="${severityClass}">(${issue.severity})</span></div>
          <div>${issue.description}</div>
          <div class="text-green-500">Recommendation: ${issue.recommendation}</div>
        </li>
      `
    })

    report += `</ul></div>`
  }

  report += `<h3 class="text-lg font-medium mb-2">Security Analysis</h3>`

  if (result.securityIssues.length === 0) {
    report += `<p class="text-green-500 mb-4">No security issues found</p>`
  } else {
    report += `
      <div class="mb-4">
        <ul class="list-disc pl-5">
    `

    result.securityIssues.forEach((issue) => {
      const severityClass =
        issue.severity === "critical"
          ? "text-red-600"
          : issue.severity === "high"
            ? "text-red-500"
            : issue.severity === "medium"
              ? "text-yellow-500"
              : "text-yellow-400"

      report += `
        <li class="mb-2">
          <div class="font-medium">${issue.type} <span class="${severityClass}">(${issue.severity})</span></div>
          <div>${issue.description}</div>
          <div class="text-green-500">Recommendation: ${issue.recommendation}</div>
        </li>
      `
    })

    report += `</ul></div>`
  }

  report += `
    <h3 class="text-lg font-medium mb-2">Performance Metrics</h3>
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div>
        <div class="font-medium">Opcode Cost</div>
        <div>${result.performance.opcodeCost} / 700</div>
      </div>
      <div>
        <div class="font-medium">State Size</div>
        <div>${result.performance.stateSize} bytes</div>
      </div>
      <div>
        <div class="font-medium">Complexity</div>
        <div>${result.performance.complexity}</div>
      </div>
    </div>
  </div>
  `

  return report
}
