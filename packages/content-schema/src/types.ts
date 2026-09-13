import { FieldType } from './field-types';

export interface TemplateFieldDefinition {
  id: string;
  key: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  order: number;
  options?: Record<string, unknown> | null;
  translatable: boolean;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ContentEntryData {
  [key: string]: unknown;
}

export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'DELETED';

// ── 4-AXIS CONTENT TRUST & SAFETY MATRIX ─────────────────────────────────────

export enum PublicationState {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
}

export enum VerificationLevel {
  UNVERIFIED = 'UNVERIFIED',
  COMMUNITY_VERIFIED = 'COMMUNITY_VERIFIED',
  FIELD_RESEARCHER_VERIFIED = 'FIELD_RESEARCHER_VERIFIED',
  OFFICIAL_GOVERNMENT_VERIFIED = 'OFFICIAL_GOVERNMENT_VERIFIED',
}

export enum SourceProvenance {
  OFFICIAL_PORTAL = 'OFFICIAL_PORTAL',
  TRIBAL_ELDER_FOLKLORE = 'TRIBAL_ELDER_FOLKLORE',
  REGISTERED_GUIDE = 'REGISTERED_GUIDE',
  INDEPENDENT_CREATOR = 'INDEPENDENT_CREATOR',
  AGGREGATED_EXTERNAL = 'AGGREGATED_EXTERNAL',
}

export enum SafetyStatus {
  SAFE_OPEN = 'SAFE_OPEN',
  SEASONAL_ADVISORY = 'SEASONAL_ADVISORY',
  RESTRICTED_PERMIT_REQUIRED = 'RESTRICTED_PERMIT_REQUIRED',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED',
  CRITICAL_HAZARD = 'CRITICAL_HAZARD',
}

// ── OPERATIONAL CAPABILITY STATUS ────────────────────────────────────────────

export enum OperationalCapability {
  REAL = 'REAL',
  EXTERNAL = 'EXTERNAL',
  SIMULATED = 'SIMULATED',
  UNAVAILABLE = 'UNAVAILABLE',
}

export interface ContentEntry {
  id: string;
  templateId: string;
  templateVersion: number;
  slug: string;
  data: ContentEntryData;
  status: PublicationState | string;
  verificationLevel?: VerificationLevel | string;
  sourceProvenance?: SourceProvenance | string;
  safetyStatus?: SafetyStatus | string;
  authorId: string;
  region?: string | null;
  zoneId?: string | null;
  districtId?: string | null;
  divisionId?: string | null;
  district?: string | null;
  division?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
  updatedAt: string;
}

