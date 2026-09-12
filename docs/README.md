# CG Tourism Platform — Documentation Index & Knowledge Hub

Welcome to the comprehensive technical documentation and system architecture guide for the **CG Tourism Platform (v1.0.0)**.

This repository serves as an enterprise-grade, schema-driven tourism operating system for Chhattisgarh, combining dynamic template engines, transactional outbox publishing, hybrid search, AI knowledge graph recommendations, and accessible public rendering.

---

## 🗺️ Documentation Sitemap

```text
docs/
├── README.md                                # Central documentation hub (this file)
│
├── 🏛️ System Architecture
│   ├── Architecture.md                      # End-to-end system topology and platform design
│   ├── Generic_Tourism_Template_Engine.md   # Dynamic schema-driven rendering engine specification
│   ├── Backend.md                           # Kernel services, API patterns, and database layers
│   ├── Core.md                              # Core module definitions, contracts, and interfaces
│   ├── Design.md                            # Visual language, glassmorphic UI, and design tokens
│   ├── Features.md                          # Platform capabilities and functional matrix
│   ├── Services.md                          # Microservices, jobs, and worker topologies
│   ├── Workflow.md                          # Authoring, review, moderation, and publication flow
│   └── architecture/                        # Deep-dive architecture canonicalization RFCs
│       ├── content-template-canonicalization.md
│       └── template-canonicalization.md
│
├── 📦 P13 System Integration & Release Closure
│   ├── p13/TASK_LOG.md                      # Audit log of tasks P13-001 through P13-076 & Golden Path
│   ├── p13/CHECKLIST.md                     # Formal 10-section signed-off release checklist
│   ├── p13/TEST_REPORT.md                   # Full test evidence (pytest, jest, e2e, build)
│   ├── p13/VERIFICATION_REPORT.md           # Full-path component and integration verification
│   ├── p13/VALIDATION_REPORT.md             # Security, accessibility, and business validation
│   ├── p13/RELEASE_NOTES.md                 # v1.0.0 release notes, migration, and runbooks
│   └── p13/FINAL_SIGNOFF.md                 # Production signoff certificate (Unanimous GO)
│
├── 🧩 Template Engine Specification
│   ├── template-engine/ARCHITECTURE.md      # Template engine compiler, versioning, and lifecycle
│   ├── template-engine/IMPLEMENTATION-MATRIX.md # Feature-to-code implementation matrix
│   ├── template-engine/MIGRATION.md         # Schema migration and compatibility protocols
│   ├── template-engine/RELEASE.md           # Deployment runbook and verification gates
│   └── template-engine/ROLLBACK.md          # Zero-downtime rollback and recovery procedures
│
├── 🛠️ Engineering & Development Guides
│   ├── development/README.md                # Local developer setup and toolchain guidelines
│   ├── development/configuration.md         # Environment variables and configuration reference
│   ├── development/database.md              # PostGIS, PostgreSQL, migrations, and pools
│   ├── development/security.md              # RBAC, auth rate limiting, JWT, and public boundary
│   └── development/tourism-data.md          # Geographic schemas and destination structures
│
├── 📈 Historical Phase Blueprints
│   ├── Phase1_Production_Setup.md           # Initial monorepo, Docker, and CI scaffolding
│   ├── Phase2_Core_Backend_APIs.md          # Core REST endpoints and authentication
│   ├── Phase3_Frontend_Architecture.md      # Next.js App Router and client layout
│   ├── Phase4_Web_Admin_Platform.md         # Moderation and administrative dashboard
│   ├── Phase5_AI_Tourism_Intelligence.md    # Initial vector embeddings and semantic search
│   ├── Security_Authentication_Emergency_SOS.md # SOS alerts and emergency dispatch
│   └── Phase18_Regional_Commerce_Marketplace.md # Marketplace and booking architecture
│
└── 📊 Data & Geo Standards
    └── ../data/README.md                    # Central data catalog, districts, and schemas
```

---

## 🚀 Quick Navigation by Role

### For Developers & Engineers
- **Getting Started**: [Development Guide](file:///docs/development/README.md) & [Environment Configuration](file:///docs/development/configuration.md)
- **Database & PostGIS**: [Database Guide](file:///docs/development/database.md)
- **Security & Authorization**: [Security Guide](file:///docs/development/security.md)
- **Full Verification**: Run `make verify` or inspect [P13 Verification Report](file:///docs/p13/VERIFICATION_REPORT.md)

### For Platform Architects & Product Managers
- **System Architecture**: [Master Architecture](file:///docs/Architecture.md)
- **Template Engine RFC**: [Generic Tourism Template Engine](file:///docs/Generic_Tourism_Template_Engine.md)
- **Phase 13 Integration**: [P13 Release Notes](file:///docs/p13/RELEASE_NOTES.md) & [Signoff Certificate](file:///docs/p13/FINAL_SIGNOFF.md)
- **Content Governance**: [Workflow & Lifecycle](file:///docs/Workflow.md)

### For QA & DevOps Engineers
- **Test Results**: [P13 Test Report](file:///docs/p13/TEST_REPORT.md) (276 backend tests, 214 frontend tests)
- **Checklist**: [P13 10-Section Checklist](file:///docs/p13/CHECKLIST.md)
- **Deployment & Migration**: [Release Guide](file:///docs/template-engine/RELEASE.md) & [Rollback Guide](file:///docs/template-engine/ROLLBACK.md)

---

## 🔒 Architectural Principles

1. **Schema-Driven Architecture**: The public web experience renders entirely from versioned, immutable template schemas (`TemplateVersion`). There are zero hardcoded destination page schemas.
2. **Transactional Outbox Guarantee**: All domain mutations (publication, updates, archiving) record an `OutboxEvent` in the same database transaction, ensuring cache, search index, and vector embeddings synchronize with zero data loss.
3. **Strict Public Content Boundary**: Unauthenticated public endpoints return strictly `PUBLISHED` content. Draft, pending-review, and archived records are unreachable without appropriate bearer token credentials.
4. **Resilient Multilingual Access**: Tri-lingual support (`en`, `hi`, `cg`) enforced by publication completeness gates.
