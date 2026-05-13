"use client"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerDoctorSchema } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

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
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 via-white to-teal-50 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-teal-200/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-20 left-20 w-16 h-16 border-4 border-yellow-200 rounded-full"></div>
      <div className="absolute top-10 right-20 w-20 h-20 bg-teal-300/30 rounded-full"></div>
      <div className="absolute top-32 right-32 w-12 h-12 border-4 border-yellow-200 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200/40 rounded-full -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute bottom-32 left-32 w-24 h-24 bg-teal-300/20 rounded-full"></div>

      {/* Left Image Section */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-white to-blue-100 opacity-60"></div>
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          alt="Professional Doctor"
          className="object-cover w-full h-full z-10"
        />
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 overflow-y-auto max-h-screen">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 my-auto">
          {/* Back button */}
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              Back to Home
            </Link>
          </div>
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary">CAREMATE</h2>
            <p className="text-gray-600 mt-2">Clinical Provider Registration</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder="Jane" 
                  {...register("name.first")} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                  placeholder="Doe" 
                  {...register("name.last")} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Work Email</label>
              <input 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                placeholder="name@hospital.org" 
                {...register("email")} 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                placeholder="Create a strong password" 
                type="password" 
                {...register("password")} 
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Professional Details</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Primary Specialization</label>
                  <input 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    placeholder="e.g. Cardiology, Pediatrics" 
                    {...register("doctorProfile.specialization")} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    placeholder="e.g. 5"
                    type="number"
                    {...register("doctorProfile.yearsExperience", { valueAsNumber: true })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Qualifications (comma-separated)</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
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
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={formState.isSubmitting} 
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {formState.isSubmitting ? "Submitting..." : "Submit Application"}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
