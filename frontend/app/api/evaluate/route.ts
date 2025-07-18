import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { framework, responses } = await request.json()

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock evaluation response
    const response = {
      option_scores: {
        Belize: {
          total_score: 8.2,
          criteria_scores: {
            Budget: 7.5,
            Activities: 9.0,
            Safety: 7.0,
            Weather: 8.5,
            Accessibility: 6.0,
          },
          strengths: [
            "Incredible barrier reef for snorkeling and diving",
            "Great value for adventure activities",
            "English-speaking country",
            "Perfect weather in fall",
          ],
          weaknesses: [
            "Limited nightlife options",
            "Some areas require careful planning",
            "Fewer luxury accommodations",
          ],
          confidence: "high",
        },
        "Costa Rica": {
          total_score: 8.7,
          criteria_scores: {
            Budget: 7.0,
            Activities: 9.5,
            Safety: 8.5,
            Weather: 8.0,
            Accessibility: 8.0,
          },
          strengths: [
            "Unmatched biodiversity and eco-tourism",
            "Excellent safety record for tourists",
            "Wide variety of activities from beaches to volcanoes",
            "Well-developed tourism infrastructure",
          ],
          weaknesses: [
            "Can be more expensive than other Central American destinations",
            "Rainy season overlap in some regions",
            "Popular spots can be crowded",
          ],
          confidence: "high",
        },
        Barbados: {
          total_score: 7.8,
          criteria_scores: {
            Budget: 6.0,
            Activities: 7.5,
            Safety: 9.0,
            Weather: 9.0,
            Accessibility: 8.5,
          },
          strengths: [
            "Pristine beaches and crystal-clear waters",
            "Very safe for tourists",
            "Perfect tropical weather",
            "Rich cultural experiences and friendly locals",
          ],
          weaknesses: [
            "Higher cost of living and dining",
            "Limited adventure activities compared to mainland options",
            "Smaller island means fewer diverse experiences",
          ],
          confidence: "medium",
        },
      },
      recommendation: {
        primary_choice: "Costa Rica",
        reasoning:
          "Based on your preferences for adventure activities and group travel, Costa Rica offers the best combination of safety, diverse experiences, and value. With your budget range and interest in both adventure and cultural experiences, it provides the most comprehensive tropical experience.",
        alternatives: [
          "Belize is an excellent choice if you prioritize marine activities and English communication",
          "Barbados offers the most relaxing beach experience if you prefer a more laid-back trip",
        ],
        red_flags: [
          "Consider travel insurance for adventure activities",
          "Book accommodations early as fall is peak season",
        ],
      },
      sensitivity_analysis: {
        critical_factors: ["Budget", "Activities"],
        robust_choice: "Costa Rica",
      },
      model_used: "gpt-4",
      complexity_score: 7.5,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error processing evaluation:", error)
    return NextResponse.json({ error: "Failed to evaluate decision" }, { status: 500 })
  }
}
