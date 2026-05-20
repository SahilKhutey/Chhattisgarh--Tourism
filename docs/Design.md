# CG Tourism Platform — Design System & UX Architecture
## UX4G Guidelines, Nature-Inspired Visual Palettes & Cultural Sensitivity

---

## 1. Design Philosophy
The **CG Tourism Platform** fuses cinematic visual discovery with government-grade reliability (inspired by India’s **UX4G** initiatives). It operates as an immersive exploration experience that values local tribal consent, ecological limits, and total accessibility for all citizens.

---

## 2. UX4G Design Principles (Government-Grade Visual Trust)
To ensure the ecosystem is usable by citizens of all digital literacy levels, the visual layouts adhere to strict UX4G rules:

1. **Clear Trust Signals:** Official state seals, verified creator tags, and clean, uncrowded layouts communicate safety and credibility.
2. **Predictable Navigation Hierarchies:** Avoid chaotic commercial booking patterns. Focus instead on structured cards, clear callouts, and clean reading hierarchies.
3. **Optimized Form Conversions:** Form elements feature clear, high-contrast labels, helper descriptions, and input constraints to prevent user errors.

---

## 3. Brand Identity & Interactive Color Tokens

Below are the production design system variables defined in `HSL` and hex codes for implementation in CSS/Tailwind:

```css
:root {
  /* 1. Brand Nature-Inspired Color Tokens */
  --color-forest-emerald: 145 52% 16%;  /* #133C24 - Deep rich forest foliage */
  --color-tribal-terracotta: 18 69% 46%; /* #C34A21 - Ancient red soil & handcrafted pottery */
  --color-river-blue: 202 75% 35%;       /* #165E8C - Deep, flowing river corridors */
  --color-earth-brown: 28 32% 12%;       /* #271E18 - Raw soil and ancient cave walls */
  --color-warm-sand: 43 45% 94%;         /* #F6F2EB - Premium soft canvas cards */
  --color-charcoal-stone: 210 14% 19%;   /* #282F35 - High contrast reading gray */

  /* 2. Interactive Accent Tokens */
  --color-sunset-orange: 24 92% 52%;     /* #F26A1D - Primary Call-To-Action buttons */
  --color-eco-green: 138 65% 38%;        /* #22A04A - Low-footprint sustainable trails */
  --color-warning-amber: 38 92% 50%;     /* #EAA212 - Local flash flood/road alerts */
  --color-emergency-red: 354 85% 48%;    /* #DF1A2E - High priority SOS telemetry triggers */

  /* 3. Radius & Spacing Tokens */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 28px;
}
```

---

## 4. Typography System Specification

To accommodate regional multilingual compatibility (Hindi, English, Halbi, Gondi), typography remains highly readable and scales gracefully:

| Typography Level | Font Size (rem) | Line Height | Font Weight | Implementation Target |
| :--- | :--- | :--- | :--- | :--- |
| **Heading XL** | `2.50rem` | `1.20` | `800` (Bold) | Main Hero Titles & Welcome banners |
| **Heading L** | `1.75rem` | `1.25` | `700` (Semi-Bold) | Explorer Categories & District lists |
| **Heading M** | `1.25rem` | `1.30` | `600` (Medium) | Destination Cards & Dialog headers |
| **Body Regular** | `1.00rem` | `1.50` | `400` (Regular) | Story descriptions & local insights |
| **Caption** | `0.85rem` | `1.40` | `500` (Medium) | Metadata, Map coordinates, Gear lists |

---

## 5. Responsive Layout Breakpoints

The platform uses a fluid, grid-based layout structure optimized for diverse mobile viewports and standard web displays:

```
[ Mobile Devices ] ──── (360px to 480px) ───── Single-column scrolling, persistent bottom-action tabs
[ Tablet Devices ] ──── (768px to 1024px) ──── Two-column grid, sliding sidebar filters panel
[ Desktop Screens ] ─── (1200px to 1440px) ─── Three-column maps-side layout, sticky information widgets
```

---

## 6. Cultural Sensitivity & Respect Guidelines
*   **Respect Tribal Sovereignty:** Commercial advertising overlays are strictly prohibited. Cultural visual storytelling must use authentic photography and approved tribal textures.
*   **Prevent Intrusion:** Map markers inside protected tribal zones are marked as "Guided Footpath Only" to prevent tourists from driving vehicles into eco-sensitive habitats.
