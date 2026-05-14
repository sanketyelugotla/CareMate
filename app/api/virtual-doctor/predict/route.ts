import type { NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import { VirtualDoctorInteraction } from "@/models/VirtualDoctorInteraction"
import { User } from "@/models/User"
import { virtualPredictSchema } from "@/lib/validation"
import { predictDiseases } from "@/services/ml/llamaAdapter"
import { error, json } from "@/app/api/_utils"
import { Types } from "mongoose"

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}

function getSpecialtyScore(doctorSpecialization: string, recommendedSpecialties: string[]) {
  if (!recommendedSpecialties.length) return 0

  const normalizedDoctorSpec = normalizeText(doctorSpecialization)
  let bestScore = 0
  let matchedSpecialty: string | null = null

  recommendedSpecialties.forEach((specialty, idx) => {
    const normalizedRecommendedSpec = normalizeText(specialty)
    let score = 0

    if (normalizedDoctorSpec === normalizedRecommendedSpec) {
      score = 60 - Math.min(idx, 4) * 5
    } else if (
      normalizedDoctorSpec.includes(normalizedRecommendedSpec) ||
      normalizedRecommendedSpec.includes(normalizedDoctorSpec)
    ) {
      score = 42 - Math.min(idx, 4) * 4
    } else {
      const doctorTokens = new Set(normalizedDoctorSpec.split(" ").filter(Boolean))
      const recTokens = normalizedRecommendedSpec.split(" ").filter(Boolean)
      const overlap = recTokens.filter((token) => doctorTokens.has(token)).length
      if (overlap > 0) score = Math.min(30, overlap * 10)
    }

    if (score > bestScore) {
      bestScore = score
      matchedSpecialty = specialty
    }
  })

  return { score: bestScore, matchedSpecialty }
}

function getAvailabilityScore(availableSlots: Array<{ dayOfWeek: number }>) {
  if (!Array.isArray(availableSlots) || availableSlots.length === 0) return 0
  const today = new Date().getDay()
  const hasTodaySlot = availableSlots.some((slot) => slot.dayOfWeek === today)
  const slotCountScore = Math.min(15, availableSlots.length * 2)
  return slotCountScore + (hasTodaySlot ? 5 : 0)
}

function getProfileStrengthScore(doctorProfile: any) {
  const experienceScore = Math.min(15, Number(doctorProfile?.yearsExperience || 0) * 1.5)
  const qualificationsCount = Array.isArray(doctorProfile?.qualifications) ? doctorProfile.qualifications.length : 0
  const qualificationsScore = Math.min(10, qualificationsCount * 2)
  const bioScore = doctorProfile?.bio ? 5 : 0
  return experienceScore + qualificationsScore + bioScore
}

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const parsed = virtualPredictSchema.safeParse(body)
  if (!parsed.success) return error(parsed.error.message, 422)

  const res = await predictDiseases(parsed.data.symptoms)

  const doctorQuery: any = {
    role: "doctor",
    "doctorProfile.isApproved": true,
    "doctorProfile.specialization": { $exists: true, $ne: "" },
  }

  const doctors = await User.find(doctorQuery)
    .select("name avatarUrl doctorProfile.specialization doctorProfile.yearsExperience doctorProfile.qualifications doctorProfile.bio doctorProfile.consultationFee doctorProfile.availableSlots")
    .limit(200)
    .lean()

  const recommendedDoctors = doctors
    .filter((doc: any) =>
      doc?.name?.first &&
      doc?.name?.last &&
      doc?.doctorProfile?.specialization &&
      Array.isArray(doc?.doctorProfile?.availableSlots) &&
      doc.doctorProfile.availableSlots.length > 0,
    )
    .map((doc: any) => {
      const specialtyMatch = getSpecialtyScore(doc.doctorProfile.specialization, res.recommendedSpecialties || [])
      const availabilityScore = getAvailabilityScore(doc.doctorProfile.availableSlots)
      const profileStrengthScore = getProfileStrengthScore(doc.doctorProfile)
      const totalScore = Math.min(
        100,
        Math.round(specialtyMatch.score + availabilityScore + profileStrengthScore),
      )

      return {
        _id: doc._id,
        name: doc.name,
        avatarUrl: doc.avatarUrl,
        specialization: doc.doctorProfile.specialization,
        yearsExperience: doc.doctorProfile.yearsExperience,
        consultationFee: doc.doctorProfile.consultationFee,
        availableSlots: doc.doctorProfile.availableSlots,
        matchScore: totalScore,
        matchedSpecialty: specialtyMatch.matchedSpecialty,
      }
    })
    .sort((a: any, b: any) => b.matchScore - a.matchScore)
    .slice(0, 5)

  const interactionPayload: any = {
    inputSymptoms: parsed.data.symptoms,
    predictedDiseases: res.predictions.map((p) => ({ name: p.disease, probability: p.probability })),
    explanation: res.explanation,
    modelUsed: res.modelUsed,
    modelVersion: res.modelVersion,
  }

  if (parsed.data.userId && Types.ObjectId.isValid(parsed.data.userId)) {
    interactionPayload.userId = parsed.data.userId
  }

  await VirtualDoctorInteraction.create({
    ...interactionPayload,
  })

  return json({
    ...res,
    recommendedDoctors,
  })
}
