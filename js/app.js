import { getUserLocation } from "./geolocation.js";

import {
  initializeMap,
  addMarker,
  clearMarkers
} from "./map.js";

import {
  fetchNearbyEchoes
} from "./wikidata.js";

import {
  showDetails
} from "./ui.js";

let currentLocation;

async function loadHistory() {

  clearMarkers();

  // 🔹 Test marker (keep for debugging)
  addMarker({
    name: "Test Echo",
    lat: currentLocation.lat + 0.003,
    lon: currentLocation.lon + 0.003,
    article: "https://en.wikipedia.org/wiki/History"
  }, showDetails);

  const radius =
    document.getElementById("radius").value;

  try {

    const results =
      await fetchNearbyEchoes(
        currentLocation.lat,
        currentLocation.lon,
        radius
      );

    console.log("Echoes loaded:", results);

    results.forEach(result => {

      const item = {

        name: result.title,
        lat: result.lat,
        lon: result.lon,
        article: null // no Wikipedia yet in V0.2

      };

      addMarker(item, showDetails);

    });

  } catch (error) {

    console.error("Failed to load Echoes:", error);

  }
}

async function start() {

  try {

    currentLocation =
      await getUserLocation();

    initializeMap(
      currentLocation.lat,
      currentLocation.lon
    );

    await loadHistory();

    document
      .getElementById("radius")
      .addEventListener(
        "change",
        loadHistory
      );

  } catch (error) {

    console.error(error);

    alert(
      "Please allow location access to use Echoes."
    );
  }
}

start();