"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const eventSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.enum(["ACADEMIC", "CULTURAL", "SPORTS", "TECHNICAL", "OTHER"]),
  capacity: z.number().min(1),
  deadline: z.date().min(new Date()),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string(),
  createGroup: z.boolean()
})

export function EventForm() {
  const [createGroup, setCreateGroup] = useState(false)
  const router = useRouter()
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(eventSchema)
  })

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error()
      toast.success("Event created successfully!")
      router.push("/events")
      router.refresh()
    } catch (error) {
      toast.error("Failed to create event")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input {...register("title")} placeholder="Event Title" />
      <Textarea {...register("content")} placeholder="Event Description" />
      <Input {...register("location")} placeholder="Location" />
      <div className="flex gap-4">
        <Calendar {...register("startDate")} />
        <Calendar {...register("endDate")} />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={createGroup}
          onCheckedChange={setCreateGroup}
        />
        <label>Create private group for registered participants</label>
      </div>
      <Button type="submit">Create Event</Button>
    </form>
  )
} 