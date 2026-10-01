export const motionClasses = {
  fadeIn: "cg-motion-fade-in",
  slideUp: "cg-motion-slide-up",
  slideDown: "cg-motion-slide-down",
  slideLeft: "cg-motion-slide-left",
  slideRight: "cg-motion-slide-right",
  scaleIn: "cg-motion-scale-in",
  reveal: "cg-motion-reveal",
  stagger: "cg-stagger",
  mobileMenu: "cg-mobile-menu",
  toastEnter: "cg-toast-enter",
  toastExit: "cg-toast-exit",
} as const;

export type MotionClassKey = keyof typeof motionClasses;
