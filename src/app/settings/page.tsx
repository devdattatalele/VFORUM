import { Suspense } from "react"
import SettingsContent from "@/components/settings/SettingsContent"
import { Loader2 } from "lucide-react"

function SettingsLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading settings...</p>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-10">
        <h1 className="mb-4 font-headline text-5xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-xl leading-relaxed text-muted-foreground">
          Manage your account preferences, notifications, and privacy settings.
        </p>
      </div>
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
