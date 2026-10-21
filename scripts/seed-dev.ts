// Wipes the Firebase emulators and loads demo data: one account per role, a
// forum with threaded answers and votes, and events. `npm run dev:local` runs it
// on every start; `npm run dev:seed` reruns it against emulators already up.
//
// It never touches a real project: it refuses to run unless both emulator hosts
// are set and the project id is a demo- project.
import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import {
  FieldValue,
  Timestamp,
  getFirestore,
  type DocumentReference,
} from "firebase-admin/firestore"
import { DEV_PASSWORD, DEV_PERSONAS } from "../src/lib/dev-personas"
import { commentRecipients } from "../src/lib/notify"
import { getPermissionsForRole } from "../src/lib/utils/userUtils"

const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST
const projectId = process.env.GCLOUD_PROJECT ?? "demo-vforum"

if (!firestoreHost || !authHost || !projectId.startsWith("demo-")) {
  console.error(
    "Refusing to seed: run this through `npm run dev:local`, or with " +
      "FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST set and a demo- project."
  )
  process.exit(1)
}

initializeApp({ projectId })
const db = getFirestore()
const auth = getAuth()

const hoursAgo = (h: number) =>
  Timestamp.fromDate(new Date(Date.now() - h * 3_600_000))
const daysFromNow = (d: number, hour = 16) => {
  const date = new Date(Date.now() + d * 86_400_000)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

type Uid = (typeof DEV_PERSONAS)[number]["uid"]
const persona = (uid: Uid) => DEV_PERSONAS.find((p) => p.uid === uid)!
const author = (uid: Uid) => ({
  uid,
  displayName: persona(uid).displayName,
  photoURL: null,
})

async function wipe() {
  const firestore = `http://${firestoreHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`
  const accounts = `http://${authHost}/emulator/v1/projects/${projectId}/accounts`
  for (const url of [firestore, accounts]) {
    const res = await fetch(url, { method: "DELETE" })
    if (!res.ok) throw new Error(`Could not wipe ${url}: ${res.status}`)
  }
}

async function seedPeople() {
  for (const p of DEV_PERSONAS) {
    await auth.createUser({
      uid: p.uid,
      email: p.email,
      password: DEV_PASSWORD,
      displayName: p.displayName,
      emailVerified: true,
    })
    await db.doc(`users/${p.uid}`).set({
      uid: p.uid,
      email: p.email,
      displayName: p.displayName,
      photoURL: null,
      role: p.role,
      permissions: getPermissionsForRole(p.role),
      createdAt: hoursAgo(24 * 60),
      updatedAt: hoursAgo(24 * 60),
    })
  }
}

type Answer = {
  by: Uid
  content: string
  hoursAgo: number
  votes?: Uid[]
  replies?: Answer[]
}

type SeedQuestion = {
  by: Uid
  communityId: string
  title: string
  tags: string[]
  content: string
  hoursAgo: number
  views: number
  upvoters?: Uid[]
  downvoters?: Uid[]
  answers?: Answer[]
  accepted?: number // index into answers
  pinned?: boolean
}

const QUESTIONS: SeedQuestion[] = [
  {
    by: "dev-moderator",
    communityId: "general-tech",
    title: "How to ask a good question on VForums",
    tags: ["meta", "guide"],
    hoursAgo: 400,
    views: 230,
    pinned: true,
    upvoters: ["dev-student", "dev-student-2", "dev-admin"],
    content: [
      "Good questions get answered fast. Before you post:",
      "",
      "1. **Search first.** Someone in an earlier batch may have asked it.",
      "2. **Say what you tried** and what happened instead.",
      "3. **Paste code as text**, in a fenced block with the language:",
      "",
      "```python",
      "def mean(xs):",
      "    return sum(xs) / len(xs)  # ZeroDivisionError on []",
      "```",
      "",
      "4. **Pick the right community and tags**, so the right people see it.",
      "",
      "When an answer solves your problem, mark it **accepted** so the next person finds it.",
    ].join("\n"),
  },
  {
    by: "dev-student",
    communityId: "gdg",
    title: "How should I start my hackathon journey as a first year?",
    tags: ["hackathon", "beginner", "career"],
    hoursAgo: 70,
    views: 48,
    upvoters: ["dev-student-2", "dev-moderator"],
    content:
      "I am in FE and want to take part in hackathons this semester. I know basic Python and some HTML. Where do I start, and do I need a team before I register?",
    answers: [
      {
        by: "dev-student-2",
        hoursAgo: 66,
        votes: ["dev-student", "dev-moderator"],
        content:
          "Start with a beginner-friendly one like the GDG on-campus hack. You do not need a team to register; most have a team-formation channel. Pick one problem, build the smallest demo that works, and practise a two-minute pitch.",
        replies: [
          {
            by: "dev-student",
            hoursAgo: 60,
            content: "Thanks! Is a Figma prototype enough for the demo?",
            replies: [
              {
                by: "dev-student-2",
                hoursAgo: 58,
                content:
                  "Judges prefer something clickable that runs. A Figma flow plus one working screen is a good middle ground.",
              },
            ],
          },
        ],
      },
      {
        by: "dev-moderator",
        hoursAgo: 50,
        votes: ["dev-student"],
        content:
          "GDG runs a hackathon prep session every month before a big event. Check the Events page and come to the next one.",
      },
    ],
  },
  {
    by: "dev-student-2",
    communityId: "gdg",
    title: "Why does my React useEffect run twice in development?",
    accepted: 0,
    tags: ["react", "javascript", "nextjs"],
    hoursAgo: 30,
    views: 35,
    upvoters: ["dev-student"],
    content: [
      "My fetch inside `useEffect` fires twice when I run `npm run dev`, but only once in production. Is this a bug in my code?",
      "",
      "```tsx",
      "useEffect(() => {",
      '  fetch("/api/events").then((r) => r.json()).then(setEvents)',
      "}, [])",
      "```",
    ].join("\n"),
    answers: [
      {
        by: "dev-student",
        hoursAgo: 28,
        votes: ["dev-student-2", "dev-moderator"],
        content: [
          "That is React Strict Mode. In development it mounts, unmounts and mounts again to surface effects without cleanup. Add one:",
          "",
          "```tsx",
          "useEffect(() => {",
          "  const controller = new AbortController()",
          '  fetch("/api/events", { signal: controller.signal })',
          "    .then((r) => r.json())",
          "    .then(setEvents)",
          "    .catch(() => {})",
          "  return () => controller.abort()",
          "}, [])",
          "```",
        ].join("\n"),
      },
    ],
  },
  {
    by: "dev-student",
    communityId: "acm",
    title: "Best resources to prepare for ACM ICPC regionals?",
    tags: ["dsa", "competitive-programming", "icpc"],
    hoursAgo: 120,
    views: 92,
    upvoters: ["dev-student-2", "dev-moderator", "dev-admin"],
    content:
      "Our team qualified for the online round. We have about six weeks. Which topics and problem sets give the best return in that time?",
    answers: [
      {
        by: "dev-moderator",
        hoursAgo: 110,
        votes: ["dev-student", "dev-admin"],
        content:
          "In six weeks: graphs (BFS, Dijkstra, DSU), DP on arrays and intervals, binary search on the answer, and number theory basics. Do the CSES problem set in that order and run one full mock contest every weekend as a team.",
      },
    ],
  },
  {
    by: "dev-student-2",
    communityId: "acm",
    title: "Segmentation fault when reversing a linked list in C",
    accepted: 0,
    tags: ["c", "linked-list", "debugging"],
    hoursAgo: 16,
    views: 21,
    content: [
      "This crashes on the last node. What am I missing?",
      "",
      "```c",
      "struct node *reverse(struct node *head) {",
      "  struct node *prev = NULL;",
      "  while (head->next != NULL) {",
      "    struct node *next = head->next;",
      "    head->next = prev;",
      "    prev = head;",
      "    head = next;",
      "  }",
      "  return prev;",
      "}",
      "```",
    ].join("\n"),
    answers: [
      {
        by: "dev-moderator",
        hoursAgo: 12,
        votes: ["dev-student-2"],
        content:
          "Loop on `head != NULL`, not `head->next != NULL`. Your loop stops before relinking the last node, and dereferences NULL when the list is empty.",
      },
    ],
  },
  {
    by: "dev-student",
    communityId: "cultural-club",
    title: "How do I fine-tune a small LLM on a laptop GPU?",
    tags: ["ai", "llm", "fine-tuning"],
    hoursAgo: 40,
    views: 64,
    upvoters: ["dev-student-2"],
    content:
      "I have an RTX 3050 with 4 GB VRAM. Is it realistic to fine-tune anything useful, or should I use Colab?",
    answers: [
      {
        by: "dev-student-2",
        hoursAgo: 36,
        votes: ["dev-student"],
        content:
          "Use LoRA with 4-bit quantization (QLoRA). A 1-3B parameter model fits in 4 GB with a small batch size. Colab's free T4 has 16 GB, so start there and move local once your pipeline works.",
      },
    ],
  },
  {
    by: "dev-student-2",
    communityId: "ieee",
    title: "Arduino or ESP32 for the IEEE line-follower project?",
    tags: ["embedded", "arduino", "esp32"],
    hoursAgo: 90,
    views: 27,
    content:
      "We need five IR sensors, two motors and Bluetooth for tuning. Is an Arduino Uno enough, or is the ESP32 worth the extra setup?",
    answers: [
      {
        by: "dev-student",
        hoursAgo: 85,
        content:
          "ESP32: it has Bluetooth built in and enough GPIO for five sensors without a multiplexer. Setup in the Arduino IDE takes ten minutes.",
      },
    ],
  },
  {
    by: "dev-moderator",
    communityId: "general-tech",
    title: "Is git rebase safe to use on a shared branch?",
    accepted: 0,
    tags: ["git", "version-control"],
    hoursAgo: 200,
    views: 110,
    upvoters: ["dev-student", "dev-student-2"],
    content:
      "Our project team keeps arguing about rebase versus merge. When is rebase actually dangerous?",
    answers: [
      {
        by: "dev-admin",
        hoursAgo: 190,
        votes: ["dev-moderator", "dev-student"],
        content:
          "Rebase rewrites commits. It is safe on your own branch before you push, and dangerous on any branch other people have already pulled. Rule of thumb: rebase local work, merge shared work.",
      },
    ],
  },
  {
    by: "dev-student",
    communityId: "general-tech",
    title: "Which laptop specs do I need for the TE AI/ML electives?",
    tags: ["hardware", "ai", "electives"],
    hoursAgo: 5,
    views: 6,
    content:
      "Seniors, how much RAM and GPU did you actually need for the AI/ML electives labs? Trying to decide before buying.",
  },
]

// Returns the number of comments written and the ids at this level.
async function addAnswers(
  question: DocumentReference,
  meta: { title: string; by: Uid },
  answers: Answer[],
  parent: { id: string; by: Uid } | null
): Promise<{ count: number; ids: string[] }> {
  let count = 0
  const ids: string[] = []
  for (const a of answers) {
    const ref = question.collection("comments").doc()
    const votes = a.votes ?? []
    await ref.set({
      questionId: question.id,
      parentId: parent?.id ?? null,
      content: a.content,
      author: author(a.by),
      createdAt: hoursAgo(a.hoursAgo),
      upvotes: votes.length,
      downvotes: 0,
    })
    for (const uid of votes) {
      await db
        .doc(`votes/comments/${ref.id}/${uid}`)
        .set({ voteType: "up", updatedAt: FieldValue.serverTimestamp() })
    }
    const recipients = commentRecipients({
      actorUid: a.by,
      questionAuthorUid: meta.by,
      parentAuthorUid: parent?.by,
    })
    for (const { uid, type } of recipients) {
      await db.collection(`users/${uid}/notifications`).add({
        type,
        questionId: question.id,
        questionTitle: meta.title,
        commentId: ref.id,
        actor: author(a.by),
        read: a.hoursAgo > 48,
        createdAt: hoursAgo(a.hoursAgo),
      })
    }
    ids.push(ref.id)
    count +=
      1 +
      (
        await addAnswers(question, meta, a.replies ?? [], {
          id: ref.id,
          by: a.by,
        })
      ).count
  }
  return { count, ids }
}

async function seedForum(): Promise<Map<string, string>> {
  const questionIds = new Map<string, string>()
  for (const q of QUESTIONS) {
    const ref = db.collection("questions").doc()
    const upvoters = q.upvoters ?? []
    const downvoters = q.downvoters ?? []
    const lastAnswer = Math.min(
      q.hoursAgo,
      ...(q.answers ?? []).map((a) => a.hoursAgo)
    )
    await ref.set({
      title: q.title,
      content: q.content,
      tags: q.tags,
      communityId: q.communityId,
      author: author(q.by),
      createdAt: hoursAgo(q.hoursAgo),
      lastActivityAt: hoursAgo(lastAnswer),
      upvotes: upvoters.length,
      downvotes: downvoters.length,
      views: q.views,
      replyCount: 0,
      pinned: q.pinned ?? false,
      locked: false,
    })
    for (const uid of upvoters) {
      await db.doc(`votes/questions/${ref.id}/${uid}`).set({ voteType: "up" })
    }
    for (const uid of downvoters) {
      await db.doc(`votes/questions/${ref.id}/${uid}`).set({ voteType: "down" })
    }
    const { count, ids } = await addAnswers(
      ref,
      { title: q.title, by: q.by },
      q.answers ?? [],
      null
    )
    await ref.update({
      replyCount: count,
      acceptedAnswerId: q.accepted === undefined ? null : ids[q.accepted],
    })
    questionIds.set(q.title, ref.id)
  }
  return questionIds
}

// A spam comment from an account outside the persona list, reported twice,
// so the moderation queue has something to review.
async function seedReports(questionIds: Map<string, string>) {
  const spammer = {
    uid: "dev-spammer",
    displayName: "Promo Bot",
    photoURL: null,
  }
  await auth.createUser({
    uid: spammer.uid,
    email: "promo.bot@vit.edu.in",
    password: DEV_PASSWORD,
    displayName: spammer.displayName,
    emailVerified: true,
  })
  await db.doc(`users/${spammer.uid}`).set({
    uid: spammer.uid,
    email: "promo.bot@vit.edu.in",
    displayName: spammer.displayName,
    photoURL: null,
    role: "user",
    permissions: getPermissionsForRole("user"),
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  })

  const title = "Best resources to prepare for ACM ICPC regionals?"
  const questionId = questionIds.get(title)!
  const question = db.doc(`questions/${questionId}`)
  const content =
    "Get 1000 Instagram followers for Rs 99!! DM me now, limited offer"
  const comment = question.collection("comments").doc()
  await comment.set({
    questionId,
    parentId: null,
    content,
    author: spammer,
    createdAt: hoursAgo(2),
    upvotes: 0,
    downvotes: 0,
  })
  await question.update({ replyCount: FieldValue.increment(1) })

  for (const [uid, details] of [
    ["dev-student", ""],
    ["dev-student-2", "Posted the same thing in three threads"],
  ] as const) {
    await db.doc(`reports/${questionId}_${comment.id}_${uid}`).set({
      questionId,
      commentId: comment.id,
      questionTitle: title,
      excerpt: content,
      targetAuthor: spammer,
      reason: "spam",
      details,
      reporter: author(uid),
      status: "open",
      createdAt: hoursAgo(1),
    })
  }
}

async function seedEvents() {
  const events = [
    {
      title: "Intro to Git and GitHub",
      description:
        "A hands-on workshop for first years: commits, branches, pull requests, and your first open-source contribution.",
      clubName: "GDG on Campus VIT",
      communityId: "gdg",
      dateTime: daysFromNow(4),
      rsvpLink: "https://gdg.community.dev/",
    },
    {
      title: "ICPC Mock Contest #3",
      description:
        "Three-hour team contest on the CSES-style problem set, followed by an editorial session.",
      clubName: "ACM VIT",
      communityId: "acm",
      dateTime: daysFromNow(9, 10),
      rsvpLink: "",
    },
    {
      title: "Build a Line Follower in a Day",
      description:
        "IEEE robotics workshop: sensors, PID tuning and a final race. Kits provided for teams of three.",
      clubName: "IEEE VIT",
      communityId: "ieee",
      dateTime: daysFromNow(15, 11),
      rsvpLink: "",
    },
    {
      title: "LLMs on a Budget",
      description:
        "Fine-tuning small language models with LoRA on free GPUs. Bring a laptop with a Google account.",
      clubName: "cult club",
      communityId: "cultural-club",
      dateTime: daysFromNow(-6, 15),
      rsvpLink: "",
    },
  ]
  for (const [i, e] of events.entries()) {
    await db.collection("events").add({
      ...e,
      posterImageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(e.clubName)}`,
      rsvpLink: e.rsvpLink || null,
      rsvpCount: 0,
      author: author("dev-moderator"),
      createdAt: hoursAgo(100 - i * 10),
    })
  }
}

async function main() {
  await wipe()
  await seedPeople()
  await seedReports(await seedForum())
  await seedEvents()
  console.log(
    `Seeded ${DEV_PERSONAS.length} personas, ${QUESTIONS.length} questions, 2 open reports and 4 events into ${projectId}.`
  )
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error)
    process.exit(1)
  }
)
