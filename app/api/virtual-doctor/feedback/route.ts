import type { NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import { RecommendationFeedback } from "@/models/RecommendationFeedback"
import { error, json } from "@/app/api/_utils"
import { Types } from "mongoose"

export async function POST(req: NextRequest) {
    await connectDB()
    const body = await req.json()

    const { userId, interactionId, recommendedDoctorId, feedbackType, reason, selectedDoctor, inputSymptoms, recommendationScore } = body

    // Validate required fields
    if (!feedbackType || !["helpful", "not_helpful"].includes(feedbackType)) {
        return error("Invalid feedback type. Must be 'helpful' or 'not_helpful'", 400)
    }

    // Validate ObjectIds if provided
    if (userId && !Types.ObjectId.isValid(userId)) {
        return error("Invalid userId format", 400)
    }
    if (interactionId && !Types.ObjectId.isValid(interactionId)) {
        return error("Invalid interactionId format", 400)
    }
    if (recommendedDoctorId && !Types.ObjectId.isValid(recommendedDoctorId)) {
        return error("Invalid recommendedDoctorId format", 400)
    }

    try {
        const feedback: any = {
            feedbackType,
            inputSymptoms,
            recommendationScore: Math.min(100, Math.max(0, Number(recommendationScore) || 0)),
        }

        if (userId && Types.ObjectId.isValid(userId)) feedback.userId = userId
        if (interactionId && Types.ObjectId.isValid(interactionId)) feedback.interactionId = interactionId
        if (recommendedDoctorId && Types.ObjectId.isValid(recommendedDoctorId)) feedback.recommendedDoctorId = recommendedDoctorId
        if (reason && typeof reason === "string") feedback.reason = reason.trim().slice(0, 500) // limit reason length
        if (selectedDoctor && typeof selectedDoctor === "object") feedback.selectedDoctor = selectedDoctor

        const created = await RecommendationFeedback.create(feedback)
        return json({ success: true, feedbackId: created._id })
    } catch (err: any) {
        console.error("Error saving feedback:", err)
        return error("Failed to save feedback", 500)
    }
}
