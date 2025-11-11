"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, BookOpen, TrendingUp } from "lucide-react"

interface Stats {
  todosCompleted: number
  assignmentsDue: number
  studyStreak: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    todosCompleted: 0,
    assignmentsDue: 0,
    studyStreak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Fetch stats from database
        const [todos, assignments, sessions] = await Promise.all([
          supabase.from("todos").select("id").eq("user_id", user.id).eq("status", "completed"),
          supabase.from("assignments").select("id").eq("user_id", user.id).eq("status", "pending"),
          supabase
            .from("study_sessions")
            .select("id")
            .eq("user_id", user.id)
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        ])

        setStats({
          todosCompleted: todos.data?.length || 0,
          assignmentsDue: assignments.data?.length || 0,
          studyStreak: sessions.data?.length || 0,
        })
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your study overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todosCompleted}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignmentsDue}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studyStreak}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-dashed cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Add New Task</h3>
                <p className="text-sm text-muted-foreground">Create and track your tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">New Assignment</h3>
                <p className="text-sm text-muted-foreground">Add assignment due dates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
