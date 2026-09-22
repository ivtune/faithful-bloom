/**
 * Downloads media through the browser so the viewer always stays inside
 * the EHC Media Archive. The real reference behind `url` will later be a
 * secure backend endpoint — never a visible Google Drive link.
 */
export async function downloadMedia(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  } catch {
    // Fallback for cross-origin sources that refuse programmatic download.
    window.open(url, "_blank", "noopener");
  }
}
