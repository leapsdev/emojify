import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="search"
          placeholder="Search by name"
          className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl text-gray-900 placeholder:text-gray-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
