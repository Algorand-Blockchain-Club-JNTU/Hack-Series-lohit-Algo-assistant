"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Code, Download } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"

interface TealCompilerProps {
  isOpen: boolean
  onClose: () => void
  initialCode?: string
}

export default function TealCompiler({ isOpen, onClose, initialCode = "" }: TealCompilerProps) {
  const [code, setCode] = useState(initialCode)
  const [compiledCode, setCompiledCode] = useState("")
  const [isCompiling, setIsCompiling] = useState(false)
  const [compileError, setCompileError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("editor")
  const [compileSuccess, setCompileSuccess] = useState(false)

  const handleCompile = async () => {
    if (!code.trim()) return

    setIsCompiling(true)
    setCompileError(null)
    setCompileSuccess(false)

    try {
      // In a real implementation, this would call an API endpoint to compile the TEAL code
      // For now, we'll simulate a successful compilation after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate compilation result
      // In a real implementation, this would be the actual compiled bytecode or result
      const simulatedResult = `// Compiled TEAL code
int 1
return
`
      setCompiledCode(simulatedResult)
      setCompileSuccess(true)
      setActiveTab("result")
    } catch (error) {
      setCompileError(error instanceof Error ? error.message : "Unknown error occurred during compilation")
    } finally {
      setIsCompiling(false)
    }
  }

  const downloadCode = (text: string, filename: string) => {
    const element = document.createElement("a")
    const file = new Blob([text], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-[#0A1A2F] border border-[rgba(0,201,201,0.3)] text-[#E6F1FF]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#00C9C9] flex items-center gap-2">
            <Code className="h-5 w-5" />
            TEAL Code Compiler
          </DialogTitle>
          <DialogDescription className="text-[#8892B0]">
            Write or paste PyTeal/TEAL code and compile it directly
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-[rgba(0,201,201,0.2)]">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger
                value="editor"
                className="data-[state=active]:bg-[rgba(0,201,201,0.1)] data-[state=active]:text-[#00C9C9] data-[state=active]:border-b-2 data-[state=active]:border-[#00C9C9] rounded-none"
              >
                Code Editor
              </TabsTrigger>
              <TabsTrigger
                value="result"
                className="data-[state=active]:bg-[rgba(0,201,201,0.1)] data-[state=active]:text-[#00C9C9] data-[state=active]:border-b-2 data-[state=active]:border-[#00C9C9] rounded-none"
                disabled={!compiledCode}
              >
                Compilation Result
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 overflow-hidden flex flex-col mt-0 p-0">
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="bg-[rgba(0,201,201,0.1)] text-[#00C9C9] border-[rgba(0,201,201,0.3)]"
                  >
                    PyTeal/TEAL
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton
                    text={code}
                    variant="ghost"
                    size="sm"
                    className="text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                    tooltipText="Copy code"
                  />
                </div>
              </div>

              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="# Enter your PyTeal or TEAL code here..."
                className="flex-1 min-h-[300px] font-mono bg-[#061525] border-[rgba(0,201,201,0.2)] text-[#E6F1FF] resize-none focus-visible:ring-[#00C9C9] focus-visible:ring-opacity-50"
              />

              {compileError && (
                <Alert
                  variant="destructive"
                  className="mt-4 bg-[rgba(220,38,38,0.1)] border border-red-800 text-red-200"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Compilation Error</AlertTitle>
                  <AlertDescription>{compileError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="p-4 border-t border-[rgba(0,201,201,0.2)] bg-[#061525]">
              <Button
                onClick={handleCompile}
                disabled={isCompiling || !code.trim()}
                className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5] disabled:bg-[rgba(0,201,201,0.3)]"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Compiling...
                  </>
                ) : (
                  "Compile Code"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="result" className="flex-1 overflow-hidden flex flex-col mt-0 p-0">
            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-[rgba(0,201,201,0.1)] text-[#00C9C9] border-[rgba(0,201,201,0.3)]"
                  >
                    Compiled TEAL
                  </Badge>
                  {compileSuccess && (
                    <span className="text-green-400 text-sm flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Compilation successful
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton
                    text={compiledCode}
                    variant="ghost"
                    size="sm"
                    className="text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                    tooltipText="Copy compiled code"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                    onClick={() => downloadCode(compiledCode, "compiled_teal.teal")}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-[#061525] border border-[rgba(0,201,201,0.2)] rounded-md">
                <pre className="m-0 p-4 bg-transparent min-h-[300px] text-[#E6F1FF] font-mono text-sm">
                  {compiledCode}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-[rgba(0,201,201,0.2)] bg-[#061525]">
              <Button
                onClick={() => setActiveTab("editor")}
                variant="outline"
                className="border-[rgba(0,201,201,0.3)] text-[#00C9C9] hover:bg-[rgba(0,201,201,0.1)]"
              >
                Back to Editor
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
