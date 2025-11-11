"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Profile {
  full_name: string | null
  avatar_url: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: null,
    avatar_url: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        setEmail(user.email || "")

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id)

        if (error && error.code !== "PGRST116") {
          console.error("[v0] Error fetching profile:", error)
        } else if (data && data.length > 0) {
          setProfile(data[0])
        } else {
          // Create a default profile if it doesn't exist
          const newProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || "",
            avatar_url: null,
          }
          await supabase.from("profiles").insert(newProfile)
          setProfile(newProfile)
        }
      } catch (error) {
        console.error("[v0] Error in fetchProfile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from("profiles").update(profile).eq("id", user.id)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled className="opacity-50 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
