"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BookOpen, Play } from "lucide-react"
import Link from "next/link"

interface Deck {
  id: string
  title: string
  description: string | null
  subject: string | null
  card_count?: number
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
  })

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const decksWithCount = await Promise.allSettled(
        (data || []).map(async (deck) => {
          const { count } = await supabase
            .from("flashcards")
            .select("*", { count: "exact", head: true })
            .eq("deck_id", deck.id)
          return { ...deck, card_count: count || 0 }
        }),
      )

      // Filter out rejected promises
      const successfulDecks = decksWithCount
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result.status === "fulfilled" ? result.value : null))
        .filter((deck) => deck !== null)

      setDecks(successfulDecks)
    } catch (error) {
      console.error("[v0] Error fetching decks:", error)
    } finally {
      setLoading(false)
    }
  }

  const addDeck = async () => {
    if (!formData.title.trim()) return

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("flashcard_decks")
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          subject: formData.subject || null,
        })
        .select()
        .single()

      if (error) throw error
      setDecks([{ ...data, card_count: 0 }, ...decks])
      setFormData({ title: "", description: "", subject: "" })
      setIsFormOpen(false)
    } catch (error) {
      console.error("[v0] Error adding deck:", error)
    }
  }

  const deleteDeck = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("flashcard_decks").delete().eq("id", id)

      if (error) throw error
      setDecks(decks.filter((d) => d.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting deck:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <p className="text-muted-foreground mt-2">Create and study flashcard decks</p>
      </div>

      {/* Add new deck button */}
      <div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Deck
        </Button>
      </div>

      {/* Add deck form */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Deck</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Deck Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Spanish Vocabulary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Languages, Biology"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
              <div className="flex gap-3 pt-2">
                <Button onClick={addDeck}>Create Deck</Button>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decks grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Decks</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading decks...</p>
        ) : decks.length === 0 ? (
          <p className="text-muted-foreground">No decks yet. Create one to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-balance">{deck.title}</h3>
                          {deck.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{deck.description}</p>
                          )}
                        </div>
                      </div>
                      {deck.subject && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Subject:</span> {deck.subject}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">{deck.card_count} cards</span>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/flashcards/${deck.id}`}>
                          <Button size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => deleteDeck(deck.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
