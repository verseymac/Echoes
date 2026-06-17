import L from "leaflet";
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

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

// ----------------------
// ADD MARKER
// ----------------------
export function addMarker(item, onClick) {

  if (!item.lat || !item.lng) return;

  const marker = L.marker([item.lat, item.lng]).addTo(map);

  marker.bindPopup(`<b>${item.title}</b>`);

  marker.on("click", () => {
    if (onClick) onClick(item);
  });
console.log("Adding marker:", item);
  markers.push(marker);
}

// ----------------------
// CLEAR MARKERS
// ----------------------
export function clearMarkers() {

  markers.forEach(m => map.removeLayer(m));
  markers = [];

}