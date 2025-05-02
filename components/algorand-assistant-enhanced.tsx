"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, FileCode, BookOpen, ThumbsUp, Shield, RefreshCw, Zap } from "lucide-react"
import { PyTealTemplateSelector } from "./chat-interface-enhanced"
import { PyTealCodeValidator } from "./chat-interface-enhanced"
import DocumentationViewer from "./documentation-viewer"
import PyTealFeedbackTester from "./pyteal-feedback-tester"
import TemplateUpdateManager from "./template-update-manager"

export default function AlgorandAssistantEnhanced() {
  const [activeTab, setActiveTab] = useState<string>("templates")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)

  // Sample code for demonstration
  const sampleCode = `from pyteal import *

def approval_program():
    # Global variables
    global_creator = Bytes("Creator")
    global_counter = Bytes("Counter")
    
    # Initialize global state on creation
    on_creation = Seq([
        App.globalPut(global_creator, Txn.sender()),
        App.globalPut(global_counter, Int(0)),
        Return(Int(1))
    ])
    
    # Increment counter
    increment = Seq([
        App.globalPut(global_counter, App.globalGet(global_counter) + Int(1)),
        Return(Int(1))
    ])
    
    # Handle each possible application call
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.application_args[0] == Bytes("increment"), increment]
    )
    
    return program

def clear_state_program():
    return Return(Int(1))

# Compile the program to TEAL
if __name__ == "__main__":
    with open("counter_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), Mode.Application, version=6)
        f.write(compiled)
    
    with open("counter_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), Mode.Application, version=6)
        f.write(compiled)
`

  return (
    <div className="container mx-auto py-8">
      <Card className="bg-[#0A1A2F] border border-[rgba(0,201,201,0.3)] mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#00C9C9] flex items-center gap-2">
            <Code className="h-6 w-6" />
            Enhanced Algorand Assistant
          </CardTitle>
          <CardDescription className="text-[#8892B0]">
            Advanced tools for Algorand smart contract development
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Documentation</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Testing</span>
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Updates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
                <CardHeader>
                  <CardTitle className="text-[#00C9C9] flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    Smart Contract Templates
                  </CardTitle>
                  <CardDescription className="text-[#8892B0]">Select a template to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <PyTealTemplateSelector />
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
                <CardHeader>
                  <CardTitle className="text-[#00C9C9] flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code Validation
                  </CardTitle>
                  <CardDescription className="text-[#8892B0]">Validate your PyTeal code</CardDescription>
                </CardHeader>
                <CardContent>
                  <PyTealCodeValidator code={sampleCode} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <DocumentationViewer templateId={selectedTemplateId} conceptId={selectedConceptId} />
        </TabsContent>

        <TabsContent value="feedback">
          <PyTealFeedbackTester code={sampleCode} query="Create a counter smart contract for Algorand" />
        </TabsContent>

        <TabsContent value="testing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#00C9C9] flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Testing
                </CardTitle>
                <CardDescription className="text-[#8892B0]">
                  Test your smart contracts for security vulnerabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-[#E6F1FF]">
                    Our automated security testing system analyzes your PyTeal code for common vulnerabilities and best
                    practices.
                  </p>
                  <Button className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5]" onClick={() => {}}>
                    Run Security Audit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#00C9C9] flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Testing
                </CardTitle>
                <CardDescription className="text-[#8892B0]">
                  Analyze your smart contracts for performance and optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-[#E6F1FF]">
                    Our performance testing system analyzes your PyTeal code for efficiency, opcode usage, and state
                    management.
                  </p>
                  <Button className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5]" onClick={() => {}}>
                    Run Performance Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="updates">
          <TemplateUpdateManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
