"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Code, Info } from "lucide-react"
import { getTemplate } from "@/lib/pyteal-templates-enhanced"
import { getConcept } from "@/lib/pyteal-knowledge-base"

interface DocumentationViewerProps {
  templateId?: string
  conceptId?: string
}

export default function DocumentationViewer({ templateId, conceptId }: DocumentationViewerProps) {
  const [activeTab, setActiveTab] = useState<string>("docs")

  // Get template or concept data
  const template = templateId ? getTemplate(templateId) : undefined
  const concept = conceptId ? getConcept(conceptId) : undefined

  if (!template && !concept) {
    return (
      <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#00C9C9]">Documentation</CardTitle>
          <CardDescription className="text-[#8892B0]">No documentation selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[#E6F1FF]">Select a template or concept to view its documentation.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
      <CardHeader>
        <CardTitle className="text-[#00C9C9] flex items-center gap-2">
          {template ? <Code className="h-5 w-5" /> : <Info className="h-5 w-5" />}
          {template ? template.name : concept?.name}
        </CardTitle>
        <CardDescription className="text-[#8892B0]">
          {template ? template.description : concept?.description}
        </CardDescription>

        {template && (
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
              Version: {template.version}
            </div>
            <div className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
              Updated: {template.lastUpdated}
            </div>
            <div className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
              PyTeal: {template.pytealVersion}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Documentation</span>
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Examples</span>
            </TabsTrigger>
            <TabsTrigger value="related" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Related</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="docs">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#E6F1FF]">Official Documentation</h3>
              <div className="space-y-2">
                {template &&
                  template.documentation.map((doc, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-between border-[rgba(0,201,201,0.3)] bg-[rgba(0,201,201,0.05)] text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                      onClick={() => window.open(doc, "_blank")}
                    >
                      <span className="truncate">{getDocTitle(doc)}</span>
                      <ExternalLink className="h-4 w-4 ml-2 shrink-0" />
                    </Button>
                  ))}

                {concept && (
                  <Button
                    variant="outline"
                    className="w-full justify-between border-[rgba(0,201,201,0.3)] bg-[rgba(0,201,201,0.05)] text-[#E6F1FF] hover:bg-[rgba(0,201,201,0.1)]"
                    onClick={() => window.open(concept.documentation, "_blank")}
                  >
                    <span className="truncate">{getDocTitle(concept.documentation)}</span>
                    <ExternalLink className="h-4 w-4 ml-2 shrink-0" />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="examples">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#E6F1FF]">Code Examples</h3>

              {concept && (
                <div className="space-y-2">
                  {concept.examples.map((example, index) => (
                    <div key={index} className="bg-[rgba(2,13,25,0.7)] rounded-md p-4">
                      <pre className="text-sm overflow-x-auto font-mono text-[#E6F1FF]">
                        <code>{example}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="related">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#E6F1FF]">Related Resources</h3>

              {concept && concept.relatedConcepts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {concept.relatedConcepts.map((relatedId, index) => {
                    const relatedConcept = getConcept(relatedId)
                    return relatedConcept ? (
                      <Card key={index} className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-medium text-[#00C9C9]">{relatedConcept.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <p className="text-xs text-[#8892B0]">{relatedConcept.description}</p>
                        </CardContent>
                      </Card>
                    ) : null
                  })}
                </div>
              )}

              {template && template.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.features.map((feature, index) => (
                    <div key={index} className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
                      {feature}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper function to extract a readable title from a URL
function getDocTitle(url: string): string {
  try {
    // Remove protocol and domain
    const path = new URL(url).pathname

    // Split by slashes and get the last meaningful segment
    const segments = path.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    // Replace hyphens and underscores with spaces and capitalize
    return lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(".html", "")
  } catch (e) {
    // If URL parsing fails, return the original URL
    return url
  }
}
