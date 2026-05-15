import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"

export async function GET() {
    const auth = await requireAuth(["admin"])
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await connectDB()

        // Get doctors pending approval
        const pendingDoctors = await User.find({
            role: "doctor",
            "doctorProfile.isApproved": { $ne: true }
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()

        const formattedDoctors = pendingDoctors.map(doc => ({
            _id: doc._id,
            name: `${doc.name?.first || ''} ${doc.name?.last || ''}`.trim() || 'Unknown',
            email: doc.email,
            phone: doc.phone,
            specialization: doc.doctorProfile?.specialization,
            licenseNumber: doc.doctorProfile?.licenseNumber
        }))

        return NextResponse.json(formattedDoctors)
    } catch (error) {
        console.error('Error fetching pending approvals:', error)
        return NextResponse.json({ error: "Failed to fetch pending approvals" }, { status: 500 })
    }
}
