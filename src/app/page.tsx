import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button size="lg">Shadcn Button</Button>
      <Checkbox />
      <Input />
      <Textarea />
    </div>
  );
}
