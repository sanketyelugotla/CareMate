"use client"
import useSWR from "swr"
import { useUser } from "@/hooks/use-user"
import { jsonFetch } from "@/lib/fetcher"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Textarea } from '@/components/ui/textarea'
import { Save } from "lucide-react"

export function DoctorProfilePanel() {
    const { user } = useUser()
    const userId = (user as any)?.id || (user as any)?._id
    const { data, mutate } = useSWR(userId ? `/api/users/${userId}` : null, (url) => jsonFetch(url))

    const [phone, setPhone] = useState("")
    const [clinicAddress, setClinicAddress] = useState("")
    const [specialization, setSpecialization] = useState("")
    const [qualifications, setQualifications] = useState("")
    const [bio, setBio] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (data) {
            setPhone((data as any)?.phone || "")
            setClinicAddress((data as any)?.doctorProfile?.clinicAddress || "")
            setSpecialization((data as any)?.doctorProfile?.specialization || "")
            setQualifications((data as any)?.doctorProfile?.qualifications || "")
            setBio((data as any)?.doctorProfile?.bio || "")
        }
    }, [data])

    async function save() {
        setSaving(true)
        try {
            if (!userId) throw new Error('Not authenticated')
            const payload: any = {
                phone,
                doctorProfile: {
                    ...(data as any)?.doctorProfile,
                    clinicAddress,
                    specialization,
                    qualifications,
                    bio,
                }
            }
            await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            })
            await mutate()
        } catch (err) {
            console.error('Failed to update doctor profile', err)
        } finally {
            setSaving(false)
        }
    }

    if (!user) return (
        <div className="max-w-2xl mx-auto">
            <p className="text-muted-foreground">Loading...</p>
        </div>
    )

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Doctor Profile</h1>
                <p className="text-muted-foreground mt-2">Manage your professional information</p>
            </div>

            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-muted-foreground mb-2 block">Phone</label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-muted-foreground mb-2 block">Clinic Address</label>
                        <Input value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-muted-foreground mb-2 block">Specialization</label>
                        <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-muted-foreground mb-2 block">Qualifications</label>
                        <Input value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="e.g., MBBS, MD - Cardiology" />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-muted-foreground mb-2 block">Bio</label>
                        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={save} disabled={saving} className="w-full sm:w-auto flex items-center space-x-2">
                        <Save size={16} />
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function DoctorProfilePage() {
    return (
        // keep default page behavior for direct navigation (wrapped by layout elsewhere)
        <DoctorProfilePanel />
    )
}
