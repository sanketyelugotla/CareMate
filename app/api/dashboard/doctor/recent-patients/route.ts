import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Appointment } from "@/models/Appointment"
import { User } from "@/models/User"

export async function GET() {
    const auth = await requireAuth(["doctor"])
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await connectDB()

        const doctorId = auth.sub

        // Get all appointments to find unique patients
        const appointments = await Appointment.find({ doctorId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()

        // Get unique patient IDs
        const uniquePatientIds = [...new Set(appointments.map(apt => apt.patientId.toString()))]
            .slice(0, 10)

        // Fetch patient details
        const patients = await Promise.all(
            uniquePatientIds.map(async (patientId) => {
                try {
                    const patient = await User.findById(patientId).lean()
                    if (!patient) return null

                    return {
                        _id: patient._id,
                        name: `${patient.name?.first || ''} ${patient.name?.last || ''}`.trim() || 'Unknown',
                        email: patient.email,
                        phone: patient.phone,
                        age: patient.profile?.age,
                        bloodGroup: patient.profile?.bloodGroup
                    }
                } catch (err) {
                    return null
                }
            })
        )

        // Filter out null values
        const validPatients = patients.filter(p => p !== null)

        return NextResponse.json(validPatients)
    } catch (error) {
        console.error('Error fetching recent patients:', error)
        return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
    }
}
