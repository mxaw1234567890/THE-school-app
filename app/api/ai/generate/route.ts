import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Prompt required" }, { status: 400 })
    }

    if (!type) {
      return Response.json({ error: "Type is required (study_guide, quiz, or summary)" }, { status: 400 })
    }

    let systemPrompt = ""
    let customPrompt = prompt

    switch (type) {
      case "study_guide":
        systemPrompt =
          "You are an educational assistant. Create a clear, concise study guide for the given topic. Use bullet points and sections."
        customPrompt = `Create a study guide for: ${prompt}`
        break
      case "quiz":
        systemPrompt = "You are a quiz generator. Create 5 multiple choice questions with answers for the given topic."
        customPrompt = `Generate quiz questions for: ${prompt}`
        break
      case "summary":
        systemPrompt = "You are a summarization expert. Create a concise summary of the given text or topic."
        customPrompt = `Summarize: ${prompt}`
        break
      default:
        return Response.json({ error: "Invalid type. Use: study_guide, quiz, or summary" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4-mini",
      system: systemPrompt,
      prompt: customPrompt,
      maxTokens: 1024,
    })

    return Response.json({ result: text })
  } catch (error) {
    console.error("[v0] AI generation error:", error)
    return Response.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
