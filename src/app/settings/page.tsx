import { Suspense } from 'react';
import SettingsContent from '@/components/settings/SettingsContent';
import { Loader2 } from 'lucide-react';

function SettingsLoadingSkeleton() {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading settings...</p>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-4 font-headline text-foreground">Settings</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Manage your account preferences, notifications, and privacy settings.
        </p>
      </div>
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
} 