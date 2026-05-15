// Embedding service using @xenova/transformers for semantic similarity matching
// This runs the model locally without requiring external APIs

let embeddingModel: any = null

async function initializeModel() {
    if (embeddingModel) return embeddingModel

    try {
        // Dynamically import to avoid issues in edge environments
        const { env, pipeline } = await import("@xenova/transformers")
        env.allowLocalModels = true
        env.allowRemoteModels = true

        embeddingModel = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
            device: "cpu",
        })
        return embeddingModel
    } catch (err) {
        console.error("Failed to initialize embedding model:", err)
        throw new Error("Embedding model initialization failed")
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const model = await initializeModel()
    const result = await model(text, { pooling: "mean", normalize: true })
    return Array.from(result.data)
}

export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        magnitudeA += a[i] * a[i]
        magnitudeB += b[i] * b[i]
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
}

// Cache for doctor specialization embeddings to avoid recomputing
const specializationEmbeddingCache = new Map<string, number[]>()

export async function getSpecializationEmbedding(specialization: string): Promise<number[]> {
    const normalized = specialization.toLowerCase().trim()
    if (specializationEmbeddingCache.has(normalized)) {
        return specializationEmbeddingCache.get(normalized)!
    }

    const embedding = await generateEmbedding(specialization)
    specializationEmbeddingCache.set(normalized, embedding)
    return embedding
}

export function clearEmbeddingCache() {
    specializationEmbeddingCache.clear()
}
