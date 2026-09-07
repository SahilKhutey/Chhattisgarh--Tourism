import { queueAction } from "./sync";
import { isOnline } from "./network";

function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function createBookmark(
  placeId: string
): Promise<{
  synced: boolean;
}> {
  if (!isOnline()) {
    await queueAction("BOOKMARK_CREATE", {
      placeId,
    });
    return {
      synced: false,
    };
  }

  try {
    const response = await fetch(`${getApiBase()}/api/v1/bookmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ placeId }),
    });

    if (!response.ok) {
      throw new Error("Unable to create bookmark");
    }

    return {
      synced: true,
    };
  } catch {
    // Network failed mid-request — fall back to offline queue
    await queueAction("BOOKMARK_CREATE", {
      placeId,
    });
    return {
      synced: false,
    };
  }
}

export async function deleteBookmark(
  placeId: string
): Promise<{
  synced: boolean;
}> {
  if (!isOnline()) {
    await queueAction("BOOKMARK_DELETE", {
      placeId,
    });
    return {
      synced: false,
    };
  }

  try {
    const response = await fetch(`${getApiBase()}/api/v1/bookmarks/${placeId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Unable to delete bookmark");
    }

    return {
      synced: true,
    };
  } catch {
    await queueAction("BOOKMARK_DELETE", {
      placeId,
    });
    return {
      synced: false,
    };
  }
}
