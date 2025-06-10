import { Suspense } from 'react';
import MyForumsList from '@/components/qna/MyForumsList';
import { Loader2 } from 'lucide-react';

function MyForumsListSkeleton() {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading your forums...</p>
    </div>
  );
}

export default function MyForumsPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-4 font-headline text-foreground">My Forums</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Manage your posted questions and discussions. You can edit or delete your own forum posts here.
        </p>
      </div>
      <Suspense fallback={<MyForumsListSkeleton />}>
        <MyForumsList />
      </Suspense>
    </div>
  );
} 