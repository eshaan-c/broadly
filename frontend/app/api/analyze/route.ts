import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { scenario, depth } = await request.json()

    // Simulate processing time based on depth
    const processingTime = depth === "quick" ? 1000 : depth === "thorough" ? 3000 : 2000
    await new Promise((resolve) => setTimeout(resolve, processingTime))

    // Mock response matching your API structure
    const response = {
      decision_type: "travel_choice",
      title: "Tropical Fall Break Trip Decision",
      options: [
        {
          name: "Belize",
          description: "Central American paradise with barrier reef and jungle adventures",
          inferred: false,
        },
        {
          name: "Costa Rica",
          description: "Eco-tourism destination with beaches, rainforests, and wildlife",
          inferred: false,
        },
        {
          name: "Barbados",
          description: "Caribbean island with pristine beaches and vibrant culture",
          inferred: true,
        },
      ],
      criteria: [
        {
          name: "Budget",
          description: "Total cost including flights, accommodation, and activities",
          weight: 0.3,
          category: "financial",
        },
        {
          name: "Activities",
          description: "Variety and quality of available activities and experiences",
          weight: 0.25,
          category: "experience",
        },
        {
          name: "Safety",
          description: "Overall safety and security for travelers",
          weight: 0.2,
          category: "practical",
        },
        {
          name: "Weather",
          description: "Climate conditions during your travel dates",
          weight: 0.15,
          category: "environmental",
        },
        {
          name: "Accessibility",
          description: "Ease of travel and getting around",
          weight: 0.1,
          category: "practical",
        },
      ],
      questions: [
        {
          text: "What's your total budget per person for this trip?",
          type: "scale",
          min: 1000,
          max: 5000,
          minLabel: "$1,000",
          maxLabel: "$5,000+",
          criteria_link: "Budget",
        },
        {
          text: "How important are adventure activities vs relaxation?",
          type: "scale",
          min: 1,
          max: 10,
          minLabel: "Pure relaxation",
          maxLabel: "Adventure focused",
          criteria_link: "Activities",
        },
        {
          text: "Rank these factors by importance to your group",
          type: "rank",
          options: ["Beach quality", "Nightlife", "Cultural experiences", "Adventure sports", "Food scene"],
          criteria_link: "Activities",
        },
        {
          text: "Are you comfortable with basic Spanish for communication?",
          type: "boolean",
          labels: ["No", "Yes"],
          criteria_link: "Accessibility",
        },
        {
          text: "Any specific activities or experiences you're hoping for?",
          type: "text",
          placeholder: "e.g., snorkeling, zip-lining, cultural tours...",
          criteria_link: "Activities",
        },
      ],
      context_factors: ["Group size", "Travel dates", "Previous travel experience"],
      depth: depth,
      scenario_text: scenario,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error processing analysis:", error)
    return NextResponse.json({ error: "Failed to analyze decision" }, { status: 500 })
  }
}
