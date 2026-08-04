# FLEXOPS — Design System

Gym Management App | React Native | Dark Theme

Ye document poore app ka design reference hai — colors, typography, spacing, components. Jab bhi koi naya screen banayein, isi file ko reference karein taaki design consistent rahe.

---

## 1. Color Palette

### Base Colors
| Name | Hex | Usage |
|---|---|---|
| `background` | `#0D0D0D` | Main app background (sabse peeche) |
| `surface` | `#1A1A1A` | Card background, list items |
| `surfaceElevated` | `#1F1F1F` | Thoda upar uthe hue cards (modals, active states) |
| `border` | `#2A2A2A` | Card borders, dividers |

### Brand / Accent
| Name | Hex | Usage |
|---|---|---|
| `primary` (Orange) | `#FF6B00` | Buttons, active tabs, highlights, progress rings |
| `primaryDark` | `#3D2410` | Icon backgrounds (soft orange tint), badges bg |
| `primaryGradientEnd` | `#FF8C3D` | Gradient end for orange cards/buttons |

### Status / Semantic Colors
| Name | Hex | Usage |
|---|---|---|
| `success` (Green) | `#0F9D58` | Active status, revenue up, paid badges |
| `successBg` | `#0C5330` | Green icon background (Payments icon) |
| `purple` | `#8B6CFF` | AI Coach icon, Ask AI theme |
| `purpleBg` | `#2E2342` | Purple icon background |
| `error` (Red) | `#E53935` | Pending payments, inactive status, alerts |
| `warning` (Yellow) | `#F5A623` | Expiring soon, warning badges |

### Text Colors
| Name | Hex | Usage |
|---|---|---|
| `textPrimary` | `#FFFFFF` | Headings, main text |
| `textSecondary` | `#9CA3AF` | Subtext, labels, timestamps |
| `textMuted` | `#6B7280` | Disabled, placeholder text |

---

## 2. Typography

Font family suggestion: **Inter** ya **Poppins** (system default bhi chalega — SF Pro / Roboto)

| Style | Size | Weight | Usage |
|---|---|---|---|
| `h1` | 24px | Bold (700) | Screen titles ("Members", "Attendance") |
| `h2` | 20px | Bold (700) | Section headers, big numbers (178/220) |
| `h3` | 16px | SemiBold (600) | Card titles, list item names |
| `body` | 14px | Regular (400) | Normal text, descriptions |
| `caption` | 12px | Regular (400) | Timestamps, small labels |
| `button` | 14px | SemiBold (600) | Button text |

---

## 3. Spacing System

Consistent spacing scale use karo (multiples of 4):

```
xs  = 4px
sm  = 8px
md  = 16px
lg  = 24px
xl  = 32px
```

- Screen padding (left/right): `16px`
- Card padding (internal): `16px`
- Gap between cards: `12px`
- Gap between sections: `24px`

---

## 4. Border Radius

| Element | Radius |
|---|---|
| Cards | `16px` |
| Buttons | `12px` |
| Small badges/pills | `20px` (fully rounded) |
| Icon containers | `14px` |
| Bottom nav center button (FAB) | `50%` (circle) |
| Profile/avatar images | `50%` (circle) |

---

## 5. Components

### 5.1 Stat Card (Dashboard)
- Background: `surface` (#1A1A1A)
- Border radius: 16px
- Padding: 16px
- Contains: label (textSecondary) + value (h2, bold) + optional icon in colored circle

### 5.2 Primary Button
- Background: `primary` (#FF6B00) or gradient
- Text: white, bold
- Border radius: 12px
- Height: ~48px

### 5.3 Icon Circle (Quick Actions)
- Size: 48x48px
- Border radius: 14px
- Background: soft tint of the icon's color (e.g. orange icon → `#3D2410` bg)
- Icon color: full accent color (e.g. `#FF6B00`)

### 5.4 Badge / Tag
- "PREMIUM" badge: orange bg, white text, small, rounded pill, positioned top-right of cards
- "Active" badge: green bg (`#0C5330`), green text (`#0F9D58`)
- "Inactive" badge: red bg tint, red text

### 5.5 Progress Ring (Attendance)
- Circular progress, stroke width ~10-12px
- Active portion: orange (`#FF6B00`)
- Track (remaining): dark gray (`#2A2A2A`)
- Center text: big bold number + label below

### 5.6 List Item (Members / Recent Check-ins)
- Avatar (circle, 40px) on left
- Name (h3) + subtext (caption, textSecondary)
- Right side: status badge or timestamp

### 5.7 Bottom Navigation Bar
- Background: `surface` (#1A1A1A), slightly elevated with border-top
- 5 items: Home, Attendance, **[+] Center FAB (orange circle, elevated)**, Videos, Profile
- Active tab: orange icon + orange label
- Inactive tab: gray icon + gray label

### 5.8 Drawer / Sidebar Menu
- Background: `background` (#0D0D0D)
- Sections with uppercase small gray headers (MAIN, MEMBERS, BUSINESS, STAFF, INSIGHTS)
- Active menu item: orange left-border indicator + orange text + subtle bg highlight
- Bottom: Dark Mode toggle + Log out

---

## 6. Screens List (from design reference)

1. **Drawer/Sidebar Menu** — navigation
2. **Overview/Dashboard** — attendance %, revenue, quick actions, recent members
3. **Exercises List** — category filter tabs, exercise cards with premium lock
4. **Exercise Detail** — video, target muscles, equipment, unlock CTA
5. **Attendance** — circular progress, scan QR/manual/search, recent check-ins
6. **Members** — search, filter tabs (All/Active/Inactive), member list
7. **Plans** — plan cards (Premium/Gold) with pricing & features
8. **Payments** — collection summary, All/Paid/Pending tabs, transaction list
9. **Ask AI** — chatbot interface, suggested prompt chips, chat input

**Bottom Nav (consistent across main screens):** Home · Attendance · [+ Videos/Add FAB] · Videos · Profile

---

## 7. React Native — Theme File Reference

Jab code likhna shuru karein, is structure me `src/theme/colors.ts` banayenge:

```ts
export const colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#1F1F1F',
  border: '#2A2A2A',

  primary: '#FF6B00',
  primaryDark: '#3D2410',
  primaryGradientEnd: '#FF8C3D',

  success: '#0F9D58',
  successBg: '#0C5330',
  purple: '#8B6CFF',
  purpleBg: '#2E2342',
  error: '#E53935',
  warning: '#F5A623',

  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  card: 16,
  button: 12,
  pill: 20,
  icon: 14,
};
```

---

## Notes
- Colors above extracted directly from the reference design screenshots (approximate, close match).
- Mobile-first — sab spacing/sizing phone screens (360-430px width) ke hisaab se hai.
- Design ekdum consistent rakhna hai — koi bhi naya screen banate waqt yahi colors/spacing/radius use karna, alag se hardcode mat karna.