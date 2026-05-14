
// Symptom to specialty mapping (expand as needed)
const symptomSpecialtyMap: Record<string, string[]> = {
  fever: ["General Physician", "Infectious Disease"],
  cough: ["Pulmonologist", "General Physician"],
  chestpain: ["Cardiologist"],
  headache: ["Neurologist", "General Physician"],
  rash: ["Dermatologist"],
  diabetes: ["Endocrinologist"],
  anxiety: ["Psychiatrist", "Psychologist"],
  // ...add more mappings
}

export async function predictDiseases(symptoms: string) {
  const text = symptoms.toLowerCase()
  // Find all matching specialties
  const matchedSpecialties = new Set<string>()
  Object.entries(symptomSpecialtyMap).forEach(([symptom, specialties]) => {
    if (text.includes(symptom)) {
      specialties.forEach((s) => matchedSpecialties.add(s))
    }
  })

  // Mocked disease prediction (expand as needed)
  let preds = []
  if (text.includes("fever") || text.includes("cough")) {
    preds = [
      { disease: "Common Cold", probability: 0.67 },
      { disease: "Flu", probability: 0.23 },
    ]
  } else if (text.includes("chest pain")) {
    preds = [
      { disease: "Angina", probability: 0.5 },
      { disease: "Heart Attack", probability: 0.3 },
    ]
  } else {
    preds = [{ disease: "General Checkup Recommended", probability: 0.8 }]
  }

  return {
    predictions: preds,
    recommendedSpecialties: Array.from(matchedSpecialties),
    explanation: "Predictions and specialties are based on a mapping of symptoms to specialties. Expand the mapping for better accuracy.",
    modelUsed: "mock-llama",
    modelVersion: "v0.2",
  }
}
