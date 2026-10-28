# Design

Taskboard is a team's wall of index cards. Work moves left to right through three lanes. People check it between tasks: on a laptop to plan, on a phone to update status on the go. The interface's job is to show what is moving and make handing off work fast.

Both clients share the tokens and vocabulary below. Platform conventions decide the rest. Web follows desktop patterns. Mobile is **iOS first** and should feel native on an iPhone.

## Direction

- **Index cards on a wall.** The background is a cool grey wall. Cards are flat white paper with a thick status-coloured top edge, like a coloured index card tab.
- **Status colour is the one bold element.** The same three hues mark lanes, card edges, pills and the iOS segmented control. Everything else stays quiet: no gradients, no decorative shadows, no filler labels.
- **Hierarchy through radius and weight, not boxes.** Pills are fully rounded, cards 10px, inputs 8px, sheets and dialogs 16px. A shadow appears only on a card being dragged or on an open sheet.
- Rejected defaults: the SaaS card kit (identical cards with soft shadows), teal + orange, all-caps eyebrow labels, monospace meta labels, arrows appended to buttons.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| `wall` | `#EEF1F5` | App background, lane background |
| `paper` | `#FFFFFF` | Cards, inputs, sheets |
| `ink` | `#1C2433` | Primary text, headings |
| `graphite` | `#5B6475` | Secondary text, icons (5.9:1 on paper) |
| `line` | `#D8DDE5` | Borders, dividers |
| `cobalt` | `#2D5BDA` | Primary buttons, links, focus ring, selected tab |
| `brick` | `#C2362B` | Destructive actions, field errors |

Status hues: the edge colour marks card tops and lane dots. The pill uses tint background + text colour.

| Status | Label | Edge | Pill background | Pill text |
| --- | --- | --- | --- | --- |
| `TODO` | To do | `#64748B` | `#EEF1F5` | `#3F4A5C` |
| `IN_PROGRESS` | In progress | `#E09A1A` | `#FDF1DC` | `#7A4B00` |
| `DONE` | Done | `#2E7D4F` | `#E3F2E8` | `#1F5C39` |

Text contrast is ≥ 4.5:1 everywhere. Never use status colour alone: always pair it with the label.

## Type

- **Web:** Plus Jakarta Sans via `next/font/google`, one family. Weights 400, 600, 700.
- **iOS:** the system font (SF Pro), Flutter's default on iOS. Native type beats a bundled font on a phone, and it costs nothing.

| Role | Web | Mobile |
| --- | --- | --- |
| Page title | 28px / 700 / -0.01em | Large title (`SliverAppBar.large`) |
| Section | 18px / 600 | `titleMedium` |
| Card title | 15px / 600 | `titleSmall` / 600 |
| Body | 15px / 1.5 | `bodyMedium` |
| Meta | 13px, `graphite` | `bodySmall`, `graphite` |

Sentence case everywhere. Lines stay under 80 characters.

## Layout

**Web** (left aligned, 16px base spacing, 8px grid)

```
┌──────────────────────────────────────────────────────────┐
│ Taskboard   Boards  My tasks                 AS  Sign out │
├──────────────────────────────────────────────────────────┤
│ Website relaunch                       Rename  Delete     │
│ Owned by Alice Santos · 3 open                            │
│ ┌─To do (2)─────┐ ┌─In progress (1)┐ ┌─Done (1)────────┐  │
│ │▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │ │▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │ │▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │  │
│ │ Card title    │ │ Card title     │ │ Card title      │  │
│ │ BR  Move ▾    │ │ AS  Move ▾     │ │ CC  Move ▾      │  │
│ │ + Add task    │ │                │ │                 │  │
│ └───────────────┘ └────────────────┘ └─────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

- Boards: responsive grid of board tiles (name, owner, open-task count). "New board" sits top right.
- Board: 3 lanes side by side at ≥ 1024px. Narrower, lanes scroll horizontally with snap, each 85vw. Cards drag between lanes (native HTML5 drag and drop). Each card also has a "Move" menu for keyboard and touch users.
- Task detail: main column (title, description, comments) plus a side panel (status, assignee, board link, dates, delete). Stacks below 768px.
- My tasks: grouped by status, one row per task with board name.

**iOS**

```
┌───────────────────────┐      ┌───────────────────────┐
│ Boards           AS ⊕ │      │ ‹ Boards           ⊕  │
│                       │      │ Website relaunch      │
│ ┌───────────────────┐ │      │ [To do 2|In prog 1|…] │
│ │Website relaunch   │ │      │ ┌───────────────────┐ │
│ │Alice · 3 open     │ │      │ │▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ │
│ └───────────────────┘ │      │ │Card title     ⋯   │ │
│                       │      │ │BR                 │ │
├───────────────────────┤      │ └───────────────────┘ │
│  ▣ Boards   ☰ My tasks│      ├───────────────────────┤
└───────────────────────┘      └───────────────────────┘
```

- Bottom tab bar with two tabs: Boards and My tasks (`StatefulShellRoute`, each tab keeps its own stack).
- Large titles that collapse on scroll. Edge swipe to go back (Cupertino page transitions).
- Board: a sliding segmented control picks the lane, with counts. Below it, a list of index cards. Tapping a card opens Task detail. The "⋯" button or a swipe opens an action sheet: Move to In progress, Move to Done, and so on.
- Create and edit forms open in a modal bottom sheet with a drag handle. Destructive confirmations use an action sheet with a red action.
- Respect safe areas. Touch targets are ≥ 44pt. Status changes give haptic selection feedback.
- Sign out lives in an action sheet behind the avatar button on the Boards tab.

## Shared components

| Concept | Web | Mobile |
| --- | --- | --- |
| Button (primary, secondary, danger, ghost) | `Button` | `FilledButton` / `TextButton` themed |
| Text field with label and error | `Input`, `Textarea` | `TextFormField` themed |
| Select | `Select` | Action sheet or `DropdownMenu` |
| Status pill | `StatusPill` | `StatusPill` |
| Avatar (initials) | `Avatar` | `Avatar` |
| Index card | `TaskCard` | `TaskCard` |
| Dialog / sheet | `Modal` (`<dialog>`) | modal bottom sheet |
| Empty and error states | `EmptyState`, `ErrorState` | `EmptyState`, `ErrorState` |
| Toast | `Toast` | `SnackBar` |

## Motion

- Default 150 ms ease-out for colour and opacity. Respect `prefers-reduced-motion` and the iOS Reduce Motion setting.
- Motion only answers user actions: a card lifting while dragged, a sheet sliding up, a toast arriving. No entrance animations.

## Copy

Each action keeps one name across the whole flow:

| Action | Button | Confirmation / toast |
| --- | --- | --- |
| Create board | New board, then Create board | Board created |
| Rename board | Rename, then Save name | Board renamed |
| Delete board | Delete board | Delete "Name" and its tasks? Then Board deleted |
| Add task | Add task | Task added |
| Change status | Move to In progress | Moved to In progress |
| Edit task | Save changes | Changes saved |
| Comment | Post comment | (comment appears) |
| Assignment arrives | n/a | Alice assigned you "Title" |

Empty states invite action: "No boards yet. Create one to start planning." and "Nothing is assigned to you right now."

Errors say what happened and what to do: "Couldn't move the task. Check your connection and try again."
