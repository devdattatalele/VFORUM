"use server"

import { adminDb } from "@/lib/firebase-admin"
import { toComment, toProfile, toQuestion } from "@/lib/server/docs"
import { excerpt } from "@/lib/markdown"
import { docId } from "@/lib/schemas"
import type { ProfileAnswer, PublicProfile } from "@/lib/types"

const LIST_LIMIT = 20

export async function getPublicProfile(
  uid: string
): Promise<PublicProfile | null> {
  const id = docId.safeParse(uid)
  if (!id.success) return null
  const user = await adminDb.collection("users").doc(id.data).get()
  if (!user.exists) return null
  const profile = toProfile(user.data())

  const questions = (
    await adminDb
      .collection("questions")
      .where("author.uid", "==", id.data)
      .get()
  ).docs
    .map((doc) => toQuestion(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const answers = await answersBy(id.data)

  return {
    uid: profile.uid || id.data,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    role: profile.role ?? "user",
    joinedAt: profile.createdAt ?? null,
    stats: {
      questions: questions.length,
      answers: answers.length,
      accepted: answers.filter((a) => a.accepted).length,
      upvotes:
        questions.reduce((sum, q) => sum + q.upvotes, 0) +
        answers.reduce((sum, a) => sum + a.upvotes, 0),
    },
    questions: questions.slice(0, LIST_LIMIT),
    answers: answers.slice(0, LIST_LIMIT),
  }
}

// ponytail: scans every comment, because a filtered collection-group query
// needs an index that must be deployed first. Add a COLLECTION_GROUP index on
// comments.author.uid and query it once the forum has thousands of comments.
async function answersBy(uid: string): Promise<ProfileAnswer[]> {
  try {
    const mine = (await adminDb.collectionGroup("comments").get()).docs.filter(
      (doc) => doc.data().author?.uid === uid && !doc.data().deleted
    )
    const questionRefs = [
      ...new Set(mine.map((doc) => doc.ref.parent.parent!.path)),
    ].map((path) => adminDb.doc(path))
    const questions = new Map(
      (questionRefs.length ? await adminDb.getAll(...questionRefs) : [])
        .filter((doc) => doc.exists)
        .map((doc) => [doc.id, toQuestion(doc.id, doc.data())])
    )
    return mine
      .map((doc) => {
        const question = questions.get(doc.ref.parent.parent!.id)
        const comment = toComment(doc.id, doc.ref.parent.parent!.id, doc.data())
        return question
          ? {
              questionId: question.id,
              questionTitle: question.title,
              commentId: comment.id,
              excerpt: excerpt(comment.content, 160),
              createdAt: comment.createdAt,
              upvotes: comment.upvotes,
              accepted: question.acceptedAnswerId === comment.id,
            }
          : null
      })
      .filter((a): a is ProfileAnswer => a !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch (error) {
    console.error("Error loading answers for profile:", error)
    return []
  }
}
