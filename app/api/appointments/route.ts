// app/api/appointments/route.ts (UPDATED VERSION)
import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Appointment } from "@/models/Appointment"
import { User } from "@/models/User"
import { appointmentCreateSchema } from "@/lib/validation"
import { error, json } from "@/app/api/_utils"
import { validateAppointmentTime } from "@/lib/slotAvailability"

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return error("Unauthorized", 401)
  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || undefined
  const when = searchParams.get("when") || undefined // upcoming | past
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10)
  const bufferMinutes = parseInt(process.env.NEXT_PUBLIC_APPT_BUFFER_MINUTES || "5", 10)

  const q: any = {}
  if (status) q.status = status
  if (auth.role === "user") q.patientId = auth.sub
  if (auth.role === "doctor") q.doctorId = auth.sub

  // Date-based filtering for upcoming vs past
  if (when) {
    const now = new Date()
    const bufferMs = bufferMinutes * 60 * 1000
    if (when === "upcoming") {
      // start after now - buffer
      q.start = { $gte: new Date(now.getTime() - bufferMs) }
      // exclude completed explicitly
      q.status = { $ne: 'completed' }
    } else if (when === "past") {
      q.start = { $lt: new Date(now.getTime() - bufferMs) }
    }
  }

  const total = await Appointment.countDocuments(q)
  const items = await Appointment.find(q)
    .sort({ start: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate("patientId", "name avatarUrl")
    .populate("doctorId", "name avatarUrl doctorProfile")
    .lean()

  // Map the data to ensure correct structure
  const mappedItems = items.map((item: any) => ({
    ...item,
    patient: item.patientId ? {
      name: typeof item.patientId === 'string' ? item.patientId :
        (item.patientId.name ? `${item.patientId.name.first} ${item.patientId.name.last}` : 'N/A')
    } : null,
    doctor: item.doctorId ? {
      name: typeof item.doctorId === 'string' ? item.doctorId :
        (item.doctorId.name ? `${item.doctorId.name.first} ${item.doctorId.name.last}` : 'N/A'),
      avatarUrl: item.doctorId.avatarUrl,
      specialization: item.doctorId.doctorProfile?.specialization || 'General',
      clinicAddress: item.doctorId.doctorProfile?.clinicAddress
    } : null,
  }))

  return json({ items: mappedItems, total })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(["user"])
  if (!auth) return error("Unauthorized", 401)
  await connectDB()

  const body = await req.json()
  const parsed = appointmentCreateSchema.safeParse(body)
  if (!parsed.success) return error(parsed.error.message, 422)

  const doctor = await User.findById(parsed.data.doctorId)
  if (!doctor || doctor.role !== "doctor" || !doctor.doctorProfile?.isApproved) {
    return error("Invalid doctor", 400)
  }

  const start = new Date(parsed.data.start)
  const end = new Date(parsed.data.end)

  if (!(start instanceof Date) || !(end instanceof Date)) {
    return error("Invalid date format", 400)
  }

  // Validate appointment time with schedule checking
  const validation = await validateAppointmentTime(doctor._id.toString(), start, end)

  if (!validation.valid) {
    return error(validation.reason || "Time slot not available", 409)
  }

  const created = await Appointment.create({
    patientId: auth.sub,
    doctorId: doctor._id,
    start,
    end,
    status: "confirmed",
    notes: parsed.data.notes
  })

  return json({ success: true, appointmentId: created._id })
}