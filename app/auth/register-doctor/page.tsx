"use client"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerDoctorSchema } from "@/lib/validation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Values = z.infer<typeof registerDoctorSchema>

export default function RegisterDoctorPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState, setValue } = useForm<Values>({
    resolver: zodResolver(registerDoctorSchema),
    defaultValues: {
      name: { first: "", last: "" },
      email: "",
      password: "",
      doctorProfile: { specialization: "", yearsExperience: 0, qualifications: [] },
    } as any,
  })

  async function onSubmit(values: Values) {
    setError(null)
    const res = await fetch("/api/auth/register-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const b = await res.json().catch(() => ({}))
      setError(b?.error || "Failed to register")
      return
    }
    router.push("/auth/login")
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col justify-center items-center p-stack-xl font-body-md text-on-surface">
      <div className="w-full max-w-lg">
        <div className="mb-stack-xl text-center">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary mb-stack-sm">CareMate</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Clinical Provider Portal</p>
        </div>
        
        <Card className="border border-outline-variant bg-surface-container-lowest shadow-sm rounded-xl">
          <CardHeader className="space-y-stack-sm pb-stack-lg border-b border-outline-variant mb-stack-lg">
            <CardTitle className="font-headline-md text-headline-md text-center font-bold text-on-surface">Provider Registration</CardTitle>
            <CardDescription className="text-center font-label-md text-label-md text-on-surface-variant">
              Submit your credentials to join our healthcare network.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-stack-lg pb-stack-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-stack-lg">
              
              <div className="grid grid-cols-2 gap-stack-md">
                <div className="space-y-stack-xs">
                  <label className="font-label-sm text-label-sm font-bold text-on-surface">First Name</label>
                  <Input 
                    className="bg-surface border border-outline-variant h-12 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg" 
                    placeholder="Enter first name" 
                    {...register("name.first")} 
                  />
                </div>
                <div className="space-y-stack-xs">
                  <label className="font-label-sm text-label-sm font-bold text-on-surface">Last Name</label>
                  <Input 
                    className="bg-surface border border-outline-variant h-12 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg" 
                    placeholder="Enter last name" 
                    {...register("name.last")} 
                  />
                </div>
              </div>

              <div className="space-y-stack-xs">
                <label className="font-label-sm text-label-sm font-bold text-on-surface">Work Email</label>
                <Input 
                  className="bg-surface border border-outline-variant h-12 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg" 
                  placeholder="name@hospital.org" 
                  {...register("email")} 
                />
              </div>

              <div className="space-y-stack-xs">
                <label className="font-label-sm text-label-sm font-bold text-on-surface">Password</label>
                <Input 
                  className="bg-surface border border-outline-variant h-12 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg" 
                  placeholder="Create a strong password" 
                  type="password" 
                  {...register("password")} 
                />
              </div>

              <div className="pt-stack-lg border-t border-outline-variant">
                <h3 className="font-label-md text-label-md font-bold text-primary mb-stack-md uppercase tracking-wider">Professional Details</h3>
                
                <div className="space-y-stack-md">
                  <div className="space-y-stack-xs">
                    <label className="font-label-sm text-label-sm font-bold text-on-surface">Primary Specialization</label>
                    <Input 
                      className="bg-surface border border-outline-variant h-12 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg" 
                      placeholder="e.g. Cardiology, Pediatrics" 
                      {...register("doctorProfile.specialization")} 
                    />
                  </div>
                  
                  <div className="space-y-stack-xs">
                    <label className="font-label-sm text-label-sm font-bold text-on-surface">Years of Experience</label>
                    <Input
                      className="bg-surface border border-outline-variant h-12 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg" 
                      placeholder="e.g. 5"
                      type="number"
                      {...register("doctorProfile.yearsExperience", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-stack-xs">
                    <label className="font-label-sm text-label-sm font-bold text-on-surface">Qualifications (comma-separated)</label>
                    <Input
                      className="bg-surface border border-outline-variant h-12 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg" 
                      placeholder="e.g. MD, PhD, FACS"
                      onChange={(e) => {
                        const arr = e.target.value
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean)
                        setValue("doctorProfile.qualifications", arr as any, { shouldDirty: true })
                      }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-stack-sm rounded-lg bg-error-container text-on-error-container font-label-sm text-label-sm font-bold border border-error">
                  {error}
                </div>
              )}
              
              <Button type="submit" disabled={formState.isSubmitting} className="w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg mt-stack-md transition-all hover:bg-primary/90">
                {formState.isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
