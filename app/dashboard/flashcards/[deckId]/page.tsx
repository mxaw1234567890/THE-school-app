"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FlashcardComponent } from "@/components/flashcard"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface DeckInfo {
  title: string
  description: string | null
}

interface Flashcard {
  id: string
  front: string
  back: string
}

export default function StudyDeckPage() {
  const params = useParams()
  const deckId = params.deckId as string

  const [deck, setDeck] = useState<DeckInfo | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCard, setNewCard] = useState({ front: "", back: "" })

  useEffect(() => {
    fetchDeckAndCards()
  }, [deckId])

  const fetchDeckAndCards = async () => {
    try {
      const supabase = createClient()

      const [deckRes, cardsRes] = await Promise.all([
        supabase.from("flashcard_decks").select("title, description").eq("id", deckId).single(),
        supabase.from("flashcards").select("*").eq("deck_id", deckId).order("created_at", { ascending: true }),
      ])

      if (deckRes.data) setDeck(deckRes.data)
      if (cardsRes.data) setFlashcards(cardsRes.data)
    } catch (error) {
      console.error("[v0] Error fetching deck:", error)
    } finally {
      setLoading(false)
    }
  }

  const addCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("flashcards")
        .insert({
          deck_id: deckId,
          front: newCard.front,
          back: newCard.back,
        })
        .select()
        .single()

      if (error) throw error
      setFlashcards([...flashcards, data])
      setNewCard({ front: "", back: "" })
      setIsAddingCard(false)
    } catch (error) {
      console.error("[v0] Error adding card:", error)
    }
  }

  const deleteCard = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("flashcards").delete().eq("id", id)

      if (error) throw error
      const newCards = flashcards.filter((c) => c.id !== id)
      setFlashcards(newCards)
      if (currentIndex >= newCards.length) {
        setCurrentIndex(Math.max(0, newCards.length - 1))
      }
    } catch (error) {
      console.error("[v0] Error deleting card:", error)
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/flashcards">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{deck?.title}</h1>
          {deck?.description && <p className="text-muted-foreground mt-2">{deck.description}</p>}
        </div>
      </div>

      {/* Study area */}
      {flashcards.length > 0 ? (
        <div className="space-y-6">
          {/* Flashcard display */}
          <Card>
            <CardContent className="pt-8 pb-8">
              <FlashcardComponent front={flashcards[currentIndex].front} back={flashcards[currentIndex].back} />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Card {currentIndex + 1} of {flashcards.length}
              </p>
              <div className="w-64 h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <Button variant="outline" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Delete card */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => deleteCard(flashcards[currentIndex].id)}
              className="text-destructive hover:text-destructive"
            >
              Delete This Card
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-muted-foreground mb-4">No flashcards yet. Add one to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Add new card section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAddingCard ? (
            <Button onClick={() => setIsAddingCard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          ) : (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="front">Question (Front)</Label>
                <Input
                  id="front"
                  placeholder="Enter the question..."
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="back">Answer (Back)</Label>
                <Input
                  id="back"
                  placeholder="Enter the answer..."
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={addCard}>Add Card</Button>
                <Button variant="outline" onClick={() => setIsAddingCard(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
