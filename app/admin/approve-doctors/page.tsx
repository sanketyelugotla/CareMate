"use client"
import useSWR from "swr"
import { jsonFetch } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/DashboardLayout"

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
    <div className="max-w-6xl mx-auto font-body-md text-on-surface">
      <div className="mb-stack-xl">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Approve Doctors</h1>
        <p className="font-label-md text-label-md text-on-surface-variant mt-stack-xs">Review and approve pending doctor registrations</p>
      </div>

      <div className="grid gap-stack-md">
        {items.map((d: any) => (
          <div key={d._id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg hover:bg-surface-container transition-colors">
            <div className="flex items-center justify-between border-b border-outline-variant pb-stack-md mb-stack-md">
                <div className="flex items-center gap-stack-sm">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>how_to_reg</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{d.name?.first} {d.name?.last}</span>
                </div>
                <span className="px-stack-sm py-1 rounded font-label-sm text-label-sm font-bold bg-tertiary-container text-on-tertiary-container">
                  Pending Approval
                </span>
            </div>
            
            <div className="space-y-stack-md">
              <div className="grid md:grid-cols-2 gap-stack-md">
                <div className="flex items-center gap-stack-sm font-label-md text-label-md">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>school</span>
                  <span className="text-on-surface-variant">{d.doctorProfile?.specialization || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-stack-sm font-label-md text-label-md">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>mail</span>
                  <span className="text-on-surface-variant">{d.email}</span>
                </div>
                {d.phone && (
                  <div className="flex items-center gap-stack-sm font-label-md text-label-md">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>phone</span>
                    <span className="text-on-surface-variant">{d.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-stack-sm pt-stack-sm">
                <Button
                  onClick={() => approve(d._id, true)}
                  className="flex items-center gap-stack-xs bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                  <span>Approve</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => approve(d._id, false)}
                  className="flex items-center gap-stack-xs bg-error-container text-on-error-container font-label-md text-label-md font-bold hover:opacity-80"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cancel</span>
                  <span>Reject</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-stack-xl bg-surface-container-lowest border border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-on-surface-variant opacity-50 mb-stack-md" style={{ fontSize: '48px' }}>how_to_reg</span>
            <p className="font-label-md text-label-md text-on-surface-variant">No pending doctor approvals.</p>
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
