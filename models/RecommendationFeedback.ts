import { Schema, model, models } from "mongoose"

const RecommendationFeedbackSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        interactionId: { type: Schema.Types.ObjectId, ref: "VirtualDoctorInteraction" },
        recommendedDoctorId: { type: Schema.Types.ObjectId, ref: "User" },
        inputSymptoms: String,
        recommendationScore: Number, // 0-100 match score
        feedbackType: { type: String, enum: ["helpful", "not_helpful"], required: true },
        reason: String, // optional detailed reason
        selectedDoctor: {
            _id: Schema.Types.ObjectId,
            name: { first: String, last: String },
            specialization: String,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
)

export const RecommendationFeedback =
    models.RecommendationFeedback || model("RecommendationFeedback", RecommendationFeedbackSchema)
