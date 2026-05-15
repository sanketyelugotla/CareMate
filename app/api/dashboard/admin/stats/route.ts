import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { Appointment } from "@/models/Appointment"

export async function GET() {
    const auth = await requireAuth(["admin"])
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await connectDB()

        // Get total doctors (approved)
        const totalDoctors = await User.countDocuments({
            role: "doctor",
            "doctorProfile.isApproved": true
        })

        // Get total patients
        const totalPatients = await User.countDocuments({ role: "user" })

        // Get appointments from last 30 days
        const since = new Date(Date.now() - 30 * 24 * 3600 * 1000)
        const totalAppointments = await Appointment.countDocuments({
            start: { $gte: since }
        })

        // Get pending doctor approvals
        const pendingApprovals = await User.countDocuments({
            role: "doctor",
            "doctorProfile.isApproved": { $ne: true }
        })

        return NextResponse.json({
            totalDoctors,
            totalPatients,
            totalAppointments,
            pendingApprovals
        })
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
