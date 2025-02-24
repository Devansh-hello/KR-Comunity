import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ContentToModerate {
  title?: string
  content: string
}

export async function moderateContent({ title, content }: ContentToModerate) {
  try {
    const textToModerate = `${title ? title + "\n" : ""}${content}`
    
    const response = await openai.moderations.create({
      input: textToModerate,
    })

    const result = response.results[0]

    return {
      safe: !result.flagged,
      categories: result.categories,
      scores: result.category_scores,
    }
  } catch (error) {
    console.error("Moderation error:", error)
    // Default to safe if moderation fails
    return { safe: true }
  }
} 