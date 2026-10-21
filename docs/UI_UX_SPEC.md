# vforum UI/UX specification

Source of truth for tokens: `src/app/globals.css`. vforum uses the VOSS Labs design language, the same tokens as vboard, vauth and vosslabs.org, so it reads as a sibling of those products.

## Character

Neutral canvases, flat bordered cards, one restrained orange accent. Lead with the question, its state and the next action. Sentence case everywhere. Geist for reading text, Geist Mono for identifiers, counts, tags and small labels.

## Theme

Components use semantic tokens only; no raw colours in markup.

| Token | Purpose |
| --- | --- |
| `background`, `foreground` | Paper `#fafafa` and ink `#0a0a0a` (dark: `#0a0a0a`, `#fafafa`) |
| `card`, `popover` | White surfaces (dark: `#111111`) with a 1px `border` |
| `primary` | Primary actions are ink on paper, paper on ink in dark mode |
| `secondary`, `muted`, `accent` | Supporting fills and hover states |
| `muted-foreground` | Descriptions and metadata |
| `brand`, `ring` | VOSS orange: focus, the active tab, eyebrows, the wordmark dot |
| `success`, `warning`, `destructive` | States, always with a word or icon |
| `--series-1`, `--series-2` | Chart series, slots 1 and 2 of the validated categorical palette |

Dark mode is class-based through `next-themes` and follows the system by default. Orange is emphasis, never a fill for whole cards.

## Typography, shape, spacing

- Geist and Geist Mono from `next/font`, 16px root.
- Page titles 30–36px semibold with tight tracking; the home hero up to 60px.
- Reading text 16px; metadata 14px; mono labels 11–12px uppercase with wide tracking.
- Radius 8px. Cards are flat and bordered: no shadows, gradients or hover lift.
- `.container`: full width up to 1320px, 16px gutters on mobile and 24px from 768px.
- Motion is minimal and respects `prefers-reduced-motion`.

## Shell

- Public pages (`src/app/(site)`): top navigation with Forum, Events and Communities. The current page has an orange underline and `aria-current`. Search, Ask, notifications, theme and account sit on the right; a sheet carries the same links on mobile. A plain footer closes the page.
- Workspace pages (`src/app/(workspace)`): a sidebar with Analytics, Moderation, Members and Audit log, filtered by permission. Only the longest matching destination is active.

## Shared compositions

- `PageHeader`: title, optional eyebrow and description, actions on the right.
- `Eyebrow`: mono uppercase label with the orange dot.
- `SectionHeader`: section title with a count or link, and a rule below.
- `EmptyState`: icon, title, one line of help and a relevant action. Distinguish "nothing yet" from "no matches".
- `QuestionRow`: community and state badges, title, excerpt, tags; a footer strip with author, time, and answers, votes and views in mono.
- `EventRow` and `EventCard`: a date tile with the month in orange.
- `CommunityList`: letter tiles, counts, an arrow.

## Charts

Analytics follows the dataviz method: one series takes the slot-1 hue with no legend; two series take slots 1 and 2 with a legend; lines are 2px; bars have 4px rounded data ends; grids and axes are recessive; every chart has hover tooltips and a "Show data" table.

## States and accessibility

- Cover loading (skeletons shaped like the content), empty, no-match, error and success states.
- Destructive actions use AlertDialog with an explicit verb and what will happen.
- Every input has a label; icon buttons have accessible names; keyboard focus is visible.
- Do not add controls for features that do not exist.

## Verification

Run `npm run check`. Look at the changed pages at 390px and 1280px in both themes.
