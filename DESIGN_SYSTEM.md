# Dreamland — Design System Reference

> This document captures the complete visual identity, color system, typography, and component design language of the Dreamland Hotels app. Use it to maintain a consistent look and feel when building the mobile application.

---

## Design Vibe

**Luxury dark hospitality.** The UI feels like a high-end hotel lobby at night — deep forest greens, warm gold accents, cream text, and rich shadows. It is sophisticated, calm, and premium without being flashy. Every surface is dark; gold is used sparingly as the single accent color to create focus and elegance. There is no white in the palette.

Key personality words: **luxury · dark · warm · minimal · premium · trustworthy**

---

## Color Palette

All colors are semantic tokens. Use these names consistently.

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0a1f13` | Page / screen background (darkest green) |
| `surface` | `#122b1a` | Elevated surfaces — sidebars, modals, bottom sheets |
| `card` | `#163220` | Cards, list items, input backgrounds |
| `border` | `#1e4a2a` | All borders and dividers |
| `gold` | `#c9a84c` | Primary accent — buttons, active states, headings, icons |
| `gold-light` | `#e2c070` | Hover state for gold elements |
| `gold-dark` | `#a8882a` | Pressed / active gold; scrollbar hover |
| `text` | `#f0ead6` | Primary body text (warm cream, not pure white) |
| `muted` | `#7a9e86` | Secondary text, placeholders, labels, inactive icons |
| `error` | `#e05555` | Destructive actions, validation errors |
| `success` | `#4caf7d` | Confirmations, completed states |
| `warning` | `#e8a83a` | Draft / partial / in-progress states |

### Layering Model
Screens are built in distinct depth layers, lightest on top:
```
bg (#0a1f13)  ← screen background
  └── surface (#122b1a)  ← sidebars, sheets, modals
        └── card (#163220)  ← cards, list items
              └── border (#1e4a2a)  ← separators inside cards
```

---

## Typography

Two typefaces only. Never mix in a third.

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Display / Brand** | Playfair Display (serif) | 600–700 | Hotel names, screen titles, logo text, section headings |
| **UI / Body** | Inter (sans-serif) | 400–500 | All body copy, labels, inputs, buttons, captions |

### Type Scale (mobile-adapted)
| Style | Font | Size | Weight | Color |
|-------|------|------|--------|-------|
| Screen title | Playfair Display | 28–32sp | Bold (700) | `text` |
| Section heading | Playfair Display | 20–24sp | SemiBold (600) | `text` |
| Card title | Playfair Display | 16–18sp | SemiBold (600) | `gold` |
| Body | Inter | 14sp | Regular (400) | `text` |
| Label / Caption | Inter | 11–12sp | Medium (500) | `muted`, uppercase + wide letter-spacing |
| Hint / Subtext | Inter | 12sp | Regular (400) | `muted` |
| Button text | Inter | 13–14sp | Medium (500) | depends on variant |

**Labels** (form field labels, section sub-labels) are always **uppercase + wide letter-spacing** in `muted` color.

---

## Spacing & Shape

| Property | Value | Notes |
|----------|-------|-------|
| Base unit | 4dp | All spacing in multiples of 4 |
| Screen padding | 24dp | Horizontal padding on all screens |
| Card padding | 20dp | Internal padding inside cards |
| Card radius | 16dp (rounded-2xl) | Cards, modals, bottom sheets |
| Input radius | 8dp (rounded-lg) | Text inputs, dropdowns |
| Pill radius | 999dp (rounded-full) | Badges, tags, toggle pills |
| Small element radius | 12dp (rounded-xl) | Icon containers, small cards, nav items |
| List item gap | 8–12dp | Between cards in a list |
| Section gap | 16dp | Between sections on a screen |

---

## Shadows & Elevation

Shadows are heavy and dark — they reinforce depth on the dark background.

| Level | Value | Usage |
|-------|-------|-------|
| Card shadow | `0 4px 24px rgba(0,0,0,0.5)` | Floating cards |
| Dialog shadow | `0 8px 48px rgba(0,0,0,0.7)` | Modals, bottom sheets |
| Gold glow | `0 0 16px rgba(201,168,76,0.25)` | Active / focused gold elements |

On mobile, bottom sheets and modals should have the dialog shadow.

---

## Component Patterns

### Buttons

Four variants — primary is always gold-filled.

| Variant | Background | Text | Border | Hover/Press |
|---------|-----------|------|--------|-------------|
| **Primary** | `gold` | `bg` (dark green) | — | lighten to `gold-light`; gold glow shadow |
| **Outline** | transparent | `gold` | `gold` | fill with `gold`, text becomes `bg` |
| **Ghost** | transparent | `muted` | — | bg becomes `card`, text becomes `text` |
| **Danger** | `error` | white | — | darken red |

Sizes: sm (12sp, 12/6dp padding), md (14sp, 16/10dp padding), lg (16sp, 24/12dp padding).  
Border radius: 8dp on all buttons.  
Loading state: spinner replaces or precedes the label.  
Disabled state: 50% opacity, non-interactive cursor.

### Input Fields

```
Label      ← uppercase, 11sp, muted, wide tracking
┌─────────────────────────────────┐
│ Placeholder or value text        │  ← surface bg, border color border
└─────────────────────────────────┘
  Hint text (optional)             ← 12sp muted
  Error text (if invalid)          ← 12sp error color
```

- Background: `surface`
- Border: `border` at rest → `gold` on focus (+ 1dp gold ring)
- Text: `text`; placeholder: `muted`
- Border radius: 8dp
- Padding: 12dp horizontal, 10dp vertical
- Error state: border and ring turn `error`

### Badges / Status Pills

Pill-shaped tags (border-radius: 999dp), 10–11sp Medium, always have a background tint + matching border.

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `active` / `complete` | success/20% | `success` | success/30% |
| `inactive` / `error` | error/20% | `error` | error/30% |
| `draft` / `partial` / `warning` | warning/20% | `warning` | warning/30% |
| `gold` | gold/20% | `gold` | gold/30% |
| `default` / `empty` | border/50% | `muted` | `border` |

### Cards / Section Cards

```
┌──────────────────────────────────┐  ← border: border color, radius: 16dp
│  [Icon 36×36]  Title             │  ← card background
│  [container]   Subtitle/muted    │
│                                  │
│  [Badge]              [Status]   │
└──────────────────────────────────┘
```

- Background: `card`
- Border: `border` at rest → `gold` on hover/press
- On hover/press: also apply gold glow shadow
- Icon container: 36×36dp, radius 12dp, background `gold/10%`, border `gold/20%`
- Icon color: `gold`

### Toggle / Switch

```
OFF:  [────●      ]   ← border color background
ON:   [      ●────]   ← gold background
```

- Track: 44×24dp, radius 999dp
- Thumb: 20×20dp white circle, 2dp inset
- Off color: `border`; On color: `gold`
- Animate translate with 200ms ease

### Navigation (Sidebar / Bottom Nav on mobile)

Active item:
- Background: `card`
- Border: `border` (1dp, all sides or left highlight on mobile)
- Text + icon: `gold`

Inactive item:
- Background: transparent
- Text: `text`; icon: `muted`
- On hover/press: background `card`, text+icon `gold`

Item padding: 12dp vertical, 16dp horizontal. Radius: 12dp.

---

## Overlay / Modal / Bottom Sheet

- Backdrop: `rgba(0,0,0,0.70)` + blur (4–8dp backdrop-filter blur)
- Sheet background: `surface`
- Sheet border: `border` (top edge or all sides)
- Sheet radius: 24dp top corners (bottom sheet) or 16dp (centered modal)
- Max height: 90% of screen height with internal scroll

---

## Status & Feedback

| State | Color | Pattern |
|-------|-------|---------|
| Loading | `gold` | Spinning ring indicator |
| Success toast | `success` | Brief snackbar/toast, bottom of screen |
| Error toast | `error` | Brief snackbar/toast |
| Empty state | `muted` | Centered icon (32–40dp, `border` color) + italic caption |
| Saving indicator | `muted` | Small spinner + "Saving…" text inline |

---

## Iconography

- Icon library: **Lucide** (or equivalent — clean, 1.5dp stroke, rounded caps)
- Default icon color: `muted`
- Active / accent icon color: `gold`
- Destructive icon color: `error`
- Icon sizes: 16dp (inline), 18dp (nav), 20dp (section headers), 24–32dp (empty states)

---

## Brand Identity

- **App name:** Dreamland
- **Tagline:** Premium Hospitality
- **Logo:** `dreamland-logo.png` — displayed at ~80dp wide, white/gold tones
- **Brand sentence:** Below the logo in the sidebar/header — "Dreamland" in Playfair Display gold, "Admin Panel" in Inter muted uppercase beneath it.

---

## Do's and Don'ts

| Do | Don't |
|----|-------|
| Use gold only for primary actions and active states | Overuse gold — it loses meaning |
| Keep backgrounds in the green-black family | Use pure black (`#000`) or grey backgrounds |
| Use Playfair Display for titles and hotel names | Use Playfair for body text or small labels |
| Use `muted` for secondary text and labels | Use `text` color for everything |
| Apply the gold glow shadow on focused/active elements | Add colored shadows in non-interactive states |
| Use cream (`text` = `#f0ead6`) for primary text | Use pure white (`#fff`) for text |
| Keep border radius generous (8–16dp) | Use sharp corners (0dp radius) |
