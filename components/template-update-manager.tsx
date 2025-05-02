"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, RefreshCw, FileCode } from "lucide-react"
import { getAllTemplates, checkForTemplateUpdates, updateTemplate } from "@/lib/pyteal-templates-enhanced"

export default function TemplateUpdateManager() {
  const [templates, setTemplates] = useState<any[]>([])
  const [templatesNeedingUpdates, setTemplatesNeedingUpdates] = useState<any[]>([])
  const [currentAlgorandVersion, setCurrentAlgorandVersion] = useState<string>("3.17.0")
  const [currentPyTealVersion, setCurrentPyTealVersion] = useState<string>("0.24.0")
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [newCode, setNewCode] = useState<string>("")
  const [newVersion, setNewVersion] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false)

  useEffect(() => {
    // Load templates
    const allTemplates = getAllTemplates()
    setTemplates(allTemplates)

    // Check for templates needing updates
    const needUpdates = checkForTemplateUpdates(currentAlgorandVersion, currentPyTealVersion)
    setTemplatesNeedingUpdates(needUpdates)
  }, [currentAlgorandVersion, currentPyTealVersion])

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template)
    setNewCode(template.code)

    // Increment version
    const versionParts = template.version.split(".")
    const lastPart = Number.parseInt(versionParts[versionParts.length - 1]) + 1
    versionParts[versionParts.length - 1] = lastPart.toString()
    setNewVersion(versionParts.join("."))

    setUpdateSuccess(false)
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !newCode || !newVersion) return

    setIsUpdating(true)

    try {
      // Update the template
      const updatedTemplate = updateTemplate(
        selectedTemplate.id,
        newCode,
        newVersion,
        currentAlgorandVersion,
        currentPyTealVersion,
      )

      if (updatedTemplate) {
        // Refresh templates
        const allTemplates = getAllTemplates()
        setTemplates(allTemplates)

        // Check for templates needing updates
        const needUpdates = checkForTemplateUpdates(currentAlgorandVersion, currentPyTealVersion)
        setTemplatesNeedingUpdates(needUpdates)

        // Update selected template
        setSelectedTemplate(updatedTemplate)

        setUpdateSuccess(true)
      }
    } catch (error) {
      console.error("Error updating template:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
          <CardHeader>
            <CardTitle className="text-[#00C9C9] flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Template Updates
            </CardTitle>
            <CardDescription className="text-[#8892B0]">
              {templatesNeedingUpdates.length} templates need updates
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#E6F1FF]">Current Algorand Version</Label>
              <Input
                value={currentAlgorandVersion}
                onChange={(e) => setCurrentAlgorandVersion(e.target.value)}
                className="bg-[#061525] border-[rgba(0,201,201,0.2)] text-[#E6F1FF]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#E6F1FF]">Current PyTeal Version</Label>
              <Input
                value={currentPyTealVersion}
                onChange={(e) => setCurrentPyTealVersion(e.target.value)}
                className="bg-[#061525] border-[rgba(0,201,201,0.2)] text-[#E6F1FF]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#E6F1FF]">Templates</Label>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {templates.map((template) => {
                  const needsUpdate = templatesNeedingUpdates.some((t) => t.id === template.id)

                  return (
                    <div
                      key={template.id}
                      className={`p-3 rounded-md cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? "bg-[rgba(0,201,201,0.2)] border border-[#00C9C9]"
                          : needsUpdate
                            ? "bg-[rgba(220,38,38,0.1)] border border-red-800"
                            : "bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)] hover:border-[rgba(0,201,201,0.4)]"
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-[#E6F1FF] flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-[#00C9C9]" />
                          {template.name}
                        </div>
                        {needsUpdate && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#8892B0]">
                        <span>v{template.version}</span>
                        <span>•</span>
                        <span>PyTeal {template.pytealVersion}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        {selectedTemplate ? (
          <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
            <CardHeader>
              <CardTitle className="text-[#00C9C9] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  {selectedTemplate.name}
                </span>
                <Badge className="bg-[rgba(0,201,201,0.1)] text-[#00C9C9] border-[rgba(0,201,201,0.3)]">
                  v{selectedTemplate.version}
                </Badge>
              </CardTitle>
              <CardDescription className="text-[#8892B0]">{selectedTemplate.description}</CardDescription>

              <div className="flex flex-wrap gap-2 mt-2">
                <div className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
                  Updated: {selectedTemplate.lastUpdated}
                </div>
                <div className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
                  Algorand: {selectedTemplate.algorandVersion}
                </div>
                <div className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
                  PyTeal: {selectedTemplate.pytealVersion}
                </div>
                {selectedTemplate.features.map((feature: string, index: number) => (
                  <div key={index} className="text-xs bg-[rgba(0,201,201,0.1)] text-[#00C9C9] px-2 py-1 rounded">
                    {feature}
                  </div>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {updateSuccess && (
                <div className="mb-4 p-3 bg-[rgba(16,185,129,0.1)] rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-400">Template updated successfully</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[#E6F1FF]">New Version</Label>
                <Input
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  className="bg-[#061525] border-[rgba(0,201,201,0.2)] text-[#E6F1FF]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#E6F1FF]">Template Code</Label>
                <Textarea
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="min-h-[400px] font-mono bg-[#061525] border-[rgba(0,201,201,0.2)] text-[#E6F1FF]"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleUpdateTemplate}
                disabled={isUpdating || !newCode || !newVersion}
                className="bg-[#00C9C9] text-[#020D19] hover:bg-[#00b5b5]"
              >
                {isUpdating ? "Updating..." : "Update Template"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-[rgba(0,201,201,0.05)] border border-[rgba(0,201,201,0.2)]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileCode className="h-16 w-16 text-[#00C9C9] opacity-30 mb-4" />
              <h3 className="text-xl font-medium text-[#E6F1FF] mb-2">Select a Template</h3>
              <p className="text-[#8892B0] text-center max-w-md">
                Select a template from the list to view and update it. Templates that need updates are highlighted in
                red.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
