"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CheckCircle2, BookOpen, BarChart3, Settings, LogOut, Menu, X, Sparkles, Mic, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    {
      href: "/dashboard",
      icon: BarChart3,
      label: "Dashboard",
    },
    {
      href: "/dashboard/todos",
      icon: CheckCircle2,
      label: "Tasks",
    },
    {
      href: "/dashboard/assignments",
      icon: BookOpen,
      label: "Assignments",
    },
    {
      href: "/dashboard/flashcards",
      icon: BookOpen,
      label: "Flashcards",
    },
    {
      href: "/dashboard/ai-tools",
      icon: Sparkles,
      label: "AI Tools",
    },
    {
      href: "/dashboard/voice-notes",
      icon: Mic,
      label: "Voice Notes",
    },
    {
      href: "/dashboard/collaborate",
      icon: Users,
      label: "Collaborate",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
    },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-card border"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r flex flex-col transition-all duration-300 z-30",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">School App</h1>
          <p className="text-xs text-muted-foreground mt-1">Study Companion</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </Button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
