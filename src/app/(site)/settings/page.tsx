import type { Metadata } from "next"
import PageHeader from "@/components/PageHeader"
import SettingsContent from "@/components/settings/SettingsContent"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Your name, appearance and session."
      />
      <SettingsContent />
    </div>
  )
}
