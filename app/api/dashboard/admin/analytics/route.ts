import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { Appointment } from "@/models/Appointment"

function startOfDay(d: Date) {
    const out = new Date(d)
    out.setHours(0, 0, 0, 0)
    return out
}

function endOfDay(d: Date) {
    const out = new Date(d)
    out.setHours(23, 59, 59, 999)
    return out
}

function toDateKey(d: Date) {
    return d.toISOString().slice(0, 10)
}

export async function GET() {
    const auth = await requireAuth(["admin"])
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        await connectDB()

        const now = new Date()
        const last30dStart = new Date(now)
        last30dStart.setDate(last30dStart.getDate() - 29)
        last30dStart.setHours(0, 0, 0, 0)

        const last24hStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const todayStart = startOfDay(now)
        const todayEnd = endOfDay(now)

        const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

        const [
            totalDoctorsAll,
            totalDoctors,
            totalPatients,
            totalAppointments30d,
            pendingApprovals,
            appointmentsByDayRaw,
            userGrowthRaw,
            appointmentsLast24h,
            completedLast24h,
            activeDoctorsToday,
            activePatientsToday,
            statusBreakdownRaw,
            appointmentsByHourRaw,
            completed30d,
            cancelled30d,
            noShow30d,
        ] = await Promise.all([
            User.countDocuments({ role: "doctor" }),
            User.countDocuments({ role: "doctor", "doctorProfile.isApproved": true }),
            User.countDocuments({ role: "user" }),
            Appointment.countDocuments({ createdAt: { $gte: last30dStart } }),
            User.countDocuments({ role: "doctor", "doctorProfile.isApproved": { $ne: true } }),
            Appointment.aggregate([
                { $match: { createdAt: { $gte: last30dStart } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            User.aggregate([
                { $match: { createdAt: { $gte: sixMonthsStart }, role: { $in: ["user", "doctor"] } } },
                {
                    $group: {
                        _id: {
                            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                            role: "$role",
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]),
            Appointment.countDocuments({ createdAt: { $gte: last24hStart } }),
            Appointment.countDocuments({ status: "completed", updatedAt: { $gte: last24hStart } }),
            Appointment.distinct("doctorId", {
                start: { $gte: todayStart, $lte: todayEnd },
                status: { $nin: ["cancelled"] },
            }),
            Appointment.distinct("patientId", {
                start: { $gte: todayStart, $lte: todayEnd },
                status: { $nin: ["cancelled"] },
            }),
            Appointment.aggregate([
                { $match: { createdAt: { $gte: last30dStart } } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            Appointment.aggregate([
                { $match: { createdAt: { $gte: last24hStart } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%H:00", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Appointment.countDocuments({ createdAt: { $gte: last30dStart }, status: "completed" }),
            Appointment.countDocuments({ createdAt: { $gte: last30dStart }, status: "cancelled" }),
            Appointment.countDocuments({ createdAt: { $gte: last30dStart }, status: "no_show" }),
        ])

        const appointmentsByDayMap = new Map<string, number>(
            appointmentsByDayRaw.map((x: any) => [x._id, x.count]),
        )
        const appointmentTrends = [] as Array<{ date: string; count: number }>
        for (let i = 29; i >= 0; i -= 1) {
            const d = new Date(now)
            d.setDate(now.getDate() - i)
            const key = toDateKey(d)
            appointmentTrends.push({ date: key.slice(5), count: appointmentsByDayMap.get(key) || 0 })
        }

        const monthKeys = [] as string[]
        for (let i = 5; i >= 0; i -= 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
        }
        const growthSeed = new Map<string, { month: string; patients: number; doctors: number }>()
        monthKeys.forEach((m) => growthSeed.set(m, { month: m, patients: 0, doctors: 0 }))
        userGrowthRaw.forEach((row: any) => {
            const bucket = growthSeed.get(row._id.month)
            if (!bucket) return
            if (row._id.role === "user") bucket.patients = row.count
            if (row._id.role === "doctor") bucket.doctors = row.count
        })
        const userGrowth = Array.from(growthSeed.values()).map((x) => ({
            ...x,
            month: x.month.slice(5),
        }))

        const statusBreakdown = statusBreakdownRaw.map((x: any) => ({
            status: x._id || "unknown",
            count: x.count,
        }))

        const hours = Array.from({ length: 24 }).map((_, h) => `${String(h).padStart(2, "0")}:00`)
        const hourMap = new Map<string, number>(appointmentsByHourRaw.map((x: any) => [x._id, x.count]))
        const hourlyActivity = hours.map((hour) => ({ hour, count: hourMap.get(hour) || 0 }))

        const completionRate = totalAppointments30d > 0 ? (completed30d / totalAppointments30d) * 100 : 0
        const cancellationRate = totalAppointments30d > 0 ? (cancelled30d / totalAppointments30d) * 100 : 0
        const noShowRate = totalAppointments30d > 0 ? (noShow30d / totalAppointments30d) * 100 : 0
        const avgDailyAppointments = totalAppointments30d / 30
        const doctorApprovalRate = totalDoctorsAll > 0 ? (totalDoctors / totalDoctorsAll) * 100 : 0

        const healthScore = Math.max(
            0,
            Math.min(
                100,
                Math.round(completionRate * 0.45 + (100 - cancellationRate) * 0.25 + (100 - noShowRate) * 0.15 + doctorApprovalRate * 0.15),
            ),
        )

        return NextResponse.json({
            summary: {
                totalDoctors,
                totalPatients,
                totalAppointments30d,
                pendingApprovals,
            },
            appointmentTrends,
            userGrowth,
            systemActivity: {
                appointmentsLast24h,
                completedLast24h,
                activeDoctorsToday: activeDoctorsToday.length,
                activePatientsToday: activePatientsToday.length,
                statusBreakdown,
                hourlyActivity,
            },
            performance: {
                completionRate: Number(completionRate.toFixed(1)),
                cancellationRate: Number(cancellationRate.toFixed(1)),
                noShowRate: Number(noShowRate.toFixed(1)),
                avgDailyAppointments: Number(avgDailyAppointments.toFixed(1)),
                doctorApprovalRate: Number(doctorApprovalRate.toFixed(1)),
                healthScore,
            },
        })
    } catch (error) {
        console.error("Error fetching admin analytics:", error)
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }
}
