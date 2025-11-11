"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TodoItem } from "@/components/todo-item"
import { Plus } from "lucide-react"

interface Todo {
  id: string
  title: string
  status: "completed" | "pending"
  priority: "low" | "medium" | "high"
  due_date: string | null
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error("[v0] Error fetching todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("todos")
        .insert({
          user_id: user.id,
          title: newTodo,
          priority,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error
      setTodos([data, ...todos])
      setNewTodo("")
    } catch (error) {
      console.error("[v0] Error adding todo:", error)
    }
  }

  const toggleTodo = async (id: string) => {
    try {
      const supabase = createClient()
      const todo = todos.find((t) => t.id === id)
      if (!todo) return

      const newStatus = todo.status === "completed" ? "pending" : "completed"

      const { error } = await supabase.from("todos").update({ status: newStatus }).eq("id", id)

      if (error) throw error
      setTodos(todos.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
    } catch (error) {
      console.error("[v0] Error toggling todo:", error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) throw error
      setTodos(todos.filter((t) => t.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting todo:", error)
    }
  }

  const updateTodo = async (id: string, title: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("todos").update({ title }).eq("id", id)

      if (error) throw error
      setTodos(todos.map((t) => (t.id === id ? { ...t, title } : t)))
    } catch (error) {
      console.error("[v0] Error updating todo:", error)
    }
  }

  const completedCount = todos.filter((t) => t.status === "completed").length
  const pendingCount = todos.filter((t) => t.status === "pending").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground mt-2">Manage your daily tasks and to-dos</p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{todos.length}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
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
            <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Add new todo */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-col md:flex-row">
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo()
              }}
              className="flex-1"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="px-3 py-2 rounded-lg border bg-background"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button onClick={addTodo}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Todo list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Loading tasks...</p>
          ) : todos.length === 0 ? (
            <p className="text-muted-foreground">No tasks yet. Create one to get started!</p>
          ) : (
            todos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} onUpdate={updateTodo} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
