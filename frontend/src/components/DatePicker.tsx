import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  id: string
  value: string
  onChange: (value: string) => void
}

const formatDateValue = (value: string) => {
  if (!value) {
    return "Pick a date"
  }

  return format(parseISO(value), "PPP")
}

const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd")

const DatePicker = ({ id, value, onChange }: DatePickerProps) => {
  const selectedDate = value ? parseISO(value) : undefined
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {formatDateValue(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onChange(toDateInputValue(date))
              setOpen(false)
            }
          }}
          required
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
