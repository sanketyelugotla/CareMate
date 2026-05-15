import type { NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import { VirtualDoctorInteraction } from "@/models/VirtualDoctorInteraction"
import { User } from "@/models/User"
import { virtualPredictSchema } from "@/lib/validation"
import { predictDiseases } from "@/services/ml/llamaAdapter"
import { error, json } from "@/app/api/_utils"
import { Types } from "mongoose"
import { generateEmbedding, getSpecializationEmbedding, cosineSimilarity } from "@/services/ml/embeddingService"

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}

async function getSemanticSpecialtyScore(
  doctorSpecialization: string,
  symptomsEmbedding: number[],
  recommendedSpecialties: string[],
): Promise<{ score: number; matchedSpecialty: string | null }> {
  if (!recommendedSpecialties.length) return { score: 0, matchedSpecialty: null }

  let bestScore = 0
  let matchedSpecialty: string | null = null

  try {
    // Compute similarity between symptoms and each recommended specialty
    // Only count high-confidence matches (similarity > 0.5)
    for (let i = 0; i < recommendedSpecialties.length; i++) {
      const specialty = recommendedSpecialties[i]
      const specialtyEmbedding = await getSpecializationEmbedding(specialty)

      const similarity = cosineSimilarity(symptomsEmbedding, specialtyEmbedding)
      // Require high similarity (>0.5) to score points
      if (similarity > 0.5) {
        const score = Math.max(0, similarity * 50) - Math.min(i, 4) * 2
        if (score > bestScore) {
          bestScore = score
          matchedSpecialty = specialty
        }
      }
    }

    // Also check if doctor specialization matches any recommended specialty semantically
    const doctorSpecEmbedding = await getSpecializationEmbedding(doctorSpecialization)
    for (let i = 0; i < recommendedSpecialties.length; i++) {
      const specialty = recommendedSpecialties[i]
      const specialtyEmbedding = await getSpecializationEmbedding(specialty)

      const specialtyMatch = cosineSimilarity(doctorSpecEmbedding, specialtyEmbedding)
      // Require very high similarity (>0.6) for direct doctor-specialty match
      if (specialtyMatch > 0.6) {
        const score = Math.max(0, specialtyMatch * 50) + 15 - Math.min(i, 4) * 2
        if (score > bestScore) {
          bestScore = score
          matchedSpecialty = specialty
        }
      }
    }
  } catch (err) {
    console.warn("Error computing semantic scores, falling back to keyword matching:", err)
    // Fallback to keyword matching if embedding fails
    return getKeywordSpecialtyScore(doctorSpecialization, recommendedSpecialties)
  }

  return { score: Math.min(60, bestScore), matchedSpecialty }
}

function getKeywordSpecialtyScore(doctorSpecialization: string, recommendedSpecialties: string[]) {
  if (!recommendedSpecialties.length) return { score: 0, matchedSpecialty: null }

  const normalizedDoctorSpec = normalizeText(doctorSpecialization)
  let bestScore = 0
  let matchedSpecialty: string | null = null

  recommendedSpecialties.forEach((specialty, idx) => {
    const normalizedRecommendedSpec = normalizeText(specialty)
    let score = 0

    // Exact match
    if (normalizedDoctorSpec === normalizedRecommendedSpec) {
      score = 60 - Math.min(idx, 4) * 5
    }
    // Substring match (either direction)
    else if (
      normalizedDoctorSpec.includes(normalizedRecommendedSpec) ||
      normalizedRecommendedSpec.includes(normalizedDoctorSpec)
    ) {
      score = 48 - Math.min(idx, 4) * 4
    }
    // Only allow overlap if both words are specific (not generic like "physician", "doctor")
    else {
      const genericTerms = new Set(["physician", "doctor", "medical", "health"])
      const doctorTokens = normalizedDoctorSpec.split(" ").filter((t) => t && !genericTerms.has(t))
      const recTokens = normalizedRecommendedSpec.split(" ").filter((t) => t && !genericTerms.has(t))

      const overlap = recTokens.filter((token) => doctorTokens.has(token)).length
      // Require very strong overlap (>70% match ratio) to score points
      if (overlap > 0 && recTokens.length > 0) {
        const matchRatio = overlap / recTokens.length
        score = matchRatio > 0.7 ? Math.min(35, overlap * 12) : 0
      }
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

  // Generate embedding for the symptoms input
  let symptomsEmbedding: number[] = []
  try {
    symptomsEmbedding = await generateEmbedding(parsed.data.symptoms)
  } catch (err) {
    console.warn("Embedding generation failed, continuing with keyword matching:", err)
  }

  const doctorQuery: any = {
    role: "doctor",
    "doctorProfile.isApproved": true,
    "doctorProfile.specialization": { $exists: true, $ne: "" },
  }

  const doctors = await User.find(doctorQuery)
    .select("name avatarUrl doctorProfile.specialization doctorProfile.yearsExperience doctorProfile.qualifications doctorProfile.bio doctorProfile.consultationFee doctorProfile.availableSlots")
    .limit(200)
    .lean()

  const recommendedDoctors = await Promise.all(
    doctors
      .filter((doc: any) =>
        doc?.name?.first &&
        doc?.name?.last &&
        doc?.doctorProfile?.specialization &&
        Array.isArray(doc?.doctorProfile?.availableSlots) &&
        doc.doctorProfile.availableSlots.length > 0,
      )
      .map(async (doc: any) => {
        // Use semantic similarity if embeddings are available, otherwise fallback to keywords
        const specialtyMatch = symptomsEmbedding.length > 0
          ? await getSemanticSpecialtyScore(doc.doctorProfile.specialization, symptomsEmbedding, res.recommendedSpecialties || [])
          : getKeywordSpecialtyScore(doc.doctorProfile.specialization, res.recommendedSpecialties || [])

        const availabilityScore = getAvailabilityScore(doc.doctorProfile.availableSlots)
        const profileStrengthScore = getProfileStrengthScore(doc.doctorProfile)

        // Weighted scoring: specialty is 80% of score (increased from 60%), other factors are 20%
        const otherFactorsScore = (availabilityScore + profileStrengthScore) / 2
        const totalScore = Math.min(
          100,
          Math.round(specialtyMatch.score * 0.8 + otherFactorsScore * 0.2),
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
          specialtyMatchScore: specialtyMatch.score,
        }
      }),
  )
    .then((results) => {
      // Strictly filter: require specialty score >= 35
      const strictFiltered = results.filter((doc: any) => doc.specialtyMatchScore >= 35)

      // If no results meet threshold and we're using semantic matching, lower threshold to 25 as fallback
      // This ensures we still show relevant doctors even if embeddings are slightly conservative
      if (strictFiltered.length === 0 && symptomsEmbedding.length > 0) {
        return results.filter((doc: any) => doc.specialtyMatchScore >= 25)
      }

      return strictFiltered
    })
    .then((results) => results.sort((a: any, b: any) => b.matchScore - a.matchScore))
    .then((results) => results.map(({ specialtyMatchScore, ...doc }) => doc)) // remove debugging field
    .then((results) => results.slice(0, 5))

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
