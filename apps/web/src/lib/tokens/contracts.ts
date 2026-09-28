/**
 * CG Tourism OS — Design System & Accessibility Contracts
 * Enforces strict typing across all canonical UI components.
 */

import { TemplateFieldType } from '@cg-tourism/types';

export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emergency';

export interface AccessibilityAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'dialog' | 'menu';
  role?: string;
  tabIndex?: number;
}

export type SupportedLocale = 'en' | 'hi' | 'cg';

export interface TrilingualContent {
  en: string;
  hi: string;
  cg: string;
}

export type TourismDivision =
  | 'Bastar'
  | 'Durg'
  | 'Raipur'
  | 'Bilaspur'
  | 'Surguja';

export interface GeographicCorridorReference {
  division: TourismDivision;
  districtId: string;
  districtName: string;
  zone?: string;
  circuitId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DynamicSectionRenderContract {
  id: string;
  fieldType: TemplateFieldType;
  label: string;
  value: unknown;
  translatable: boolean;
  order: number;
  isVisible: boolean;
  accessibilityHint?: string;
}
