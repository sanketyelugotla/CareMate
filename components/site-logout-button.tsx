"use client"

import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      })
      window.location.replace("/")
    } catch (e) {
      window.location.replace("/")
    }
  }
  return (
    <Button size="sm" variant="outline" onClick={onLogout}>
      Logout
    </Button>
  )
}
