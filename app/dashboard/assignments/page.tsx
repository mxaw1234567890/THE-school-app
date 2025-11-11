"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssignmentCard } from "@/components/assignment-card"
import { Plus } from "lucide-react"

interface Assignment {
  id: string
  subject: string
  title: string
  description: string | null
  due_date: string
  status: "pending" | "completed" | "submitted"
  grade: number | null
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
    due_date: "",
  })

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true })

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error("[v0] Error fetching assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const addAssignment = async () => {
    if (!formData.subject.trim() || !formData.title.trim() || !formData.due_date) {
      console.error("[v0] Missing required fields")
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const formattedDueDate = new Date(formData.due_date).toISOString()

      const { data, error } = await supabase
        .from("assignments")
        .insert({
          user_id: user.id,
          subject: formData.subject,
          title: formData.title,
          description: formData.description || null,
          due_date: formattedDueDate,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error
      setAssignments(
        [...assignments, data].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()),
      )
      setFormData({ subject: "", title: "", description: "", due_date: "" })
      setIsFormOpen(false)
    } catch (error) {
      console.error("[v0] Error adding assignment:", error)
    }
  }

  const deleteAssignment = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("assignments").delete().eq("id", id)

      if (error) throw error
      setAssignments(assignments.filter((a) => a.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting assignment:", error)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("assignments").update({ status }).eq("id", id)

      if (error) throw error
      setAssignments(assignments.map((a) => (a.id === id ? { ...a, status: status as any } : a)))
    } catch (error) {
      console.error("[v0] Error updating assignment:", error)
    }
  }

  const pendingCount = assignments.filter((a) => a.status === "pending").length
  const completedCount = assignments.filter((a) => a.status === "completed").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground mt-2">Track and manage your academic assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">Total Assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {
                assignments.filter((a) => a.due_date && new Date(a.due_date) < new Date() && a.status === "pending")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Add new assignment button */}
      <div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {/* Add assignment form */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, History"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chapter 5 Homework"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={addAssignment}>Add Assignment</Button>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments list */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Assignments</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p className="text-muted-foreground">No assignments yet. Create one to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onDelete={deleteAssignment}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
