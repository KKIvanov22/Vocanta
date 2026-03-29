/** Server-side base URL for the Flask API (no trailing slash). */
export function getBackendUrl(): string {
  return (process.env.BACKEND_URL ?? "https://vocanta-production.up.railway.app").replace(
    /\/$/,
    "",
  );
}
