'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type SiteHeaderProps = {
  hide?: boolean
}

export default function SiteHeader({ hide = false }: SiteHeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUser(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      })
      setUser(null)
      window.location.replace("/")
    } catch (e) {
      window.location.replace("/")
    }
  }

  if (hide) {
    return <></>
  }

  return (
    <header className="flex justify-between items-center w-full px-margin-desktop py-stack-sm h-16 sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="flex items-center gap-stack-md">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center">
          CareMate
        </Link>
        <div className="hidden md:flex items-center ml-stack-xl gap-stack-lg h-full">
          <nav className="flex items-center gap-stack-lg h-full">
            <Link href="/" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center h-full">
              Home
            </Link>
            <Link href="/#services" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 px-2 py-1 rounded flex items-center">
              Services
            </Link>
            <Link href="/doctors" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 px-2 py-1 rounded flex items-center">
              Find Doctors
            </Link>
            <Link href="/#ai-assistant" onClick={(e) => {
              if (user) {
                e.preventDefault()
                router.push('/dashboard/user?tab=prediction')
              }
            }} className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 px-2 py-1 rounded flex items-center">
              AI Assistant
            </Link>

            {user && (
              <Link 
                href={user.role === 'admin' ? '/dashboard/admin' : user.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/user'} 
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 px-2 py-1 rounded flex items-center"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </div>
      <div className="flex items-center gap-stack-md">
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="flex items-center space-x-3 ml-2">
                <div className="text-right hidden sm:block">
                  <p className="text-label-md font-bold text-on-surface">{user.name}</p>
                  <p className="text-label-sm text-on-surface-variant capitalize">{user.role}</p>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                </div>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-label-md text-label-md rounded-lg transition-all ml-4"
                >
                  Logout
                </button>
              </div>
            </>
          ) : !loading ? (
            <div className="flex items-center space-x-3 ml-4">
              <Link href="/auth/login" className="px-4 py-2 border border-outline text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container transition-all">
                Login
              </Link>
              <Link href="/auth/register" className="px-4 py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:opacity-90 transition-all">
                Sign up
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}