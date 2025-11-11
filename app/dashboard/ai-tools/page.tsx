"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader } from "lucide-react"

type ToolType = "study_guide" | "quiz" | "summary" | null

export default function AIToolsPage() {
  const [selectedTool, setSelectedTool] = useState<ToolType>(null)
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const tools = [
    {
      id: "study_guide" as ToolType,
      title: "Study Guide Generator",
      description: "AI-powered study guide creation",
      icon: "📚",
    },
    {
      id: "quiz" as ToolType,
      title: "Quiz Creator",
      description: "Generate practice questions automatically",
      icon: "❓",
    },
    {
      id: "summary" as ToolType,
      title: "Smart Summarizer",
      description: "Condense long texts into key points",
      icon: "📝",
    },
  ]

  const generateContent = async () => {
    if (!input.trim() || !selectedTool) return

    setLoading(true)
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          type: selectedTool,
        }),
      })

      const data = await response.json()
      setResult(data.result || "")
    } catch (error) {
      console.error("[v0] Error generating content:", error)
      setResult("Error generating content. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Study Tools
        </h1>
        <p className="text-muted-foreground mt-2">Powered by advanced AI to enhance your studying</p>
      </div>

      {/* Tool Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-all ${
              selectedTool === tool.id ? "ring-2 ring-primary bg-primary/5" : "hover:border-primary"
            }`}
            onClick={() => {
              setSelectedTool(tool.id)
              setResult("")
              setInput("")
            }}
          >
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="font-semibold">{tool.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool Interface */}
      {selectedTool && (
        <Card>
          <CardHeader>
            <CardTitle>{tools.find((t) => t.id === selectedTool)?.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input">
                {selectedTool === "study_guide"
                  ? "Topic or Subject"
                  : selectedTool === "quiz"
                    ? "Topic for Questions"
                    : "Text to Summarize"}
              </Label>
              <textarea
                id="input"
                placeholder={
                  selectedTool === "study_guide"
                    ? "Enter a topic, e.g., 'Photosynthesis'"
                    : selectedTool === "quiz"
                      ? "Enter topic for quiz questions"
                      : "Paste text to summarize"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-3 rounded-lg border bg-background text-foreground min-h-32 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button onClick={generateContent} disabled={!input.trim() || loading} className="w-full">
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>

            {result && (
              <div className="mt-6 p-4 bg-accent rounded-lg">
                <h4 className="font-semibold mb-3">Generated Content:</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-foreground overflow-auto max-h-96">{result}</pre>
                </div>
                <Button
                  variant="outline"
                  className="mt-3 bg-transparent"
                  onClick={() => {
                    navigator.clipboard.writeText(result)
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>How AI Tools Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold">Study Guide Generator</p>
            <p className="text-muted-foreground">Input a topic and get a structured study guide with key concepts</p>
          </div>
          <div>
            <p className="font-semibold">Quiz Creator</p>
            <p className="text-muted-foreground">Generate practice questions to test your knowledge</p>
          </div>
          <div>
            <p className="font-semibold">Smart Summarizer</p>
            <p className="text-muted-foreground">Condense lengthy texts into concise summaries</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
