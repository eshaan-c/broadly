import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Decision API is running successfully",
    timestamp: new Date().toISOString(),
  })
}
