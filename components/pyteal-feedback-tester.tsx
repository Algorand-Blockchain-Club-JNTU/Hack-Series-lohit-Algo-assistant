"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, ThumbsUp, ThumbsDown, Code, Shield, Zap } from "lucide-react"
import { submitFeedback } from "@/lib/feedback-system"
import { runAutomatedTests, runSecurityAudit } from "@/lib/automated-testing"
import { addFineTuningExample } from "@/lib/fine-tuning-system"

interface PyTealFeedbackTesterProps {
  code: string
  query: string
  templateId?: string
}

export default function PyTealFeedbackTester({ code, query, templateId }: PyTealFeedbackTesterProps) {
  const [activeTab, setActiveTab] = useState<string>("feedback")
  const [rating, setRating] = useState<number>(3)
  const [issues, setIssues] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [newIssue, setNewIssue] = useState<string>("")
  const [newSuggestion, setNewSuggestion] = useState<string>("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [securityResults, setSecurityResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleAddIssue = () => {
    if (newIssue.trim()) {
      setIssues([...issues, newIssue.trim()])
      setNewIssue("")
    }
  }

  const handleAddSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions([...suggestions, newSuggestion.trim()])
      setNewSuggestion("")
    }
  }

  const handleRemoveIssue = (index: number) => {
    setIssues(issues.filter((_, i) => i !== index))
  }

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index))
  }

  const handleSubmitFeedback = () => {
    const feedback = {
      query,
      code,
      rating,
      issues,
      suggestions,
      templateId,
    }

    submitFeedback(feedback)

    // If rating is high, add to fine-tuning examples
    if (rating >= 4) {
      addFineTuningExample({
        query,
        response: code,
        quality: "high",
        tags: ["feedback", "high-quality"],
        source: "feedback",
      })
    }

    setFeedbackSubmitted(true)
  }

  const handleRunTests = async () => {
    setIsLoading(true)

    try {
      const results = await runAutomatedTests(code)
      setTestResults(results)
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRunSecurityAudit = async () => {
    setIsLoading(true)

    try {
      const results = await runSecurityAudit(code)
      setSecurityResults(results)
    } catch (error) {
      console.error("Error running security audit:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
      <CardHeader>
        <CardTitle className="text-[#00C9C9] flex items-center gap-2">
          <Code className="h-5 w-5" />
          PyTeal Code Evaluation
        </CardTitle>
        <CardDescription className="text-[#8892B0]">
          Provide feedback and run tests on the generated PyTeal code
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              <span>Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Testing</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback">
            {feedbackSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-[#E6F1FF] mb-2">Thank You!</h3>
                <p className="text-[#8892B0]">Your feedback has been submitted and will help improve the system.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#E6F1FF]">How would you rate this code? (1-5)</Label>
                  <div className="flex items-center gap-4">
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                    <Slider
                      value={[rating]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => setRating(value[0])}
                      className="flex-1"
                    />
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                    <Badge className="bg-[rgba(0,201,201,0.1)] text-[#00C9C9] border-[rgba(0,201,201,0.3)]">
                      {rating}/5
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E6F1FF]">Issues or Problems</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newIssue}
                      onChange={(e) => setNewIssue(e.target.value)}
                      placeholder="Describe an issue with the code"
                      className="bg-[#061525] border-[rgba(0,201,201,0.2)] text-[#E6F1FF]"
                    />
                    <Button
                      onClick={handleAddIssue}
                      variant="outline"
                      className="border-[rgba(0,201,201,0.3)] text-[#00C9C9] hover:bg-[rgba(0,201,201,0.1)]"
                    >
                      Add
                    </Button>
                  </div>

                  {issues.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {issues.map((issue, index) => (
                        <Badge
                          key={index}
                          className="bg-[rgba(220,38,38,0.1)] text-red-400 border-red-800 flex items-center gap-1"
                        >
                          <span>{issue}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 text-red-400 hover:text-red-300 hover:bg-transparent"
                            onClick={() => handleRemoveIssue(index)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#E6F1FF]">Suggestions for Improvement</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder="Suggest an improvement"
                      className="bg-[#061525] border-[rgba(0,201,201,0.2)] text-[#E6F1FF]"
                    />
                    <Button
                      onClick={handleAddSuggestion}
                      variant="outline"
                      className="border-[rgba(0,201,201,0.3)] text-[#00C9C9] hover:bg-[rgba(0,201,201,0.1)]"
                    >
                      Add
                    </Button>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          className="bg-[rgba(16,185,129,0.1)] text-green-400 border-green-800 flex items-center gap-1"
                        >
                          <span>{suggestion}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 text-green-400 hover:text-green-300 hover:bg-transparent"
                            onClick={() => handleRemoveSuggestion(index)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="testing">
            <div className="space-y-4">
              {!testResults ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-[#00C9C9] mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-[#E6F1FF] mb-2">Run Automated Tests</h3>
                  <p className="text-[#8892B0] mb-4">
                    Test the PyTeal code for validation errors, performance issues, and best practices.
                  </p>
                  <Button
                    onClick={handleRunTests}
                    disabled={isLoading}
                    className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5]"
                  >
                    {isLoading ? "Running Tests..." : "Run Tests"}
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-medium text-[#E6F1FF]">Test Results</h3>
                    <Badge
                      className={`${
                        testResults.passed
                          ? "bg-[rgba(16,185,129,0.1)] text-green-400 border-green-800"
                          : "bg-[rgba(220,38,38,0.1)] text-red-400 border-red-800"
                      }`}
                    >
                      {testResults.passed ? "PASSED" : "FAILED"}
                    </Badge>
                  </div>

                  {testResults.validationErrors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-red-400 mb-2">Validation Errors</h4>
                      <ul className="space-y-1">
                        {testResults.validationErrors.map((error: any, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-red-300">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {testResults.validationWarnings.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-yellow-400 mb-2">Validation Warnings</h4>
                      <ul className="space-y-1">
                        {testResults.validationWarnings.map((warning: any, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-yellow-300">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{warning.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-medium text-[#E6F1FF] mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[rgba(0,201,201,0.05)] p-3 rounded-md">
                        <div className="text-xs text-[#8892B0]">Opcode Cost</div>
                        <div className="text-lg font-medium text-[#E6F1FF]">
                          {testResults.performance.opcodeCost} <span className="text-xs text-[#8892B0]">/ 700</span>
                        </div>
                      </div>
                      <div className="bg-[rgba(0,201,201,0.05)] p-3 rounded-md">
                        <div className="text-xs text-[#8892B0]">State Size</div>
                        <div className="text-lg font-medium text-[#E6F1FF]">
                          {testResults.performance.stateSize} <span className="text-xs text-[#8892B0]">bytes</span>
                        </div>
                      </div>
                      <div className="bg-[rgba(0,201,201,0.05)] p-3 rounded-md">
                        <div className="text-xs text-[#8892B0]">Complexity</div>
                        <div className="text-lg font-medium text-[#E6F1FF]">{testResults.performance.complexity}</div>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleRunTests} className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5]">
                    Run Tests Again
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              {!securityResults ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-[#00C9C9] mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-[#E6F1FF] mb-2">Run Security Audit</h3>
                  <p className="text-[#8892B0] mb-4">
                    Analyze the PyTeal code for security vulnerabilities and best practices.
                  </p>
                  <Button
                    onClick={handleRunSecurityAudit}
                    disabled={isLoading}
                    className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5]"
                  >
                    {isLoading ? "Running Audit..." : "Run Security Audit"}
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-medium text-[#E6F1FF]">Security Audit Results</h3>
                    <Badge
                      className={`${
                        securityResults.passed
                          ? "bg-[rgba(16,185,129,0.1)] text-green-400 border-green-800"
                          : "bg-[rgba(220,38,38,0.1)] text-red-400 border-red-800"
                      }`}
                    >
                      {securityResults.passed ? "SECURE" : "VULNERABILITIES FOUND"}
                    </Badge>
                  </div>

                  {securityResults.issues.length > 0 ? (
                    <div className="mb-4">
                      <h4 className="font-medium text-[#E6F1FF] mb-2">Security Issues</h4>
                      <div className="space-y-3">
                        {securityResults.issues.map((issue: any, index: number) => {
                          const severityColor =
                            issue.severity === "critical"
                              ? "text-red-600"
                              : issue.severity === "high"
                                ? "text-red-500"
                                : issue.severity === "medium"
                                  ? "text-yellow-500"
                                  : "text-yellow-400"

                          return (
                            <div key={index} className="bg-[rgba(0,201,201,0.05)] p-3 rounded-md">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-[#E6F1FF]">{issue.type}</div>
                                <Badge className={`${severityColor} border-none`}>{issue.severity}</Badge>
                              </div>
                              <p className="text-sm text-[#8892B0] mb-2">{issue.description}</p>
                              <p className="text-sm text-green-400">{issue.recommendation}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-[rgba(16,185,129,0.1)] rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-400">No security issues found</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-medium text-[#E6F1FF] mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {securityResults.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-[#8892B0]">
                          <span className="text-[#00C9C9]">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button onClick={handleRunSecurityAudit} className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5]">
                    Run Audit Again
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        {activeTab === "feedback" && !feedbackSubmitted && (
          <Button onClick={handleSubmitFeedback} className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5]">
            Submit Feedback
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
