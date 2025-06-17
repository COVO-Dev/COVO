"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="range"
      selected={date}
      onSelect={setDate}
      className="rounded-md border bg-white shadow-sm"
    />
  )
}
