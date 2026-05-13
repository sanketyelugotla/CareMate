"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Bell, Settings as SettingsIcon, Lock } from "lucide-react"

export default function SettingsPage() {
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const [settings, setSettings] = useState({
        emailNotifications: true,
        appointmentReminders: true,
        weeklyReports: false
    })

    const handleSaveSettings = async (type: string) => {
        setSaving(true)
        setMessage("")
        try {
            setMessage(`${type} saved successfully`)
            setTimeout(() => setMessage(""), 3000)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your preferences</p>
            </div>

            {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm font-medium">{message}</p>
                </div>
            )}

            <div className="space-y-6">
                <Card className="bg-card p-6 border border-border">
                    <div className="flex items-center space-x-3 pb-4 border-b border-border mb-6">
                        <Bell className="text-blue-600" size={24} />
                        <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-foreground">Email Notifications</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.appointmentReminders}
                                onChange={(e) => setSettings({ ...settings, appointmentReminders: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-foreground">Appointment Reminders</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.weeklyReports}
                                onChange={(e) => setSettings({ ...settings, weeklyReports: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-foreground">Weekly Reports</span>
                        </label>
                        <Button
                            onClick={() => handleSaveSettings("Notification preferences")}
                            disabled={saving}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {saving ? "Saving..." : "Save Preferences"}
                        </Button>
                    </div>
                </Card>

                <Card className="bg-card p-6 border border-border">
                    <div className="flex items-center space-x-3 pb-4 border-b border-border mb-6">
                        <Lock className="text-purple-600" size={24} />
                        <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                defaultValue="admin@caremate.com"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Change Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button
                            onClick={() => handleSaveSettings("Profile settings")}
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {saving ? "Saving..." : "Update Profile"}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
