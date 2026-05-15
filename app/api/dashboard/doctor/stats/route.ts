import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Appointment } from "@/models/Appointment"
import dayjs from "dayjs"

export async function GET() {
    const auth = await requireAuth(["doctor"])
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await connectDB()

        const doctorId = auth.sub
        const startOfToday = dayjs().startOf('day').toDate()
        const endOfToday = dayjs().endOf('day').toDate()

        // Get today's appointments
        const todayAppointments = await Appointment.countDocuments({
            doctorId,
            start: { $gte: startOfToday, $lte: endOfToday }
        })

        // Get completed today
        const completedToday = await Appointment.countDocuments({
            doctorId,
            start: { $gte: startOfToday, $lte: endOfToday },
            status: 'completed'
        })

        // Get upcoming appointments (after today)
        const upcomingAppointments = await Appointment.countDocuments({
            doctorId,
            start: { $gt: endOfToday },
            status: { $nin: ['cancelled'] }
        })

        // Get total unique patients
        const appointments = await Appointment.find({ doctorId }).select('patientId')
        const uniquePatients = new Set(appointments.map(apt => apt.patientId.toString()))
        const totalPatients = uniquePatients.size

        return NextResponse.json({
            todayAppointments,
            totalPatients,
            completedToday,
            upcomingAppointments
        })
    } catch (error) {
        console.error('Error fetching doctor stats:', error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
