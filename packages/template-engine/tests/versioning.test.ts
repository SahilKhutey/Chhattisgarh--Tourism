import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  diffTemplateVersions,
  summarizeUpgradeRisk,
  TemplateSnapshot,
} from '../src/index.js';

describe('Template Versioning & Upgrade Risk', () => {
  const v1: TemplateSnapshot = {
    id: 'tpl-1',
    name: 'Bastar Art',
    slug: 'bastar-art',
    version: 1,
    fields: [
      {
        key: 'title',
        label: 'Title',
        fieldType: 'TEXT',
        required: true,
        order: 0,
        translatable: true,
      },
      {
        key: 'description',
        label: 'Description',
        fieldType: 'TEXTAREA',
        required: false,
        order: 1,
        translatable: true,
      },
      {
        key: 'photo',
        label: 'Photo',
        fieldType: 'IMAGE',
        required: false,
        order: 2,
        translatable: false,
      },
    ],
  };

  it('detects no changes between identical snapshots', () => {
    const diff = diffTemplateVersions(v1, { ...v1, version: 2 });
    assert.equal(diff.changes.length, 0);
    const summary = summarizeUpgradeRisk(diff);
    assert.equal(summary.riskLevel, 'SAFE');
    assert.equal(summary.breakingChanges.length, 0);
  });

  it('identifies removed fields as BREAKING', () => {
    const v2: TemplateSnapshot = {
      ...v1,
      version: 2,
      fields: v1.fields.filter((f) => f.key !== 'photo'),
    };
    const diff = diffTemplateVersions(v1, v2);
    assert.equal(diff.changes.length, 1);
    assert.equal(diff.changes[0].key, 'photo');
    assert.equal(diff.changes[0].changeType, 'BREAKING');
    assert.equal(diff.changes[0].type, 'REMOVED');

    const summary = summarizeUpgradeRisk(diff);
    assert.equal(summary.riskLevel, 'BREAKING');
    assert.equal(summary.breakingChanges.length, 1);
  });

  it('identifies added required fields as BREAKING', () => {
    const v2: TemplateSnapshot = {
      ...v1,
      version: 2,
      fields: [
        ...v1.fields,
        {
          key: 'district',
          label: 'District',
          fieldType: 'TEXT',
          required: true,
          order: 3,
          translatable: false,
        },
      ],
    };
    const diff = diffTemplateVersions(v1, v2);
    assert.equal(diff.changes.length, 1);
    assert.equal(diff.changes[0].changeType, 'BREAKING');
    assert.equal(diff.changes[0].type, 'ADDED');

    const summary = summarizeUpgradeRisk(diff);
    assert.equal(summary.riskLevel, 'BREAKING');
  });

  it('identifies added optional fields as SAFE', () => {
    const v2: TemplateSnapshot = {
      ...v1,
      version: 2,
      fields: [
        ...v1.fields,
        {
          key: 'website',
          label: 'Website',
          fieldType: 'TEXT',
          required: false,
          order: 3,
          translatable: false,
        },
      ],
    };
    const diff = diffTemplateVersions(v1, v2);
    assert.equal(diff.changes.length, 1);
    assert.equal(diff.changes[0].changeType, 'SAFE');
    assert.equal(diff.changes[0].type, 'ADDED');

    const summary = summarizeUpgradeRisk(diff);
    assert.equal(summary.riskLevel, 'SAFE');
    assert.equal(summary.safeChanges.length, 1);
  });

  it('identifies field type changes as BREAKING', () => {
    const v2: TemplateSnapshot = {
      ...v1,
      version: 2,
      fields: v1.fields.map((f) =>
        f.key === 'description' ? { ...f, fieldType: 'RICHTEXT' } : f
      ),
    };
    const diff = diffTemplateVersions(v1, v2);
    assert.equal(diff.changes.length, 1);
    assert.equal(diff.changes[0].changeType, 'BREAKING');
    assert.equal(diff.changes[0].type, 'MODIFIED');
  });
});
