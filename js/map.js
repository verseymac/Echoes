let map;
let markers = [];

export function initializeMap(lat, lon) {

  map = L.map("map").setView([lat, lon], 14);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap contributors"
    }
  ).addTo(map);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup("You are here");
}

export function clearMarkers() {

  markers.forEach(marker => {
    map.removeLayer(marker);
  });

  markers = [];
}

export function addMarker(item, callback) {

  const marker = L.marker([
    item.lat,
    item.lon
  ]).addTo(map);

  marker.on("click", () => callback(item));

  markers.push(marker);
}