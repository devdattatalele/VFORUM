import { Suspense } from 'react';
import QuestionList from '@/components/qna/QuestionList';
import { Loader2 } from 'lucide-react';

function QuestionListSkeleton() {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading questions...</p>
    </div>
  );
}

export default function QnAPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-4 font-headline text-foreground">Q&amp;A Forum</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Ask questions, share knowledge, and connect with the community. Browse by tags to find topics you're interested in.
        </p>
      </div>
      <Suspense fallback={<QuestionListSkeleton />}>
        <QuestionList />
      </Suspense>
    </div>
  );
}
