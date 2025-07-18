import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { scenario, depth, answers } = await request.json()

    // This is a mock implementation
    // In a real app, you would call your Flask API here

    // Simulate processing time based on depth
    const processingTime = depth === "quick" ? 1000 : depth === "thorough" ? 3000 : 2000

    await new Promise((resolve) => setTimeout(resolve, processingTime))

    // Mock response data - in a real implementation, this would use the answers to customize the response
    const response = {
      options: [
        {
          name: "Job Offer A - New York",
          pros: ["Higher salary ($120k)", "Prestigious company", "Career advancement opportunities"],
          cons: ["Higher cost of living", "Longer commute", "More stressful work environment"],
        },
        {
          name: "Job Offer B - Austin",
          pros: ["Good salary ($105k)", "Better work-life balance", "Lower cost of living", "Emerging tech hub"],
          cons: ["Less prestigious company", "Potentially slower career growth", "Relocation required"],
        },
      ],
      criteria: [
        {
          name: "Financial Impact",
          analysis:
            "While Job A offers a higher nominal salary, Job B may provide better financial outcomes when adjusted for cost of living differences.",
        },
        {
          name: "Career Growth",
          analysis:
            "Job A offers more immediate prestige and potential for advancement, while Job B may provide more balanced growth over time.",
        },
        {
          name: "Quality of Life",
          analysis: "Job B appears to offer better work-life balance and potentially less stressful environment.",
        },
      ],
      recommendation: `Based on your scenario and your high ranking of ${answers?.factors?.[0] || "work-life balance"}, 
        Job B in Austin appears to align better with your priorities, though Job A offers stronger immediate career benefits. 
        ${answers?.relocation ? "Since you indicated willingness to relocate" : "Though you indicated concerns about relocation"} 
        and rated this decision as ${answers?.importance >= 8 ? "highly important" : "moderately important"} (${answers?.importance || "7"}/10), 
        we recommend carefully considering the long-term lifestyle implications of each choice.`,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error processing analysis:", error)
    return NextResponse.json({ error: "Failed to analyze decision" }, { status: 500 })
  }
}
