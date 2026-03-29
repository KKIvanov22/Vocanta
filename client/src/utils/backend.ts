/** Server-side base URL for the Flask API (no trailing slash). */
export function getBackendUrl(): string {
  return (process.env.BACKEND_URL ?? "http://127.0.0.1:5000").replace(
    /\/$/,
    "",
  );
}
