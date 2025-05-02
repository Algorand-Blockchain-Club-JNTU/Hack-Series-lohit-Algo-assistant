/**
 * Automated testing system for PyTeal contracts
 */

import { validatePyTealCode } from "./pyteal-validator"

export interface TestResult {
  id: string
  code: string
  timestamp: string
  passed: boolean
  validationErrors: any[]
  validationWarnings: any[]
  securityIssues: SecurityIssue[]
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

export interface PerformanceMetrics {
  opcodeCost: number
  stateSize: number
  complexity: number
}

/**
 * Run automated tests on PyTeal code
 * @param code The PyTeal code to test
 * @returns Test results
 */
export async function runAutomatedTests(code: string): Promise<TestResult> {
  const id = `test_${Date.now()}`
  const timestamp = new Date().toISOString()

  // Run validation
  const validationResult = validatePyTealCode(code)

  // Check for security issues
  const securityIssues = checkSecurityIssues(code)

  // Calculate performance metrics
  const performance = calculatePerformanceMetrics(code)

  // Determine if the test passed
  const passed =
    validationResult.isValid &&
    securityIssues.filter((issue) => issue.severity === "high" || issue.severity === "critical").length === 0

  return {
    id,
    code,
    timestamp,
    passed,
    validationErrors: validationResult.errors,
    validationWarnings: validationResult.warnings,
    securityIssues,
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
 * Generate a test report for a PyTeal contract
 * @param result The test result
 * @returns HTML report
 */
export function generateTestReport(result: TestResult): string {
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

/**
 * Run a comprehensive security audit on PyTeal code
 * @param code The PyTeal code to audit
 * @returns Audit results
 */
export async function runSecurityAudit(code: string): Promise<{
  passed: boolean
  issues: SecurityIssue[]
  recommendations: string[]
}> {
  // This would be a more comprehensive version of checkSecurityIssues
  // In a real implementation, this would use more sophisticated analysis

  const issues = checkSecurityIssues(code)

  // Generate recommendations based on issues
  const recommendations = issues.map((issue) => issue.recommendation)

  // Add general recommendations
  recommendations.push(
    "Use explicit type conversions to avoid unexpected behavior",
    "Add comprehensive error messages to help with debugging",
    "Consider using ABI for better interoperability",
    "Implement proper event logging for important state changes",
  )

  // Determine if the audit passed
  const passed = issues.filter((issue) => issue.severity === "high" || issue.severity === "critical").length === 0

  return {
    passed,
    issues,
    recommendations: [...new Set(recommendations)], // Remove duplicates
  }
}
