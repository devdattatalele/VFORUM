# vforum — Future / Deferred

Things intentionally out of the current phases. Don't add until the trigger condition is met.

## Features

- Image and file attachments on questions — when text and links prove insufficient; needs Firebase Storage or R2 and a moderation story.
- Full-text search (Algolia, Typesense, or Postgres tsvector after phase 3) — when the substring filter over the latest 50 questions misses results people ask about.
- Reputation and badges — after accepted answers and profiles exist and there is enough activity for them to mean something.
- @mentions — after notifications ship.
- Bookmarks — when asked for.
- Email digests — when notifications exist and weekly active users justify it.
- Mentorship matching, a mobile app, integrations with VIT academic systems (from the old roadmap) — revisit only with a concrete user need.

## Platform

- Rate limiting and spam detection on posting — when the first spam wave arrives; until then moderators delete.
- Soft delete with retention instead of hard delete — when a moderation dispute needs an audit.
- AI answer drafts — only once the forum has enough real answers to be grounded in.

## Ops

- Custom domain (vforum.vosslabs.org) — with the phase 2 client registration.
- A separate Firebase project for preview deployments — when enough contributors share the preview backend for it to be a problem.
