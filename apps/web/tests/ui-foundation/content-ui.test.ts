import type {
  ContentUIContext,
  ContentSection,
  ContentRenderModel,
} from "@/lib/content/content-ui";

describe("Content UI Contracts", () => {
  it("structures valid ContentRenderModel without hardcoded entity branching", () => {
    const context: ContentUIContext = {
      templateId: "tpl-festival-v1",
      entryId: "entry-bastar-dussehra-2026",
      locale: "cg",
      preview: false,
      authenticated: true,
    };

    const sections: ContentSection[] = [
      {
        id: "sec-hero",
        type: "HERO_BANNER",
        order: 1,
        visible: true,
        data: {
          title: "बस्तर दशहरा (Bastar Dussehra)",
          subtitle: "75-day world-renowned indigenous festival",
        },
      },
      {
        id: "sec-geo",
        type: "MAP_CORRIDOR",
        order: 2,
        visible: true,
        data: {
          district: "Bastar",
          coordinates: { lat: 19.074, lng: 82.008 },
        },
      },
    ];

    const model: ContentRenderModel = {
      templateId: context.templateId,
      entryId: context.entryId,
      title: "Bastar Dussehra Festival Portal",
      sections,
      metadata: {
        season: "Autumn / Post-Monsoon",
        significance: "Living Gond/Dhurwa spiritual gathering",
      },
    };

    expect(model.templateId).toBe("tpl-festival-v1");
    expect(model.sections).toHaveLength(2);
    expect(model.sections[0].type).toBe("HERO_BANNER");
    expect(model.sections[1].type).toBe("MAP_CORRIDOR");
    expect(model.metadata?.season).toBe("Autumn / Post-Monsoon");
  });
});
