import { getWikipediaSummary } from "./wikipedia.js";
import { calculateDistance } from "./utils.js";

// ----------------------------
// LOADING
// ----------------------------

export function setLoading() {
  document.getElementById("content").innerHTML =
    "<p>Searching nearby echoes...</p>";
}

// ----------------------------
// MAIN DETAILS PANEL
// ----------------------------

export async function showDetails(item) {

  const container =
    document.getElementById("content");

  const formattedType =
    (item.type || "historic site")
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

  let distanceText = "";

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

  let summary = "No historical summary available.";

  try {

    if (
      item.title &&
      item.title !== "Unknown Historic Site"
    ) {

      const wiki =
        await getWikipediaSummary(item.title);

      if (wiki?.extract) {
        summary =
          wiki.extract.length > 600
            ? wiki.extract.substring(0, 600) + "..."
            : wiki.extract;
      }
    }

  } catch (err) {
    console.warn("Wikipedia failed", err);
  }

  container.innerHTML = `
    <h3>${item.title}</h3>

    <p class="meta">
      ${formattedType}
      ${distanceText ? ` • ${distanceText} away` : ""}
    </p>

    <p>${summary}</p>
  `;
}

// ----------------------------
// SAVED ECHO DETAILS
// ----------------------------

export function showSavedEcho(item) {

  const container =
    document.getElementById("echoes-details");

  const formattedType =
    (item.type || "historic site")
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());

  const discoveredDate =
    item.discoveredAt
      ? new Date(item.discoveredAt).toLocaleDateString()
      : "Unknown";

  const closest =
    item.closestDistance
      ? `${Math.round(item.closestDistance)}m`
      : "Unknown";

  const stateEmojiMap = {
    hidden: "❓",
    discovered: "🟡",
    visited: "🔵",
    mastered: "🏆"
  };

  const stateEmoji =
    stateEmojiMap[item.state || "hidden"];

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
      <strong>Status:</strong>
      ${stateEmoji} ${item.state || "hidden"}
    </p>

    <p>
      <strong>Closest Approach:</strong>
      ${closest}
    </p>
  `;
}

// ----------------------------
// USER SCORE
// ----------------------------

export function renderUserScore() {

  const container =
    document.getElementById("user-score");

  const score =
    localStorage.getItem("echo_score") || 0;

  container.innerHTML = `
    <h3>Total Echo Score</h3>
    <p style="font-size: 24px;">
      ${score}
    </p>
  `;
}