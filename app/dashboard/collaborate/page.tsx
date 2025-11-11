"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Share2, Copy, Check } from "lucide-react"

interface CollaborationItem {
  id: string
  title: string
  type: "deck" | "assignment"
  shared_with: number
}

export default function CollaboratePage() {
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [decks, setDecks] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch decks
      const { data: decksData } = await supabase.from("flashcard_decks").select("id, title").eq("user_id", user.id)

      // Fetch assignments
      const { data: assignmentsData } = await supabase.from("assignments").select("id, title").eq("user_id", user.id)

      setDecks(decksData || [])
      setAssignments(assignmentsData || [])

      // Fetch collaborations
      const { data: collabData } = await supabase.from("collaborations").select("*").eq("user_id", user.id)

      if (collabData) {
        const formatted = collabData.map((c) => ({
          id: c.id,
          title: c.deck_id ? "Shared Deck" : "Shared Assignment",
          type: c.deck_id ? "deck" : "assignment",
          shared_with: 0,
        }))
        setCollaborations(formatted)
      }
    } catch (error) {
      console.error("[v0] Error fetching collaboration data:", error)
    } finally {
      setLoading(false)
    }
  }

  const shareItem = async (itemId: string, type: "deck" | "assignment") => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const insertData: any = {
        user_id: user.id,
        role: "viewer",
      }

      if (type === "deck") {
        insertData.deck_id = itemId
      } else {
        insertData.assignment_id = itemId
      }

      const { error } = await supabase.from("collaborations").insert(insertData)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("[v0] Error sharing item:", error)
    }
  }

  const copyShareLink = (itemId: string) => {
    const shareLink = `${window.location.origin}/shared/${itemId}`
    navigator.clipboard.writeText(shareLink)
    setCopiedId(itemId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Collaborate</h1>
        <p className="text-muted-foreground mt-2">Share study materials with classmates</p>
      </div>

      {/* Share sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Decks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Flashcard Decks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground">Loading decks...</p>
            ) : decks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No decks to share</p>
            ) : (
              decks.map((deck) => (
                <div key={deck.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">{deck.title}</p>
                    <p className="text-xs text-muted-foreground">Flashcard Deck</p>
                  </div>
                  <Button size="sm" onClick={() => copyShareLink(deck.id)}>
                    {copiedId === deck.id ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Share Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Share Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments to share</p>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">Assignment</p>
                  </div>
                  <Button size="sm" onClick={() => copyShareLink(assignment.id)}>
                    {copiedId === assignment.id ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Collaborations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Collaborations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading collaborations...</p>
          ) : collaborations.length === 0 ? (
            <p className="text-muted-foreground">No active collaborations yet</p>
          ) : (
            <div className="space-y-3">
              {collaborations.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{collab.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{collab.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{collab.shared_with} viewers</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collaboration tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Collaboration Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Copy and share links with classmates to collaborate on study materials</p>
          <p>• View shared decks and assignments in your Study Hub</p>
          <p>• Control access by managing your collaboration settings</p>
          <p>• Study together in real-time with shared flashcard decks</p>
        </CardContent>
      </Card>
    </div>
  )
}
