// import L from "leaflet";
let map;
let markers = [];

// ----------------------
// INITIALISE MAP
// ----------------------
export function initializeMap(lat, lng) {

  map = L.map("map").setView([lat, lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

}

function getIcon(type, discovered) {

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
  L.marker(
    [item.lat, item.lng],
    { icon }
  ).addTo(map);

  marker.bindPopup(`<b>${item.title}</b>`);

  marker.on("click", () => {

  if (onClick) {
    onClick(item);
  }

});

  markers.push(marker);
}

// ----------------------
// CLEAR MARKERS
// ----------------------
export function clearMarkers() {

  markers.forEach(m => map.removeLayer(m));
  markers = [];

}