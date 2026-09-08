export function isOnline(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return true;
  }
  return navigator.onLine ?? true;
}

export function subscribeToNetwork(callback: (online: boolean) => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
