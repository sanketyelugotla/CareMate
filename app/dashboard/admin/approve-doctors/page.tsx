"use client"
import useSWR from "swr"
import { jsonFetch } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserCheck, GraduationCap, Mail, Phone, CheckCircle, XCircle, AlertCircle } from "lucide-react"

function SkeletonLoader() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <div className="h-6 bg-muted rounded w-1/2"></div>
                                <div className="h-6 bg-muted rounded w-1/6"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-2/3"></div>
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                            </div>
                            <div className="flex space-x-2">
                                <div className="h-10 bg-muted rounded w-1/3"></div>
                                <div className="h-10 bg-muted rounded w-1/3"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function ApproveDoctorsPanel() {
    const { data, mutate, isLoading } = useSWR("/api/admin/doctors?isApproved=false&page=1&pageSize=20", (url) => jsonFetch(url))
    const items = (data as any)?.items || []

    async function approve(id: string, approved: boolean) {
        try {
            await fetch(`/api/admin/approve-doctor/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ approve: approved }),
            })
            mutate()
        } catch (err) {
            console.error('Error approving doctor:', err)
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Approve Doctors</h1>
                <p className="text-muted-foreground mt-2">Review and approve {items.length} pending doctor registrations</p>
            </div>

            {isLoading ? (
                <SkeletonLoader />
            ) : (
                <div className="grid gap-4">
                    {items.length > 0 ? (
                        items.map((doctor: any) => (
                            <Card key={doctor._id} className="bg-card hover:shadow-lg transition-shadow border border-border overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <UserCheck size={28} className="text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-foreground">
                                                        {doctor.name?.first} {doctor.name?.last}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <AlertCircle size={14} className="text-yellow-500" />
                                                        <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
                                                            Pending Approval
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid md:grid-cols-2 gap-4 border-t border-border pt-4">
                                            {doctor.doctorProfile?.specialization && (
                                                <div className="flex items-start space-x-3">
                                                    <GraduationCap size={18} className="text-blue-500 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground font-medium">Specialization</p>
                                                        <p className="text-sm text-foreground font-medium">{doctor.doctorProfile.specialization}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {doctor.email && (
                                                <div className="flex items-start space-x-3">
                                                    <Mail size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground font-medium">Email</p>
                                                        <p className="text-sm text-foreground font-medium break-all">{doctor.email}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {doctor.phone && (
                                                <div className="flex items-start space-x-3">
                                                    <Phone size={18} className="text-purple-500 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground font-medium">Phone</p>
                                                        <p className="text-sm text-foreground font-medium">{doctor.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {doctor.doctorProfile?.licenseNumber && (
                                                <div className="flex items-start space-x-3">
                                                    <AlertCircle size={18} className="text-orange-500 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground font-medium">License</p>
                                                        <p className="text-sm text-foreground font-medium">{doctor.doctorProfile.licenseNumber}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2 border-t border-border flex-wrap">
                                            <Button
                                                onClick={() => approve(doctor._id, true)}
                                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-initial"
                                            >
                                                <CheckCircle size={18} />
                                                <span>Approve</span>
                                            </Button>
                                            <Button
                                                onClick={() => approve(doctor._id, false)}
                                                variant="outline"
                                                className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 flex-1 sm:flex-initial"
                                            >
                                                <XCircle size={18} />
                                                <span>Reject</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] border border-border">
                            <UserCheck size={56} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-muted-foreground text-lg font-medium">No pending doctor approvals</p>
                            <p className="text-muted-foreground text-sm mt-1">All doctors have been reviewed</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function ApproveDoctorsPage() {
    return <ApproveDoctorsPanel />
}
