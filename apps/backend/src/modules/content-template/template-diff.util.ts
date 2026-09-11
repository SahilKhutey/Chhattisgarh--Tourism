export interface SnapshotField {
  key: string;
  label: string;
  fieldType: string;
  required: boolean;
  order: number;
  translatable?: boolean;
  helpText?: string | null;
  options?: any;
}

export interface TemplateSnapshotData {
  id: string;
  name: string;
  slug: string;
  version: number;
  fields: SnapshotField[];
}

export interface FieldChange {
  key: string;
  type: 'ADDED' | 'REMOVED' | 'MODIFIED';
  changeType: 'BREAKING' | 'SAFE';
  fieldLabel?: string;
  detail: string;
}

export interface VersionDiff {
  fromVersion: number;
  toVersion: number;
  changes: FieldChange[];
}

export interface UpgradeRiskSummary {
  riskLevel: 'SAFE' | 'BREAKING';
  breakingChanges: FieldChange[];
  safeChanges: FieldChange[];
  summary: string;
}

export function diffTemplateSnapshots(
  vOld: TemplateSnapshotData,
  vNew: TemplateSnapshotData,
): VersionDiff {
  const oldFieldsMap = new Map<string, SnapshotField>(
    (vOld.fields || []).map((f) => [f.key, f]),
  );
  const newFieldsMap = new Map<string, SnapshotField>(
    (vNew.fields || []).map((f) => [f.key, f]),
  );

  const changes: FieldChange[] = [];

  for (const [key, oldField] of oldFieldsMap.entries()) {
    const newField = newFieldsMap.get(key);
    if (!newField) {
      changes.push({
        key,
        type: 'REMOVED',
        changeType: 'BREAKING',
        fieldLabel: oldField.label,
        detail: `Field "${oldField.label}" (${key}) was removed. Existing entries may contain orphaned data.`,
      });
    } else {
      if (oldField.fieldType !== newField.fieldType) {
        changes.push({
          key,
          type: 'MODIFIED',
          changeType: 'BREAKING',
          fieldLabel: newField.label,
          detail: `Field type changed from "${oldField.fieldType}" to "${newField.fieldType}".`,
        });
      }

      if (!oldField.required && newField.required) {
        changes.push({
          key,
          type: 'MODIFIED',
          changeType: 'BREAKING',
          fieldLabel: newField.label,
          detail: `Field was changed from optional to required. Existing entries lacking this field will fail validation.`,
        });
      } else if (oldField.required && !newField.required) {
        changes.push({
          key,
          type: 'MODIFIED',
          changeType: 'SAFE',
          fieldLabel: newField.label,
          detail: `Field requirement relaxed from required to optional.`,
        });
      }

      if (oldField.label !== newField.label) {
        changes.push({
          key,
          type: 'MODIFIED',
          changeType: 'SAFE',
          fieldLabel: newField.label,
          detail: `Field label changed from "${oldField.label}" to "${newField.label}".`,
        });
      }
    }
  }

  for (const [key, newField] of newFieldsMap.entries()) {
    if (!oldFieldsMap.has(key)) {
      if (newField.required) {
        changes.push({
          key,
          type: 'ADDED',
          changeType: 'BREAKING',
          fieldLabel: newField.label,
          detail: `New required field "${newField.label}" (${key}) was added. Existing entries do not contain this field.`,
        });
      } else {
        changes.push({
          key,
          type: 'ADDED',
          changeType: 'SAFE',
          fieldLabel: newField.label,
          detail: `New optional field "${newField.label}" (${key}) was added.`,
        });
      }
    }
  }

  return {
    fromVersion: vOld.version,
    toVersion: vNew.version,
    changes,
  };
}

export function summarizeUpgradeRisk(diff: VersionDiff): UpgradeRiskSummary {
  const breakingChanges = diff.changes.filter((c) => c.changeType === 'BREAKING');
  const safeChanges = diff.changes.filter((c) => c.changeType === 'SAFE');

  const riskLevel = breakingChanges.length > 0 ? 'BREAKING' : 'SAFE';

  let summary = '';
  if (breakingChanges.length === 0 && safeChanges.length === 0) {
    summary = `Version ${diff.toVersion} has no field changes compared to version ${diff.fromVersion}.`;
  } else if (breakingChanges.length > 0) {
    summary = `Upgrade risk: BREAKING. ${breakingChanges.length} breaking change(s) and ${safeChanges.length} safe change(s) detected.`;
  } else {
    summary = `Upgrade risk: SAFE. ${safeChanges.length} safe change(s) detected; backwards compatible.`;
  }

  return {
    riskLevel,
    breakingChanges,
    safeChanges,
    summary,
  };
}

