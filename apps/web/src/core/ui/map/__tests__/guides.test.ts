import type { MapGuide } from "../guides";
import { sortGuideSteps, isValidGuide, getGuideCoordinates } from "../guides";

describe("Map Guides Contract", () => {
  const sampleGuide: MapGuide = {
    id: "guide-kanger",
    title: "Kanger Valley Forest Trail",
    steps: [
      {
        id: "step-3",
        title: "Kotumsar Cave",
        order: 3,
        coordinate: { latitude: 18.91, longitude: 81.88 },
      },
      {
        id: "step-1",
        title: "Kanger Entry Post",
        order: 1,
        coordinate: { latitude: 18.95, longitude: 81.95 },
      },
      {
        id: "step-2",
        title: "Tirathgarh Falls",
        order: 2,
        coordinate: { latitude: 18.9, longitude: 81.86 },
      },
    ],
  };

  it("sorts guide steps sequentially by order", () => {
    const sorted = sortGuideSteps(sampleGuide.steps);
    expect(sorted[0].id).toBe("step-1");
    expect(sorted[1].id).toBe("step-2");
    expect(sorted[2].id).toBe("step-3");
  });

  it("validates valid guides", () => {
    expect(isValidGuide(sampleGuide)).toBe(true);
    expect(
      isValidGuide({
        id: "empty",
        title: "Empty",
        steps: [],
      }),
    ).toBe(false);
  });

  it("extracts valid coordinates from guide steps", () => {
    const coords = getGuideCoordinates(sampleGuide);
    expect(coords.length).toBe(3);
    expect(coords[0].latitude).toBe(18.91);
  });
});
