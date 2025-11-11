"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface FlashcardProps {
  front: string
  back: string
  onNext?: () => void
}

export function Flashcard({ front, back, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="w-full h-full flex items-center justify-center perspective">
      <div
        className={cn(
          "w-full max-w-2xl h-96 cursor-pointer transition-transform duration-300 transform-gpu",
          isFlipped ? "[transform:rotateY(180deg)]" : "",
        )}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className={cn(
            "absolute w-full h-full bg-gradient-to-br rounded-2xl shadow-2xl p-8 flex items-center justify-center border",
            isFlipped ? "hidden" : "",
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Question</p>
            <p className="text-3xl font-bold text-foreground text-balance">{front}</p>
            <p className="text-xs text-muted-foreground mt-8">Click to reveal answer</p>
          </div>
        </div>

        <div
          className={cn(
            "absolute w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-2xl p-8 flex items-center justify-center border border-primary/30",
            !isFlipped ? "hidden" : "",
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Answer</p>
            <p className="text-2xl font-semibold text-foreground text-balance">{back}</p>
            <p className="text-xs text-muted-foreground mt-8">Click to flip back</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Flashcard as FlashcardComponent }
export default Flashcard
