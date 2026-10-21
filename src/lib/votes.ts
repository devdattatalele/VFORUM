export type VoteType = "up" | "down" | "none"

// Counter changes when one user's vote moves from `current` to `next`.
export function voteDelta(current: VoteType, next: VoteType) {
  return {
    up: (next === "up" ? 1 : 0) - (current === "up" ? 1 : 0),
    down: (next === "down" ? 1 : 0) - (current === "down" ? 1 : 0),
  }
}
