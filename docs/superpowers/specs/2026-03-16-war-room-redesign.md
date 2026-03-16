# War Room Visual Redesign — Design Spec

**Goal:** Retheme the Ragnarok Pairing Console from its current dark-gold aesthetic to an aggressive "War Room" command bunker visual identity, improving visual hierarchy, consistency, and mobile usability.

**Scope:** Visual/CSS-only changes to `src/App.jsx`. No functional changes. All existing features, screens, and data flows remain identical.

---

## Design System

### Colour Palette

```
Background:
  --bg:          #0a0806    (page background)
  --surf:        #0e0c0a    (surface/card background)
  --bord:        #1e1814    (borders, dividers)
  --bord-light:  #2a2218    (hover/lighter borders)

Primary accent (Hot Amber):
  --amber:       #c88838    (buttons, progress, active states, our team)
  --amber-dim:   #a87830    (section labels, divider text — AA compliant)
  --amber-glow:  rgba(200,136,56,0.06)  (radial glow on page headers)

Secondary accent (Slate):
  --slate:       #7888a0    (opponent/info elements, secondary highlights)
  --slate-dim:   #506070    (slate borders)

Text:
  --white:       #e8dcd0    (headings, primary text)
  --text:        #b0a898    (body text)
  --dim:         #908878    (secondary text, factions, metadata — AA compliant)

Semantic:
  --green:       #60a830    (win borders)
  --green-fg:    #80d040    (win text/values)
  --green-bg:    #0d1a08    (win badge background)
  --red:         #a83030    (loss borders)
  --red-fg:      #e04848    (loss text/values)
  --red-bg:      #1a0808    (loss badge background)
  --blue:        #5090d0    (balanced/W rating)
  --blue-bg:     #081420    (balanced badge background)
  --purple:      #9070b0    (player skill rating)
  --purple-bg:   #140e1c    (player skill badge background)
```

### Typography

**Fonts (Google Fonts):**
- **Chakra Petch** (400, 500, 600, 700) — headings, labels, buttons, nav title, tags
- **Source Code Pro** (400, 500, 600, 700) — body text, data, scores, badges, inputs

**Scale:**
- Page heading: 22-24px, weight 700, Chakra Petch
- Section heading: 18px, weight 700, Chakra Petch
- Nav title: 14px, weight 700, Chakra Petch
- Labels/tags: 12px, letter-spacing 2-3px, uppercase, Chakra Petch
- Body text: 13-14px, Source Code Pro
- Data values (scores, GP): 14-22px, weight 700, Source Code Pro
- Badges: 12px, weight 700, Source Code Pro
- Minimum font size: 12px (WCAG AA)

### Layout Patterns

**Left-border accents (replaces full borders):**
All cards, rows, and interactive elements use a 3px left border instead of a full border:
- Default: `border-left: 3px solid var(--bord)`
- Hover: `border-left-color: var(--amber)` or `var(--slate)`
- Selected: `border-left-color: var(--amber); background: rgba(200,136,56,0.04)`
- Win/complete: `border-left-color: var(--green)`
- Active/current: `border-left-color: var(--amber)`
- Loss: `border-left-color: var(--red)`

**Surface cards:**
- Background: `var(--surf)` (#0e0c0a)
- No border-radius (sharp corners)
- Sits on page background `var(--bg)` (#0a0806)

**Radial glow:**
- Applied to page-level containers: `background-image: radial-gradient(ellipse at 50% -20%, var(--amber-glow) 0%, transparent 50%)`

**Segmented progress bar (replaces smooth bar):**
```html
<div style="display:flex;gap:3px">
  <div style="flex:1;height:4px;background:var(--amber)"></div>  <!-- done -->
  <div style="flex:1;height:4px;background:var(--amber);opacity:0.5;animation:pulse 2s infinite"></div>  <!-- active -->
  <div style="flex:1;height:4px;background:var(--bord)"></div>  <!-- pending -->
</div>
```

### Component Changes

**Badge:**
- Remove: full background fill
- Add: 2px left border, coloured by rating tier
- Background: subtle tinted background per tier
- Font: Source Code Pro 12px 700

Rating tier colours:
```
W++: bg #0d2a10, fg #60c030, border #40a020
W+:  bg #0d2a10, fg #50b030, border #308018
W:   bg #081420, fg #5090d0, border #305880
W-:  bg #1a1408, fg #b09030, border #806020
PS:  bg #140e1c, fg #9070b0, border #604080
?:   bg #141210, fg #807868, border #4a4438
L-:  bg #1a1008, fg #c08040, border #805020
L:   bg #1a0808, fg #e04848, border #802020
L+:  bg #200808, fg #f04040, border #a01818
```

**Buttons:**
- Primary (filled): `background: var(--amber); color: var(--bg); font-weight: 800`
- Ghost (outline): `border: 1px solid var(--bord); color: var(--amber); font-weight: 600`
- Ghost hover: `border-color: var(--amber-dim)`
- Font: Chakra Petch 12px, letter-spacing 2px, uppercase
- Padding: sm 12px 16px, regular 14px 22px
- Min tap target: 44px height

**Nav bar:**
- Background: `var(--bg)`
- Bottom border: `1px solid var(--bord)`
- Height: 52px
- Title: Chakra Petch 14px 700, colour `var(--amber)`

**Dividers:**
- Horizontal line: `1px solid var(--bord)`
- Label: Chakra Petch 12px, letter-spacing 3px, uppercase, colour `var(--amber-dim)`

**Inputs/Selects:**
- Background: #0c0a08 (slightly darker than surface)
- Border: `1px solid var(--bord)`
- Padding: 12px
- Font: Source Code Pro 14px
- Min height: 48px (selects)

**Stat cards:**
- Left-border accent (green for record, amber for GP)
- Background: `var(--surf)`
- Label: Chakra Petch 12px uppercase, colour `var(--dim)`
- Value: Source Code Pro 20-22px 700

**Player rows:**
- Left-border accent (default: `var(--bord)`, hover: `var(--amber)`)
- Background: `var(--surf)`
- Name: Chakra Petch 13px 600 white
- Faction: Source Code Pro 12px dim italic
- GP value: Source Code Pro 14px 700 amber

**Round rows:**
- Left-border accent: green (complete), amber (active), bord (pending)
- Round number: Source Code Pro 12px dim, zero-padded (01, 02...)
- Opponent name: Chakra Petch 13px white
- Score: Source Code Pro 14px 700, coloured by result
- Result letter: Chakra Petch 12px 700

**Opponent cards:**
- Left-border accent (default: `var(--bord)`, hover: `var(--slate)`)
- Name: Chakra Petch 14px 700 white
- Factions: Source Code Pro 12px dim italic, comma-separated

### Screens Affected

All screens receive the theme update. No layout changes — only colours, fonts, borders, and the patterns described above. Specifically:

1. **EventList** — surface cards with left borders, segmented grouping
2. **EventSetup** — form inputs with new styling
3. **Home (event dashboard)** — stat cards, player rows, opponent grid, round rows, progress bar
4. **Setup (opponent editor)** — form styling
5. **Matchup** — table styling, badge updates
6. **Pairing** — left-bordered main panel, sidebar styling, step bar
7. **Ratings** — player tabs, faction list
8. **Definitions** — rating tier cards
9. **EditOurTeam** — form styling
10. **ManageFactions** — list styling
11. **RoundView** — score entry, confirmation, suggestions
12. **RoundPicker** — round rows
13. **ScoringTableEditor** — table rows
14. **NavBar** — colours and font
15. **Burger menu** — section labels, item styling

### Accessibility

- All text colours meet WCAG AA 4.5:1 minimum contrast on their respective backgrounds
- Minimum font size: 12px throughout
- Minimum tap target: 44x44px for all interactive elements
- Button font-weight: 800 (primary) / 600 (ghost) for legibility on coloured backgrounds
