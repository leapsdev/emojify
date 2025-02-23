import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ProfileForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <label htmlFor="username" className="text-lg font-medium">
            Username
          </label>
          <span className="text-gray-500">Required</span>
        </div>
        <Input id="username" className="rounded-2xl border-gray-200 bg-gray-50 px-4 py-6 text-lg" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="displayName" className="text-lg font-medium">
          Display name
        </label>
        <Input
          id="displayName"
          placeholder="Your name"
          className="rounded-2xl border-gray-200 bg-gray-50 px-4 py-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-lg font-medium">
          Bio
        </label>
        <div className="relative">
          <Textarea
            id="bio"
            placeholder="Tell us about you..."
            className="rounded-2xl border-gray-200 bg-gray-50 min-h-[150px] p-4 text-lg resize-none"
            maxLength={300}
          />
        </div>
      </div>
    </div>
  )
}
