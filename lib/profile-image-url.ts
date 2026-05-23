/** X/Twitter CDN serves tiny `_normal` avatars by default — request a larger variant. */
export function upgradeProfileImageUrl(url: string) {
  if (!url) return url;
  if (!/twimg\.com/i.test(url)) return url;
  return url
    .replace(/_normal(\.(?:jpe?g|png|webp|gif))(\?.*)?$/i, "_400x400$1$2")
    .replace(/_bigger(\.(?:jpe?g|png|webp|gif))(\?.*)?$/i, "_400x400$1$2")
    .replace(/_mini(\.(?:jpe?g|png|webp|gif))(\?.*)?$/i, "_400x400$1$2")
    .replace(/_200x200(\.(?:jpe?g|png|webp|gif))(\?.*)?$/i, "_400x400$1$2");
}

export function unavatarUrlForHandle(handle: string, size = 400) {
  return `https://unavatar.io/x/${encodeURIComponent(handle)}?size=${size}`;
}
