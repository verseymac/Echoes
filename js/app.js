
import { getUserLocation } from "./geolocation.js";

import {
  initializeMap,
  addMarker,
  clearMarkers
} from "./map.js";

import { fetchNearbyEchoes } from "./wikidata.js";

import { showDetails } from "./ui.js";

let currentLocation;

// ----------------------------
// LOAD ECHOES
// ----------------------------
async function loadHistory() {

  clearMarkers();

  const radius = Number(
    document.getElementById("radius").value
  );

  try {

    const results = await fetchNearbyEchoes(
      currentLocation.lat,
      currentLocation.lng,
      radius
    );

    console.log("Echoes loaded:", results);

    // Test marker (debug only)
    addMarker({
      title: "Test Echo",
      lat: currentLocation.lat + 0.003,
      lng: currentLocation.lng + 0.003,
      article: "https://en.wikipedia.org/wiki/History"
    }, showDetails);

    if (!results || results.length === 0) {
      console.log("No Echoes found.");
      return;
    }

    results.forEach(result => {

      addMarker({
        title: result.title,
        lat: result.lat,
        lng: result.lng,
        article: null
      }, showDetails);

    });

  } catch (error) {

    console.error("Failed to load Echoes:", error);

  }
}

// ----------------------------
// START APP
// ----------------------------
async function start() {

  try {

    currentLocation = await getUserLocation();

    console.log("User location received:", currentLocation);
    
    initializeMap(
      currentLocation.lat,
      currentLocation.lng
    );

    addMarker({
      title: "You are here",
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      article: null
    }, showDetails);

    await loadHistory();

    document
      .getElementById("radius")
      .addEventListener("change", loadHistory);

  } catch (error) {

    console.error(error);

    alert("Please allow location access to use Echoes.");
  }
}

start();