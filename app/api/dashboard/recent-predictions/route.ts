import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { VirtualDoctorInteraction } from "@/models/VirtualDoctorInteraction"
import { error, json } from "@/app/api/_utils"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return error("Unauthorized", 401)
  
  await connectDB()
  
  // Try legacy VirtualDoctorInteraction (old virtual doctor page)
  const legacyPredictions = await VirtualDoctorInteraction.find({
    userId: auth.sub
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  if (legacyPredictions.length > 0) {
    return json(legacyPredictions)
  }

  // Proxy to Flask backend to get current user's AI chat sessions
  // The Flask session cookie is forwarded from the browser request
  try {
    const flaskBase = process.env.FLASK_API_URL || "http://localhost:8000"
    const cookieHeader = req.headers.get("cookie") || ""
    
    const flaskRes = await fetch(`${flaskBase}/api/sessions`, {
      headers: {
        cookie: cookieHeader,
      },
    })

    if (!flaskRes.ok) return json([])

    const flaskData = await flaskRes.json()
    const sessions = flaskData.sessions || []

    if (sessions.length === 0) return json([])

    // Shape sessions to match the Predictions widget format
    const shaped = sessions.slice(0, 5).map((s: any) => ({
      _id: s.session_id,
      createdAt: s.last_active || s.created_at || new Date(),
      inputSymptoms: s.title || s.preview || "AI Chat Session",
      predictedDiseases: [],
      isAISession: true,
      sessionId: s.session_id,
    }))

    return json(shaped)
  } catch (err) {
    console.error("Error fetching AI sessions from Flask:", err)
    return json([])
  }
}
