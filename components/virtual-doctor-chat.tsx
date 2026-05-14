"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Msg = { from: "user" | "bot"; text: string }

type PredictionData = {
  predictions: Array<{ disease: string; probability: number }>
  recommendedSpecialties?: string[]
  recommendedDoctors?: Array<{ _id: string; name: { first: string; last: string }; specialization: string; matchScore: number }>
  explanation: string
}

export function VirtualDoctorChat() {
  const [messages, setMessages] = useState<Msg[]>([{ from: "bot", text: "Hi! Describe your symptoms to begin." }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastPrediction, setLastPrediction] = useState<PredictionData | null>(null)
  const [feedbackMode, setFeedbackMode] = useState<"idle" | "helpful" | "not_helpful">("idle")
  const [feedbackReason, setFeedbackReason] = useState("")
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)

  async function runPrediction() {
    if (!input.trim()) return
    const userMsg: Msg = { from: "user", text: input }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setLoading(true)
    setFeedbackMode("idle")
    setFeedbackReason("")
    try {
      const res = await fetch("/api/virtual-doctor/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: userMsg.text }),
      })
      const data = await res.json()
      setLastPrediction(data)

      const predictionLines = Array.isArray(data.predictions)
        ? data.predictions.map((p: any) => `• ${p.disease} (${Math.round(p.probability * 100)}%)`).join("\n")
        : "No predictions available."

      const specialtyLines = Array.isArray(data.recommendedSpecialties) && data.recommendedSpecialties.length
        ? `\n\nRecommended Specialties:\n${data.recommendedSpecialties.map((s: string) => `• ${s}`).join("\n")}`
        : ""

      const doctorLines = Array.isArray(data.recommendedDoctors) && data.recommendedDoctors.length
        ? `\n\nTop Matching Doctors:\n${data.recommendedDoctors
          .map(
            (d: any, idx: number) =>
              `${idx + 1}. Dr. ${d.name?.first || ""} ${d.name?.last || ""} - ${d.specialization} (${d.matchScore}% match)`,
          )
          .join("\n")}`
        : ""

      const txt = `Predictions:\n${predictionLines}${specialtyLines}${doctorLines}\n\n${data.explanation}`
      setMessages((m) => [...m, { from: "bot", text: txt }])
    } catch (e: any) {
      setMessages((m) => [...m, { from: "bot", text: "Sorry, something went wrong." }])
      setLastPrediction(null)
    } finally {
      setLoading(false)
    }
  }

  async function submitFeedback() {
    if (!feedbackMode || feedbackMode === "idle" || !lastPrediction) return
    setFeedbackSubmitting(true)
    try {
      const topDoctor = lastPrediction.recommendedDoctors?.[0]
      const payload = {
        feedbackType: feedbackMode,
        reason: feedbackReason.trim() || undefined,
        inputSymptoms: messages.find((m) => m.from === "user")?.text || "",
        recommendationScore: topDoctor?.matchScore || 0,
        selectedDoctor: topDoctor
          ? {
            _id: topDoctor._id,
            name: topDoctor.name,
            specialization: topDoctor.specialization,
          }
          : undefined,
      }

      const res = await fetch("/api/virtual-doctor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setMessages((m) => [
          ...m,
          { from: "bot", text: "Thank you for your feedback! It helps us improve recommendations." },
        ])
        setFeedbackMode("idle")
        setFeedbackReason("")
        setLastPrediction(null)
      } else {
        setMessages((m) => [...m, { from: "bot", text: "Failed to submit feedback. Please try again." }])
      }
    } catch (e: any) {
      setMessages((m) => [...m, { from: "bot", text: "Error submitting feedback." }])
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-pretty">Virtual Doctor</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div
          className="border rounded-md p-3 h-64 overflow-auto bg-background"
          role="log"
          aria-live="polite"
          aria-label="Chat transcript"
        >
          {messages.map((m, i) => (
            <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
              <span className="inline-block px-3 py-2 my-1 rounded-md bg-secondary text-foreground">{m.text}</span>
            </div>
          ))}
          {loading ? <div className="text-sm text-muted-foreground">Thinking...</div> : null}
        </div>

        {feedbackMode !== "idle" && (
          <div className="border rounded-md p-3 bg-muted/30 space-y-2">
            <p className="text-sm font-medium">
              {feedbackMode === "helpful" ? "Great! Any additional feedback?" : "Sorry to hear. Any details?"}
            </p>
            <Textarea
              aria-label="Feedback reason"
              placeholder="Optional: Tell us why (max 500 characters)..."
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value.slice(0, 500))}
              className="text-sm"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={submitFeedback}
                disabled={feedbackSubmitting}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {feedbackSubmitting ? "Sending..." : "Send Feedback"}
              </Button>
              <Button
                onClick={() => {
                  setFeedbackMode("idle")
                  setFeedbackReason("")
                }}
                disabled={feedbackSubmitting}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {feedbackMode === "idle" && lastPrediction && !loading && (
          <div className="border rounded-md p-3 bg-muted/30">
            <p className="text-sm font-medium mb-2">Was this helpful?</p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setFeedbackMode("helpful")}
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700"
              >
                👍 Helpful
              </Button>
              <Button
                onClick={() => setFeedbackMode("not_helpful")}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                👎 Not Helpful
              </Button>
            </div>
          </div>
        )}

        <Textarea
          aria-label="Symptom input"
          placeholder="Describe your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Button onClick={runPrediction} disabled={loading || !input.trim()}>
            Run prediction
          </Button>
          <Button variant="secondary" asChild>
            <a href="/doctors">Book a doctor</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
