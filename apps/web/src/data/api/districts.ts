import { apiClient } from "./client";
import { getPlaces } from "./places";
import type {
  District,
  PaginatedResponse,
  Place,
} from "./types";

export function createDistrictSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getDistricts(): Promise<PaginatedResponse<District>> {
  const raw = await apiClient.get<any[]>("/api/v1/places/districts");

  const districts: District[] = Array.isArray(raw)
    ? raw.map((d: any, index: number) => {
        const name = typeof d === "string" ? d : d.name;
        const slug = createDistrictSlug(name);
        return {
          id: d.id || `district-${index + 1}`,
          name,
          slug,
          description: d.description || `Explore destinations and cultural heritage in ${name}, Chhattisgarh.`,
          imageUrl: d.imageUrl || null,
          placeCount: d.placeCount ?? 0,
          latitude: d.latitude ?? null,
          longitude: d.longitude ?? null,
        };
      })
    : [];

  return {
    data: districts,
    page: 1,
    limit: districts.length,
    total: districts.length,
    totalPages: 1,
  };
}

export async function getDistrict(slug: string): Promise<District> {
  const list = await getDistricts();
  const found = list.data.find(
    (d) => d.slug.toLowerCase() === slug.toLowerCase() || d.name.toLowerCase() === slug.toLowerCase(),
  );

  if (!found) {
    const formattedName = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      id: slug,
      name: formattedName,
      slug: slug.toLowerCase(),
      description: `Authentic travel guide and destinations in ${formattedName}, Chhattisgarh.`,
      imageUrl: null,
      placeCount: 0,
    };
  }

  return found;
}

export async function getDistrictPlaces(districtName: string): Promise<Place[]> {
  const response = await getPlaces({ district: districtName, verified: true });
  return response.data;
}
