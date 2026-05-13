"use client"
import useSWR from "swr"
import { jsonFetch } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/DashboardLayout"
import { UserCheck, GraduationCap, Mail, Phone, CheckCircle, XCircle } from "lucide-react"

export function ApproveDoctorsPanel() {
  const { data, mutate } = useSWR("/api/admin/doctors?isApproved=false&page=1&pageSize=20", (url) => jsonFetch(url))
  const items = (data as any)?.items || []

  async function approve(id: string, approve: boolean) {
    await fetch(`/api/admin/approve-doctor/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ approve }),
    })
    mutate()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Approve Doctors</h1>
        <p className="text-muted-foreground mt-2">Review and approve pending doctor registrations</p>
      </div>

      <div className="grid gap-4">
        {items.map((d: any) => (
          <Card key={d._id} className="bg-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="text-purple-600" size={24} />
                  <span>{d.name?.first} {d.name?.last}</span>
                </CardTitle>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                  Pending Approval
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap size={16} className="text-gray-400" />
                  <span className="text-muted-foreground">{d.doctorProfile?.specialization || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-muted-foreground">{d.email}</span>
                </div>
                {d.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-muted-foreground">{d.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => approve(d._id, true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle size={16} />
                  <span>Approve</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => approve(d._id, false)}
                  className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700"
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)]">
            <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-muted-foreground">No pending doctor approvals.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApproveDoctorsPage() {
  return (
    <DashboardLayout>
      <ApproveDoctorsPanel />
    </DashboardLayout>
  )
}
