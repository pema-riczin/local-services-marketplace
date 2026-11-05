# Design Brief

## Direction

Hearth & Ledger — a warm, trustworthy local services marketplace where editorial warmth meets clear, scannable provider cards.

## Tone

Warm editorial — deep pine green and cream paper tones replace the generic bright-teal marketplace cliché, signalling trust and local craft.

## Differentiation

Fraunces serif headings over a calm cream card grid with a warm clay rating treatment make browsing providers feel like a curated local directory, not a listings dump.

## Color Palette

| Token      | OKLCH         | Role                                    |
| ---------- | ------------- | --------------------------------------- |
| background | 0.975 0.008 85 | Warm paper canvas                      |
| foreground | 0.24 0.02 155  | Deep pine ink text                     |
| card       | 0.995 0.004 85 | Provider card / surface                |
| primary    | 0.42 0.075 162 | Trust green — CTAs, brand, active nav  |
| accent     | 0.66 0.13 55   | Warm clay — stars, highlights, badges  |
| muted      | 0.93 0.012 85  | Filter panel, secondary surfaces       |

## Typography

- Display: Fraunces — hero, page headings, provider names, brand wordmark
- Body: General Sans — paragraphs, UI labels, buttons, metadata
- Mono: Geist Mono — rates, counts, small data
- Scale: hero `text-4xl md:text-6xl font-semibold tracking-tight`, h2 `text-2xl md:text-3xl font-semibold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Warm-tinted layered shadows (`shadow-subtle` at rest, `shadow-elevated` on hover) lift cards off the cream canvas; borders are warm and low-contrast.

## Structural Zones

| Zone    | Background      | Border     | Notes                                          |
| ------- | --------------- | ---------- | ---------------------------------------------- |
| Header  | card + shadow   | border-b   | Sticky, brand left, nav + primary CTA right    |
| Content | background      | —          | Alternate `bg-muted/40` for filter/hero bands  |
| Footer  | muted/50        | border-t   | Small link columns, muted-foreground text      |

## Spacing & Rhythm

Generous section gaps (`py-16 md:py-24`), card grid gutters `gap-6`, filter panel padding `p-5`, micro-spacing `gap-2`/`gap-3` between card metadata rows.

## Component Patterns

- Buttons: `rounded-lg`, primary pine-green fill with subtle gradient, hover darken + slight lift; secondary is bordered muted
- Cards: `rounded-xl`, `bg-card`, `shadow-subtle`, hover `shadow-elevated` + `-translate-y-0.5`
- Badges: pill `rounded-full`, category uses muted/secondary; rating uses accent clay with filled stars

## Motion

- Entrance: `animate-fade-up` staggered on card grid load (0.5s, smooth ease)
- Hover: cards lift with `transition-smooth`; buttons darken and shift 1px
- Decorative: `animate-fade-in` on filter panel; no bouncy or looping motion

## Constraints

- Light mode primary; dark mode intentionally tuned, not inverted
- No purple gradients, no neon glow shadows, no arbitrary color literals
- Semantic tokens only in components — no raw hex or `bg-[#...]`
- Mobile-first responsive; provider grid collapses to single column

## Signature Detail

The warm clay star-rating row paired with a pine-green category badge on each provider card — a small, repeatable trust signal that defines the marketplace's identity.
