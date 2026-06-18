export async function getWikipediaSummary(title) {

  try {

    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );

    if (!response.ok) return null;

    return await response.json();

  } catch {

    return null;

  }
}