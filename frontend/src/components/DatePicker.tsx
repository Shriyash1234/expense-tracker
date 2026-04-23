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
  placeholder?: string
}

const formatDateValue = (value: string, placeholder = "Pick a date") => {
  if (!value) {
    return placeholder
  }

  return format(parseISO(value), "PPP")
}

const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd")

const DatePicker = ({ id, value, onChange, placeholder }: DatePickerProps) => {
  const selectedDate = value ? parseISO(value) : undefined
  const today = new Date()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start overflow-hidden text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          <span className="truncate">{formatDateValue(value, placeholder)}</span>
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
          disabled={{ after: today }}
          required
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
