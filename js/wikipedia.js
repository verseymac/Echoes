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

export async function searchWikipedia(query) {

  try {

    const url =
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`;

    const res = await fetch(url);
    const data = await res.json();

    const firstResult = data?.query?.search?.[0];

    if (!firstResult) return null;

    return firstResult.title;

  } catch (error) {

    console.error("Wikipedia search failed:", error);
    return null;
  }
}