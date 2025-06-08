"use client";

import QuestionForm from "@/components/qna/QuestionForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AskQuestionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/qna?auth_required=true'); 
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center"><ShieldAlert className="mr-2 h-6 w-6 text-destructive"/> Access Denied</CardTitle>
          <CardDescription>You need to be signed in to ask a question.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please sign in to continue.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 font-headline">Ask a New Question</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Question</CardTitle>
          <CardDescription>Fill in the details below to post your question to the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionForm />
        </CardContent>
      </Card>
    </div>
  );
}
