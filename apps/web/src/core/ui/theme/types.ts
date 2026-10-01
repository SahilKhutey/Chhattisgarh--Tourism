export type UITheme =
  | "default"
  | "high-contrast";

export type MotionPreference =
  | "system"
  | "reduced"
  | "full";

export type UIThemeSettings = {
  theme: UITheme;
  motion: MotionPreference;
};
