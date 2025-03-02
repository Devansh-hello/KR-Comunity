"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function EventManagement() {
  const [filter, setFilter] = useState("all")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="active">Active Events</SelectItem>
              <SelectItem value="past">Past Events</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Rest of your event management content */}
        </div>
      </CardContent>
    </Card>
  )
} 