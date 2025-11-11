"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Todo {
  id: string
  title: string
  status: "completed" | "pending"
  priority: "low" | "medium" | "high"
  due_date: string | null
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, title: string) => void
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(todo.id, title)
      setIsEditing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:bg-accent transition-colors">
      <button
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        {todo.status === "completed" ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") setIsEditing(false)
            }}
            autoFocus
            className="h-8"
          />
        ) : (
          <>
            <p
              className={cn(
                "font-medium transition-all",
                todo.status === "completed" ? "line-through text-muted-foreground" : "text-foreground",
              )}
            >
              {todo.title}
            </p>
            {todo.due_date && (
              <p className="text-xs text-muted-foreground mt-1">Due: {new Date(todo.due_date).toLocaleDateString()}</p>
            )}
          </>
        )}
      </div>

      <span className={cn("text-xs font-semibold px-2 py-1 rounded-full capitalize", getPriorityColor(todo.priority))}>
        {todo.priority}
      </span>

      <div className="flex gap-2 flex-shrink-0">
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(!isEditing)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(todo.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
