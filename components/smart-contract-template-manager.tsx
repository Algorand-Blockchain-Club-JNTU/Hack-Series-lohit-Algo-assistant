"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon, Code, FileCode } from "lucide-react"
import { AMCPClient } from "@/lib/amcp-client"

// Initialize AMCP client
const amcpClient = new AMCPClient()

interface SmartContractTemplateManagerProps {
  onSelectTemplate?: (template: any) => void
}

export default function SmartContractTemplateManager({ onSelectTemplate }: SmartContractTemplateManagerProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>("voting")
  const [copied, setCopied] = useState<boolean>(false)

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Fetch templates for common contract types
        const templateTypes = ["voting", "auction", "escrow", "token", "nft"]
        const fetchedTemplates = []

        for (const type of templateTypes) {
          const template = await amcpClient.getRelevantTemplate(type)
          if (template && template.data) {
            fetchedTemplates.push(template.data)
          }
        }

        setTemplates(fetchedTemplates)
      } catch (error) {
        console.error("Error fetching templates:", error)
      }
    }

    fetchTemplates()
  }, [])

  // Handle copy to clipboard
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle template selection
  const handleSelectTemplate = (template: any) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
    }
  }

  if (templates.length === 0) {
    return <div className="text-center py-4">Loading templates...</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCode className="h-5 w-5 mr-2" />
          Smart Contract Templates
        </CardTitle>
        <CardDescription>Pre-built templates for common Algorand smart contracts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            {templates.slice(0, 3).map((template) => (
              <TabsTrigger key={template.templateName} value={template.templateName}>
                {template.templateName.charAt(0).toUpperCase() + template.templateName.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {templates.map((template) => (
            <TabsContent key={template.templateName} value={template.templateName}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">
                    {template.templateName.charAt(0).toUpperCase() + template.templateName.slice(1)} Contract
                  </h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Features:</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {template.keyFeatures.slice(0, 3).map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Best Practices:</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {template.bestPractices.slice(0, 3).map((practice: string, index: number) => (
                      <li key={index}>{practice}</li>
                    ))}
                  </ul>
                </div>

                <div className="relative">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono overflow-auto max-h-60">
                    <pre>{template.code.substring(0, 500)}...</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => handleCopy(template.code)}
                  >
                    {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </div>

                <Button className="w-full" onClick={() => handleSelectTemplate(template)}>
                  <Code className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
