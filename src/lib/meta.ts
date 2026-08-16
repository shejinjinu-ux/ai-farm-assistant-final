/** Shared head() metadata builder for app pages. */
export function pageMeta(title: string, description: string) {
  const full = `${title} — AI Farm Assistant`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
    ],
  };
}
