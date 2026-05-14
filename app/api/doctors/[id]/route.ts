import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { error, json } from "@/app/api/_utils"

export async function GET(_: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await connectDB()
  const doc = await User.findById(params.id).select("-passwordHash")
  if (!doc || doc.role !== "doctor") return error("Not found", 404)
  return json(doc)
}
