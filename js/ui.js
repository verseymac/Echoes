export function setLoading() {
  document.getElementById("content").innerHTML =
    "<p>Searching nearby echoes...</p>";
}

import { getWikipediaSummary } from "./wikipedia.js";

import { calculateDistance } from "./utils.js";

export async function showDetails(item) {

  if (!item.discovered) {

  document.getElementById("content").innerHTML = `
    <h3>❓ Unknown Echo</h3>
    <p>This place is waiting to be discovered.</p>
  `;

  return;
}

  const container =
    document.getElementById("content");

  const formattedType =
    (item.type || "historic_site")
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

  let distanceText = "Unknown";

  if (
    item.userLat &&
    item.userLng &&
    item.lat &&
    item.lng
  ) {

    const distance = calculateDistance(
      item.userLat,
      item.userLng,
      item.lat,
      item.lng
    );

    distanceText =
      distance < 1000
        ? `${Math.round(distance)}m`
        : `${(distance / 1000).toFixed(1)}km`;
  }

  let summary =
    "No historical summary available.";

  try {

    let wiki = null;

if (
  item.title &&
  item.title !== "Unknown Historic Site"
) {

  wiki =
    await getWikipediaSummary(
      item.title
    );

}

    if (wiki?.extract) {
      summary = 
      wiki.extract.length > 600
        ? wiki.extract.substring(0, 600) + "..."
        : wiki.extract;
    }

  } catch (error) {

    console.error(
      "No historical summary available.",
      error
    );

  }

  container.innerHTML = `
  <h3>${item.title}</h3>

  <p class="meta">
    ${formattedType}
    ${distanceText !== "Unknown" ? ` • ${distanceText} away` : ""}
  </p>

  <p>
    ${summary}
  </p>
`;
}

export function showSavedEcho(item) {

  const container =
    document.getElementById(
      "echoes-details"
    );

  const formattedType =
    (item.type || "historic site")
      .replace(/_/g, " ")
      .replace(/\b\w/g,
        c => c.toUpperCase()
      );

  const discoveredDate =
    item.discoveredAt
      ? new Date(
          item.discoveredAt
        ).toLocaleDateString()
      : "Unknown";

  const closest =
    item.closestDistance
      ? `${Math.round(
          item.closestDistance
        )}m`
      : "Unknown";

  container.innerHTML = `
    <h3>${item.title}</h3>

    <p>
      <strong>Type:</strong>
      ${formattedType}
    </p>

    <p>
      <strong>Discovered:</strong>
      ${discoveredDate}
    </p>

    <p>
      <strong>Closest Approach:</strong>
      ${closest}
    </p>
  `;
}