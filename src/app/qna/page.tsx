import QuestionList from '@/components/qna/QuestionList';

export default function QnAPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="mb-10">
        <h1 className="text-5xl font-bold mb-4 font-headline text-foreground">Q&amp;A Forum</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Ask questions, share knowledge, and connect with the community. Browse by tags to find topics you're interested in.
        </p>
      </div>
      <QuestionList />
    </div>
  );
}
