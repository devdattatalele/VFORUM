import { describe, expect, it } from "vitest"
import { commentRecipients } from "@/lib/notify"

describe("commentRecipients", () => {
  it("tells the asker about a new answer", () => {
    expect(
      commentRecipients({ actorUid: "b", questionAuthorUid: "a" })
    ).toEqual([{ uid: "a", type: "answer" }])
  })

  it("never notifies the commenter", () => {
    expect(
      commentRecipients({ actorUid: "a", questionAuthorUid: "a" })
    ).toEqual([])
    expect(
      commentRecipients({
        actorUid: "a",
        questionAuthorUid: "a",
        parentAuthorUid: "a",
      })
    ).toEqual([])
  })

  it("tells the parent author about a reply, and the asker once", () => {
    expect(
      commentRecipients({
        actorUid: "c",
        questionAuthorUid: "a",
        parentAuthorUid: "b",
      })
    ).toEqual([
      { uid: "b", type: "reply" },
      { uid: "a", type: "comment" },
    ])
    expect(
      commentRecipients({
        actorUid: "c",
        questionAuthorUid: "a",
        parentAuthorUid: "a",
      })
    ).toEqual([{ uid: "a", type: "reply" }])
  })
})
