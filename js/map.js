let map;
let markers = [];
const markerMap = {};

// ----------------------
// INITIALISE MAP
// ----------------------
export function initializeMap(lat, lng) {

  map = L.map("map").setView([lat, lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
}

// ----------------------
// ICON LOGIC
// ----------------------
function getIcon(type, discovered) {
  if (type === "user") return "🧭";
  // Hidden state (fog of war)
  if (!discovered) return "❓";

  const icons = {
    castle: "🏰",
    memorial: "🕯️",
    monument: "🗿",
    archaeological_site: "🏺",
    ruins: "🏛️",
    battlefield: "⚔️"
  };

  return icons[type] || "📍";
}

// ----------------------
// ADD MARKER
// ----------------------
export function addMarker(item, onClick) {

  console.log("Adding marker:", item);

  if (!item.lat || !item.lng) return;

  const icon = L.divIcon({
    html: getIcon(item.type, item.discovered),
    className: "echo-icon",
    iconSize: [30, 30]
  });

  const marker =
    L.marker([item.lat, item.lng], { icon })
      .addTo(map);

marker.bindPopup(`
  <div class="echo-popup">
    <div class="echo-popup-title">${item.title}</div>
    <div class="echo-popup-type">${item.type || "historic site"}</div>

    <button onclick="window.dispatchEvent(new CustomEvent('echo-open', {detail: ${item.id}}))">
      Open
    </button>
  </div>
`);

  marker.on("click", () => {
    if (onClick) onClick(item);
  });

  markers.push(marker);

  // Store marker for later updates
  if (item.id !== undefined && item.id !== null) {
    markerMap[item.id] = marker;
  }
}

// ----------------------
// REVEAL MARKER (DISCOVERY)
// ----------------------
export function revealMarker(id, type) {

  const marker = markerMap[id];

  if (!marker) return;

  const icon = L.divIcon({
    html: getIcon(type, true),
    className: "echo-icon",
    iconSize: [30, 30]
  });

  marker.setIcon(icon);
}

// ----------------------
// CLEAR MARKERS
// ----------------------
export function clearMarkers() {

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  // important: reset lookup table too
  Object.keys(markerMap).forEach(key => {
    delete markerMap[key];
  });
}