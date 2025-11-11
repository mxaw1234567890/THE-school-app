"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Trash2, Download } from "lucide-react"

interface VoiceNote {
  id: string
  recording: Blob
  timestamp: Date
  duration: number
}

export default function VoiceNotesPage() {
  const [notes, setNotes] = useState<VoiceNote[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          recording: audioBlob,
          timestamp: new Date(),
          duration: recordingTime,
        }
        setNotes([newNote, ...notes])
        setRecordingTime(0)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("[v0] Error accessing microphone:", error)
      alert("Unable to access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const downloadNote = (note: VoiceNote) => {
    const url = URL.createObjectURL(note.recording)
    const link = document.createElement("a")
    link.href = url
    link.download = `note-${note.timestamp.toISOString()}.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Voice Notes</h1>
        <p className="text-muted-foreground mt-2">Record audio notes while studying</p>
      </div>

      {/* Recording interface */}
      <Card>
        <CardHeader>
          <CardTitle>Record a Voice Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-3xl font-mono font-bold text-primary">{formatTime(recordingTime)}</div>
              <p className="text-sm text-muted-foreground">{isRecording ? "Recording..." : "Ready to record"}</p>
            </div>

            <div className="flex gap-3">
              {!isRecording ? (
                <Button onClick={startRecording} size="lg" className="bg-red-500 hover:bg-red-600">
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} size="lg" variant="destructive">
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved notes */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Saved Notes</h2>
        {notes.length === 0 ? (
          <p className="text-muted-foreground">No voice notes yet. Start recording to create one!</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {note.timestamp.toLocaleDateString()} at {note.timestamp.toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Duration: {formatTime(note.duration)}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => downloadNote(note)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteNote(note.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Audio player */}
                  <audio src={URL.createObjectURL(note.recording)} controls className="w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Voice Notes Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Record lectures or your own explanations for quick reference</p>
          <p>• Use voice notes to capture thoughts while studying</p>
          <p>• Download and organize your recordings for later review</p>
          <p>• Best used with headphones in a quiet environment</p>
        </CardContent>
      </Card>
    </div>
  )
}
