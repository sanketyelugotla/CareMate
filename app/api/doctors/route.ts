import type { NextRequest } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { json } from "@/app/api/_utils"

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const spec = searchParams.get("specialization")
  const q: any = { role: "doctor", "doctorProfile.isApproved": true }
  if (spec) q["doctorProfile.specialization"] = spec
  // Only return doctors with complete profiles
  const doctors = await User.find(q).select("-passwordHash").limit(50)
  const filtered = doctors.filter((doc: any) =>
    doc.name && doc.name.first && doc.name.last &&
    doc.doctorProfile && doc.doctorProfile.specialization
  )
  return json(filtered)
}
