"use client"

import { Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Assignment {
  id: string
  subject: string
  title: string
  description: string | null
  due_date: string
  status: "pending" | "completed" | "submitted"
  grade: number | null
}

interface AssignmentCardProps {
  assignment: Assignment
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

export function AssignmentCard({ assignment, onDelete, onStatusChange }: AssignmentCardProps) {
  const dueDate = new Date(assignment.due_date)
  const isOverdue = dueDate < new Date() && assignment.status !== "completed"
  const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending":
        return isOverdue
          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                {assignment.subject}
              </span>
              <Badge className={cn(getStatusColor(), "capitalize")}>{assignment.status}</Badge>
            </div>
            <h3 className="font-semibold text-foreground">{assignment.title}</h3>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={() => onDelete(assignment.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {assignment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
        )}

        {/* Grade if available */}
        {assignment.grade !== null && (
          <div className="text-sm">
            <span className="text-muted-foreground">Grade: </span>
            <span className="font-semibold text-primary">{assignment.grade}%</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={cn(isOverdue && "text-destructive font-semibold")}>
              {isOverdue
                ? `Overdue by ${Math.abs(daysUntilDue)} days`
                : daysUntilDue === 0
                  ? "Due today"
                  : `Due in ${daysUntilDue} days`}
            </span>
          </div>
          {assignment.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(assignment.id, assignment.status === "pending" ? "submitted" : "pending")}
            >
              Mark Done
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
