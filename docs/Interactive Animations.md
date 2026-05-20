# CG Tourism Platform — Interactive Animation & Motion System
## Cinematic Transitions, Gesture Guidelines & Spring System Specifications

---

## 1. Motion Design Philosophy
Motion on the **CG Tourism Platform** should feel organic and natural, like the slow flow of water or shifting forest fog. Animations serve to reduce cognitive load, guide visual focus, and announce system updates without slowing down low-end mobile hardware.

---

## 2. Motion Presets & Transition Timings

To ensure a cohesive interface feel, developers must restrict animations to the following standardized timing configurations:

| Interaction Event | Target Duration | Easing Function | UX Purpose |
| :--- | :--- | :--- | :--- |
| **Fast Feedback** | `150ms` | `bezier(0.4, 0.0, 0.2, 1)` | Tactile button presses, micro-checkbox clicks. |
| **Standard Slide** | `250ms` | `bezier(0.25, 0.8, 0.25, 1)`| Sliding navigation sidebars, bottom sheets rising. |
| **Cinematic Expand** | `400ms` | `bezier(0.16, 1, 0.3, 1)` | Expanding travel details, hero banner transitions. |
| **SOS Signal Pulse** | `2000ms` (Loop) | `linear` | Continuous alerts on emergency navigation overlays. |

---

## 3. Production Framer Motion Presets

Here are the concrete configuration blueprints for web animations using `framer-motion`:

### A. Spring Card Hover Transition
```typescript
export const springCardPreset = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.015, 
    y: -4,
    transition: { 
      type: "spring", 
      stiffness: 260, 
      damping: 20 
    } 
  },
  tap: { scale: 0.99 }
};
```

### B. List Stagger Container Transition
```typescript
export const listContainerPreset = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const listItemPreset = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 200, 
      damping: 24 
    } 
  }
};
```

### C. Collapsible Drawer Panel Transition
```typescript
export const collapsibleDrawerPreset = {
  closed: { 
    height: 0, 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: "easeInOut" 
    } 
  },
  open: { 
    height: "auto", 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 220, 
      damping: 25 
    } 
  }
};
```

---

## 4. Gesture Guidelines (Mobile Core Interactions)
- **Pull-To-Refresh Sync:** Pulled headers display a rotating tribal gear loop. Releasing triggers a haptic buzz and starts sync updates.
- **Pinch-To-Zoom Maps:** Zoom maps dynamically based on pinch velocity.
- **Swipe-To-Dismiss bottom-sheets:** Enable dragging bottom sheets downward. A swipe velocity exceeding `0.5m/s` triggers slide-out dismissals.

---

## 5. Accessibility-Aware Reduced Motion Controls
When the visitor's device announces `prefers-reduced-motion` settings, the interactive shell automatically overrides active spring variables:
*   **Parallax & Cinematic Zoom:** Instantly disabled.
*   **Spring Expansions:** Converted to simple, hardware-friendly linear opacity fades (`duration: 0.15s`).
