"use client"

import useSWR from "swr"
import { jsonFetch } from "@/lib/fetcher"
import dayjs from "dayjs"
import { useMemo, useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Calendar, Clock, User, Stethoscope, History, TimerReset, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"

type AppointmentLike = {
    _id: string
    start: string
    end: string
    status?: string
    notes?: string
    patient?: { name?: string; email?: string }
    doctor?: { name?: string; email?: string }
}

type ListResponse = {
    items: AppointmentLike[]
    total: number
}

function AppointmentsSkeleton() {
    return (
        <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-5 animate-pulse">
                    <CardContent className="p-0">
                        <div className="h-5 bg-muted rounded w-1/3 mb-4" />
                        <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function AppointmentsPanel() {
    const { user } = useUser()
    const [when, setWhen] = useState<"upcoming" | "past">("upcoming")
    const [page, setPage] = useState(1)
    const [busy, setBusy] = useState(false)

    const [showPostponeModal, setShowPostponeModal] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentLike | null>(null)
    const [postponeForm, setPostponeForm] = useState({
        start: "",
        end: "",
    })

    const pageSize = 12
    const fetcher = (url: string) => jsonFetch(url) as Promise<ListResponse>

    const { data, isLoading, mutate } = useSWR<ListResponse>(
        `/api/appointments?when=${when}&page=${page}&pageSize=${pageSize}`,
        fetcher
    )

    const { data: upcomingCountData } = useSWR<ListResponse>(
        `/api/appointments?when=upcoming&page=1&pageSize=1`,
        fetcher
    )

    const { data: pastCountData } = useSWR<ListResponse>(
        `/api/appointments?when=past&page=1&pageSize=1`,
        fetcher
    )

    const items = data?.items || []
    const total = data?.total || 0
    const upcomingTotalCount = upcomingCountData?.total || 0
    const pastTotalCount = pastCountData?.total || 0

    const isDoctor = user?.role === "doctor"

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            confirmed: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            cancelled: "bg-red-100 text-red-700",
            completed: "bg-blue-100 text-blue-700",
        }
        return colors[status] || "bg-gray-100 text-gray-700"
    }

    const canManage = (a: AppointmentLike) => {
        if (!isDoctor) return false
        const status = a.status || "pending"
        if (status === "cancelled" || status === "completed") return false
        return dayjs(a.start).isAfter(dayjs())
    }

    const openPostponeModal = (a: AppointmentLike) => {
        setSelectedAppointment(a)
        setPostponeForm({
            start: dayjs(a.start).format("YYYY-MM-DDTHH:mm"),
            end: dayjs(a.end).format("YYYY-MM-DDTHH:mm"),
        })
        setShowPostponeModal(true)
    }

    const handleCancelAppointment = async (appointmentId: string) => {
        setBusy(true)
        try {
            const res = await fetch(`/api/appointments/${appointmentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: "cancelled" }),
            })

            if (!res.ok) {
                alert("Failed to cancel appointment")
                return
            }

            await mutate()
        } catch (err) {
            console.error("Cancel appointment error:", err)
            alert("Failed to cancel appointment")
        } finally {
            setBusy(false)
        }
    }

    const handlePostponeAppointment = async () => {
        if (!selectedAppointment) return

        const start = dayjs(postponeForm.start)
        const end = dayjs(postponeForm.end)

        if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
            alert("Please choose valid start and end times")
            return
        }

        setBusy(true)
        try {
            const res = await fetch(`/api/appointments/${selectedAppointment._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    start: start.toISOString(),
                    end: end.toISOString(),
                }),
            })

            if (!res.ok) {
                alert("Unable to postpone. Selected slot may be unavailable.")
                return
            }

            setShowPostponeModal(false)
            setSelectedAppointment(null)
            await mutate()
        } catch (err) {
            console.error("Postpone appointment error:", err)
            alert("Failed to postpone appointment")
        } finally {
            setBusy(false)
        }
    }

    const counterpartLabel = useMemo(() => (isDoctor ? "Patient" : "Doctor"), [isDoctor])

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
                    <p className="text-muted-foreground mt-1">Track and manage your consultations</p>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-border p-1 bg-background">
                    <button
                        onClick={() => {
                            setWhen("upcoming")
                            setPage(1)
                        }}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${when === "upcoming" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"}`}
                    >
                        Upcoming ({upcomingTotalCount})
                    </button>
                    <button
                        onClick={() => {
                            setWhen("past")
                            setPage(1)
                        }}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${when === "past" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"}`}
                    >
                        <span className="inline-flex items-center gap-1">
                            <History size={14} />
                            History ({pastTotalCount})
                        </span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <AppointmentsSkeleton />
            ) : (
                <div className="grid gap-4">
                    {items.map((a) => {
                        const person = isDoctor ? a.patient : a.doctor
                        return (
                            <Card key={a._id} className="bg-card border border-border hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-foreground font-semibold">
                                                <Calendar size={18} className="text-blue-600" />
                                                <span>{dayjs(a.start).format("ddd, MMM DD, YYYY")}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock size={16} />
                                                <span>{dayjs(a.start).format("h:mm A")} - {dayjs(a.end).format("h:mm A")}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {isDoctor ? <User size={16} /> : <Stethoscope size={16} />}
                                                <span>{counterpartLabel}: {typeof person === 'object' && person?.name ? person.name : "N/A"}</span>
                                            </div>

                                            {a.notes && (
                                                <p className="text-sm text-muted-foreground border-l-2 border-blue-200 pl-3">
                                                    {a.notes}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(a.status || "pending")}`}>
                                                {a.status || "pending"}
                                            </span>

                                            {canManage(a) ? (
                                                <div className="flex items-center gap-2 pt-1">
                                                    <button
                                                        onClick={() => openPostponeModal(a)}
                                                        disabled={busy}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                                                    >
                                                        <TimerReset size={14} />
                                                        Postpone
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelAppointment(a._id)}
                                                        disabled={busy}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                                                    >
                                                        <XCircle size={14} />
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {items.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-xl shadow-sm border border-border">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-muted-foreground">No {when} appointments found.</p>
                        </div>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                        <div className="text-sm text-muted-foreground">
                            {total === 0 ? "No results" : `Showing ${(page - 1) * pageSize + 1} - ${Math.min(page * pageSize, total)} of ${total}`}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || busy}>Prev</Button>
                            <Button onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= total || busy}>Next</Button>
                        </div>
                    </div>
                </div>
            )}

            {showPostponeModal && selectedAppointment ? (
                <div className="fixed inset-0 bg-background/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-card rounded-xl border border-border shadow-xl p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Postpone Appointment</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">New Start</label>
                                <input
                                    type="datetime-local"
                                    value={postponeForm.start}
                                    onChange={(e) => setPostponeForm((f) => ({ ...f, start: e.target.value }))}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">New End</label>
                                <input
                                    type="datetime-local"
                                    value={postponeForm.end}
                                    onChange={(e) => setPostponeForm((f) => ({ ...f, end: e.target.value }))}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPostponeModal(false)
                                        setSelectedAppointment(null)
                                    }}
                                    disabled={busy}
                                >
                                    Close
                                </Button>
                                <Button onClick={handlePostponeAppointment} disabled={busy}>
                                    {busy ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default function MyAppointmentsPage() {
    return (
        <DashboardLayout>
            <AppointmentsPanel />
        </DashboardLayout>
    )
}
